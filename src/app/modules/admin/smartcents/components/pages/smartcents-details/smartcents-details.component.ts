import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import moment from 'moment';
import { AuthService } from 'app/core/auth/auth.service';
import { OrderManageService } from 'app/modules/admin/orderManage/components/order-manage.service';
import { SmartCentsService } from '../../smartcents.service';
import { saveBillPay, saveVendorBill } from '../../smartcents.types';
@Component({
  selector: 'app-smartcents-details-manage',
  templateUrl: './smartcents-details.component.html',
  styles: [`.buttonComment {
    border: 1px solid #404C5E;
    color: #404C5E;
    border-radius: 3px;
    font-size: 12px;}`]
})
export class SmartCentsDetailsComponent implements OnInit, OnDestroy {
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
  isEstimatedDateLoader: boolean = false;
  isBillLoader: boolean = false;
  BillData = {
    billPayPaymentMethod: null,
    billPayPaymentDate: null,
    billPayReference: null,
    blnPaid: false
  }
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
  // Accessories
  isAccessoriesLoader: boolean = false;
  isAccessoriesDelLoader: boolean = false;
  accessoryForm = {
    name: '',
    quantity: '',
    cost: '',
    setup: ''
  }
  // Adjustment
  isAdjustmentLoader: boolean = false;
  isAdjustmentDelLoader: boolean = false;
  adjustmentForm = {
    name: '',
    cost: ''
  }
  // Imprints
  isAddImprintLoader: boolean = false;
  isDelImprintLoader: boolean = false;
  imprintForm = {
    name: '',
    quantity: '',
    run: '',
    setup: '',
    n_color: '',
    imprint_color: ''
  }
  // Colors
  isAddColorLoader: boolean = false;
  isDelColorLoader: boolean = false;
  colorsForm = {
    name: '',
    quantity: '',
    cost: ''
  }
  // Send Purchase Order
  isSentPOLoader: boolean = false;
  blnArtNeedsResent: boolean = false;
  isSavePOLoader: boolean = false;
  isRemovePOLoader: boolean = false;
  ngImprint = '';

  smartCentsData: any;
  colorsData: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _activeRoute: ActivatedRoute,
    private _OrderManageService: OrderManageService,
    private _smartCentService: SmartCentsService,
    private _authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this._activeRoute.params.subscribe(res => {
      this.paramData = res;
      this.isLoading = true;
      this.getOrderDetails();
    });
  }
  getOrderDetails() {
    let params = {
      smarcents_details: true,
      orderLinePOID: this.paramData.poid
    }
    this._smartCentService.getApiData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.smartCentsData = res["data"][0];
      this.vendorBillData = {
        vendorInvoiceNumber: this.smartCentsData.vendorInvoiceNumber ? this.smartCentsData.vendorInvoiceNumber : null,
        vendorInvoiceDate: this.smartCentsData.vendorInvoiceDate ? this.smartCentsData.vendorInvoiceDate : null,
        vendorInvoiceNetTerms: this.smartCentsData.vendorInvoiceNetTerms ? this.smartCentsData.vendorInvoiceNetTerms : 0,
        blnInvoiced: false
      }
      this.BillData = {
        billPayPaymentMethod: this.smartCentsData.billPayPaymentMethod ? this.smartCentsData.billPayPaymentMethod : 0,
        billPayPaymentDate: this.smartCentsData.billPayPaymentDate ? this.smartCentsData.billPayPaymentDate : null,
        billPayReference: this.smartCentsData.billPayReference ? this.smartCentsData.billPayReference : null,
        blnPaid: this.smartCentsData.blnPaid
      }
      this.getColorsData();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getColorsData() {
    let params = {
      smarcents_color_size_breakdown: true,
      orderLineID: this.smartCentsData.fk_orderLineID
    }
    this._smartCentService.getApiData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.colorsData = res["data"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateBillPay() {
    this.isBillLoader = true;
    let date = null;
    if (this.BillData.billPayPaymentDate) {
      date = moment(this.BillData.billPayPaymentDate).format('L');
    }
    let payload: saveBillPay = {
      orderLinePOID: this.smartCentsData.fk_orderLineID,
      billPayPaymentMethod: this.BillData.billPayPaymentMethod,
      billPayReference: this.BillData.billPayReference,
      billPayPaymentDate: date,
      blnPaid: this.BillData.blnPaid,
      update_save_bill_pay: true
    }
    this._OrderManageService.PutAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
      }
      this.isBillLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isBillLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateVendorBills() {
    this.isVendorBillLoader = true;
    let date = null;
    if (this.smartCentsData.vendorInvoiceDate) {
      date = moment(this.smartCentsData.vendorInvoiceDate).format('L');
    }
    let term = this.smartCentsData.vendorInvoiceNetTerms;
    if (this.smartCentsData.vendorInvoiceNetTerms == '0') {
      term = null;
    }
    let payload: saveVendorBill = {
      orderLinePOID: this.smartCentsData.fk_orderLineID,
      vendorInvoiceNumber: this.smartCentsData.vendorInvoiceNumber,
      vendorInvoiceDate: date,
      vendorInvoiceNetTerms: term,
      blnInvoiced: this.vendorBillData.blnInvoiced,
      update_save_vendor_bill: true
    }
    this._OrderManageService.PutAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
  backToList() {
    this.router.navigateByUrl('ordermanage/dashboard');
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
