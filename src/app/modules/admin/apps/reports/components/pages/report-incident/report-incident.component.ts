import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { FormControl } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { vendorComment } from '../../reports.types';
import moment from 'moment';

@Component({
  selector: 'app-report-incident-report',
  templateUrl: './report-incident.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportIncidentComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['id', 'created', 'modified', 'submitted', 'store', 'cost', 'source', 'entities', 'action'];
  totalData = 0;
  page = 1;

  allStores = [];
  searchStoresCtrl = new FormControl();
  selectedStores: any;
  isSearchingStores = false;

  // Submitted By
  allEmployees = [];
  searchEmployeesCtrl = new FormControl();
  selectedEmployees: any;
  isSearchingEmployees = false;

  // Source By
  allEmployeesSource = [];
  searchEmployeesCtrlSource = new FormControl();
  selectedEmployeesSource: any;
  isSearchingEmployeesSource = false;

  // Vendors
  allSuppliers = [];
  searchSuppliersCtrl = new FormControl();
  selectedSuppliers: any;
  isSearchingSuppliers = false;

  ngRangeStart: any;
  ngRangeEnd: any;

  isIncidentReportLoader: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.isIncidentReportLoader = true;
    this.getStores();
    this.getSuppliers();
    this.getEmployees();
    this.getSourceEmployee();
    this.getIncidentReportData(1);
  };
  getStores() {
    this._reportService.Stores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStores.push({ storeName: 'All Stores', pk_storeID: '' });
      this.allStores = this.allStores.concat(res["data"]);
      this.selectedStores = this.allStores[0];
      this.searchStoresCtrl.setValue(this.selectedStores);
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
    let params;
    this.searchStoresCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          stores: true,
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
      switchMap(value => this._reportService.getAPIData(params)
        .pipe(
          finalize(() => {
            this.isSearchingStores = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStores.push({ storeName: 'All Stores', pk_storeID: '' });
      this.allStores = this.allStores.concat(data["data"]);
    });
  }
  onSelectedStores(ev) {
    this.selectedStores = ev.option.value;
  }
  displayWithStores(value: any) {
    return value?.storeName;
  }
  // Employees
  getEmployees() {
    let param = {
      incident_reports_employees: true,
      size: 10
    }
    this._reportService.getAPIData(param).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allEmployees.push({ pk_userID: '', employeeName: 'All Employees' });
      this.allEmployees = this.allEmployees.concat(res["data"]);
      this.selectedEmployees = this.allEmployees[0];
      this.searchEmployeesCtrl.setValue(this.selectedEmployees);
      this.allEmployeesSource.push({ pk_userID: '', employeeName: 'All Employees' });
      this.allEmployeesSource = this.allEmployeesSource.concat(res["data"]);
      this.selectedEmployeesSource = this.allEmployeesSource[0];
      this.searchEmployeesCtrlSource.setValue(this.selectedEmployeesSource);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
    let params;
    this.searchEmployeesCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          incident_reports_employees: true,
          keyword: res
        }
        return res !== null && res.length >= 2
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allEmployees = [];
        this.isSearchingEmployees = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._reportService.getAPIData(params)
        .pipe(
          finalize(() => {
            this.isSearchingEmployees = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allEmployees.push({ pk_userID: '', employeeName: 'All Employees' });
      this.allEmployees = data['data'];
    });
  }
  onSelectedEmployees(ev) {
    this.selectedEmployees = ev.option.value;
  }
  displayWithEmployees(value: any) {
    let name = value?.employeeName;
    return name;
  }
  getSourceEmployee() {
    let params;
    this.searchEmployeesCtrlSource.valueChanges.pipe(
      filter((res: any) => {
        params = {
          incident_reports_employees: true,
          keyword: res
        }
        return res !== null && res.length >= 2
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allEmployeesSource = [];
        this.isSearchingEmployeesSource = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._reportService.getAPIData(params)
        .pipe(
          finalize(() => {
            this.isSearchingEmployeesSource = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allEmployeesSource.push({ pk_userID: '', employeeName: 'All Employees' });
      this.allEmployeesSource = data['data'];
    });
  }
  onSelectedEmployeesSource(ev) {
    this.selectedEmployeesSource = ev.option.value;
  }
  displayWithEmployeesSource(value: any) {
    let name = value?.employeeName;
    return name;
  }
  // Suppliers
  getSuppliers() {
    let param = {
      suppliers: true,
      size: 10
    }
    this._reportService.getAPIData(param).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allSuppliers.push({ pk_companyID: '', companyName: 'All Suppliers' });
      this.allSuppliers = this.allSuppliers.concat(res["data"]);
      this.selectedSuppliers = this.allSuppliers[0];
      this.searchSuppliersCtrl.setValue(this.selectedSuppliers);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
    let params;
    this.searchSuppliersCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          suppliers: true,
          keyword: res
        }
        return res !== null && res.length >= 2
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allSuppliers = [];
        this.isSearchingSuppliers = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._reportService.getAPIData(params)
        .pipe(
          finalize(() => {
            this.isSearchingSuppliers = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allSuppliers = data['data'];
    });
  }
  onSelectedSuppliers(ev) {
    this.selectedSuppliers = ev.option.value;
  }
  displayWithSuppliers(value: any) {
    return value?.companyName;
  }

  getIncidentReportData(page) {
    if (page == 1) {
      if (this.dataSource.length > 0) {
        this.paginator.pageIndex = 0;
      }
      this.isIncidentReportLoader = true;
    }
    if (!this.selectedEmployees) {
      this.selectedEmployees = { pk_userID: '' };
      this.selectedEmployeesSource = { pk_userID: '' };
    }
    if (!this.selectedSuppliers) {
      this.selectedSuppliers = { pk_companyID: '' };
    }
    let params = {
      incident_reports: true,
      store_list: this.selectedStores.pk_storeID,
      supplier_list: this.selectedSuppliers.pk_companyID,
      source_employee_list: this.selectedEmployeesSource.pk_userID,
      submittedBy_employee_list: this.selectedEmployees.pk_userID,
      startDate: moment(this.ngRangeStart).format('MM/DD/yyyy'),
      endDate: moment(this.ngRangeEnd).format('MM/DD/yyyy'),
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalData = res["totalRecords"];
      this.isIncidentReportLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isIncidentReportLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextPageData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getIncidentReportData(this.page);
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
