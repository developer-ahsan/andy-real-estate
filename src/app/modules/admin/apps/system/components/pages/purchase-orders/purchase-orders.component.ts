import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../system.service';
import { AddPromoCode, DeleteImprintColor, DeletePromoCode, UpdateImprintMethod, UpdatePromoCode } from '../../system.types';
import moment from 'moment';
@Component({
  selector: 'app-purchase-orders',
  templateUrl: './purchase-orders.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class PurchaseOrdersAdjustmentsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'savings', 'threshold', 'exp', 'active', 'shipping', 'used', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  sort_by: string = '';
  sort_order: string = 'ASC'


  mainScreen: string = 'Current';
  keyword = '';
  not_available = 'N/A';


  isSearching: boolean = false;

  // Add Method
  ngName: string = '';
  ngDesc: string = '';
  isAddPromoLoader: boolean = false;

  // Update Color
  isUpdatePromoLoader: boolean = false;
  isUpdatePromo: boolean = false;
  updatePromoData: any;
  ngRGBUpdate = '';

  addPurchaseForm: FormGroup;
  updatePromoForm: FormGroup;

  purchaseOrders: any;
  isAddPurchaseLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService
  ) { }

  initForm() {
    this.addPurchaseForm = new FormGroup({
      displayName: new FormControl('', Validators.required),
      reportName: new FormControl('', Validators.required),
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.isLoading = true;
    this.getPurchaseOrders();
  };
  calledScreen(value) {
    this.initForm();
    this.mainScreen = value;
  }
  getPurchaseOrders() {
    let params = {
      purchase_order_adjustments: true
    }
    this.isLoading = true;
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.purchaseOrders = [];
      if (res["data"][0].qryAdjustments) {
        const orders = res["data"][0].qryAdjustments.split(',,');
        orders.forEach(order => {
          const [id, displayName, reportName, status] = order.split('::');
          this.purchaseOrders.push({ id, displayName, reportName, status });
        });
      }
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }


  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        obj[key] = obj[key]?.replace(/'/g, "''");
      }
    }
    return obj;
  }

  addNewPurchase() {
    const { displayName, reportName } = this.addPurchaseForm.getRawValue();
    if (displayName.trim() == '' || reportName.trim() == '') {
      this._systemService.snackBar('Please provide both a display and report name for the new adjustment.');
      return;
    }

    let payload = {
      displayName,
      reportName,
      add_purchase_order_adjustment: true
    }
    this.isAddPurchaseLoader = true;
    this._systemService.AddSystemData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._systemService.snackBar(res["message"]);
        this.getPurchaseOrders();
        this.addPurchaseForm.reset();
      }
      this.isAddPurchaseLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddPurchaseLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }
  // Delete Purchase
  deletePurchase(item) {
    item.delLoader = true;
    let payload = {
      purchaseOrderAdjustmentID: Number(item.id),
      delete_purchase_order_adjustment: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.purchaseOrders = this.purchaseOrders.filter(elem => elem.id != item.id);
      this._systemService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
    });
  }
  updatePurchase(item) {
    const { id, displayName, reportName } = item;
    if (displayName.trim() == '' || reportName.trim() == '') {
      this._systemService.snackBar('Please provide both a display and report name for the new adjustment.');
      return;
    }
    let payload = {
      purchaseOrderAdjustmentID: Number(id),
      displayName,
      reportName,
      update_purchase_order_adjustment: true
    }
    item.updateLoader = true;
    this._systemService.UpdateSystemData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._systemService.snackBar(res["message"]);
        this.getPurchaseOrders();
        this.addPurchaseForm.reset();
      }
      item.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.updateLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }

  // Update Promo
  updatePromoToggle(item) {
    if (item) {
      this.updatePromoData = item;
      this.updatePromoForm.patchValue(item);
      if (item.expDate != 0) {
        this.updatePromoForm.patchValue({
          expDate: new Date(item.expDate)
        });
      }
    }
    this.isUpdatePromo = !this.isUpdatePromo;
  }
  updatePromoCode() {
    const { maxAmount, promocode, amount, threshold, description, blnActive, expDate, blnShipping, blnRemoveShippingCost, blnRemoveShippingPrice, blnRemoveCost, blnRemovePrice, blnPercent } = this.updatePromoForm.getRawValue();
    if (promocode.trim() == '' || description.trim() == '') {
      this._systemService.snackBar('Please fill out the required fields');
      return;
    }
    let date;
    if (expDate) {
      date = moment(expDate).format('MM/DD/YYYY');
    } else {
      date = 0;
    }
    let payload: UpdatePromoCode = {
      amount, maxAmount, threshold, description: description.trim(), blnActive, expDate: date, blnShipping, blnRemoveShippingCost, blnRemoveShippingPrice, blnRemoveCost, blnRemovePrice, blnPercent, promocode: promocode.trim(), update_promo_code: true
    }
    this.isUpdatePromoLoader = true;
    this._systemService.UpdateSystemData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdatePromoLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource.filter(elem => {
        if (elem.promocode == this.updatePromoData.promocode) {
          elem.promocode = promocode;
          elem.amount = amount;
          elem.threshold = threshold;
          elem.description = description;
          elem.blnActive = blnActive;
          elem.expDate = moment(expDate).format('MM/DD/YYYY');
          elem.blnShipping = blnShipping;
          elem.blnPercent = blnPercent;
          elem.blnRemoveShippingCost = blnRemoveShippingCost;
          elem.blnRemoveShippingPrice = blnRemoveShippingPrice;
          elem.blnRemoveCost = blnRemoveCost;
          elem.blnRemovePrice = blnRemovePrice;
        }
      });
      this._systemService.snackBar('Promo Code Updated Successfully');
      this.isUpdatePromo = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
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
