import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersList } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

interface Transaction {
  item: string;
  cost: number;
}

@Component({
  selector: 'app-orders-report',
  templateUrl: './orders-report.component.html',
  styles: ['.fuse-mat-rounded .mat-tab-group .mat-tab-body-content {overflow-x: hidden !important}'],
  encapsulation: ViewEncapsulation.None,
})
export class OrdersReportComponent implements OnInit {
  @Input() isLoading: boolean;
  @Input() selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

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
  transactions: Transaction[] = [
    { item: 'Disposable Face Mask', cost: 0.210 }
  ];
  showForm: boolean = false;

  orderParticipants = [];
  orderDetail: any;
  orderProducts = [];

  grandTotalCost = 0;
  grandTotalPrice = 0;
  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // this._orderService.orders$
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((orders: OrdersList[]) => {
    //     this.selectedOrder = orders["data"].find(x => x.pk_orderID == location.pathname.split('/')[3]);
    //     this.htmlComment = this.selectedOrder["internalComments"];

    //     if (this.selectedOrder["fk_groupOrderID"]) {
    //       this.showReport = true;
    //       this._orderService.getOrderParticipants(this.selectedOrder.pk_orderID)
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

    //     this._orderService.getOrderDetails(this.selectedOrder.pk_orderID)
    //       .pipe(takeUntil(this._unsubscribeAll))
    //       .subscribe((orderDetails) => {
    //         this.selectedOrderDetails = orderDetails["data"];
    //         this._changeDetectorRef.markForCheck();
    //       });
    //   });

    // this._orderService.getOrderTotals(this.selectedOrder.pk_orderID)
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((orderTotals) => {
    //     this.selectedOrderTotals = orderTotals["data"][0];
    //     this._changeDetectorRef.markForCheck();
    //   });
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.orderDetail = res["data"][0];
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
      this.orderProducts = res["data"];
    })
  }
  getLineProducts(value) {
    let params = {
      order_line_item: true,
      order_line_id: value
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getProductImprints(value, res["data"]);
    }, err => {
      this.isLoading = true;
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
      data.forEach(element => {
        res["data"].forEach(item => {
          if (item.fk_orderLineID == element.fk_orderLineID) {
            tempArr.push({ product: element, imprints: item });
          }
        });
      });
      this.orderProducts = tempArr;
      this.getProductTotal();
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = true;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  getProductTotal() {
    this.grandTotalCost = 0;
    this.grandTotalPrice = 0;
    this.orderProducts.forEach(element => {
      this.grandTotalCost = this.grandTotalCost + ((element.product.cost * element.product.quantity) + (element.imprints.runCost * element.product.quantity) + (element.imprints.setupCost));
      this.grandTotalPrice = this.grandTotalPrice + ((element.product.price * element.product.quantity) + (element.imprints.runPrice * element.product.quantity) + (element.imprints.setupPrice))
    });
  }
  orderSelection(order) {
    this.showForm = true;
  }

  getTotalCost() {
    return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value * 2000, 0);
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

}
