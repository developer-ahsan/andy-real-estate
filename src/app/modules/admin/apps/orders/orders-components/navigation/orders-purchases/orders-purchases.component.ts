import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { takeUntil } from 'rxjs/operators';
import { OrdersList } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { Subject } from 'rxjs';

interface OrdersPurchases {
  company: string;
  supplies: boolean;
  decorates: boolean;
  digitizes: boolean;
  total: number;
}

@Component({
  selector: 'app-orders-purchases',
  templateUrl: './orders-purchases.component.html'
})
export class OrdersPurchasesComponent implements OnInit {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  selectedOrder: OrdersList = null;
  displayedColumns: string[] = ['company', 'supplies', 'decorates', 'digitizes', 'total'];
  transactions: OrdersPurchases[] = [
    { company: 'ARTWORK', supplies: true, decorates: false, digitizes: false, total: 255 }
  ];
  isView: boolean = false;

  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this._orderService.orders$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((orders: OrdersList[]) => {
        this.selectedOrder = orders["data"].find(x => x.pk_orderID == location.pathname.split('/')[3]);

        this._changeDetectorRef.markForCheck();
      });



    this._orderService.getOrderPurchases(this.selectedOrder.pk_orderID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((purchases) => {
        console.log("purchases => ", purchases);

        this._changeDetectorRef.markForCheck();
      });

    this.isLoadingChange.emit(false);
  }

  getTotalCost() {
    return this.transactions.map(t => t.total).reduce((acc, value) => acc + value, 0);
  }

  viewPurchaseOrder(): void {
    this.isView = !this.isView;
  }

  public exportHtmlToPDF() {
    let data = document.getElementById('htmltable');
    const file_name = `PurchasesReport_56165.pdf`;
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

