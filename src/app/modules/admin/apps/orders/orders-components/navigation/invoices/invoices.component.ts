import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { takeUntil } from 'rxjs/operators';
import { OrdersList } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html'
})
export class InvoicesComponent implements OnInit {
  @Input() selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  // selectedOrder: OrdersList = null;
  selectedOrderDetails = [];
  selectedOrderTotals: Object = null;
  htmlComment: string = '';
  not_available = 'N/A';
  showReport = false;
  orders: string[] = [
    'COMBINED ORDER REPORT',
    'The CHC Store - Initiator'
  ];
  displayedColumns: string[] = ['item', 'cost'];
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
    this.isLoading = true;
    // this._orderService.orders$
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((orders: OrdersList[]) => {
    //     this.orderDetail = orders["data"].find(x => x.pk_orderID == location.pathname.split('/')[3]);
    //     this.htmlComment = this.orderDetail["internalComments"];

    //     if (this.orderDetail["fk_groupOrderID"]) {
    //       this.showReport = true;
    //       this._orderService.getOrderParticipants(this.orderDetail.pk_orderID)
    //         .pipe(takeUntil(this._unsubscribeAll))
    //         .subscribe((orderParticipants) => {
    //           const firstOption = {
    //             billingFirstName: "COMBINED ORDER REPORT",
    //             billingLastName: "",
    //             billingEmail: ""
    //           };
    //           const combinedParticipants = [firstOption].concat(orderParticipants["data"]);
    //           this.orderParticipants = combinedParticipants;

    //           this._changeDetectorRef.markForCheck();
    //         });
    //     }

    //     this._orderService.getOrderDetails(this.orderDetail.pk_orderID)
    //       .pipe(takeUntil(this._unsubscribeAll))
    //       .subscribe((orderDetails) => {
    //         this.orderDetailDetails = orderDetails["data"];
    //         this._changeDetectorRef.markForCheck();
    //       });
    //   });

    // this._orderService.getOrderTotals(this.orderDetail.pk_orderID)
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((orderTotals) => {
    //     this.orderDetailTotals = orderTotals["data"][0];
    //     this._changeDetectorRef.markForCheck();
    //   });
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length) {
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
    // this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    //   let value = [];
    //   res["data"].forEach((element, index) => {
    //     value.push(element.pk_orderLineID);
    //     if (index == res["data"].length - 1) {
    //       this.getLineProducts(value.toString());
    //     }
    //   });
    //   this.orderProducts = res["data"];
    // })
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
          let royaltyPrice = element.royaltyPrice;
          let cost = (element.runCost * element.quantity) + element.shippingCost;
          let price = (element.runPrice * element.quantity) + element.shippingPrice + element.royaltyPrice;
          prod.push(element);
          products.push({ products: prod, order_line_id: element.fk_orderLineID, accessories: [], imprints: [], totalQuantity: element.quantity, totalMercandiseCost: cost, totalMerchendisePrice: price, royaltyPrice: royaltyPrice });
        } else {
          const index = products.findIndex(item => item.order_line_id == element.fk_orderLineID);
          if (index < 0) {
            let cost = (element.runCost * element.quantity) + element.shippingCost;
            let price = (element.runPrice * element.quantity) + element.shippingPrice + element.royaltyPrice;
            let royaltyPrice = element.royaltyPrice;
            prod.push(element);
            products.push({ products: prod, order_line_id: element.fk_orderLineID, accessories: [], imprints: [], totalQuantity: element.quantity, totalMercandiseCost: cost, totalMerchendisePrice: price, royaltyPrice: royaltyPrice });
          } else {
            let cost = (element.runCost * element.quantity);
            let price = (element.runPrice * element.quantity) + element.royaltyPrice;

            prod = products[index].products;
            prod.push(element);
            products[index].products = prod;
            products[index].royaltyPrice = products[index].royaltyPrice + element.royaltyPrice;
            products[index].totalQuantity = products[index].totalQuantity + element.quantity;
            products[index].totalMercandiseCost = products[index].totalMercandiseCost + cost;
            products[index].totalMerchendisePrice = products[index].totalMerchendisePrice + price;
          }
        }
      });
      if (res["accessories"].length > 0) {
        res["accessories"].forEach(element => {
          let cost = (element.runCost * element.quantity) + element.setupCost;
          let price = (element.runPrice * element.quantity) + element.setupPrice;
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
    });
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
        if (index > -1) {
          data[index].imprints.push(element);
          data[index].totalMercandiseCost = data[index].totalMercandiseCost + cost;
          data[index].totalMerchendisePrice = data[index].totalMerchendisePrice + price;
        }
      });

      this.orderProducts = data;
      console.log(this.orderProducts)
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
  // getLineProducts(value) {
  //   let params = {
  //     order_line_item: true,
  //     order_line_id: value
  //   }
  //   this._orderService.getOrderLineProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
  //     this.getProductImprints(value, res["data"]);
  //   }, err => {
  //     this.isLoading = false;
  //     this.isLoadingChange.emit(false);
  //     this._changeDetectorRef.markForCheck();
  //   })
  // }
  // getProductImprints(value, data) {
  //   let params = {
  //     imprint_report: true,
  //     order_line_id: value
  //   }
  //   this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
  //     let tempArr = [];
  //     data.forEach(element => {
  //       res["data"].forEach(item => {
  //         if (item.fk_orderLineID == element.fk_orderLineID) {
  //           tempArr.push({ product: element, imprints: item });
  //         }
  //       });
  //     });
  //     this.orderProducts = tempArr;
  //     this.getProductTotal();
  //     this.isLoading = false;
  //     this.isLoadingChange.emit(false);
  //     this._changeDetectorRef.markForCheck();
  //   }, err => {
  //     this.isLoading = false;
  //     this.isLoadingChange.emit(false);
  //     this._changeDetectorRef.markForCheck();
  //   })
  // }
  getProductTotal() {
    // this.grandTotalCost = 0;
    // this.grandTotalPrice = 0;
    // this.orderProducts.forEach(element => {
    //   this.grandTotalCost = this.grandTotalCost + ((element.product.cost * element.product.quantity) + (element.imprints.runCost * element.product.quantity) + (element.imprints.setupCost));
    //   this.grandTotalPrice = this.grandTotalPrice + ((element.product.price * element.product.quantity) + (element.imprints.runPrice * element.product.quantity) + (element.imprints.setupPrice))
    // });
  }
  orderSelection(order) {
    this.showForm = true;
  }

  getTotalCost() {
    // return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value * 2000, 0);
  }

  public exportHtmlToPDF() {
    let element = document.getElementById('htmltable');
    var positionInfo = element.getBoundingClientRect();
    var height = positionInfo.height;
    var width = positionInfo.width;
    var top_left_margin = 15;
    let PDF_Width = width + (top_left_margin * 2);
    var PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);
    var canvas_image_width = width;
    var canvas_image_height = height;

    var totalPDFPages = Math.ceil(height / PDF_Height) - 1;
    const { pk_orderID } = this.orderDetail;
    let data = document.getElementById('htmltable');
    const file_name = `OrderReport_${pk_orderID}.pdf`;
    html2canvas(data, { useCORS: true }).then(canvas => {
      canvas.getContext('2d');
      var imgData = canvas.toDataURL("image/jpeg", 1.0);
      var pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);
      pdf.addImage(imgData, 'jpeg', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);


      for (var i = 1; i <= totalPDFPages; i++) {
        pdf.addPage([PDF_Width, PDF_Height]);
        pdf.addImage(imgData, 'jpeg', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height);
      }
      pdf.save(file_name);
    });
  }

}