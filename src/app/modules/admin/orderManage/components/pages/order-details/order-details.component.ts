import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { OrderManageService } from '../../order-manage.service';
import { AddAdjustment, AddComment, AddPOOption, Add_PO_Imprint, DeletePurchaseOrder, DuplicatePO, HideUnhideQuote, SaveAndSendPurchaseOrder, SavePurchaseOrder, SendPurchaseOrder, UpdateEstimatedShipping, UpdateInHandsDate, UpdateTracking, addAccessory, createPurchaseOrder, removePurchaseOrderItem, saveBillPay, saveVendorBill, updatePurchaseOrderStatus } from '../../order-manage.types';
import moment from 'moment';
import { AuthService } from 'app/core/auth/auth.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { VendorsService } from 'app/modules/admin/apps/vendors/components/vendors.service';
import { SmartArtService } from 'app/modules/admin/smartart/components/smartart.service';
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
    })
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
      this.imprintInformation = res["imprintInformation"];
      if (res["purchaseOrders"].length > 0) {
        this.orderDataPO = res["purchaseOrders"][0];
        const { shippingCarrierName, shippingServiceName, shippingCustomerAccountNumber, blnSupplier, blnDecorator } = this.orderDataPO;
        if (shippingCustomerAccountNumber) {
          this.orderDataPO.shippingComment = `${shippingCarrierName}/${shippingServiceName}/ACCT## ${shippingCustomerAccountNumber}`;
        }
        // For PO Order Field
        if ((blnSupplier && blnDecorator) || (!blnSupplier && blnDecorator)) {
          this.orderDataPO.showPurchaseOrder = true;
        }
        this.vendorBillData = {
          vendorInvoiceNumber: this.orderDataPO.vendorInvoiceNumber ? this.orderDataPO.vendorInvoiceNumber : null,
          vendorInvoiceDate: this.orderDataPO.vendorInvoiceDate ? this.orderDataPO.vendorInvoiceDate : null,
          vendorInvoiceNetTerms: this.orderDataPO.vendorInvoiceNetTerms ? this.orderDataPO.vendorInvoiceNetTerms : 0,
          blnInvoiced: this.orderDataPO.blnInvoiced
        }
        this.BillData = {
          billPayPaymentMethod: this.orderDataPO.billPayPaymentMethod ? this.orderDataPO.billPayPaymentMethod : 0,
          billPayPaymentDate: this.orderDataPO.billPayPaymentDate ? this.orderDataPO.billPayPaymentDate : null,
          billPayReference: this.orderDataPO.billPayReference ? this.orderDataPO.billPayReference : null,
          blnPaid: this.orderDataPO.blnPaid
        }
        this.getArtworkFiles();
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
  // Update Bill Pay
  updateBillPay() {
    const paymentDate = this.BillData.billPayPaymentDate ? moment(this.BillData.billPayPaymentDate).format('L') : null;

    const payload: saveBillPay = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      billPayPaymentMethod: this.BillData.billPayPaymentMethod,
      billPayReference: this.BillData.billPayReference,
      billPayPaymentDate: paymentDate,
      blnPaid: this.BillData.blnPaid,
      update_save_bill_pay: true
    };

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
    const invoiceNetTerms = this.vendorBillData.vendorInvoiceNetTerms === '0' ? null : this.vendorBillData.vendorInvoiceNetTerms;

    const payload: saveVendorBill = {
      orderLinePOID: this.orderDataPO.pk_orderLinePOID,
      vendorInvoiceNumber: this.vendorBillData.vendorInvoiceNumber,
      vendorInvoiceDate: invoiceDate,
      vendorInvoiceNetTerms: invoiceNetTerms,
      blnInvoiced: this.vendorBillData.blnInvoiced,
      update_save_vendor_bill: true
    };

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
    this.isSavePOLoader = true;
    // Colors
    let OrderLinePOOptions = [];
    this.colorsList.forEach(element => {
      OrderLinePOOptions.push({
        optionName: element.optionName.replace(/'/g, "''"),
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
        accessoryName: element.accessoryName.replace(/'/g, "''"),
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
      productName: this.orderData.productName.replace(/'/g, "''"),
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
    })
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
      this.isLoading = true;
      this.isAddPOOder = false;
      this.getVendorsData();
      this.getOrderDetails();
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
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };


}
