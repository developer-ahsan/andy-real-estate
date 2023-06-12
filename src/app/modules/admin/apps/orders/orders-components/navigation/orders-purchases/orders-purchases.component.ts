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
  displayedColumns1: string[] = ['companys', 'suppliess', 'decoratess', 'shippingtotal', 'totals'];
  transactions: OrdersPurchases[] = [
    { company: 'ARTWORK', supplies: true, decorates: false, digitizes: false, total: 255 }
  ];
  isView: boolean = false;
  orderDetail: any;
  orderProducts: any;
  grandTotalCost: number;
  grandTotalPrice: number;

  totalShippingCost = 0;
  purchases: any;
  isViewData: any;
  orderLineIDs: any;
  isDetailLoader: boolean = false;
  purchaseDetails: any;
  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getOrderDetail();
    this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let value = [];
      this.orderProducts = res["data"];
      res["data"].forEach((element, index) => {
        value.push(element.pk_orderLineID);
        if (index == res["data"].length - 1) {
          this.getPurchaseOrders(value.toString());
          this.orderLineIDs = value.toString();
        }
      });
    });
  }
  getOrderDetail() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getPurchaseOrders(orderLineIDs) {
    let params = {
      purchase_order: true,
      order_line_id: orderLineIDs
    }
    this._orderService.getOrderCommonCall(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((purchases) => {
        this.purchases = purchases;
        this.totalShippingCost = purchases["shippingPrice"][0].shippingCost;
        purchases["data"].forEach(element => {
          this.totalShippingCost = this.totalShippingCost + element.total;
        });
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      });
  }
  getLineProducts(value) {
    let params = {
      order_line_item: true,
      order_line_id: value
    }
    this._orderService.getOrderLineProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getProductImprints(value, res["data"]);
    }, err => {
      this.isDetailLoader = false;
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
      // this.getProductTotal();
      this.isDetailLoader = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isDetailLoader = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  getProductTotal() {
    let suppliersArray = [];
    this.grandTotalCost = 0;
    this.grandTotalPrice = 0;
    this.orderProducts.forEach(element => {
      this.totalShippingCost = Number(this.totalShippingCost) + Number(element.product.shippingCost);
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

  viewPurchaseOrder(item): void {
    this.isView = !this.isView;
    if (this.isView) {
      this.isDetailLoader = true;
      this._changeDetectorRef.markForCheck();
      this.isViewData = item;
      this.getPurchaseOrdersDetails();
    }
  }
  getPurchaseOrdersDetails() {
    let params = {
      view_purchase_order: true,
      order_line_id: this.isViewData.fk_orderLineID,
      vendor_id: this.isViewData.fk_vendorID
    }
    this._orderService.getOrderCommonCall(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        this.purchaseDetails = data["data"][0];
        this.getLineProducts(this.isViewData.fk_orderLineID);
        // this.isDetailLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isDetailLoader = false;
        this._changeDetectorRef.markForCheck();
      });
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

