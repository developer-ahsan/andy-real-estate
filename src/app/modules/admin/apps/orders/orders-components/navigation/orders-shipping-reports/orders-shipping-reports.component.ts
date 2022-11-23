import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Subject } from 'rxjs';
import { OrdersService } from '../../orders.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-orders-shipping-reports',
  templateUrl: './orders-shipping-reports.component.html'
})
export class OrdersShippingReportsComponent implements OnInit {
  @Input() isLoading: boolean;
  @Input() selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  orderParticipants = [];
  orderDetail: any;
  orderProducts = [];
  not_available = 'N/A';

  totalShippingCost = 0;
  totalShippingPrice = 0;
  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.orderDetail = res["data"][0];
      }
    })
    this.getOrderProducts();
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
      // this.orderProducts = res["data"];
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
          this.totalShippingCost = this.totalShippingCost + element.shippingCost;
          this.totalShippingPrice = this.totalShippingPrice + element.shippingPrice;
          prod.push(element);
          products.push({ products: prod, order_line_id: element.fk_orderLineID, accessories: [], imprints: [], totalQuantity: element.quantity, totalMercandiseCost: cost, totalMerchendisePrice: price });
        } else {
          const index = products.findIndex(item => item.order_line_id == element.fk_orderLineID);
          if (index < 0) {
            let cost = (element.cost * element.quantity) + element.shippingCost;
            let price = (element.price * element.quantity) + element.shippingPrice;
            this.totalShippingCost = this.totalShippingCost + element.shippingCost;
            this.totalShippingPrice = this.totalShippingPrice + element.shippingPrice;
            prod.push(element);
            products.push({ products: prod, order_line_id: element.fk_orderLineID, accessories: [], imprints: [], totalQuantity: element.quantity, totalMercandiseCost: cost, totalMerchendisePrice: price });
          } else {
            this.totalShippingCost = this.totalShippingCost + element.shippingCost;
            this.totalShippingPrice = this.totalShippingPrice + element.shippingPrice;
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
      res["data"].forEach(element => {
        let cost = (element.runCost * element.quantity) + element.setupCost;
        let price = (element.runPrice * element.quantity) + element.setupPrice;
        const index = data.findIndex(item => item.order_line_id == element.fk_orderLineID);
        data[index].imprints.push(element);
        data[index].totalMercandiseCost = data[index].totalMercandiseCost + cost;
        data[index].totalMerchendisePrice = data[index].totalMerchendisePrice + price;
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
    });
  }

  public exportHtmlToPDF() {
    let data = document.getElementById('htmltable');
    const file_name = `ShippinReport_56165.pdf`;
    html2canvas(data).then(canvas => {

      let docWidth = 208;
      let docHeight = canvas.height * docWidth / canvas.width;

      const contentDataURL = canvas.toDataURL('image/png')
      let doc = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      doc.addImage(contentDataURL, 'PNG', 0, position, docWidth, docHeight)

      doc.save(file_name);
    });
  }

}
