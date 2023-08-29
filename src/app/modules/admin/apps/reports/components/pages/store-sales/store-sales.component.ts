import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { AddCompany, UpdateCompany, UpdateWebsiteLoginInfo } from '../../reports.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
@Component({
  selector: 'app-store-sales',
  templateUrl: './store-sales.component.html',
  styles: ["::ng-deep {.ql-container {height: auto}} .mat-paginator {border-radius: 16px !important}"]
})
export class ReportsStoreSalesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('topScrollAnchor') topScroll: ElementRef;
  @ViewChild('summaryScrollAnchor') summaryScrollAnchor: ElementRef;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  allStates = [];
  searchStatesCtrl = new FormControl();
  selectedStates: any;
  isSearchingStates = false;

  allPromoCodes = [];
  searchPromoCodesCtrl = new FormControl();
  selectedPromoCodes: any;
  isSearchingPromoCodes = false;

  isGenerateReportLoader: boolean = false;


  // ReportDropdowns
  reportType = 0;
  blnShowCancelled = 0;
  paymentStatus = 1;
  blnYTD = 0;
  blnIndividualOrders = 0;
  state = '';
  promocode = '';
  blnCost = 0;

  storesList = [];
  storesLoader: boolean = false;
  storesPage = 1;
  totalStores = 0;

  generateReportData: any;
  reportPage = 1;
  totalData = 0;
  displayedColumns: string[] = ['store', 'sales', 'py', 'percent', 'difference', 'n_sales', 'pyns', 'avg', 'margin'];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService,
    private commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.getStores();
    this.getStates();
    this.getPromoCodes();
  };
  getStores() {
    this.commonService.storesData$.pipe(
      takeUntil(this._unsubscribeAll),
      map(res => res["data"].filter(element => element.blnActive))
    ).subscribe(filteredData => {
      filteredData.forEach(element => {
        element.isChecked = true;
      });
      this.storesList.push(...filteredData);
    });

  }

  getStates() {
    this._reportService.States$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.searchStatesCtrl.setValue({ name: 'All States', pk_stateID: 0 });
      this.allStates.push({ name: 'All States', pk_stateID: 0 });
      this.allStates = this.allStates.concat(res["data"]);
      this.selectedStates = this.allStates[0];
    });
    let params;
    this.searchStatesCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          states: true,
          keyword: res
        }
        return res !== null && res.length >= 2
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allStates = [];
        this.isSearchingStates = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._reportService.getAPIData(params)
        .pipe(
          finalize(() => {
            this.isSearchingStates = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStates = data['data'];
    });
  }
  onSelectedStates(ev) {
    this.selectedStates = ev.option.value;
  }
  displayWithStates(value: any) {
    return value?.name;
  }
  selectedUnSelected(check) {
    if (check) {
      this.storesList.forEach(element => {
        element.isChecked = true;
      });
    } else {
      this.storesList.forEach(element => {
        element.isChecked = false;
      });
    }
  }
  getPromoCodes() {
    this._reportService.PromoCodes$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.searchPromoCodesCtrl.setValue({ promocode: 'Any Promocode' });
      this.allPromoCodes.push({ promocode: 'Any Promocode' });
      this.allPromoCodes = this.allPromoCodes.concat(res["data"]);
      this.selectedPromoCodes = this.allPromoCodes[0];
    });
    let params;
    this.searchPromoCodesCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          promocodes: true,
          keyword: res
        }
        return res !== null && res.length >= 2
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allPromoCodes = [];
        this.isSearchingPromoCodes = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._reportService.getAPIData(params)
        .pipe(
          finalize(() => {
            this.isSearchingPromoCodes = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allPromoCodes = data['data'];
    });
  }
  onSelectedPromoCodes(ev) {
    this.selectedPromoCodes = ev.option.value;
  }
  displayWithPromoCodes(value: any) {
    return value?.promocode;
  }
  generateReport(page) {
    this.generateReportData = null;
    this._reportService.setFiltersReport();
    let selectedStores = [];
    this.storesList.forEach(element => {
      if (element.isChecked) {
        selectedStores.push(element.pk_storeID);
      }
    });
    if (selectedStores.length == 0) {
      this._reportService.snackBar('Please select at least 1 store');
      return;
    }
    this.isGenerateReportLoader = true;
    let params = {
      store_sales_report: true,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      stores_list: selectedStores.toString(),
      payment_status: this.paymentStatus,
      report_type: this.reportType,
      show_cancelled_order: this.blnShowCancelled,
      is_individual: this.blnIndividualOrders,
      is_ytd: this.blnYTD,
      state: this.selectedStates.pk_stateID,
      promoCode: this.selectedPromoCodes.promocode
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      console.log(res);
      if (res["data"].length > 0) {
        this.generateReportData = res["data"];
        this.totalData = res["totalRecords"];
        this.generateReportData.forEach(element => {
          if (element.previousYearSales == 0) {
            element.percent = 0
          } else {
            element.percent = Number(100 - (element.monthlyEarnings / element.previousYearSales) * 100);
          }
          if (element.percent == 0) {
            element.percent = 0;
            element.color = 'gray';
          }
          if (element.percent < 0) {
            element.color = 'red';
          } else if (element.percent > 0) {
            element.color = 'green'
          } else {
            element.color = 'gray';
          }
          element.difference = Number(element.monthlyEarnings - element.previousYearSales);
          if (!element.difference) {
            element.difference = 0;
          }
          if (element.difference < 0) {
            element.difference = Math.abs(element.difference);
          }
          element.avg = Number(element.monthlyEarnings / element.NS);
          if (!element.avg) {
            element.avg = 0;
          }
          element.margin = Number(((element.price - element.cost) / element.price) * 100);
          if (!element.margin) {
            element.margin = 0;
          }
        });
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
    this.backtoTop();
  }
  backToList() {
    this.generateReportData = null;
    this._changeDetectorRef.markForCheck();
  }
  goToSummary() {
    setTimeout(() => {
      this.summaryScrollAnchor.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  backtoTop() {
    setTimeout(() => {
      this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  generatePdf() {

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
