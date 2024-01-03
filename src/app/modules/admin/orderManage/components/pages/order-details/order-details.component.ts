import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { OrderManageService } from '../../order-manage.service';
import { AddAdjustment, AddAttachment, AddComment, AddPOOption, Add_PO_Imprint, DeletePurchaseOrder, DuplicatePO, HideUnhideQuote, POPDFLink, SaveAndSendPurchaseOrder, SavePurchaseOrders, SendPurchaseOrder, UpdateEstimatedShipping, UpdateInHandsDate, UpdateTracking, addAccessory, createPurchaseOrder, removePurchaseOrderItem, saveBillPay, saveVendorBill, updatePurchaseOrderStatus } from '../../order-manage.types';
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
    imprint_color: '',
    imprintComment: ''
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
  blnArtNeedsResent: boolean = true;
  blnExportedBox: boolean = false;
  isSavePOLoader: boolean = false;
  isPDFPOLoader: boolean = false;
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
    { value: 12, label: 'Paid' },
    { value: 11, label: 'Billed' },
    { value: 13, label: 'PO Cancelled' },
  ];



  totalColorsListQuantity = 0;
  totalColorsListCost = 0;
  totalImprintCost = 0
  totalAccessoryCost = 0
  totalAdjustmentCost = 0


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
      const activeSuppliers = res["data"].filter(element => element.blnActiveVendor);
      this.allVendors.push(...activeSuppliers);
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
    this.orderDataPO.blnNotDuplicate = this.orderDataPO.blnDuplicate ? false : true;
    this.orderData.formattedInHandsDate = this.orderData?.formattedInHandsDate ? new Date(this.orderData.formattedInHandsDate) : null;
    this.orderDataPO.formattedShippingDate = this.orderDataPO?.formattedShippingDate ? new Date(this.orderDataPO.formattedShippingDate) : null;
    this.orderDataPO.formattedEstimatedShippingDate = this.orderDataPO.formattedEstimatedShippingDate ? new Date(this.orderDataPO.formattedEstimatedShippingDate) : null;
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
      orderLine_POID: this.paramData.pk_orderLinePOID,
      blnSupplier: this.orderDataPO.blnSupplier,
      blnDecorator: this.orderDataPO.blnDecorator,
      blnDuplicated: this.orderDataPO.blnDuplicated
    }
    this._OrderManageService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.imprintdata = res["imprints"];
      this.colorsList = res["color_sizes"];
      this.adjustmentsList = res["adjustments"];
      this.accessoriesList = res["accessories"];
      this.attachmentsList = res["attachments"];
      this.calculateTotalValues();
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
        imprint_color: '',
        imprintComment: ''
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
  calculateTotalValues() {
    this.totalColorsListQuantity = 0;
    this.totalColorsListCost = 0;
    this.totalAccessoryCost = 0;
    this.totalAdjustmentCost = 0;
    this.totalImprintCost = 0;
    // this.imprintdata = res["imprints"];
    //   this.colorsList = res["color_sizes"];
    //   this.adjustmentsList = res["adjustments"];
    //   this.accessoriesList = res["accessories"];
    //   this.attachmentsList = res["attachments"];

    this.colorsList.forEach(color => {
      color.unitCost = Number(color.unitCost).toFixed(4);
      color.totalCost = Number(color.quantity * color.unitCost).toFixed(4);
      this.totalColorsListCost += Number(color.totalCost);
      this.totalColorsListQuantity += color.quantity;
    });
    this.imprintdata.forEach(imprint => {
      imprint.unitCost = Number(imprint.unitCost).toFixed(4);
      imprint.setup = Number(imprint.setup).toFixed(4);
      imprint.totalCost = Number(Number(imprint.quantity * Number(imprint.unitCost)) + Number(imprint.setup)).toFixed(4);
      this.totalImprintCost += Number(imprint.totalCost);
    });
    this.accessoriesList.forEach(accessory => {
      accessory.unitCost = Number(accessory.unitCost).toFixed(4);
      accessory.setupCost = Number(accessory.setupCost).toFixed(4);
      accessory.totalCost = Number(Number(accessory.quantity * Number(accessory.unitCost)) + Number(accessory.setupCost)).toFixed(4);
      this.totalAccessoryCost += Number(accessory.totalCost);
    });
    this.adjustmentsList.forEach(adjustment => {
      this.totalAdjustmentCost += Number(adjustment.unitCost);
    });
    this.orderDataPO.POTotal = Number(this.totalColorsListCost + this.totalImprintCost + this.totalAccessoryCost + this.totalAdjustmentCost).toFixed(4);
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
        order_id: this.orderData.pk_orderID,
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
    if (this.ngComment?.trim() != '') {
      this.isCommentsLoader = true;
      let payload: AddComment = {
        comment: this.ngComment,
        order_id: this.orderData.pk_orderID,
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
    if (this.orderDataPO.formattedShippingDate) {
      date = moment(this.orderDataPO.formattedShippingDate).format('L');
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
        this.orderDataPO.statusID = 5;
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
    if (this.orderDataPO.formattedEstimatedShippingDate) {
      date = moment(this.orderDataPO.formattedEstimatedShippingDate).format('L');
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
        this.orderDataPO.statusID = 4;
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
            this.orderDataPO.statusID = 12;
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
            this.orderDataPO.statusID = 11;
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
      orderID: this.orderData.pk_orderID,
      accessoryName: this.accessoryForm.name?.replace(/'/g, "''"),
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
      orderID: this.orderData.pk_orderID,
      adjustmentTotalCost: Number(this.adjustmentForm.cost),
      adjustmentName: this.adjustmentForm.name?.replace(/'/g, "''"),
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
      orderID: this.orderData.pk_orderID,
      imprintName: this.imprintForm.name?.replace(/'/g, "''"),
      imprintQuantity: Number(this.imprintForm.quantity),
      imprintRun: Number(this.imprintForm.run),
      imprintSetup: Number(this.imprintForm.setup),
      imprintNumColors: Number(this.imprintForm.n_color),
      imprintColors: this.imprintForm.imprint_color?.replace(/'/g, "''"),
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
    if (this.colorsForm.product?.trim() == '' || this.colorsForm.name?.trim() == '' || Number(this.colorsForm.quantity) == 0 || !this.colorsForm.cost) {
      this._OrderManageService.snackBar('Name Quantity and cost is required');
      return;
    }
    let payload: AddPOOption = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      orderID: this.orderData.pk_orderID,
      optionName: this.colorsForm.name?.trim(),
      productName: this.colorsForm.product?.trim(),
      POQuantity: this.orderDataPO.quantity,
      optionQuantity: Number(this.colorsForm.quantity),
      optionUnitCost: Number(this.colorsForm.cost),
      orderLineID: Number(this.paramData.pk_orderLineID),
      blnGroupRun: this.orderLineData?.blnGroupRun ? this.orderLineData?.blnGroupRun : false,
      groupRunOrderLineID: this.orderLineData?.groupRunOrderLineID ? this.orderLineData?.groupRunOrderLineID : false,
      blnDuplicate: this.orderDataPO.blnDuplicate,
      orderLineImprints: this.imprintdata,
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
      item.isAdjustmentDelLoader = true;
      params = {
        orderLinePOAdjustmentID: item.pk_orderLinePOAdjustmentID,
        orderLinePOID: this.orderDataPO.pk_orderLinePOID,
        orderID: this.orderData.pk_orderID,
        remove_adjustment: true
      }
    } else if (check == 'colors') {
      item.isDelColorLoader = true;
      params = {
        orderLinePOOptionID: item.pk_orderLinePOOptionID,
        orderLinePOID: this.orderDataPO.pk_orderLinePOID,
        orderID: this.orderData.pk_orderID,
        POQuantity: this.orderDataPO.quantity,
        optionQuantity: item.quantity,
        orderLineID: Number(this.paramData.pk_orderLineID),
        blnGroupRun: this.orderLineData?.blnGroupRun ? this.orderLineData?.blnGroupRun : false,
        groupRunOrderLineID: this.orderLineData?.groupRunOrderLineID ? this.orderLineData?.groupRunOrderLineID : false,
        blnDuplicate: this.orderDataPO.blnDuplicate,
        orderLineImprints: this.imprintdata,
        remove_po_options: true
      }
    } else if (check == 'accessory') {
      item.isAccessoriesDelLoader = true;
      params = {
        orderLinePOAccessoryID: item.pk_orderLinePOAccessoryID,
        orderLinePOID: this.orderDataPO.pk_orderLinePOID,
        orderID: this.orderData.pk_orderID,
        remove_accessory: true
      }
    } else if (check == 'imprint') {
      item.isDelImprintLoader = true;
      params = {
        orderLinePOImprintID: item.pk_orderLinePOImprintID,
        orderLinePOID: this.orderDataPO.pk_orderLinePOID,
        orderID: this.orderData.pk_orderID,
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
        item.isAccessoriesDelLoader = false;
        item.isAdjustmentDelLoader = false;
        item.isDelColorLoader = false;
        item.isDelImprintLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      item.isAccessoriesDelLoader = false;
      item.isAdjustmentDelLoader = false;
      item.isDelColorLoader = false;
      item.isDelImprintLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  sendPOModal() {
    this._commonService.showConfirmation('Are you sure you want to send this purchase order?', (confirmed) => {
      if (confirmed) {
        this.sendPoOrder();
      }
    });
    // $(this.sendPO.nativeElement).modal('show');
  }
  closeSendPOModal() {
    $(this.sendPO.nativeElement).modal('hide');
  }
  sendPoOrder() {
    let isPOProofPath = false;
    if (this.orderDataPO.poProofFiles.length) {
      isPOProofPath = true;
    }

    const { pk_orderID, storeName, fk_storeID, pk_companyID, currentTotal, fk_storeUserID, blnEProcurement, blnCashBack, qryStoreUserCashbackSettingsBlnCashBack } = this.orderData;
    let { pk_orderLinePOID, shippingDate, estimatedShippingDate, trackingNumber, blnSample, fk_orderLineID, shippingCustomerAccountNumber, POinHandsDate, stockFrom, fk_vendorID, vendorShippingName, vendorShippingAddress1, vendorShippingAddress2, vendorShippingCity, vendorShippingState, vendorShippingZip, vendorShippingPhone, vendorShippingEmail, shippingComment, shipToCompanyName, shipToCustomerName, shipToLocation, shipToPurchaseOrder, shipToAddress, shipToCity, shipToState, shipToZip, shipToCountry, imprintComment, POTotal, shipToDeliverTo, productName, quantity, purchaseOrderNumber, purchaseOrderComments, blnDuplicate, blnNotDuplicate, blnDecorator, blnSupplier, coop, imprintDetail, blnExported } = this.orderDataPO;
    if (POinHandsDate) {
      POinHandsDate = moment(new Date(POinHandsDate)).format('MM/DD/yyyy');
    }
    if (shippingDate) {
      shippingDate = moment(new Date(shippingDate)).format('MM/DD/yyyy');
    }
    if (estimatedShippingDate) {
      estimatedShippingDate = moment(new Date(estimatedShippingDate)).format('MM/DD/yyyy');
    }
    // const { blnGroupRun, groupRunOrderLineID, customerAccountNumber } = this.orderLineData;
    // Colors
    let OrderLinePOOptions = [];
    for (let i = 0; i < this.colorsList.length; i++) {
      const element = this.colorsList[i];

      if (element.productName?.trim() == '' || element.quantity <= 0 || element.unitCost <= 0) {
        this._OrderManageService.snackBar('Please fill out the fields in Color/Size Breakdown');
        return;
      }

      OrderLinePOOptions.push({
        optionName: element.optionName?.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        productName: element.productName?.replace(/'/g, "''"),
        total: element.totalCost,
        pk_orderLinePOOptionID: element.pk_orderLinePOOptionID
      });
    }

    // Imprints
    let orderLineImprint = [];
    for (let i = 0; i < this.imprintdata.length; i++) {
      const element = this.imprintdata[i];

      if (element.imprintName?.trim() == '' || element.quantity <= 0 || element.unitCost < 0) {
        this._OrderManageService.snackBar('Please fill out the fields in imprints');
        return;
      }

      orderLineImprint.push({
        imprintName: element.imprintName?.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        total: element.totalCost,
        colors: element.colors?.replace(/'/g, "''"),
        setup: element.setup,
        totalImprintColors: element.totalImprintColors,
        imprintComment: element.imprintComment?.replace(/'/g, "''"),
        processQuantity: element.processQuantity,
        reorderNumber: element.reorderNumber,
        pk_orderLinePOImprintID: element.pk_orderLinePOImprintID,
      });
    }

    // Accessories
    let orderLineAccessory = [];
    for (let i = 0; i < this.accessoriesList.length; i++) {
      const element = this.accessoriesList[i];

      if (element.accessoryName?.trim() == '' || element.quantity <= 0 || element.unitCost <= 0) {
        this._OrderManageService.snackBar('Please fill out the fields in accessories');
        return;
      }

      orderLineAccessory.push({
        accessoryName: element.accessoryName?.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        totalCost: element.totalCost,
        setupCost: element.setupCost,
        pk_orderLinePOAccessoryID: element.pk_orderLinePOAccessoryID,
      });
    }

    // Adjustments  
    let orderLineAdjustments = [];
    for (let i = 0; i < this.adjustmentsList.length; i++) {
      const element = this.adjustmentsList[i];

      if (element.adjustmentName?.trim() == '' || element.quantity <= 0 || element.unitCost <= 0) {
        this._OrderManageService.snackBar('Please fill out the fields in adjustments');
        return;
      }

      orderLineAdjustments.push({
        adjustmentName: element.adjustmentName?.replace(/'/g, "''"),
        unitCost: element.unitCost,
        pk_orderLinePOAdjustmentID: element.pk_orderLinePOAdjustmentID
      });
    }
    if (!vendorShippingEmail?.trim()) {
      this._OrderManageService.snackBar('Emails is required');
      return;
    }
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
      POTotal: POTotal,
      shipToDeliverTo: shipToDeliverTo,
      quantity,
      purchaseOrderNumber: purchaseOrderNumber,
      purchaseOrderComments: purchaseOrderComments,
      productName: productName,
      blnDuplicate: blnNotDuplicate,
      POinHandsDate: POinHandsDate,
      stockFrom: stockFrom,
      imprintDetail: imprintDetail,
      coop: coop,
      shippingDate: shippingDate,
      estimatedShippingDate: estimatedShippingDate,
      trackingNumber: trackingNumber,
      total: currentTotal,
      blnExported: blnExported,
      blnGroupRun: this.orderLineData?.blnGroupRun ? this.orderLineData?.blnGroupRun : false,
      isPOProofPath,
      orderID: pk_orderID,
      fk_storeUserID: fk_storeUserID,
      storeID: fk_storeID,
      orderLineID: fk_orderLineID,
      groupRunOrderLineID: this.orderLineData?.groupRunOrderLineID ? this.orderLineData?.groupRunOrderLineID : null,
      storeName: storeName,
      blnDecorator: blnDecorator,
      blnSupplier: blnSupplier,
      blnSample: blnSample,
      customerAccountNumber: this.orderLineData?.customerAccountNumber ? this.orderLineData?.groupRunOrderLineID : null
    }
    let payload: SavePurchaseOrders = {
      orderManageLoggedInUserName: this.ordermanageUserData.firstName + ' ' + this.ordermanageUserData.lastName,
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      orderLinePO: OrderLinePO,
      orderLineOptions: OrderLinePOOptions,
      orderLineImprints: orderLineImprint,
      orderLineAccessories: orderLineAccessory,
      orderLineAdjustments: orderLineAdjustments,
      blnArtNeedsResent: this.blnArtNeedsResent,
      blnSend: true,
      blnCashBack: blnCashBack,
      qryStoreUserCashbackSettingsBlnCashBack: qryStoreUserCashbackSettingsBlnCashBack,
      blnEProcurement: blnEProcurement,
      cashbackDiscount: this.orderData.cashbackDiscount ? this.orderData.cashbackDiscount[0] : null,
      orderLineIDs: this.orderData.orderLineIDs?.split(','),
      fk_groupOrderID: this.orderData.fk_groupOrderID,
      attachments: this.attachmentsList,
      save_purchase_order: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isSentPOLoader = true;
    this._OrderManageService.PutAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
        this.orderDataPO.blnSent = true;
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
    let isPOProofPath = false;
    if (this.orderDataPO.poProofFiles.length) {
      isPOProofPath = true;
    }

    const { pk_orderID, storeName, fk_storeID, pk_companyID, currentTotal, fk_storeUserID, blnEProcurement, blnCashBack, qryStoreUserCashbackSettingsBlnCashBack } = this.orderData;
    let { pk_orderLinePOID, shippingDate, estimatedShippingDate, trackingNumber, blnSample, fk_orderLineID, shippingCustomerAccountNumber, POinHandsDate, stockFrom, fk_vendorID, vendorShippingName, vendorShippingAddress1, vendorShippingAddress2, vendorShippingCity, vendorShippingState, vendorShippingZip, vendorShippingPhone, vendorShippingEmail, shippingComment, shipToCompanyName, shipToCustomerName, shipToLocation, shipToPurchaseOrder, shipToAddress, shipToCity, shipToState, shipToZip, shipToCountry, imprintComment, POTotal, shipToDeliverTo, productName, quantity, purchaseOrderNumber, purchaseOrderComments, blnDuplicate, blnNotDuplicate, blnDecorator, blnSupplier, coop, imprintDetail, blnExported } = this.orderDataPO;
    if (POinHandsDate) {
      POinHandsDate = moment(new Date(POinHandsDate)).format('MM/DD/yyyy');
    }
    if (shippingDate) {
      shippingDate = moment(new Date(shippingDate)).format('MM/DD/yyyy');
    }
    if (estimatedShippingDate) {
      estimatedShippingDate = moment(new Date(estimatedShippingDate)).format('MM/DD/yyyy');
    }
    // const { blnGroupRun, groupRunOrderLineID, customerAccountNumber } = this.orderLineData;
    // Colors
    let OrderLinePOOptions = [];
    for (let i = 0; i < this.colorsList.length; i++) {
      const element = this.colorsList[i];

      if (element.productName?.trim() == '' || element.quantity <= 0 || element.unitCost < 0) {
        this._OrderManageService.snackBar('Please fill out the fields in Color/Size Breakdown');
        return;
      }

      OrderLinePOOptions.push({
        optionName: element.optionName?.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        productName: element.productName?.replace(/'/g, "''"),
        total: element.totalCost,
        pk_orderLinePOOptionID: element.pk_orderLinePOOptionID
      });
    }

    // Imprints
    let orderLineImprint = [];
    for (let i = 0; i < this.imprintdata.length; i++) {
      const element = this.imprintdata[i];

      if (element.imprintName?.trim() == '' || element.quantity <= 0 || element.unitCost < 0) {
        this._OrderManageService.snackBar('Please fill out the fields in imprints');
        return;
      }

      orderLineImprint.push({
        imprintName: element.imprintName?.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        total: element.totalCost,
        colors: element.colors?.replace(/'/g, "''"),
        setup: element.setup,
        totalImprintColors: element.totalImprintColors,
        imprintComment: element.imprintComment?.replace(/'/g, "''"),
        processQuantity: element.processQuantity,
        reorderNumber: element.reorderNumber,
        pk_orderLinePOImprintID: element.pk_orderLinePOImprintID,
      });
    }

    // Accessories
    let orderLineAccessory = [];
    for (let i = 0; i < this.accessoriesList.length; i++) {
      const element = this.accessoriesList[i];

      if (element.accessoryName?.trim() == '' || element.quantity <= 0 || element.unitCost < 0) {
        this._OrderManageService.snackBar('Please fill out the fields in accessories');
        return;
      }

      orderLineAccessory.push({
        accessoryName: element.accessoryName?.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        totalCost: element.totalCost,
        setupCost: element.setupCost,
        pk_orderLinePOAccessoryID: element.pk_orderLinePOAccessoryID,
      });
    }

    // Adjustments  
    let orderLineAdjustments = [];
    for (let i = 0; i < this.adjustmentsList.length; i++) {
      const element = this.adjustmentsList[i];

      if (element.adjustmentName?.trim() == '' || element.quantity <= 0 || element.unitCost < 0) {
        this._OrderManageService.snackBar('Please fill out the fields in adjustments');
        return;
      }

      orderLineAdjustments.push({
        adjustmentName: element.adjustmentName?.replace(/'/g, "''"),
        unitCost: element.unitCost,
        pk_orderLinePOAdjustmentID: element.pk_orderLinePOAdjustmentID
      });
    }
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
      POTotal: POTotal,
      shipToDeliverTo: shipToDeliverTo,
      quantity,
      purchaseOrderNumber: purchaseOrderNumber,
      purchaseOrderComments: purchaseOrderComments,
      productName: productName,
      blnDuplicate: blnNotDuplicate,
      POinHandsDate: POinHandsDate,
      stockFrom: stockFrom,
      imprintDetail: imprintDetail,
      coop: coop,
      shippingDate: shippingDate,
      estimatedShippingDate: estimatedShippingDate,
      trackingNumber: trackingNumber,
      total: currentTotal,
      blnExported: blnExported,
      blnGroupRun: this.orderLineData?.blnGroupRun ? this.orderLineData.blnGroupRun : false,
      isPOProofPath,
      orderID: pk_orderID,
      fk_storeUserID: fk_storeUserID,
      storeID: fk_storeID,
      orderLineID: fk_orderLineID,
      groupRunOrderLineID: this.orderLineData?.groupRunOrderLineID ? this.orderLineData.groupRunOrderLineID : null,
      storeName: storeName,
      blnDecorator: blnDecorator,
      blnSupplier: blnSupplier,
      blnSample: blnSample,
      customerAccountNumber: this.orderLineData?.customerAccountNumber ? this.orderLineData.customerAccountNumber : null
    }
    let payload: SavePurchaseOrders = {
      orderManageLoggedInUserName: this.ordermanageUserData.firstName + ' ' + this.ordermanageUserData.lastName,
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      orderLinePO: OrderLinePO,
      orderLineOptions: OrderLinePOOptions,
      orderLineImprints: orderLineImprint,
      orderLineAccessories: orderLineAccessory,
      orderLineAdjustments: orderLineAdjustments,
      blnArtNeedsResent: false,
      blnSend: false,
      blnCashBack: blnCashBack,
      qryStoreUserCashbackSettingsBlnCashBack: qryStoreUserCashbackSettingsBlnCashBack,
      blnEProcurement: blnEProcurement,
      cashbackDiscount: this.orderData.cashbackDiscount ? this.orderData.cashbackDiscount[0] : null,
      fk_groupOrderID: this.orderData.fk_groupOrderID,
      orderLineIDs: this.orderData.orderLineIDs?.split(','),
      attachments: this.attachmentsList,
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
    this._commonService.showConfirmation('Are you sure you want to remove this purchase order? This cannot be undone.', (confirmed) => {
      if (confirmed) {
        this.removePoOrder();
      }
    });
    // $(this.removePO.nativeElement).modal('show');
  }
  CloseremovePOModal() {
    $(this.removePO.nativeElement).modal('hide');
  }

  removePoOrder() {
    this.isRemovePOLoader = true;
    let orderID = this.orderData.pk_orderID;
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
          orderID: this.orderData.pk_orderID,
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
      shippingComment: shippingComment?.replace(/'/g, "''"),
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
    const { pk_orderID } = this.orderData;

    this.colorsList.forEach(element => {
      orderLineOption.push({
        productName: element.productName?.replace(/'/g, "''"),
        optionName: element.optionName?.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        total: element.total,
        fk_optionID: element.fk_optionID
      })
    });
    this.imprintdata.forEach(element => {
      orderLineImprint.push({
        imprintName: element.imprintName?.replace(/'/g, "''"),
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
        accessoryName: element.accessoryName?.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        totalCost: element.totalCost,
        setupCost: element.setupCost
      })
    });
    this.adjustmentsList.forEach(element => {
      orderLineAdjustments.push({
        adjustmentName: element.adjustmentName?.replace(/'/g, "''"),
        unitCost: element.unitCost
      })
    });

    let payload: DuplicatePO = {
      order_id: pk_orderID,
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
      this.orderDataPO.vendorShippingEmail = vendor.ordersEmail;
      this.orderDataPO.vendorShippingComment = vendor.shippingComment;
      this.orderDataPO.vendorShippingPhone = vendor.phone;
      if (vendor.additionalOrderEmails) {
        this.orderDataPO.vendorShippingEmail = this.orderDataPO.vendorShippingEmail + ',' + vendor.additionalOrderEmails;
      }
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
    }
  };
  addAttachmentFile() {
    if (!this.imageAttachmentValue) {
      this._OrderManageService.snackBar('Please choose any file.');
      return;
    }
    if (!this.attachmentName?.trim()) {
      this._OrderManageService.snackBar('Attachment Name is required.');
      return;
    }
    const { imageUpload, type, mime } = this.imageAttachmentValue;
    this.isAttachmentLoader = true;
    let payload: AddAttachment = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      extension: type,
      name: this.attachmentName?.trim(),
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
    let isPOProofPath = false;
    if (this.orderDataPO.poProofFiles.length) {
      isPOProofPath = true;
    }

    const { pk_orderID, storeName, fk_storeID, pk_companyID, currentTotal, fk_storeUserID, blnEProcurement, blnCashBack, qryStoreUserCashbackSettingsBlnCashBack } = this.orderData;
    let { pk_orderLinePOID, shippingDate, estimatedShippingDate, trackingNumber, blnSample, fk_orderLineID, shippingCustomerAccountNumber, POinHandsDate, stockFrom, fk_vendorID, vendorShippingName, vendorShippingAddress1, vendorShippingAddress2, vendorShippingCity, vendorShippingState, vendorShippingZip, vendorShippingPhone, vendorShippingEmail, shippingComment, shipToCompanyName, shipToCustomerName, shipToLocation, shipToPurchaseOrder, shipToAddress, shipToCity, shipToState, shipToZip, shipToCountry, imprintComment, POTotal, shipToDeliverTo, productName, quantity, purchaseOrderNumber, purchaseOrderComments, blnDuplicate, blnDecorator, blnSupplier, coop, imprintDetail, blnExported } = this.orderDataPO;
    if (POinHandsDate) {
      POinHandsDate = moment(new Date(POinHandsDate)).format('MM/DD/yyyy');
    }
    if (shippingDate) {
      shippingDate = moment(new Date(shippingDate)).format('MM/DD/yyyy');
    }
    if (estimatedShippingDate) {
      estimatedShippingDate = moment(new Date(estimatedShippingDate)).format('MM/DD/yyyy');
    }
    // Colors
    let OrderLinePOOptions = [];
    for (let i = 0; i < this.colorsList.length; i++) {
      const element = this.colorsList[i];

      if (element.productName?.trim() == '' || element.quantity <= 0 || element.unitCost < 0) {
        this._OrderManageService.snackBar('Please fill out the fields in Color/Size Breakdown');
        return;
      }

      OrderLinePOOptions.push({
        optionName: element.optionName?.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        productName: element.productName?.replace(/'/g, "''"),
        total: element.totalCost,
        pk_orderLinePOOptionID: element.pk_orderLinePOOptionID
      });
    }

    // Imprints
    let orderLineImprint = [];
    for (let i = 0; i < this.imprintdata.length; i++) {
      const element = this.imprintdata[i];

      if (element.imprintName?.trim() == '' || element.quantity <= 0 || element.unitCost < 0) {
        this._OrderManageService.snackBar('Please fill out the fields in imprints');
        return;
      }

      orderLineImprint.push({
        imprintName: element.imprintName?.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        total: element.totalCost,
        colors: element.colors?.replace(/'/g, "''"),
        setup: element.setup,
        totalImprintColors: element.totalImprintColors,
        imprintComment: element.imprintComment?.replace(/'/g, "''"),
        processQuantity: element.processQuantity,
        reorderNumber: element.reorderNumber,
        pk_orderLinePOImprintID: element.pk_orderLinePOImprintID,
      });
    }

    // Accessories
    let orderLineAccessory = [];
    for (let i = 0; i < this.accessoriesList.length; i++) {
      const element = this.accessoriesList[i];

      if (element.accessoryName?.trim() == '' || element.quantity <= 0 || element.unitCost < 0) {
        this._OrderManageService.snackBar('Please fill out the fields in accessories');
        return;
      }

      orderLineAccessory.push({
        accessoryName: element.accessoryName?.replace(/'/g, "''"),
        quantity: element.quantity,
        unitCost: element.unitCost,
        totalCost: element.totalCost,
        setupCost: element.setupCost,
        pk_orderLinePOAccessoryID: element.pk_orderLinePOAccessoryID,
      });
    }

    // Adjustments  
    let orderLineAdjustments = [];
    for (let i = 0; i < this.adjustmentsList.length; i++) {
      const element = this.adjustmentsList[i];

      if (element.adjustmentName?.trim() == '' || element.quantity <= 0 || element.unitCost < 0) {
        this._OrderManageService.snackBar('Please fill out the fields in adjustments');
        return;
      }

      orderLineAdjustments.push({
        adjustmentName: element.adjustmentName?.replace(/'/g, "''"),
        unitCost: element.unitCost,
        pk_orderLinePOAdjustmentID: element.pk_orderLinePOAdjustmentID
      });
    }
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
      POTotal: POTotal,
      shipToDeliverTo: shipToDeliverTo,
      quantity,
      purchaseOrderNumber: purchaseOrderNumber,
      purchaseOrderComments: purchaseOrderComments,
      productName: productName,
      blnDuplicate: blnDuplicate,
      POinHandsDate: POinHandsDate,
      stockFrom: stockFrom,
      imprintDetail: imprintDetail,
      coop: coop,
      shippingDate: shippingDate,
      estimatedShippingDate: estimatedShippingDate,
      trackingNumber: trackingNumber,
      total: currentTotal,
      blnExported: blnExported,
      blnGroupRun: this.orderLineData?.blnGroupRun ? this.orderLineData?.blnGroupRun : false,
      isPOProofPath,
      orderID: pk_orderID,
      fk_storeUserID: fk_storeUserID,
      storeID: fk_storeID,
      orderLineID: fk_orderLineID,
      groupRunOrderLineID: this.orderLineData?.groupRunOrderLineID ? this.orderLineData?.groupRunOrderLineID : null,
      storeName: storeName,
      blnDecorator: blnDecorator,
      blnSupplier: blnSupplier,
      blnSample: blnSample,
      customerAccountNumber: this.orderLineData?.customerAccountNumber ? this.orderLineData?.customerAccountNumber : null
    }
    let payload: POPDFLink = {
      orderLinePO: OrderLinePO,
      orderLineOptions: OrderLinePOOptions,
      orderLineImprints: orderLineImprint,
      orderLineAccessories: orderLineAccessory,
      orderLineAdjustments: orderLineAdjustments,
      generate_POPDFLink: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isPDFPOLoader = true;
    this._OrderManageService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      const base64String = res["data"].base64Pdf;
      const fileName = `Purchase-Order-${pk_orderID}-${fk_orderLineID}-${pk_orderLinePOID}.pdf`;

      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = fileName;
      downloadLink.click();
      this.isPDFPOLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isPDFPOLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  enforceMaxDigits(event: any, length): void {
    const maxDigits = length;
    const inputValue = event.target.value.toString();

    if (inputValue.length > maxDigits) {
      event.target.value = +inputValue.slice(0, maxDigits);
      event.preventDefault();
    }
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
