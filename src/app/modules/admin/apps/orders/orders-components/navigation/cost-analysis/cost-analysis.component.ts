import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-cost-analysis',
  templateUrl: './cost-analysis.component.html'
})
export class CostAnalysisComponent implements OnInit {
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  isLoading: boolean = false;
  selectedOrder: any;

  orderParticipants = [];
  orderDetail: any;
  orderProducts = [];

  grandTotalCost = 0;
  grandTotalPrice = 0;
  not_available = 'N/A';

  orderTotal: any;
  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;


    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.orderDetail = res["data"][0];
        let params = {
          order_total: true,
          order_id: this.orderDetail.pk_orderID
        }
        this._orderService.getOrder(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          this.orderTotal = res["data"][0];
        })
      }
    })

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
      res["data"].forEach(element => {
        let cost = (element.runCost * element.quantity) + element.setupCost;
        let price = (element.runPrice * element.quantity) + element.setupPrice;
        const index = data.findIndex(item => item.order_line_id == element.fk_orderLineID);
        data[index].imprints.push(element);
        data[index].totalMercandiseCost = data[index].totalMercandiseCost + cost;
        data[index].totalMerchendisePrice = data[index].totalMerchendisePrice + price;
      });


      this.orderProducts = data;
      // console.log(this.orderProducts)
      this.getProductTotal();
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getProductTotal() {
    this.grandTotalCost = 0;
    this.grandTotalPrice = 0;
    // this.orderProducts.forEach(element => {
    //   let runCost = 0;
    //   let runPrice = 0;
    //   let setupCost = 0;
    //   let setupPrice = 0;
    //   if (element.imprint) {
    //     runCost = element.imprints.runCost;
    //     runPrice = element.imprints.runPrice;
    //     setupCost = element.imprints.setupCost;
    //     setupPrice = element.imprints.setupPrice;
    //   }
    //   this.grandTotalCost = this.grandTotalCost + ((element.products[0].cost * element.products[0].quantity) + (runCost * element.products[0].quantity) + (setupCost));
    //   this.grandTotalPrice = this.grandTotalPrice + ((element.product.price * element.product.quantity) + (runPrice * element.product.quantity) + (setupPrice))
    // });
  }

  public exportHtmlToPDF() {
    let data = document.getElementById('htmltable');
    const file_name = `CostAnalysisReport_56165.pdf`;
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
  getMerchendiseTotalCost(item) {
    return 50
    // return (item.imprints?.runCost * item.products[0]?.quantity) + (item.products[0]?.cost * item.products[0]?.quantity) + (item.imprints?.setupCost) + (item.products[0]?.shippingCost);
  }
  getMerchendiseTotalPrice(item) {
    return 50

    // return (item.imprints?.runPrice * item.products[0]?.quantity) + (item.products[0]?.price * item.products[0]?.quantity) + (item.imprints?.setupPrice) + (item.products[0]?.shippingPrice);
  }
  getPercentage(item, check) {
    if (check == 'shipping') {
      if (item.products[0].shippingPrice == 0) {
        return 0;
      }
      let percentage = ((1 - (item.products[0].shippingCost / item.products[0].shippingPrice)) * 100)
      return percentage;
    }
    if (check == 'imprints') {
      if (item.runPrice == 0) {
        return 0;
      }
      let percentage = ((1 - (item.runCost / item.runPrice)) * 100);
      return percentage;
    }
    if (check == 'setup') {
      if (item.setupPrice == 0) {
        return 0;
      }
      let percentage = ((1 - (item.setupCost / item.setupPrice)) * 100);
      return percentage;

    }
  }
}
