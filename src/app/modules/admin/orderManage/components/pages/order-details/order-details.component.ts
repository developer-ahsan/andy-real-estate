import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { OrderManageService } from '../../order-manage.service';
import { AddComment, HideUnhideQuote, UpdateInHandsDate, UpdateTracking, saveVendorBill } from '../../order-manage.types';
import moment from 'moment';
import { AuthService } from 'app/core/auth/auth.service';
@Component({
  selector: 'app-order-details-manage',
  templateUrl: './order-details.component.html',
  styles: [`.buttonComment {
    border: 1px solid #404C5E;
    color: #404C5E;
    border-radius: 3px;
    font-size: 12px;}`]
})
export class OrderManageDetailsComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  paramData: any;
  isLoading: boolean = false;
  orderData: any;
  orderDataPO: any;
  imprintdata: any = [];

  statusID = 1;
  isHandsDateLoader: boolean = false;
  isCommentsLoader: boolean = false;
  userData: any;
  ngComment = '';

  // Shipping Tracking
  isTrackingLoader: boolean = false;
  blnblnSendShippingEmail: boolean = false;
  blnRevised: boolean = false;
  shippingCarriers = [
    {
      name: 'UPS',
      id: 1
    },
    {
      name: 'FedEx',
      id: 2
    },
    {
      name: 'Freight',
      id: 3
    },
    {
      name: 'USPS',
      id: 4
    },
    {
      name: 'Delivery',
      id: 5
    },
    {
      name: 'DHL',
      id: 6
    }
  ];
  // Vendor Bill
  isVendorBillLoader: boolean = false;
  vendorBillData = {
    vendorInvoiceNumber: null,
    vendorInvoiceDate: null,
    vendorInvoiceNetTerms: '0',
    blnInvoiced: false
  }
  // ColorsBreakdown
  colorsList: any = [];
  accessoriesList: any = [];
  adjustmentsList: any = [];
  attachmentsList: any = [];
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _activeRoute: ActivatedRoute,
    private _OrderManageService: OrderManageService,
    private _authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userData = this._authService.parseJwt(this._authService.accessToken);
    this._activeRoute.queryParams.subscribe(res => {
      this.paramData = res;
      this.isLoading = true;
      this.getOrderDetails();
    });
  }
  getOrderDetails() {
    let params = {
      order_manage_details: true,
      orderLine_id: this.paramData.pk_orderLineID,
      orderLine_POID: this.paramData.pk_orderLinePOID,
      order_id: this.paramData.fk_orderID
    }
    this._OrderManageService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderData = res["data"][0];
      if (res["purchaseOrders"].length > 0) {
        this.orderDataPO = res["purchaseOrders"][0];
        this.vendorBillData = {
          vendorInvoiceNumber: this.orderDataPO.vendorInvoiceNumber ? this.orderDataPO.vendorInvoiceNumber : null,
          vendorInvoiceDate: this.orderDataPO.vendorInvoiceDate ? this.orderDataPO.vendorInvoiceDate : null,
          vendorInvoiceNetTerms: this.orderDataPO.vendorInvoiceNetTerms ? this.orderDataPO.vendorInvoiceNetTerms : 0,
          blnInvoiced: false
        }
      }
      this.getImpritData();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getImpritData() {
    let params = {
      order_manage_imprint_details: true,
      orderLine_id: this.paramData.pk_orderLineID,
      orderLine_POID: this.paramData.pk_orderLinePOID
    }
    this._OrderManageService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.imprintdata = res["imprints"];
      this.colorsList = res["color_sizes"];
      this.adjustmentsList = res["adjustments"];
      this.accessoriesList = res["accessories"];
      this.attachmentsList = res["attachments"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backToList() {
    this.router.navigateByUrl('ordermanage/dashboard');
  }
  updateInhandsDate() {
    if (this.orderData.inHandsDate) {
      this.isHandsDateLoader = true;
      let date = moment(this.orderData.inHandsDate).format('L');
      let payload: UpdateInHandsDate = {
        inHandsDate: String(date),
        order_id: this.orderData.fk_orderID,
        update_inHands_date: true
      }
      this._OrderManageService.PutAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this._OrderManageService.snackBar(res["message"]);
        }
        this.isHandsDateLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isHandsDateLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    } else {
      this._OrderManageService.snackBar('Please select any date');
      return;
    }
  }
  updateComments() {
    if (this.ngComment != '') {
      this.isCommentsLoader = true;
      let payload: AddComment = {
        comment: this.ngComment,
        order_id: this.orderData.fk_orderID,
        post_comment: true
      }
      this._OrderManageService.PutAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          let comment = `<b><span class="fa fa-circle disabled"></span> ${this.userData.name}</b> said on ${moment().format('MMM DD YYYY')} | ${moment().format('h:mm:ss')}<br>${this.ngComment}<br><br>`;
          this.orderData.internalComments = this.orderData.internalComments + comment;
          this._OrderManageService.snackBar(res["message"]);
          this.ngComment = '';
        }
        this.isCommentsLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isCommentsLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    } else {
      this._OrderManageService.snackBar('Comment is required');
      return;
    }
  }
  updateShippingTracking() {
    this.isTrackingLoader = true;
    let date = null;
    if (this.orderData.shippingDate) {
      date = moment(this.orderData.shippingDate).format('L');
    }
    let paylaod: UpdateTracking = {
      orderLinePOID: this.orderData.fk_reOrderLineID,
      orderLineID: this.orderData.fk_cartLineID,
      orderID: this.orderData.fk_orderID,
      blnGroupRun: this.orderData.blnGroupRun,
      blnGroupOrder: this.orderData.blnGroupOrder,
      trackingNumber: this.orderData.trackingNumber,
      shipDate: date,
      carrier: this.orderData.shippingCarrier,
      carrierName: this.orderData.shippingCarrier,
      blnSendShippingEmail: this.blnblnSendShippingEmail,
      blnRevised: this.blnRevised,
      update_shipping_tracking: true
    }
    this._OrderManageService.PutAPIData(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
      }
      this.isTrackingLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isTrackingLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateBillPay() {
    this.isTrackingLoader = true;
    let date = null;
    if (this.orderData.shippingDate) {
      date = moment(this.orderData.shippingDate).format('L');
    }
    let paylaod: UpdateTracking = {
      orderLinePOID: this.orderData.fk_reOrderLineID,
      orderLineID: this.orderData.fk_cartLineID,
      orderID: this.orderData.fk_orderID,
      blnGroupRun: this.orderData.blnGroupRun,
      blnGroupOrder: this.orderData.blnGroupOrder,
      trackingNumber: this.orderData.trackingNumber,
      shipDate: date,
      carrier: this.orderData.shippingCarrier,
      carrierName: this.orderData.shippingCarrier,
      blnSendShippingEmail: this.blnblnSendShippingEmail,
      blnRevised: this.blnRevised,
      update_shipping_tracking: true
    }
    this._OrderManageService.PutAPIData(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
      }
      this.isTrackingLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isTrackingLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateVendorBills() {
    this.isVendorBillLoader = true;
    let date = null;
    if (this.vendorBillData.vendorInvoiceDate) {
      date = moment(this.vendorBillData.vendorInvoiceDate).format('L');
    }
    let term = this.vendorBillData.vendorInvoiceNetTerms;
    if (this.vendorBillData.vendorInvoiceNetTerms == '0') {
      term = null;
    }
    let paylaod: saveVendorBill = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      vendorInvoiceNumber: this.vendorBillData.vendorInvoiceNumber,
      vendorInvoiceDate: date,
      vendorInvoiceNetTerms: term,
      blnInvoiced: this.vendorBillData.blnInvoiced,
      update_save_vendor_bill: true
    }
    this._OrderManageService.PutAPIData(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
      }
      this.isVendorBillLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isVendorBillLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };


}
