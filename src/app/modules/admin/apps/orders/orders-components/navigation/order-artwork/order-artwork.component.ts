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
  tempDate = new Date().toLocaleString();
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
      console.log(res);
      let value = [];
      res["data"].forEach((element, index) => {
        element.products = [];
        element.imprints = [];
        this.orderProducts.push(element);
        this.getArtworkFiles(element.pk_orderLineID, index);
        value.push(element.pk_orderLineID);
        if (index == res["data"].length - 1) {
          this.getLineProducts(value.toString());
        }
      });
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
        const index = this.orderProducts.findIndex(item => item.pk_orderLineID == element.fk_orderLineID);
        if (this.orderProducts[index].products.length > 0) {
          this.orderProducts[index].products.push(element);
        } else {
          this.orderProducts[index].products = [element];
        }
      });
      this.getProductImprints(value);
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  getProductImprints(value) {
    let params = {
      imprint_report: true,
      order_line_id: value
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let tempArr = [];
      let imprintIds = [];
      res["data"].forEach(element => {
        const index = this.orderProducts.findIndex(item => item.pk_orderLineID == element.fk_orderLineID);
        element.artworkFiles = [];
        imprintIds.push(element.pk_imprintID);
        this.checkIfImageExists(element, `https://assets.consolidus.com/artwork/Proof/${this.orderDetail.fk_storeUserID}/${this.orderDetail.pk_orderID}/${element.fk_orderLineID}/${element.pk_imprintID}.jpg`);
        if (this.orderProducts[index].artworkFiles.length > 0) {
          this.orderProducts[index].artworkFiles.forEach(file => {
            if (file.ID.includes(element.pk_imprintID)) {
              element.artworkFiles.push(file);
            }
          });
        }
        this.orderProducts[index].imprints.push(element);
      });
      console.log(this.orderProducts);
      this.getImprintsStatus(imprintIds.toString(), value.toString());
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getImprintsStatus(value, orders) {
    let params = {
      imprint_status: true,
      order_line_id: orders,
      imprint_id: value
    }
    this._orderService.getOrder(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        this.orderProducts.forEach(item => {
          const index = item.imprints.findIndex(imprint => element.fk_imprintID == imprint.pk_imprintID);
          if (index >= 0) {
            item.imprints[index].status = element;
          }
        });
      });
      // console.log(this.orderProducts)
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  getArtworkFiles(pk_orderLineID, index) {
    let payload = {
      files_fetch: true,
      path: `artwork/${this.orderDetail.fk_storeID}/${this.orderDetail.fk_storeUserID}/${this.orderDetail.pk_orderID}/${pk_orderLineID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._orderService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      this.orderProducts[index].artworkFiles = files["data"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  checkIfImageExists(imprint, url) {
    const img = new Image();
    img.src = url;

    if (img.complete) {

    } else {
      img.onload = () => {
        imprint.proofImg = true;
        this._changeDetectorRef.markForCheck();
        // return true;
      };

      img.onerror = () => {
        imprint.proofImg = false;
        this._changeDetectorRef.markForCheck();
        return;
      };
    }
  };
  openSideNav(item) {
    // console.log(item)
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
