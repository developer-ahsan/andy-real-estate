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
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  selectedOrder: OrdersList = null;
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


  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this._orderService.orders$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((orders: OrdersList[]) => {
        this.selectedOrder = orders["data"].find(x => x.pk_orderID == location.pathname.split('/')[3]);
        this.htmlComment = this.selectedOrder["internalComments"];

        if (this.selectedOrder["fk_groupOrderID"]) {
          this.showReport = true;
          this._orderService.getOrderParticipants(this.selectedOrder.pk_orderID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderParticipants) => {
              const firstOption = {
                billingFirstName: "COMBINED ORDER REPORT",
                billingLastName: "",
                billingEmail: ""
              };
              const combinedParticipants = [firstOption].concat(orderParticipants["data"]);
              this.orderParticipants = combinedParticipants;

              this._changeDetectorRef.markForCheck();
            });
        }

        this._orderService.getOrderDetails(this.selectedOrder.pk_orderID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((orderDetails) => {
            this.selectedOrderDetails = orderDetails["data"];
            this._changeDetectorRef.markForCheck();
          });
      });

    this._orderService.getOrderTotals(this.selectedOrder.pk_orderID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((orderTotals) => {
        this.selectedOrderTotals = orderTotals["data"][0];
        this._changeDetectorRef.markForCheck();
      });

    this.isLoadingChange.emit(false);
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
