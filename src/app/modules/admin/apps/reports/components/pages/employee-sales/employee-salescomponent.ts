import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { updateCompanySettings } from '../../reports.types';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-employee-sales',
  templateUrl: './employee-sales.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportsEmployeeSalesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // ReportDropdowns
  blnIndividualOrders = 0;
  paymentStatus = 1;
  ngEmployee = 0;

  allEmployees = [];
  searchEmployeesCtrl = new FormControl();
  selectedEmployees: any;
  isSearchingEmployees = false;
  isGenerateReportLoader: boolean;

  generateReportData: any;
  reportPage = 1;
  totalData = 0;
  displayedColumns: string[] = ['store', 'sales', 'py', 'percent', 'difference', 'n_sales', 'pyns', 'avg', 'margin'];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getEmployees();
  };
  getEmployees() {
    let param = {
      employees_list: true,
      size: 10
    }
    this._reportService.getAPIData(param).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allEmployees = this.allEmployees.concat(res["data"]);
      this.selectedEmployees = this.allEmployees[0];
      this.searchEmployeesCtrl.setValue(this.selectedEmployees);
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
          employees_list: true,
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
      this.allEmployees = data['data'];
    });
  }
  onSelectedEmployees(ev) {
    this.selectedEmployees = ev.option.value;
  }
  displayWithEmployees(value: any) {
    let name = value?.firstName + ' ' + value?.lastName;
    return name;
  }
  // Reports
  generateReport(page) {
    if (page == 1) {
      this.reportPage = 1;
      if (this.generateReportData) {
        this.paginator.pageIndex = 0;
      }
      this.generateReportData = null;
    }
    this._reportService.setFiltersReport();
    if (!this.selectedEmployees) {
      this._reportService.snackBar('Please select an employee');
      return;
    }
    this.isGenerateReportLoader = true;
    setTimeout(() => {
      let params = {
        page: page,
        employee_sales_report: true,
        start_date: this._reportService.startDate,
        end_date: this._reportService.endDate,
        user_id: this.selectedEmployees.pk_userID,
        size: 20
      }
      this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
          this._reportService.snackBar('No records found for this user');
        }
        this.isGenerateReportLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isGenerateReportLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    }, 100);
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