import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { OrderManageService } from '../../order-manage.service';
import { AddAdjustment, AddComment, AddPOOption, Add_PO_Imprint, HideUnhideQuote, SavePurchaseOrder, SendPurchaseOrder, UpdateEstimatedShipping, UpdateInHandsDate, UpdateTracking, addAccessory, removePurchaseOrderItem, saveBillPay, saveVendorBill } from '../../order-manage.types';
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
        this.BillData = {
          billPayPaymentMethod: this.orderDataPO.billPayPaymentMethod ? this.orderDataPO.billPayPaymentMethod : 0,
          billPayPaymentDate: this.orderDataPO.billPayPaymentDate ? this.orderDataPO.billPayPaymentDate : null,
          billPayReference: this.orderDataPO.billPayReference ? this.orderDataPO.billPayReference : null,
          blnPaid: this.orderDataPO.blnPaid
        }
      }
      this.getImprintData();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
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
    let payload: UpdateTracking = {
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
    if (this.orderData.estimatedShippingDate) {
      date = moment(this.orderData.estimatedShippingDate).format('L');
    }
    let payload: UpdateEstimatedShipping = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      orderLineID: this.orderData.pk_orderLineID,
      orderID: this.orderData.pk_orderID,
      blnGroupRun: this.orderData.blnGroupRun,
      blnGroupOrder: false,
      estimatedShippingDate: date,   // format: mm/dd/yy
      update_estimated_shipping: false
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
  updateBillPay() {
    this.isBillLoader = true;
    let date = null;
    if (this.BillData.billPayPaymentDate) {
      date = moment(this.BillData.billPayPaymentDate).format('L');
    }
    let payload: saveBillPay = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
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
    if (this.vendorBillData.vendorInvoiceDate) {
      date = moment(this.vendorBillData.vendorInvoiceDate).format('L');
    }
    let term = this.vendorBillData.vendorInvoiceNetTerms;
    if (this.vendorBillData.vendorInvoiceNetTerms == '0') {
      term = null;
    }
    let payload: saveVendorBill = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      vendorInvoiceNumber: this.vendorBillData.vendorInvoiceNumber,
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
  addAccessories() {
    this.isAccessoriesLoader = true;
    let payload: addAccessory = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      accessoryName: this.accessoryForm.name,
      accessoryQuantity: Number(this.accessoryForm.quantity),
      accessoryUnitCost: Number(this.accessoryForm.cost),
      accessorySetup: Number(this.accessoryForm.cost),
      add_accessory: true
    }
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
    this.isAdjustmentLoader = true;
    let payload: AddAdjustment = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      adjustmentTotalCost: Number(this.adjustmentForm.cost),
      adjustmentName: this.adjustmentForm.name,
      add_adjustment: true
    }
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
    this.isAddImprintLoader = true;
    let payload: Add_PO_Imprint = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      imprintName: this.imprintForm.name,
      imprintQuantity: Number(this.imprintForm.quantity),
      imprintRun: Number(this.imprintForm.run),
      imprintSetup: Number(this.imprintForm.setup),
      imprintNumColors: Number(this.imprintForm.n_color),
      imprintColors: this.imprintForm.imprint_color,
      add_po_imprint: true
    }
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
    this.isAddColorLoader = true;
    let payload: AddPOOption = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      optionName: this.colorsForm.name,
      optionQuantity: Number(this.colorsForm.quantity),
      optionUnitCost: Number(this.colorsForm.cost),
      add_po_options: true
    }
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
  sendPoOrder() {
    this.isSentPOLoader = true;
    let payload: SendPurchaseOrder = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      fk_vendorID: this.orderData.pk_companyID,
      purchaseOrderNumber: this.orderData.purchaseOrderNum,
      vendorShippingName: this.orderDataPO.vendorShippingName,
      shippingDate: this.orderData.shippingDate,
      estimatedShippingDate: this.orderData.estimatedShippingDate,
      trackingNumber: this.orderData.trackingNumber,
      total: this.orderData.currentTotal,
      blnArtNeedsResent: this.blnArtNeedsResent,
      send_purchase_order: true
    }
    this._OrderManageService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
      }
      this.isSentPOLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSentPOLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  savePoOrder() {
    this.isSavePOLoader = true;
    // Colors
    let OrderLinePOOptions = [];
    this.colorsList.forEach(element => {
      OrderLinePOOptions.push({
        optionName: element.optionName,
        quantity: element.quantity,
        unitCost: element.unitCost,
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
        processQuantity: element.processQuantity,
        pk_orderLinePOImprintID: element.pk_orderLinePOImprintID,
      });
    });
    // Accessories
    let orderLineAccessory = [];
    this.accessoriesList.forEach(element => {
      orderLineAccessory.push({
        accessoryName: element.accessoryName,
        quantity: element.quantity,
        unitCost: element.unitCost,
        totalCost: element.totalCost,
        setupCost: element.setupCost,
        pk_orderLinePOAccessoryID: element.pk_orderLinePOAccessoryID,
      });
    });
    // OrderLinePO
    let OrderLinePO = {
      fk_vendorID: this.orderData.pk_companyID,
      vendorShippingName: this.orderDataPO.vendorShippingName,
      vendorShippingAddress1: this.orderDataPO.vendorShippingAddress1,
      vendorShippingAddress2: this.orderDataPO.vendorShippingAddress2,
      vendorShippingCity: this.orderDataPO.vendorShippingCity,
      vendorShippingState: this.orderDataPO.vendorShippingState,
      vendorShippingZip: this.orderDataPO.vendorShippingZip,
      vendorShippingPhone: this.orderDataPO.vendorShippingPhone,
      vendorShippingEmail: this.orderDataPO.vendorShippingEmail,
      shippingComment: this.orderDataPO.shippingComment,
      shipToCompanyName: this.orderDataPO.shipToCompanyName,
      shipToCustomerName: this.orderDataPO.shipToCustomerName,
      shipToLocation: this.orderDataPO.shipToLocation,
      shipToPurchaseOrder: this.orderDataPO.shipToPurchaseOrder,
      shipToAddress: this.orderDataPO.shipToAddress,
      shipToCity: this.orderDataPO.shipToCity,
      shipToState: this.orderDataPO.shipToState,
      shipToZip: this.orderDataPO.shipToZip,
      shipToCountry: this.orderDataPO.shipToCountry,
      imprintComment: this.orderDataPO.imprintComment,
      POTotal: this.orderDataPO.POTotal,
      shipToDeliverTo: this.orderDataPO.shipToDeliverTo,
      productName: this.orderData.productName,
      quantity: this.orderData.quantity,
      purchaseOrderNumber: this.orderDataPO.purchaseOrderNumber,
      purchaseOrderComments: this.orderDataPO.purchaseOrderComments,
      blnDuplicate: true
    }
    let payload: SavePurchaseOrder = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      orderLinePO: OrderLinePO,
      orderLineOptions: OrderLinePOOptions,
      orderLineImprints: orderLineImprint,
      orderLineAccessories: orderLineAccessory,
      save_purchase_order: true
    }
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
  removePoOrder() {
    this.isRemovePOLoader = true;
    let orderID = this.orderData.fk_orderID;
    let orderLineID = this.orderDataPO.fk_orderLineID;
    if (orderLineID) {
      orderID = 0;
    } else {
      orderLineID = 0;
    }
    let payload: removePurchaseOrderItem = {
      orderID: orderID,
      orderLineID: orderLineID,
      remove_purchase_order_item: true
    }
    this._OrderManageService.PutAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._OrderManageService.snackBar(res["message"]);
        this.backToList();
      }
      this.isRemovePOLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isRemovePOLoader = false;
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
