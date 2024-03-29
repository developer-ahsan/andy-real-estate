import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../system.service';
import { AddColor, AddImprintColor, AddImprintMethod, AddOhioTaxRate, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod, UpdateOhioTaxRate } from '../../system.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-country-sales',
  templateUrl: './country-sales.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class CountrySalesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'code', 'tax', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  mainScreen: string = 'Current Ohio Country Tax Rates';
  keyword = '';
  not_available = 'N/A';


  isSearching: boolean = false;

  // Add Method
  addOhioForm: FormGroup;
  ngName: string = '';
  ngDesc: string = '';
  isAddCountyLoader: boolean = false;

  // Update Color
  isUpdateOhioLoader: boolean = false;
  isUpdateMethod: boolean = false;
  updateMethodData: any;
  ngRGBUpdate = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.initOhioForm();
    this.getOhioList(1, 'get');
  };
  initOhioForm() {
    this.addOhioForm = new FormGroup({
      zip: new FormControl('', Validators.required),
      county: new FormControl('', Validators.required),
      rate: new FormControl('', Validators.required),
      add_ohio: new FormControl(true, Validators.required)
    });
  }
  calledScreen(value) {
    this.mainScreen = value;
  }
  getOhioList(page, type) {
    let params = {
      ohio_tax_rates: true,
      keyword: this.keyword,
      page: page,
      size: 20
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.rate = element.rate.toFixed(4);
      });
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.keyword == '') {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddCountyLoader = false;
        this.initOhioForm();
        this.ngName = '';
        this.ngDesc = '';
        this._systemService.snackBar('Ohio Tax Added Successfully');
        this.mainScreen = 'Current Ohio Country Tax Rates';
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
    this.getOhioList(this.page, 'get');
  };
  searchColor(value) {
    if (this.dataSource.length != 0) {
      this.paginator.firstPage();
    }
    this.page = 1;
    this.keyword = value;
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getOhioList(1, 'get');
  }
  resetSearch() {
    if (this.dataSource.length != 0) {
      this.paginator.firstPage();
    }
    this.keyword = '';
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempRecords;
  }

  addNewCounty() {
    const { county, zip, rate, add_ohio } = this.addOhioForm.getRawValue();
    if (county.trim() == '' || zip.trim() == '' || rate == '') {
      this._systemService.snackBar('Please fill out the required fields.');
      return;
    }

    let payload: AddOhioTaxRate = {
      county, zip, rate, add_ohio
    }
    payload = this._commonService.replaceNullSpaces(payload);
    if (county == '' || zip == '' || rate == '') {
      this._systemService.snackBar('Please fill out the required fields.');
      return;
    }
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    if (payload.rate < 0) {
      this._systemService.snackBar('Tax rate should be positive value');
      return;
    }
    this.isAddCountyLoader = true;
    this._systemService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getOhioList(1, 'add')
      } else {
        this.isAddCountyLoader = false;
        this._systemService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddCountyLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }
  // Delete Color
  deleteColor(item) {
    item.delLoader = true;
    let payload: DeleteImprintColor = {
      imprint_color_id: item.pk_imprintColorID,
      delete_imprint_color: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(color => color.pk_imprintColorID != item.pk_imprintColorID);
      this.totalUsers--;
      this._systemService.snackBar('Color Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
    });
  }
  // Update Method
  updateMethodToggle(item) {
    this.updateMethodData = item;
    this.isUpdateMethod = !this.isUpdateMethod;
  }
  updateOhio() {
    let ohio_rates = [];
    this.dataSource.forEach((element, index) => {
      element = this._commonService.replaceNullSpaces(element);
      element = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(element);
      if (element.county == '' || element.zip == '' || element.rate == '') {
        this._systemService.snackBar('Please fill out the required fields');
        return;
      } else if (element.rate < 0) {
        this._systemService.snackBar('Tax rate should be positive value');
        return;
      } else {
        if (!element.is_delete) {
          element.is_delete = false;
        }
        ohio_rates.push({
          county: element.county,
          zip: element.zip,
          rate: element.rate,
          county_id: element.pk_countyID,
          is_delete: element.is_delete
        });
      }

      if (ohio_rates.length == this.dataSource.length) {
        this.updateOhios(ohio_rates);
      }
    });
  }
  updateOhios(ohio_rates) {
    let payload: UpdateOhioTaxRate = {
      ohio_rates: ohio_rates,
      update_ohio: true
    }
    this.isUpdateOhioLoader = true;
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateOhioLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(item => item.is_delete == false);
      this._systemService.snackBar('Ohio Tax Rates Updated Successfully');
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
