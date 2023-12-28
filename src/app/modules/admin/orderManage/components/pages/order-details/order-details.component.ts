import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { OrderManageService } from '../../order-manage.service';
import { AddAdjustment, AddAttachment, AddComment, AddPOOption, Add_PO_Imprint, DeletePurchaseOrder, DuplicatePO, HideUnhideQuote, SaveAndSendPurchaseOrder, SavePurchaseOrder, SendPurchaseOrder, UpdateEstimatedShipping, UpdateInHandsDate, UpdateTracking, addAccessory, createPurchaseOrder, removePurchaseOrderItem, saveBillPay, saveVendorBill, updatePurchaseOrderStatus } from '../../order-manage.types';
import moment from 'moment';
import { AuthService } from 'app/core/auth/auth.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { VendorsService } from 'app/modules/admin/apps/vendors/components/vendors.service';
import { SmartArtService } from 'app/modules/admin/smartart/components/smartart.service';
import { lowerCase } from 'lodash';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $: any;
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
  orderLineData: any;
  imprintdata: any = [];

  statusID = 1;
  isHandsDateLoader: boolean = false;
  isCommentsLoader: boolean = false;
  userData: any;
  ngComment = '';

  // Shipping Tracking
  isTrackingLoader: boolean = false;
  blnblnSendShippingEmail: boolean = true;
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
  totalColorsListQuantity = 0;
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
    product: '',
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

  allVendors: any = []

  isAddPOOder: boolean = false;
  @ViewChild('removePO') removePO: ElementRef;
  @ViewChild('sendPO') sendPO: ElementRef;

  imprintInformation = [];
  isDuplicatePOLoader: boolean = false;
  ordermanageUserData: any;
  orderEmailRecipients = [];
  selectedEmailRecipients = [];
  imageAttachmentValue: any;

  isAttachmentLoader: boolean = false;
  attachmentName: string = '';
  @ViewChild('attachmentFile') attachmentFile: ElementRef;
  allStates = [];
  adjustmentsListData = [];
  statusOptions = [
    { value: 1, label: 'New-Pending' },
    { value: 2, label: 'Artwork Approved' },
    { value: 3, label: 'Purchase Order Sent' },
    { value: 4, label: 'Purchase Order Acknowledged' },
    { value: 5, label: 'Shipped' },
    { value: 6, label: 'Delivered' },
    { value: 8, label: 'Picked up' },
    { value: 10, label: 'Waiting For GroupBuy' },
  ];


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _activeRoute: ActivatedRoute,
    private _OrderManageService: OrderManageService,
    private _authService: AuthService,
    private _commonService: DashboardsService,
    private _vendorService: VendorsService,
    private _smartartService: SmartArtService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.ordermanageUserData = JSON.parse(sessionStorage.getItem('orderManage'));
    this.userData = this._authService.parseJwt(this._authService.accessToken);
    this._activeRoute.queryParams.subscribe(res => {
      this.paramData = res;
      this.isLoading = true;
      this.getVendorsData();
      this.getOrderDetails();
    });
  }
  getVendorsData() {
    this._commonService.suppliersData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allVendors = res["data"];
    });
    const storedValue = JSON.parse(sessionStorage.getItem('storeStateSupplierData'));
    this.allStates = this.splitData(storedValue.data[2][0].states);
  }
  splitData(data) {
    const dataArray = data.split(",,");
    const result = [];

    dataArray.forEach(item => {
      const [id, state, name, index] = item.split("::");
      result.push({ id: parseInt(id), state, name, index: parseInt(index) });
    });

    return result;
  }
  getOrderDetails() {
    let params = {
      order_manage_details: true,
      orderLine_id: this.paramData.pk_orderLineID,
      orderLine_POID: this.paramData.pk_orderLinePOID,
      order_id: this.paramData.fk_orderID
    }
    this._OrderManageService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderData = res["order"][0];
      if (res["orderLineData"].length) {
        this.orderLineData = res["orderLineData"][0];
      }
      if (res["adjustmentsList"].length) {
        const data = res["adjustmentsList"][0].adjustmentsList.split(',,');
        data.forEach(element => {
          const [id, name] = element.split('::');
          this.adjustmentsListData.push({ id, name });
        });
      }
      if (res["purchaseOrders"].length > 0) {
        this.orderDataPO = res["purchaseOrders"][0];
        const { shippingCarrierName, shippingServiceName, shippingCustomerAccountNumber, blnSupplier, blnDecorator, POinHandsDate } = this.orderDataPO;
        if (this.orderDataPO.POinHandsDate) {
          const date = POinHandsDate?.replace("{", '')?.replace('}', '')?.replace('ts ', '')?.replace(`'`, '')?.replace(`'`, '');
          this.orderDataPO.POinHandsDate = new Date(date);
        }
        if (shippingCustomerAccountNumber) {
          this.orderDataPO.shippingComment = `${shippingCarrierName}/${shippingServiceName}/ACCT## ${shippingCustomerAccountNumber}`;
        }
        // For PO Order Field
        if ((blnSupplier && blnDecorator) || (!blnSupplier && blnDecorator)) {
          this.orderDataPO.showPurchaseOrder = true;
        }
        let vendorTerm: any = 0;
        if (this.orderDataPO.vendorInvoiceNetTerms) {
          vendorTerm = this.orderDataPO.vendorInvoiceNetTerms;
        } else {
          vendorTerm = this.orderLineData?.netTerms ? this.orderLineData?.netTerms : 0;
        }
        this.vendorBillData = {
          vendorInvoiceNumber: this.orderDataPO.vendorInvoiceNumber ? this.orderDataPO.vendorInvoiceNumber : null,
          vendorInvoiceDate: this.orderDataPO.vendorInvoiceDate ? this.orderDataPO.vendorInvoiceDate : null,
          vendorInvoiceNetTerms: vendorTerm,
          blnInvoiced: this.orderDataPO.blnInvoiced
        }

        this.setBillPayData();
        if (this.orderData.shippingCustomerAccountNumber) {
          this.orderDataPO.shippingComment = `${this.orderData.shippingCarrierName} / ${this.orderData.shippingServiceName} / ACCT##: ${this.orderData.shippingCustomerAccountNumber}`;
        }
        if (!this.orderDataPO.imprintDetail) {
          this.orderDataPO.imprintDetail = `Please send proof to artwork@${this.orderData?.storeName?.toLowerCase()}`
        }
        this.orderDataPO.poProofFiles = [];
        this.getArtworkFiles();
      }
      this.imprintInformation = res["imprintInformation"];
      this.checkImprintProofExists();
      this.setValues();

      const { storeName } = this.orderData;
      this.orderEmailRecipients.push(`orders@${storeName.toLowerCase()}`, `artwork@${storeName.toLowerCase()}`, `billing@consolidus.com`, `service@${storeName.toLowerCase()}`, `content@consolidus.com`);
      let recipients;
      if (res["recipients"]) {
        recipients = res["recipients"][0].commentorsEmail.split(',,');
        recipients.forEach(element => {
          let [id, email] = element.split(',');
          this.orderEmailRecipients.push(email);
        });
      }

      this.getImprintData();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // 
  setValues() {
    this.orderData.formattedInHandsDate = this.orderData?.formattedInHandsDate ? new Date(this.orderData.formattedInHandsDate) : null;
    this.orderData.formattedShippingDate = this.orderData?.formattedShippingDate ? new Date(this.orderData.formattedShippingDate) : null;
    this.orderData.formattedEstimatedShippingDate = this.orderData.formattedEstimatedShippingDate ? new Date(this.orderData.formattedEstimatedShippingDate) : null;
    console.log(this.orderDataPO)
    if (!this.orderDataPO.shippingCarrier) {
      this.orderDataPO.shippingCarrier = 1;
    }
  }
  // Bill Pay
  setBillPayData() {
    let selectedPaymentMethod: any = 0;

    if (
      !this.orderDataPO.billPayPaymentMethod &&
      !this.orderLineData?.paymentMethod
    ) {
      selectedPaymentMethod = 0;
    } else {
      const paymentMethods = ['American Express', 'MasterCard', 'Credit card', 'Vendor Website', 'ACH', 'Check'];

      for (const method of paymentMethods) {
        if (this.orderDataPO.billPayPaymentMethod === method || this.orderLineData?.paymentMethod === method) {
          selectedPaymentMethod = method;
          break;
        }
      }
    }
    this.BillData = {
      billPayPaymentMethod: selectedPaymentMethod,
      billPayPaymentDate: this.orderDataPO.billPayPaymentDate || null,
      billPayReference: this.orderDataPO.billPayReference || null,
      blnPaid: this.orderDataPO.blnPaid
    };
  }

  checkImprintProofExists() {
    this.imprintInformation.forEach(imprint => {
      const url = `https://assets.consolidus.com/artwork/Proof/${this.orderData.fk_storeUserID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${imprint.fk_imprintID}.jpg`;
      this._commonService.checkImageExistData(url).then(image => {
        imprint.proofCheck = image;
        this._changeDetectorRef.markForCheck();
      });
    });
  }
  getImprintData() {
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
      this.colorsList.forEach(color => {
        this.totalColorsListQuantity += color.quantity;
      });
      this.isAccessoriesLoader = false;
      this.isAdjustmentLoader = false;
      this.isAddImprintLoader = false;
      this.isAddColorLoader = false;
      this.accessoryForm = {
        name: '',
        quantity: '',
        cost: '',
        setup: ''
      }
      this.adjustmentForm = {
        name: '',
        cost: ''
      }
      this.imprintForm = {
        name: '',
        quantity: '',
        run: '',
        setup: '',
        n_color: '',
        imprint_color: ''
      }
      this.colorsForm = {
        product: '',
        name: '',
        quantity: '',
        cost: ''
      }
      this.isLoading = false;
      // DelLoaders
      this.isAccessoriesDelLoader = false;
      this.isAdjustmentDelLoader = false;
      this.isDelColorLoader = false;
      this.isDelImprintLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isAddColorLoader = false;
      this.isAdjustmentLoader = false;
      this.isAddImprintLoader = false;
      this.isAccessoriesLoader = false;
      // DelLoaders
      this.isAccessoriesDelLoader = false;
      this.isAdjustmentDelLoader = false;
      this.isDelColorLoader = false;
      this.isDelImprintLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backToList() {
    this.router.navigateByUrl('ordermanage/dashboard');
  }
  weekendsDatesFilter = (d: Date): boolean => {
    if (d) {
      const day = d.getDay();
      return day !== 0 && day !== 6;
    } else {
      return true;
    }
    /* Prevent Saturday and Sunday for select. */
  }
  updateInhandsDate() {
    if (this.orderData.formattedInHandsDate) {
      this.isHandsDateLoader = true;
      let date = null;
      if (this.orderData.formattedInHandsDate) {
        date = moment(this.orderData.formattedInHandsDate).format('L');
      }
      let payload: UpdateInHandsDate = {
        inHandsDate: String(date),
        orderLinePOID: this.orderDataPO.pk_orderLinePOID,
        order_id: this.orderData.fk_orderID,
        update_inHands_date: true
      }
      this._OrderManageService.PutAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this._OrderManageService.snackBar(res["message"]);
        }
        this.orderData.inHandsDate = date;
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
    const { storeName } = this.orderData;
    const { shippingCompanyName } = this.orderDataPO
    if (this.ngComment.trim() != '') {
      this.isCommentsLoader = true;
      let payload: AddComment = {
        comment: this.ngComment,
        order_id: this.orderData.fk_orderID,
        orderManageLoggedInUserName: this.ordermanageUserData.firstName + ' ' + this.ordermanageUserData.lastName,
        recipients: this.selectedEmailRecipients,
        store_name: storeName,
        company_name: shippingCompanyName,
        post_comment: true
      }
      payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
      this._OrderManageService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          let comment = res["newComment"];
          this.orderData.internalComments = this.orderData.internalComments + comment;
          this._OrderManageService.snackBar(res["message"]);
          this.ngComment = '';
          this.selectedEmailRecipients = [];
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
    if (this.orderData.formattedShippingDate) {
      date = moment(this.orderData.formattedShippingDate).format('L');
    }
    let payload: UpdateTracking = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      orderLineID: this.orderDataPO.fk_orderLineID,
      orderID: this.orderDataPO.fk_orderID,
      blnGroupRun: this.orderLineData?.blnGroupRun ? this.orderLineData?.blnGroupRun : false,
      orderManageLoggedInName: this.ordermanageUserData.firstName + ' ' + this.ordermanageUserData.lastName,
      blnGroupOrder: this.orderData.fk_groupOrderID ? true : false,
      trackingNumber: this.orderDataPO.trackingNumber,
      shipDate: date,
      carrier: this.orderDataPO.shippingCarrier,
      blnSendShippingEmail: this.blnblnSendShippingEmail,
      blnRevised: this.blnRevised,
      update_shipping_tracking: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this._OrderManageService.PutAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
  updateEstimatedShipping() {
    this.isEstimatedDateLoader = true;
    let date = null;
    if (this.orderData.formattedEstimatedShippingDate) {
      date = moment(this.orderData.formattedEstimatedShippingDate).format('L');
    }
    let payload: UpdateEstimatedShipping = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      orderLineID: this.paramData.pk_orderLineID,
      orderManageLoggedInName: this.ordermanageUserData.firstName + ' ' + this.ordermanageUserData.lastName,
      orderID: this.orderData.pk_orderID,
      blnGroupRun: this.orderData.blnGroupRun,
      estimatedShippingDate: date,  // format: mm/dd/yy
      update_estimated_shipping: true
    }
    this._OrderManageService.PutAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
      }
      this.isEstimatedDateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isEstimatedDateLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Update Bill Pay
  updateBillPay() {
    const paymentDate = this.BillData.billPayPaymentDate ? moment(this.BillData.billPayPaymentDate).format('L') : null;

    let payload: saveBillPay = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      billPayPaymentMethod: this.BillData.billPayPaymentMethod,
      billPayReference: this.BillData.billPayReference,
      billPayPaymentDate: paymentDate,
      blnPaid: this.BillData.blnPaid,
      update_save_bill_pay: true
    };
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isBillLoader = true;

    this._OrderManageService.PutAPIData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (res: any) => {
          if (res.success) {
            this._OrderManageService.snackBar(res.message);
          }
          this.isBillLoader = false;
          this._changeDetectorRef.markForCheck();
        },
        (err) => {
          this.isBillLoader = false;
          this._changeDetectorRef.markForCheck();
        }
      );
  }
  // Update Vendor Bills
  updateVendorBills() {
    const invoiceDate = this.vendorBillData.vendorInvoiceDate ? moment(this.vendorBillData.vendorInvoiceDate).format('L') : null;
    const invoiceNetTerms = this.vendorBillData.vendorInvoiceNetTerms == '0' ? null : this.vendorBillData.vendorInvoiceNetTerms;

    let payload: saveVendorBill = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      vendorInvoiceNumber: this.vendorBillData.vendorInvoiceNumber,
      vendorInvoiceDate: invoiceDate,
      vendorInvoiceNetTerms: invoiceNetTerms,
      blnInvoiced: true,
      update_save_vendor_bill: true
    };
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);

    this.isVendorBillLoader = true;

    this._OrderManageService.PutAPIData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (res: any) => {
          if (res.success) {
            this._OrderManageService.snackBar(res.message);
          }
          this.isVendorBillLoader = false;
          this._changeDetectorRef.markForCheck();
        },
        (err) => {
          this.isVendorBillLoader = false;
          this._changeDetectorRef.markForCheck();
        }
      );
  }
  addAccessories() {
    if (this.accessoryForm.name?.trim() == '' || !Number(this.accessoryForm.quantity)) {
      this._OrderManageService.snackBar('Imprint name and quantity is required');
      return;
    }
    if (Number(this.accessoryForm.quantity) < 0 || Number(this.accessoryForm.cost) < 0 || Number(this.accessoryForm.setup) < 0) {
      this._OrderManageService.snackBar('Values should be positive');
      return;
    }
    let payload: addAccessory = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      accessoryName: this.accessoryForm.name?.trim(),
      accessoryQuantity: Number(this.accessoryForm.quantity),
      accessoryUnitCost: Number(this.accessoryForm.cost),
      accessorySetup: Number(this.accessoryForm.setup),
      add_accessory: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isAccessoriesLoader = true;
    this._OrderManageService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
        this.getImprintData();
      } else {
        this.isAccessoriesLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAccessoriesLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  addAdjustment() {
    if (this.adjustmentForm.name?.trim() == '' || !Number(this.adjustmentForm.cost)) {
      this._OrderManageService.snackBar('Imprint name and cost is required');
      return;
    }
    if (Number(this.adjustmentForm.cost) < 0) {
      this._OrderManageService.snackBar('Cost should be positive');
      return;
    }
    let payload: AddAdjustment = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      adjustmentTotalCost: Number(this.adjustmentForm.cost),
      adjustmentName: this.adjustmentForm.name?.trim(),
      add_adjustment: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isAdjustmentLoader = true;
    this._OrderManageService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
        this.getImprintData();
      } else {
        this.isAdjustmentLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAdjustmentLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  addImprintPO() {
    if (this.imprintForm.name?.trim() == '' || !Number(this.imprintForm.quantity)) {
      this._OrderManageService.snackBar('Imprint name and quantity is required');
      return;
    }
    if (Number(this.imprintForm.quantity) < 0 || Number(this.imprintForm.run) < 0 || Number(this.imprintForm.setup) < 0 || Number(this.imprintForm.n_color) < 0) {
      this._OrderManageService.snackBar('Values should be positive');
      return;
    }
    let payload: Add_PO_Imprint = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      imprintName: this.imprintForm.name?.trim(),
      imprintQuantity: Number(this.imprintForm.quantity),
      imprintRun: Number(this.imprintForm.run),
      imprintSetup: Number(this.imprintForm.setup),
      imprintNumColors: Number(this.imprintForm.n_color),
      imprintColors: this.imprintForm.imprint_color,
      add_po_imprint: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isAddImprintLoader = true;
    this._OrderManageService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
        this.getImprintData();
      } else {
        this.isAddImprintLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAddImprintLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  addColorsPO() {
    if (this.colorsForm.name.trim() == '' || Number(this.colorsForm.quantity) == 0 || !this.colorsForm.cost) {
      this._OrderManageService.snackBar('Name Quantity and cost is required');
      return;
    }
    let payload: AddPOOption = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      optionName: this.colorsForm.name.trim(),
      optionQuantity: Number(this.colorsForm.quantity),
      optionUnitCost: Number(this.colorsForm.cost),
      add_po_options: true
    }
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isAddColorLoader = true;
    this._OrderManageService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
        this.getImprintData();
      } else {
        this.isAddColorLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAddColorLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  removePODetails(item, check) {
    let params: any;
    if (check == 'adjustment') {
      this.isAdjustmentDelLoader = true;
      params = {
        orderLinePOAdjustmentID: item.pk_orderLinePOAdjustmentID,
        orderLinePOID: this.orderDataPO.pk_orderLinePOID,
        remove_adjustment: true
      }
    } else if (check == 'colors') {
      this.isDelColorLoader = false;
      params = {
        orderLinePOOptionID: item.pk_orderLinePOOptionID,
        orderLinePOID: this.orderDataPO.pk_orderLinePOID,
        remove_po_options: true
      }
    } else if (check == 'accessory') {
      this.isAccessoriesDelLoader = false;
      params = {
        orderLinePOAccessoryID: item.pk_orderLinePOAccessoryID,
        orderLinePOID: this.orderDataPO.pk_orderLinePOID,
        remove_accessory: true
      }
    } else if (check == 'imprint') {
      this.isDelImprintLoader = false;
      params = {
        orderLinePOImprintID: item.pk_orderLinePOImprintID,
        orderLinePOID: this.orderDataPO.pk_orderLinePOID,
        remove_po_imprint: true
      }
    }
    this._OrderManageService.PutAPIData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      // this.isAccessoriesDelLoader = false;
      // this.isAdjustmentDelLoader = false;
      // this.isDelColorLoader = false;
      // this.isDelImprintLoader = false;
      // this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getImprintData();
        setTimeout(() => {
          this._OrderManageService.snackBar(res["message"]);
        }, 500);
      } else {
        this.isAccessoriesDelLoader = false;
        this.isAdjustmentDelLoader = false;
        this.isDelColorLoader = false;
        this.isDelImprintLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAccessoriesDelLoader = false;
      this.isAdjustmentDelLoader = false;
      this.isDelColorLoader = false;
      this.isDelImprintLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  sendPOModal() {
    $(this.sendPO.nativeElement).modal('show');
  }
  closeSendPOModal() {
    $(this.sendPO.nativeElement).modal('hide');
  }
  sendPoOrder() {
    this.isSentPOLoader = true;
    const { } = this.orderData;
    let poOptions = [];
    let poImprints = [];
    let poAccessories = [];
    let poAdjustments = [];
    const { fk_orderID, blnGroupRun, storeName } = this.orderData;
    const { pk_orderLinePOID, shippingDate, estimatedShippingDate, trackingNumber, blnSample, fk_orderLineID, shippingCustomerAccountNumber, POinHandsDate, stockFrom, fk_vendorID, vendorShippingName, vendorShippingAddress1, vendorShippingAddress2, vendorShippingCity, vendorShippingState, vendorShippingZip, vendorShippingPhone, vendorShippingEmail, shippingComment, shipToCompanyName, shipToCustomerName, shipToLocation, shipToPurchaseOrder, shipToAddress, shipToCity, shipToState, shipToZip, shipToCountry, imprintComment, POTotal, shipToDeliverTo, productName, quantity, purchaseOrderNumber, purchaseOrderComments, blnDuplicate, blnDecorator, blnSupplier } = this.orderDataPO;

    this.colorsList.forEach(element => {
      poOptions.push({
        optionName: element.optionName.replace(/'/g, "''"),
        quantity: element.quantity,
        unit: element.unitCost,
        total: element.total
      })
    });
    this.imprintdata.forEach(element => {
      poImprints.push({
        imprintName: element.imprintName.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        total: element.total,
        reorderNumber: element.reorderNumber,
        setup: element.setup,
        processQuantity: element.processQuantity,
        colors: element.colors,
        imprintComment: imprintComment
      })
    });

    this.accessoriesList.forEach(element => {
      poAccessories.push({
        accessoryName: element.accessoryName.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        totalCost: element.totalCost,
        setupCost: element.setupCost
      })
    });
    this.adjustmentsList.forEach(element => {
      poAdjustments.push({
        adjustmentName: element.adjustmentName.replace(/'/g, "''"),
        unitCost: element.unitCost
      })
    });

    let payload: SaveAndSendPurchaseOrder = {
      orderLinePOID: pk_orderLinePOID,
      purchaseOrderNumber: purchaseOrderNumber,
      purchaseOrderComments: purchaseOrderComments,
      POTotal: POTotal,
      vendorShippingName: vendorShippingName,
      vendorShippingEmail: vendorShippingEmail,
      shippingDate: shippingDate ? moment(shippingDate).format('L') : shippingDate,
      estimatedShippingDate: estimatedShippingDate ? moment(estimatedShippingDate).format('L') : estimatedShippingDate,
      trackingNumber: trackingNumber,
      total: POTotal,
      blnArtNeedsResent: this.blnArtNeedsResent,
      blnGroupRun: blnGroupRun,
      productName: productName.replace(/'/g, "''"),
      storeName: storeName.replace(/'/g, "''"),
      orderManageLoggedInUserName: this.ordermanageUserData.firstName + ' ' + this.ordermanageUserData.lastName,
      orderId: fk_orderID,
      blnSample: blnSample,
      orderLineID: fk_orderLineID,
      fk_vendorID: fk_vendorID,
      customerAccountNumber: shippingCustomerAccountNumber,
      shipToPurchaseOrder: shipToPurchaseOrder,
      vendorShippingAddress1: vendorShippingAddress1,
      vendorShippingAddress2: vendorShippingAddress2,
      vendorShippingCity: vendorShippingCity,
      quantity: quantity,
      vendorShippingState: vendorShippingState,
      vendorShippingZip: vendorShippingZip,
      vendorShippingPhone: vendorShippingPhone,
      shippingComment: shippingComment,
      POinHandsDate: POinHandsDate ? moment(POinHandsDate).format('L') : POinHandsDate,
      shipToCompanyName: shipToCompanyName,
      shipToCustomerName: shipToCustomerName,
      shipToLocation: shipToLocation,
      shipToAddress: shipToAddress,
      shipToDeliverTo: shipToDeliverTo,
      shipToCity: shipToCity,
      shipToState: shipToState,
      shipToZip: shipToZip,
      shipToCountry: shipToCountry,
      stockFrom: stockFrom,
      blnDecorator: blnDecorator,
      blnSupplier: blnSupplier,
      poOptions: poOptions,
      poImprints: poImprints,
      poAccessories: poAccessories,
      poAdjustments: poAdjustments,
      save_send_purchase_order: true
    }
    this._OrderManageService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
        this.orderDataPO.internalComments = this.orderDataPO.internalComments + '<br>' + res["newOrderComment"];
        this.closeSendPOModal();
      }
      this.isSentPOLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSentPOLoader = false;
      this._changeDetectorRef.markForCheck();
    });

  }


  savePoOrder() {
    const { fk_orderID, blnGroupRun, storeName, pk_companyID, currentTotal } = this.orderData;
    const { pk_orderLinePOID, shippingDate, estimatedShippingDate, trackingNumber, blnSample, fk_orderLineID, shippingCustomerAccountNumber, POinHandsDate, stockFrom, fk_vendorID, vendorShippingName, vendorShippingAddress1, vendorShippingAddress2, vendorShippingCity, vendorShippingState, vendorShippingZip, vendorShippingPhone, vendorShippingEmail, shippingComment, shipToCompanyName, shipToCustomerName, shipToLocation, shipToPurchaseOrder, shipToAddress, shipToCity, shipToState, shipToZip, shipToCountry, imprintComment, POTotal, shipToDeliverTo, productName, quantity, purchaseOrderNumber, purchaseOrderComments, blnDuplicate, blnDecorator, blnSupplier, coop, imprintDetail } = this.orderDataPO;
    // Colors
    let OrderLinePOOptions = [];
    this.colorsList.forEach(element => {
      OrderLinePOOptions.push({
        optionName: element.optionName.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        productName: productName,
        total: element.total,
        pk_orderLinePOOptionID: element.pk_orderLinePOOptionID
      });
    });
    // Imprints
    let orderLineImprint = [];
    this.imprintdata.forEach(element => {
      orderLineImprint.push({
        imprintName: element.imprintName,
        quantity: element.quantity,
        unitCost: element.unitCost,
        total: element.total,
        colors: element.colors,
        setup: element.setup,
        totalImprintColors: element.totalImprintColors,
        imprintComment: imprintComment,
        processQuantity: element.processQuantity,
        reorderNumber: element.reorderNumber,
        pk_orderLinePOImprintID: element.pk_orderLinePOImprintID,
      });
    });
    // Accessories
    let orderLineAccessory = [];
    this.accessoriesList.forEach(element => {
      orderLineAccessory.push({
        accessoryName: element.accessoryName.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        totalCost: element.totalCost,
        setupCost: element.setupCost,
        pk_orderLinePOAccessoryID: element.pk_orderLinePOAccessoryID,
      });
    });
    // Adjustments  
    let orderLineAdjustments = [];
    this.adjustmentsList.forEach(element => {
      orderLineAdjustments.push({
        adjustmentName: element.adjustmentName.replace(/'/g, "''"),
        unitCost: element.unitCost,
        pk_orderLinePOAdjustmentID: element.pk_orderLinePOAdjustmentID
      })
    });
    // OrderLinePO
    let OrderLinePO = {
      fk_vendorID: fk_vendorID,
      vendorShippingName: vendorShippingName,
      vendorShippingAddress1: vendorShippingAddress1,
      vendorShippingAddress2: vendorShippingAddress2,
      vendorShippingCity: vendorShippingCity,
      vendorShippingState: vendorShippingState,
      vendorShippingZip: vendorShippingZip,
      vendorShippingPhone: vendorShippingPhone,
      vendorShippingEmail: vendorShippingEmail,
      shippingComment: shippingComment,
      shipToCompanyName: shipToCompanyName,
      shipToCustomerName: shipToCustomerName,
      shipToLocation: shipToLocation,
      shipToPurchaseOrder: shipToPurchaseOrder,
      shipToAddress: shipToAddress,
      shipToCity: shipToCity,
      shipToState: shipToState,
      shipToZip: shipToZip,
      shipToCountry: shipToCountry,
      imprintComment: imprintComment,
      POTotal: POTotal,
      shipToDeliverTo: shipToDeliverTo,
      quantity: quantity,
      purchaseOrderNumber: purchaseOrderNumber,
      productName: productName,
      purchaseOrderComments: purchaseOrderComments,
      blnDuplicate: blnDuplicate,
      POinHandsDate: POinHandsDate,
      stockFrom: stockFrom,
      imprintDetail: imprintDetail,
      coop: coop,
      shippingDate: shippingDate,
      estimatedShippingDate: estimatedShippingDate,
      trackingNumber: trackingNumber,
      total: currentTotal,
      blnGroupRun: blnGroupRun,
      orderId: fk_orderID,
      orderLineID: fk_orderLineID,
      storeName: storeName,
      blnDecorator: blnDecorator,
      blnSupplier: blnSupplier,
      blnSample: blnSample,
      customerAccountNumber: shippingCustomerAccountNumber
    }
    let payload: SavePurchaseOrder = {
      orderManageLoggedInUserName: this.ordermanageUserData.firstName + ' ' + this.ordermanageUserData.lastName,
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      orderLinePO: OrderLinePO,
      orderLineOptions: OrderLinePOOptions,
      orderLineImprints: orderLineImprint,
      orderLineAccessories: orderLineAccessory,
      orderLineAdjustments: orderLineAdjustments,
      blnArtNeedsResent: this.blnArtNeedsResent,
      save_purchase_order: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isSavePOLoader = true;
    this._OrderManageService.PutAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
      }
      this.isSavePOLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSavePOLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  removePOModal() {
    $(this.removePO.nativeElement).modal('show');
  }
  CloseremovePOModal() {
    $(this.removePO.nativeElement).modal('hide');
  }

  removePoOrder() {
    this.isRemovePOLoader = true;
    let orderID = this.orderData.fk_orderID;
    let orderLineID = this.orderDataPO.pk_orderLinePOID;
    let payload: DeletePurchaseOrder = {
      orderLinePOID: orderLineID,
      orderId: orderID,
      delete_purchase_order: true
    }
    this._OrderManageService.PutAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
        this.CloseremovePOModal();
        this.isRemovePOLoader = false;
        this._changeDetectorRef.markForCheck();
        let parameters = {
          orderID: this.orderData.fk_orderID,
          status: 0,
        };
        this.router.navigate(['/ordermanage/dashboard'], { queryParams: parameters });
      }

    }, err => {
      this.isRemovePOLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // CreatePurchaseOrder
  goToPoOrder() {
    this.isAddPOOder = true;
  }

  // Duplicate purchase order:
  duplicatePOOrder() {
    let orderLineOption = [];
    let orderLineImprint = [];
    let orderLineAccessory = [];
    let orderLineAdjustments = [];
    let OrderLinePO;

    const { } = this.orderData;
    const { fk_vendorID, vendorShippingName, vendorShippingAddress1, vendorShippingAddress2, vendorShippingCity, vendorShippingState, vendorShippingZip, vendorShippingPhone, vendorShippingEmail, shippingComment, shipToCompanyName, shipToCustomerName, shipToLocation, shipToPurchaseOrder, shipToAddress, shipToCity, shipToState, shipToZip, shipToCountry, imprintComment, POTotal, shipToDeliverTo, productName, quantity, purchaseOrderNumber, purchaseOrderComments, blnDuplicate } = this.orderDataPO;

    OrderLinePO = {
      fk_vendorID: fk_vendorID,
      vendorShippingName: vendorShippingName,
      vendorShippingAddress1: vendorShippingAddress1,
      vendorShippingAddress2: vendorShippingAddress2,
      vendorShippingCity: vendorShippingCity,
      vendorShippingState: vendorShippingState,
      vendorShippingZip: vendorShippingZip,
      vendorShippingPhone: vendorShippingPhone,
      vendorShippingEmail: vendorShippingEmail,
      shippingComment: shippingComment.replace(/'/g, "''"),
      shipToCompanyName: shipToCompanyName,
      shipToCustomerName: shipToCustomerName,
      shipToLocation: shipToLocation,
      shipToPurchaseOrder: shipToPurchaseOrder,
      shipToAddress: shipToAddress,
      shipToCity: shipToCity,
      shipToState: shipToState,
      shipToZip: shipToZip,
      shipToCountry: shipToCountry,
      imprintComment: imprintComment,
      POTotal: POTotal,
      shipToDeliverTo: shipToDeliverTo,
      productName: productName,
      quantity: quantity,
      purchaseOrderNumber: purchaseOrderNumber,
      purchaseOrderComments: purchaseOrderComments,
      blnDuplicate: blnDuplicate
    }
    const { pk_orderLinePOID } = this.orderDataPO;
    const { fk_orderID } = this.orderData;

    this.colorsList.forEach(element => {
      orderLineOption.push({
        productName: element.productName.replace(/'/g, "''"),
        optionName: element.optionName.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        total: element.total,
        fk_optionID: element.fk_optionID
      })
    });
    this.imprintdata.forEach(element => {
      orderLineImprint.push({
        imprintName: element.imprintName.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        total: element.total,
        colors: element.colors,
        setup: element.setup,
        totalImprintColors: element.totalImprintColors,
        blnStitchProcess: element.blnStitchProcess,
        blnColorProcess: element.blnColorProcess,
        blnSingleProcess: element.blnSingleProcess,
        processQuantity: element.processQuantity,
        fk_imprintID: element.fk_imprintID
      })
    });

    this.accessoriesList.forEach(element => {
      orderLineAccessory.push({
        accessoryName: element.accessoryName.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        totalCost: element.totalCost,
        setupCost: element.setupCost
      })
    });
    this.adjustmentsList.forEach(element => {
      orderLineAdjustments.push({
        adjustmentName: element.adjustmentName.replace(/'/g, "''"),
        unitCost: element.unitCost
      })
    });

    let payload: DuplicatePO = {
      order_id: fk_orderID,
      orderLinePOID: pk_orderLinePOID,
      orderLinePO: OrderLinePO,
      orderLineOptions: orderLineOption,
      orderLineImprints: orderLineImprint,
      orderLineAccessories: orderLineAccessory,
      orderLineAdjustments: orderLineAdjustments,
      duplicate_purchase_order: true
    }
    this.isDuplicatePOLoader = true;
    this._OrderManageService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isDuplicatePOLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._OrderManageService.snackBar(res["message"]);
      this.redirectToPO(res["newID"]);
    })
  }
  redirectToPO(newID) {
    const queryParams: NavigationExtras = {
      queryParams: { fk_orderID: this.orderData.pk_orderID, pk_orderLineID: this.paramData.pk_orderLineID, pk_orderLinePOID: newID }
    };
    this.router.navigate(['/ordermanage/order-details'], queryParams);
  }
  getVendorsDataByID(id) {
    this._vendorService.getVendorsSupplierById(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      const vendor = res["data"][0];
      this.orderDataPO.vendorShippingAddress1 = vendor.address;
      this.orderDataPO.vendorShippingCity = vendor.city;
      this.orderDataPO.vendorShippingState = vendor.state;
      this.orderDataPO.vendorShippingZip = vendor.zipCode;
      this.orderDataPO.vendorShippingEmail = vendor.artworkEmail;
      this.orderDataPO.vendorShippingComment = vendor.shippingComment;
      this.orderDataPO.vendorShippingPhone = vendor.phone;
      this._changeDetectorRef.markForCheck();
    });
  }
  receiveDataFromChild(data: any) {
    let d = JSON.parse(data);
    if (d == 'Po Created') {
      // this.isLoading = true;
      this.isAddPOOder = false;
      // this.getVendorsData();
      // this.getOrderDetails();
    }
  }
  checkFileExist(url) {
    // let params = {
    //   file_check: true,
    //   url: url
    // }
    // this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    //   if (type == 'brand') {
    //     this.brandGuideExist = res["isFileExist"];
    //   } else if (type == 'finalArtwork') {
    //     this.imprintdata[index].viewFinalArtworkCheck = res["isFileExist"];
    //   }
    // })
  }
  getArtworkFiles() {
    let payload = {
      files_fetch: true,
      path: `/artwork/POProof/${this.orderDataPO.fk_orderLineID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._smartartService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      this.orderDataPO.poProofFiles = files["data"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }

  // Modify Status
  modifyStatus() {
    this.orderDataPO.isStatusLoader = true;
    const { pk_orderLinePOID, statusID } = this.orderDataPO;
    let payload: updatePurchaseOrderStatus = {
      orderLinePOID: pk_orderLinePOID,
      statusID: statusID,
      update_purchase_order_status: true
    }
    this._OrderManageService.PutAPIData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.orderDataPO.isStatusLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
      }
    })
  }
  uploadAttachmentFile(event) {
    this.imageAttachmentValue = null;
    const file = event.target.files[0];
    let type = file["type"];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const extension = type.split("/")[1]; // Extract the extension from the MIME type
      this.imageAttachmentValue = {
        imageUpload: reader.result,
        type: extension,
        mime: type
      };
      console.log(this.imageAttachmentValue);
    }
  };
  addAttachmentFile() {
    if (!this.imageAttachmentValue) {
      this._OrderManageService.snackBar('Please choose any file');
      return;
    }
    const { imageUpload, type, mime } = this.imageAttachmentValue;
    this.isAttachmentLoader = true;
    let payload: AddAttachment = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      extension: type,
      name: this.attachmentName.trim(),
      mimeType: mime,
      add_attachment: true
    }
    this._OrderManageService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.uploadAttachemnetFileToServer(res["newAttachmentID"]);
      } else {
        this.isAttachmentLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAttachmentLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  uploadAttachemnetFileToServer(id) {
    const { imageUpload, type, mime } = this.imageAttachmentValue;
    const path = `/globalAssets/Orders/PurchaseOrders/attachments/${this.orderDataPO.pk_orderLinePOID}/${id}.${type}`;
    const base64 = imageUpload.split(",")[1];
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: path
    };
    this._OrderManageService.addMedia(payload)
      .subscribe((response) => {
        this.attachmentsList.push({
          pk_purchaseOrderAttachmentID: id,
          fk_orderLinePOID: this.orderDataPO.pk_orderLinePOID,
          extension: type,
          name: this.attachmentName
        });
        this._smartartService.snackBar('Attachement File Uploaded Successfully');
        this.attachmentFile.nativeElement.value = '';
        this.attachmentName = '';
        this.isAttachmentLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isAttachmentLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  deleteAttachment(item) {
    item.delLoader = true;
    let payload = {
      attachmentID: item.pk_purchaseOrderAttachmentID,
      delete_attachment: true
    }
    this._OrderManageService.PutAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.attachmentsList = this.attachmentsList.filter(files => files.pk_purchaseOrderAttachmentID != item.pk_purchaseOrderAttachmentID);
        this.deleteFileFromServer(item);
      } else {
        item.delLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      item.delLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  deleteFileFromServer(item) {
    const path = `/globalAssets/Orders/PurchaseOrders/attachments/${this.orderDataPO.pk_orderLinePOID}/${item.pk_purchaseOrderAttachmentID}.${item.extension.replace(/ /g, '')}`;
    let payload = {
      files: [path],
      delete_multiple_files: true
    }
    this._commonService.removeMediaFiles(payload)
      .subscribe((response) => {
        this._OrderManageService.snackBar('Attachment Removed Successfully');
        this.attachmentsList = this.attachmentsList.filter(files => files.pk_purchaseOrderAttachmentID != item.pk_purchaseOrderAttachmentID);
        item.delLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        item.delLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  // PDF Make
  generatePDF() {
    // const documentDefinition: any = {
    //   pageSize: 'A4',
    //   pageOrientation: 'landscape',
    //   pageMargins: [10, 10, 10, 10],
    //   content: [],
    //   styles: {
    //     tableHeader: {
    //       bold: true
    //     }
    //   }
    // };
    // let customerAccountNumber = this.orderData.customerAccountNumber ? `Customer Account ##: ${this.orderData.customerAccountNumber}` : ''
    // documentDefinition.content.push(
    //   { text: 'Please acknowledge that you have received this PO by clicking here', link: `https://admin.consolidus.com/dspPOAck3.cfm?OLID=${this.paramData.pk_orderLineID}&OID=${this.paramData.fk_orderID}&CID=${this.orderDataPO.fk_vendorID}&S=${this.orderDataPO.blnSample ? 1 : 0}`, color: 'red', margin: [0, 2, 0, 0], fontSize: 8 },
    //   { text: `If the link above isn't working, please copy and paste this URL in to your browser`, margin: [0, 2, 0, 0], fontSize: 8 },
    //   { text: `https://admin.consolidus.com/dspPOAck3.cfm?OLID=${this.paramData.pk_orderLineID}&OID=${this.paramData.fk_orderID}&CID=${this.orderDataPO.fk_vendorID}&S=${this.orderDataPO.blnSample ? 1 : 0}`, link: `https://admin.consolidus.com/dspPOAck3.cfm?OLID=${this.paramData.pk_orderLineID}&OID=${this.paramData.fk_orderID}&CID=${this.orderDataPO.fk_vendorID}&S=${this.orderDataPO.blnSample ? 1 : 0}`, margin: [0, 2, 0, 0], fontSize: 8 },
    //   { text: '', margin: [0, 20, 0, 0] },
    //   {
    //     table: {
    //       widths: ['*', '*'], // Adjust the width of columns as needed
    //       body: [
    //         [
    //           {
    //             text: [
    //               { text: `${this.orderData.storeName} is a subsidiary of Consolidus, LLC.\n`, bold: true },
    //               'Consolidus LLC\n',
    //               '526 S.Main St.\n',
    //               'Suite 804\n',
    //               'Akron, OH 44311\n',
    //               'P: 330-319-7203, F: 330-319-7213\n',
    //               customerAccountNumber,
    //             ], border: [false, false, false, false]
    //           },
    //           { text: ['PURCHASE ORDER\n', `#${this.orderDataPO.purchaseOrderNumber}\n`, `Sent on ${moment().format('MM/DD/yyyy hh:mm:ss')}`], alignment: 'right', border: [false, false, false, false], bold: true },
    //         ]
    //       ],
    //     },
    //     layout: {
    //       defaultBorder: false, // Remove borders from the entire table
    //     },
    //     fontSize: 8
    //   },
    //   { text: '', margin: [0, 20, 0, 0] },
    //   {
    //     table: {
    //       widths: ['auto', 'auto'], // Adjust the width of columns as needed
    //       body: [
    //         [
    //           { text: 'PURCHASE ORDER #' },
    //           { text: this.orderDataPO.purchaseOrderNumber }
    //         ]
    //       ],
    //     },
    //     layout: {
    //       defaultBorder: false, // Remove borders from the entire table
    //     },
    //     fontSize: 8
    //   }
    // );
    // if (this.orderDataPO.shipToPurchaseOrder) {
    //   documentDefinition.content[6].table.body.push(
    //     [{ text: 'CUSTOMER PURCHASE ORDER #' },
    //     { text: this.orderDataPO.shipToPurchaseOrder }]
    //   )
    // }
    // documentDefinition.content[6].table.body.push([{ text: 'VENDOR' },
    // {
    //   text: [
    //     `${this.orderDataPO.vendorShippingName}\n`,
    //     `${this.orderDataPO.vendorShippingAddress1}\n`,
    //     `${this.orderDataPO.vendorShippingAddress2 || ''}\n`,
    //     `${this.orderDataPO.vendorShippingCity} ${this.orderDataPO.vendorShippingState} ${this.orderDataPO.vendorShippingZip}\n`,
    //     `${this.orderDataPO.vendorShippingPhone}\n`,
    //     `\n`,
    //     this.orderDataPO.vendorShippingEmail,
    //   ], bold: true
    // }]);
    // if (customerAccountNumber) {
    //   documentDefinition.content[6].table.body.push(
    //     [{ text: 'ACCT #', bold: true },
    //     {
    //       text: `${this.orderDataPO.customerAccountNumber}\n`, bold: true
    //     }]);
    // }
    // documentDefinition.content[6].table.body.push(
    //   [{ text: 'SHIPPING', bold: true },
    //   {
    //     text: [
    //       `${this.orderDataPO.shippingComment}\n`,
    //       { text: `Please send tracking to orders@${this.orderData.storeName}`, bold: true }
    //     ], bold: true
    //   }]);
    // pdfMake.createPdf(documentDefinition).download('generated.pdf');
  }

  getDocumentDefinition() {
    const htmlContent = '<h1>Hello, this is HTML content!</h1><p>Thank you for <br>using pdfmake in Angular!</p>';

    return {
      content: [
        // Convert HTML to pdfmake format
        { text: 'PDF generated from HTML:', fontSize: 16, bold: true },
        { text: htmlContent, margin: [0, 10] },
      ],
    };
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
