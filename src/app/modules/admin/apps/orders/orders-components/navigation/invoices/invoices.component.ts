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
  selectedOrderDetails: any;
  showReport = false;
  showForm = false;
  orderParticipants = [];
  selectedOrderTotals: Object = null;

  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getOrderDetail();
  }
  getOrderDetail() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        if (res["data"].length) {
          this.selectedOrderDetails = res["data"][0];
          if (this.selectedOrderDetails["fk_groupOrderID"]) {
            this.showReport = true;
            this._orderService.getOrderParticipants(this.selectedOrderDetails.pk_orderID)
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((orderParticipants) => {
                this.orderParticipants = orderParticipants["data"];
                this._changeDetectorRef.markForCheck();
              });
          }
          this._orderService.getOrderTotals(this.selectedOrderDetails.pk_orderID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderTotals) => {
              this.isLoading = false;
              this.selectedOrderTotals = orderTotals["data"][0];
              this._changeDetectorRef.markForCheck();
            });
        }
      }
    })
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
