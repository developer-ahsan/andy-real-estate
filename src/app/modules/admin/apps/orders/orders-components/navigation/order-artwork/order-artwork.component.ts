import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';

@Component({
  selector: 'app-order-artwork',
  templateUrl: './order-artwork.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OrderArtWorkComponent implements OnInit, OnDestroy {
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  selectedOrder: any;

  orderParticipants = [];
  orderDetail: any;
  orderProducts = [];
  not_available = 'N/A';
  imgUrl = environment.productMedia;
  @ViewChild('drawer', { static: true }) sidenav: MatDrawer;
  sideNavData: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._changeDetectorRef.markForCheck();
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length) {
        this.orderDetail = res["data"][0];
        this.getOrderProducts();
      }
    })
  }
  getOrderProducts() {
    this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let value = [];
      res["data"].forEach((element, index) => {
        value.push(element.pk_orderLineID);
        if (index == res["data"].length - 1) {
          this.getLineProducts(value.toString());
        }
      });
      this.orderProducts = res["data"];
    })
  }
  getLineProducts(value) {
    let params = {
      order_line_item: true,
      order_line_id: value
    }
    this._orderService.getOrderLineProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let products = [];

      res["data"].forEach(element => {
        let prod = [];
        if (products.length == 0) {
          let cost = (element.cost * element.quantity) + element.shippingCost;
          let price = (element.price * element.quantity) + element.shippingPrice;
          prod.push(element);
          products.push({ products: prod, order_line_id: element.fk_orderLineID, accessories: [], imprints: [], totalQuantity: element.quantity, totalMercandiseCost: cost, totalMerchendisePrice: price });
        } else {
          const index = products.findIndex(item => item.order_line_id == element.fk_orderLineID);
          if (index < 0) {
            let cost = (element.cost * element.quantity) + element.shippingCost;
            let price = (element.price * element.quantity) + element.shippingPrice;
            prod.push(element);
            products.push({ products: prod, order_line_id: element.fk_orderLineID, accessories: [], imprints: [], totalQuantity: element.quantity, totalMercandiseCost: cost, totalMerchendisePrice: price });
          } else {
            let cost = (element.cost * element.quantity);
            let price = (element.price * element.quantity);
            prod = products[index].products;
            prod.push(element);
            products[index].products = prod;
            products[index].totalQuantity = products[index].totalQuantity + element.quantity;
            products[index].totalMercandiseCost = products[index].totalMercandiseCost + cost;
            products[index].totalMerchendisePrice = products[index].totalMerchendisePrice + price;
          }
        }
      });
      if (res["accessories"].length > 0) {
        res["accessories"].forEach(element => {
          let cost = (element.runCost * element.quantity);
          let price = (element.runPrice * element.quantity);
          const index = products.findIndex(item => item.order_line_id == element.orderLineID);
          products[index].accessories.push(element);
          products[index].totalMercandiseCost = products[index].totalMercandiseCost + cost;
          products[index].totalMerchendisePrice = products[index].totalMerchendisePrice + price;
        });
      }
      this.getProductImprints(value, products);
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  getProductImprints(value, data) {
    let params = {
      imprint_report: true,
      order_line_id: value
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let tempArr = [];
      let imprintIds = [];
      res["data"].forEach(element => {
        imprintIds.push(element.pk_imprintID);
        let cost = (element.runCost * element.quantity) + element.setupCost;
        let price = (element.runPrice * element.quantity) + element.setupPrice;
        const index = data.findIndex(item => item.order_line_id == element.fk_orderLineID);
        data[index].imprints.push(element);
        data[index].totalMercandiseCost = data[index].totalMercandiseCost + cost;
        data[index].totalMerchendisePrice = data[index].totalMerchendisePrice + price;
      });

      this.getImprintsStatus(imprintIds.toString(), value.toString(), data);
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getImprintsStatus(value, orders, data) {
    let params = {
      imprint_status: true,
      order_line_id: orders,
      imprint_id: value
    }
    this._orderService.getOrder(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        data.forEach(item => {
          const index = item.imprints.findIndex(imprint => element.fk_imprintID == imprint.pk_imprintID);
          if (index >= 0) {
            item.imprints[index].status = element;
          }
        });
      });
      this.orderProducts = data;
      console.log(this.orderProducts)
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })

  }
  openSideNav(item) {
    console.log(item)
    this.sideNavData = item;
    this.sidenav.toggle();
  }
  closeSideNav() {
    this.sideNavData = null;
    this.sidenav.toggle();
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
