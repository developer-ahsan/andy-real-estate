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
  selector: 'app-promo-codes',
  templateUrl: './promo-codes.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class PromoCodesComponent implements OnInit, OnDestroy {
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
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService
  ) { }

  initForm() {
    this.addPromoForm = new FormGroup({
      promocode: new FormControl('', Validators.required),
      amount: new FormControl(0, Validators.required),
      threshold: new FormControl(0, Validators.required),
      description: new FormControl('', Validators.required),
      blnActive: new FormControl(true, Validators.required),
      expDate: new FormControl(''),
      blnShipping: new FormControl(false, Validators.required),
      blnRemoveShippingCost: new FormControl(true, Validators.required),
      blnRemoveShippingPrice: new FormControl(true, Validators.required),
      blnRemoveCost: new FormControl(false, Validators.required),
      blnRemovePrice: new FormControl(false, Validators.required),
      blnPercent: new FormControl(false, Validators.required),
      maxAmount: new FormControl(''),
    });
    this.updatePromoForm = new FormGroup({
      promocode: new FormControl({ value: '', disabled: true }, [Validators.required]),
      amount: new FormControl(0, Validators.required),
      threshold: new FormControl(0, Validators.required),
      description: new FormControl('', Validators.required),
      blnActive: new FormControl(true, Validators.required),
      expDate: new FormControl(''),
      blnShipping: new FormControl(false, Validators.required),
      blnRemoveShippingCost: new FormControl(true, Validators.required),
      blnRemoveShippingPrice: new FormControl(true, Validators.required),
      blnRemoveCost: new FormControl(false, Validators.required),
      blnRemovePrice: new FormControl(false, Validators.required),
      blnPercent: new FormControl(false, Validators.required),
      maxAmount: new FormControl(''),
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.isLoading = true;
    this.getPromoCodes(1, 'get');
  };
  calledScreen(value) {
    this.initForm();
    this.mainScreen = value;
    if (this.mainScreen == 'Add New Promo Code') {
      this.isUpdatePromo = false;
    }
  }
  getPromoCodes(page, type) {
    let params = {
      promo_codes: true,
      keyword: this.keyword,
      page: this.page,
      size: 20,
      sort_by: this.sort_by,
      sort_order: this.sort_order
    }
    this.isLoading = true;

    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.keyword == '') {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddPromoLoader = false;
        this.initForm();
        this._systemService.snackBar('Promo code added successfully');
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

  sortData(column: string) {
    this.sort_order = this.sort_order === 'ASC' ? 'DESC' : 'ASC';
    this.sort_by = column;
    this.getPromoCodes(1, 'get');
  }

  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        obj[key] = obj[key]?.replace(/'/g, "''");
      }
    }
    return obj;
  }

  addNewPromoCode() {
    const { maxAmount, promocode, amount, threshold, description, blnActive, expDate, blnShipping, blnRemoveShippingCost, blnRemoveShippingPrice, blnRemoveCost, blnRemovePrice, blnPercent } = this.addPromoForm.getRawValue();
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
    let payload: AddPromoCode = {
      maxAmount, promocode: promocode.trim(), amount, threshold, description: description.trim(), blnActive, expDate: date, blnShipping, blnRemoveShippingCost, blnRemoveShippingPrice, blnRemoveCost, blnRemovePrice, blnPercent, add_promo_code: true
    }
    this.isAddPromoLoader = true;
    this._systemService.AddSystemData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getPromoCodes(1, 'add')
      } else {
        this.isAddPromoLoader = false;
        this._systemService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddPromoLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }
  // Delete Promo
  deletePromo(item) {
    item.delLoader = true;
    let payload: DeletePromoCode = {
      promocode: item.promocode,
      delete_promo_code: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(elem => elem.promocode != item.promocode);
      this.totalUsers--;
      this.tempDataSource = this.tempDataSource.filter(elem => elem.promocode != item.promocode);
      this.tempRecords--;
      this._systemService.snackBar('Promo code deleted successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
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
