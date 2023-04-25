import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { ApplyBlanketFOBlocation, updateCompanySettings } from '../../reports.types';
import moment from 'moment';

@Component({
  selector: 'app-royalities-reports',
  templateUrl: './royalities-reports.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class RoyalitiesReportComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  isLoading: boolean = false;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  blnSettings: boolean = true;
  isUpdateLoader: boolean = false;
  supplierData: any;

  searchLocationCtrl = new FormControl();
  selectedLocation: any;
  isSearchingLocation = false;

  allLocations = [];
  // ReportDropdowns
  royaltyID: any = 0;
  blnIncludeFulfillment = 0;
  paymentStatus = 1;
  ngStore = 637;

  allStores = [];
  searchStoresCtrl = new FormControl();
  selectedStores: any;
  isSearchingStores = false;

  royaltiesPerStore: any;
  royaltiesPerStoreCheck: boolean = true;
  isLoadingRoyalties: boolean = false;

  isGenerateReportLoader: boolean;
  generateReportData: any;
  reportPage = 1;
  totalData = 0;
  displayedColumns: string[] = ['order', 'payment', 'id', 'company', 'sale', 'royalty', 'paid', 'status'];
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStores();
  };
  getStores() {
    let param = {
      royalty_stores: true
    }
    this._reportService.getRoyaltyStores(param).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStores.push({ storeName: 'Select a store', fk_storeID: '' });
      this.allStores = this.allStores.concat(res["data"]);
      this.selectedStores = this.allStores[0];
      this.searchStoresCtrl.setValue(this.selectedStores);
      this.royaltiesPerStore = null;
      this.royaltiesPerStoreCheck = true;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      // this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
    let params;
    this.searchStoresCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          royalty_stores: true,
          keyword: res
        }
        return res !== null && res.length >= 2
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allStores = [];
        this.isSearchingStores = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._reportService.getRoyaltyStores(params)
        .pipe(
          finalize(() => {
            this.isSearchingStores = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStores.push({ storeName: 'All Stores', fk_storeID: '' });
      this.allStores = this.allStores.concat(data["data"]);
    });
  }
  onSelectedStores(ev) {
    this.selectedStores = ev.option.value;
    this.royaltiesPerStoreCheck = true;
    this.royaltiesPerStore = null;
    if (this.selectedStores.fk_storeID != '') {
      this.royaltiesPerStoreData();
    } else {
      this._reportService.snackBar('Please select any store');
    }
  }
  displayWithStores(value: any) {
    return value?.storeName;
  }
  royaltiesPerStoreData() {
    this.isLoadingRoyalties = true;
    let params = {
      royalty_per_store: true,
      store_id: this.selectedStores.fk_storeID
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.royaltiesPerStore = res["data"];
      this.royaltiesPerStoreCheck = false;
      this.isLoadingRoyalties = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.royaltiesPerStoreCheck = false;
      this.isLoadingRoyalties = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Reports
  generateReport(page) {
    if (this.royaltyID == 0 || this.selectedStores.fk_storeID == '') {
      this._reportService.snackBar('You must select a store and report type above before you can generate the report.');
      return;
    }
    if (page == 1) {
      this.reportPage = 1;
      if (this.generateReportData) {
        this.paginator.pageIndex = 0;
      }
      this.generateReportData = null;
    }
    this._reportService.setFiltersReport();
    this.isGenerateReportLoader = true;
    let params = {
      page: page,
      royalty_reports: true,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      store_id: this.selectedStores.fk_storeID,
      blnIncludeFulfillment: this.blnIncludeFulfillment,
      payment_status: this.paymentStatus,
      size: 20
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        res["data"].forEach(element => {
          element.royalty = (element.total * this.royaltyID.contractPercentage).toFixed(2);
          if (moment(new Date()).diff(moment(element.paymentDate)) >= 0) {
            element.paid = 'Paid';
          } else {
            element.paid = 'Not Paid';
          }
        });
        this.generateReportData = res["data"];
        this.totalData = res["totalRecords"];
      } else {
        this.generateReportData = null;
        this._reportService.snackBar('No records found');
      }
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backToList() {
    this.generateReportData = null;
    this._changeDetectorRef.markForCheck();
  }
  getNextReportData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.reportPage++;
    } else {
      this.reportPage--;
    };
    this.generateReport(this.reportPage);
  };
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}