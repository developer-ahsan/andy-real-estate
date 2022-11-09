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
  @Input() selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['company', 'supplies', 'decorates', 'digitizes', 'total'];
  transactions: OrdersPurchases[] = [
    { company: 'ARTWORK', supplies: true, decorates: false, digitizes: false, total: 255 }
  ];
  isView: boolean = false;
  orderDetail: any;
  orderProducts: any;
  grandTotalCost: number;
  grandTotalPrice: number;

  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log(this.selectedOrder);

    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.orderDetail = res["data"][0];
        console.log('OrderDetails=>', this.orderDetail);
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
      console.log(this.orderProducts)
    })


    this._orderService.getOrderPurchases(this.selectedOrder.pk_orderID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((purchases) => {
        console.log("purchases => ", purchases);

        this._changeDetectorRef.markForCheck();
      });

    this.isLoadingChange.emit(false);
  }
  getLineProducts(value) {
    let params = {
      order_line_item: true,
      order_line_id: value
    }
    this._orderService.getOrderLineProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getProductImprints(value, res["data"]);
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
      data.forEach(element => {
        res["data"].forEach(item => {
          if (item.fk_orderLineID == element.fk_orderLineID) {
            tempArr.push({ product: element, imprints: item });
          }
        });
      });
      this.orderProducts = tempArr;
      console.log('Products=>', this.orderProducts)
      this.getProductTotal();
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  getProductTotal() {
    let suppliersArray = [];
    this.grandTotalCost = 0;
    this.grandTotalPrice = 0;
    this.orderProducts.forEach(element => {
      const index = suppliersArray.findIndex(item => item.name == element.product.supplier_name);
      if (index > -1) {
        suppliersArray[index].count++;
      } else {
        suppliersArray.push({ name: element.product.supplier_name, link: element.product.supplierLink, count: 1 });
      }
      this.grandTotalCost = this.grandTotalCost + ((element.product.cost * element.product.quantity) + (element.imprints.runCost * element.product.quantity) + (element.imprints.setupCost));
      this.grandTotalPrice = this.grandTotalPrice + ((element.product.price * element.product.quantity) + (element.imprints.runPrice * element.product.quantity) + (element.imprints.setupPrice))
    });
    console.log(suppliersArray)
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

