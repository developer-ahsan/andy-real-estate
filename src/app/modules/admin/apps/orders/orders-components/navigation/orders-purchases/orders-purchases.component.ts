import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { takeUntil } from 'rxjs/operators';
import { OrdersList } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { Subject } from 'rxjs';
import moment from 'moment';
import { OrderManageService } from 'app/modules/admin/orderManage/components/order-manage.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
declare var $: any;

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
  @ViewChild('acknowledge') acknowledge: ElementRef;

  acknowledged: string = '';

  displayedColumns: string[] = ['company', 'supplies', 'decorates', 'total'];
  displayedColumns1: string[] = ['companys', 'suppliess', 'decoratess', 'shippingtotal', 'totals'];
  transactions: OrdersPurchases[] = [
    { company: 'ARTWORK', supplies: true, decorates: false, digitizes: false, total: 255 }
  ];
  isView: boolean = false;
  orderDetail: any;
  orderProducts: any;
  grandTotalCost: number;
  grandTotalPrice: number;

  currentDate = moment().format('MM/DD/yyyy');
  currentTime = moment().format('hh:mm:ss');

  totalShippingCost = 0;
  purchases: any;
  isViewData: any;
  orderLineIDs: any;
  isDetailLoader: boolean = false;
  imprints: any;
  purchaseDetails: any;
  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderManageService: OrderManageService,
    private _commonService: DashboardsService
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
      // order_line_id: orderLineIDs
      order_id: this.orderProducts[0].fk_orderID
    }
    this._orderService.getOrderCommonCall(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((purchases) => {
        this.purchases = purchases;
        this.totalShippingCost = purchases["shippingPrice"][0].shippingCost;
        purchases["data"].forEach(element => {
          this.totalShippingCost = this.totalShippingCost + element.Total;
        });
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      });
  }
  getLineProducts() {
    let params = {
      order_manage_imprint_details: true,
      orderLine_id: this.isViewData.fk_orderLineID,
      orderLine_POID: this.isViewData.pk_orderLinePOID,
      blnSupplier: this.isViewData.blnSupplier,
      blnDecorator: this.isViewData.blnDecorator,
      blnDuplicated: this.isViewData.blnDuplicated,
    }
    this._orderManageService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getArtworkFiles();
      this._changeDetectorRef.markForCheck();
      console.log(res)
      this.purchaseDetails = res;
      if (res['imprints'].length) {
        this.checkImprintProofExists();
      }
    }, err => {
      this.isDetailLoader = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getArtworkFiles() {
    let payload = {
      files_fetch: true,
      path: `/artwork/POProof/${this.isViewData.fk_orderLineID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._commonService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      this.isDetailLoader = false;
      this.purchaseDetails.poProofFiles = files["data"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isDetailLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  checkImprintProofExists() {
    let payload = {
      files_fetch: true,
      path: `/artwork/finalArt/${this.orderDetail.fk_storeUserID}/${this.isViewData.fk_orderID}/${this.isViewData.fk_orderLineID}/`
    }
    this._commonService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      console.log(files);
      this.purchaseDetails.imprints.forEach(element => {
        element.proofFiles = [];
        files["data"].forEach((file, index) => {
          if (file.ID.includes(element.id)) {
            element.proofFiles.push(file);
          }
        });
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isDetailLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  viewPurchaseOrder(item): void {
    this.isView = !this.isView;
    if (this.isView) {
      this.isDetailLoader = true;
      this._changeDetectorRef.markForCheck();
      this.isViewData = item;
      this.getLineProducts();
    }
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

  openAcknowldgeModal() {
    $(this.acknowledge.nativeElement).modal('show');
  }

  acknowledgement() { }

}

