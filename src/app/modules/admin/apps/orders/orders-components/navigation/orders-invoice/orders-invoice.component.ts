import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
@Component({
  selector: 'app-orders-invoice',
  templateUrl: './orders-invoice.component.html'
})
export class OrdersInvoiceComponent implements OnInit {

  @Input() isLoading: boolean;
  @Input() selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  selectedOrderDetails = [];
  selectedOrderTotals: Object = null;
  htmlComment: string = '';
  not_available = 'N/A';
  showReport = false;
  orders: string[] = [
    'COMBINED ORDER REPORT',
    'The CHC Store - Initiator'
  ];
  showForm: boolean = false;

  orderParticipants = [];
  orderDetail: any;
  orderProducts = [];

  grandTotalCost = 0;
  grandTotalPrice = 0;
  orderTotal: any;
  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    let params = {
      order_total: true,
      order_id: this.selectedOrder.pk_orderID
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderTotal = res["data"][0];
    });
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.orderDetail = res["data"][0];
        console.log(this.orderDetail)
      }
    });

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
    const { pk_orderID } = this.selectedOrder;
    let data = document.getElementById('htmltable');
    const file_name = `OrderReport_${pk_orderID}.pdf`;
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
  orderSelection(order) {
    this.showForm = true;
  }
}
