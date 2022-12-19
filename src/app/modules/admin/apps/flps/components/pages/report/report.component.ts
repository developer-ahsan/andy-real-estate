import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import moment from 'moment';
import { FLPSService } from '../../flps.service';
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportComponent implements OnInit, OnDestroy {
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

  mainScreen: string = 'Current Promo Codes';
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

  addPromoForm: FormGroup;
  updatePromoForm: FormGroup;
  ngPeriod = 'Weekly';
  maxDate = new Date();
  months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  month = 1;
  currentYear = new Date().getFullYear();
  years = [];

  quarter = 1;
  quarterly = [{
    value: 1,
    text: '1-3'
  },
  {
    value: 2,
    text: '4-6'
  },
  {
    value: 3,
    text: '7-9'
  },
  {
    value: 4,
    text: '10-12'
  }];
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _flpsService: FLPSService
  ) {
  }

  initialize() {
    for (let index = 0; index < 17; index++) {
      this.years.push(this.currentYear - index);
    }
  }
  ngOnInit(): void {
    this.initialize();
    setTimeout(() => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
    }, 100);
  };
  getPromoCodes(page, type) {
    let params = {
      promo_codes: true,
      keyword: this.keyword,
      page: page,
      size: 20
    }
    this._flpsService.getFlpsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.keyword == '') {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddPromoLoader = false;
        this._flpsService.snackBar('PromoCode Added Successfully');
        this.mainScreen = 'Current Promo Codes';
      }
      this.isLoading = false;
      this.isSearching = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSearching = false;
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getPromoCodes(this.page, 'get');
  };
  searchColor(value) {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.page = 1;
    this.keyword = value;
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getPromoCodes(1, 'get');
  }
  resetSearch() {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.keyword = '';
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempRecords;
  }

  addNewPromoCode() {
    const { promocode, amount, threshold, description, blnActive, expDate, blnShipping, blnRemoveShippingCost, blnRemoveShippingPrice, blnRemoveCost, blnRemovePrice, blnPercent } = this.addPromoForm.getRawValue();
    if (promocode == '' || description == '') {
      this._flpsService.snackBar('Please fill out the required fields');
      return;
    }
    let date;
    if (expDate) {
      date = moment(expDate).format('MM/DD/YYYY');
    } else {
      date = 0;
    }
    let payload = {
      promocode, amount, threshold, description, blnActive, expDate: date, blnShipping, blnRemoveShippingCost, blnRemoveShippingPrice, blnRemoveCost, blnRemovePrice, blnPercent, add_promo_code: true
    }
    this.isAddPromoLoader = true;
    this._flpsService.AddFlpsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getPromoCodes(1, 'add')
      } else {
        this.isAddPromoLoader = false;
        this._flpsService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddPromoLoader = false;
      this._flpsService.snackBar('Something went wrong');
    })
  }
  // Delete Promo
  deletePromo(item) {
    item.delLoader = true;
    let payload = {
      promocode: item.promocode,
      delete_promo_code: true
    }
    this._flpsService.UpdateFlpsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(elem => elem.promocode != item.promocode);
      this.totalUsers--;
      this.tempDataSource = this.tempDataSource.filter(elem => elem.promocode != item.promocode);
      this.tempRecords--;
      this._flpsService.snackBar('PromoCode Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._flpsService.snackBar('Something went wrong');
    });
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
    const { promocode, amount, threshold, description, blnActive, expDate, blnShipping, blnRemoveShippingCost, blnRemoveShippingPrice, blnRemoveCost, blnRemovePrice, blnPercent } = this.updatePromoForm.getRawValue();
    if (promocode == '' || description == '') {
      this._flpsService.snackBar('Please fill out the required fields');
      return;
    }
    let date;
    if (expDate) {
      date = moment(expDate).format('MM/DD/YYYY');
    } else {
      date = 0;
    }
    let payload = {
      amount, threshold, description, blnActive, expDate: date, blnShipping, blnRemoveShippingCost, blnRemoveShippingPrice, blnRemoveCost, blnRemovePrice, blnPercent, promocode, update_promo_code: true
    }
    this.isUpdatePromoLoader = true;
    this._flpsService.UpdateFlpsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
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
      this._flpsService.snackBar('Promo Code Updated Successfully');
      this.isUpdatePromo = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._flpsService.snackBar('Something went wrong');
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
