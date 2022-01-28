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
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  selectedOrder: OrdersList = null;
  selectedOrderDetails = [];
  showReport = false;
  showForm = false;
  orderParticipants = [];
  selectedOrderTotals: Object = null;

  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._orderService.orders$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((orders: OrdersList[]) => {
        this.selectedOrder = orders["data"].find(x => x.pk_orderID == location.pathname.split('/')[3]);

        if (this.selectedOrder["fk_groupOrderID"]) {
          this.showReport = true;
          this._orderService.getOrderParticipants(this.selectedOrder.pk_orderID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderParticipants) => {
              this.orderParticipants = orderParticipants["data"];

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

  public exportHtmlToPDF() {
    let data = document.getElementById('htmltable');
    const file_name = `Invoice_56165.pdf`;
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
