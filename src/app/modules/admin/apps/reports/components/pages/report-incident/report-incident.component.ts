import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { FormControl } from '@angular/forms';
import moment from 'moment';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';

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
  isExcelLoader: boolean = false;
  GrandTotal = 0;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private commonService: DashboardsService,
    private _reportService: ReportsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.isIncidentReportLoader = true;
    this.getStores();
    this.getSuppliers();
    this.getEmployees();
    this.getIncidentReportData(1);
  };
  getStores() {
    this.commonService.storesData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        const activeStores = res["data"].filter(element => element.blnActive);
        this.allStores.push({ storeName: 'All Stores', pk_storeID: '' });
        this.allStores.push(...activeStores);
        this.selectedStores = this.allStores[0];
      });
  }
  // Employees
  getEmployees() {
    let param = {
      incident_reports_employees: true
    }
    this._reportService.getAPIData(param).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allEmployees.push({ pk_userID: '', employeeName: 'All Employees' });
      this.allEmployeesSource.push({ pk_userID: '', employeeName: 'All Employees' });
      let employees = res["data"][0].employees.split(',,');
      employees.forEach(element => {
        let employee = element.split('::');
        this.allEmployees.push({ pk_userID: Number(employee[0]), employeeName: employee[1] });
        this.allEmployeesSource.push({ pk_userID: Number(employee[0]), employeeName: employee[1] });
      });
      this.selectedEmployees = this.allEmployees[0];
      this.selectedEmployeesSource = this.allEmployeesSource[0];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Suppliers
  getSuppliers() {
    this.commonService.suppliersData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(suppliers => {
        const activeSuppliers = suppliers["data"].filter(element => element.blnActiveVendor);
        this.allSuppliers.push({ pk_companyID: '', companyName: 'All Vendors' });
        this.allSuppliers.push(...activeSuppliers);
        this.selectedSuppliers = this.allSuppliers[0];
      });
  }

  getIncidentReportData(page) {
    this.dataSource = [];
    this.GrandTotal = 0;
    this.isIncidentReportLoader = true;
    if (!this.selectedEmployees) {
      this.selectedEmployees = { pk_userID: '' };
      this.selectedEmployeesSource = { pk_userID: '' };
    }
    if (!this.selectedSuppliers) {
      this.selectedSuppliers = { pk_companyID: '' };
    }
    let start_date = '';
    let end_date = '';
    if (this.ngRangeStart) {
      start_date = moment(this.ngRangeStart).format('MM/DD/yyyy');
    }
    if (this.ngRangeEnd) {
      end_date = moment(this.ngRangeEnd).format('MM/DD/yyyy');
    }
    let params = {
      is_weekly: this._reportService.ngPlan == 'weekly' ? true : false,
      incident_reports: true,
      store_list: this.selectedStores.pk_storeID,
      supplier_list: this.selectedSuppliers.pk_companyID,
      source_employee_list: this.selectedEmployeesSource.pk_userID,
      submittedBy_employee_list: this.selectedEmployees.pk_userID,
      startDate: start_date,
      endDate: end_date,
      size: 20,
      page: page
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.GrandTotal = res["grandTotal"];
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
  clearFilters() {
    this.selectedStores = this.allStores[0];
    this.selectedSuppliers = this.allSuppliers[0];
    this.selectedEmployees = this.allEmployees[0];
    this.selectedEmployeesSource = this.allEmployeesSource[0];
    this.ngRangeStart = '';
    this.ngRangeEnd = '';
    this.getIncidentReportData(1);
  }
  // Genereate Excel Sheet
  downloadExcelWorkSheet() {
    this.isExcelLoader = true;
    // Define filename with the current date-time format
    const fileName = `IncidentReport_${moment().format('MM-DD-yy-hh-mm-ss')}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Items");

    // Basic columns
    let columns = [
      { header: "PK_INCIDENTREPORTID", key: "pk_incidentReportID", width: 10 },
      { header: "FK_STOREID", key: "FK_STOREID", width: 30 },
      { header: "FK_ORDERID", key: "fk_orderID", width: 30 },
      { header: "DATE", key: "date", width: 30 },
      { header: "FK_STOREUSERID", key: "FK_STOREUSERID", width: 30 },
      { header: "PRIORITY1", key: "priority1", width: 20 },
      { header: "PRIORITY2", key: "priority2", width: 20 },
      { header: "PRIORITY3", key: "priority3", width: 20 },
      { header: "PRIORITY4", key: "priority4", width: 20 },
      { header: "RERUNCOST", key: "rerunCost", width: 20 },
      { header: "EXPLANATION", key: "EXPLANATION", width: 80 },
      { header: "CORRECTED", key: "CORRECTED", width: 80 },
      { header: "HOW", key: "HOW", width: 80 },
      { header: "RECOMMEND", key: "RECOMMENDED", width: 20 },
      { header: "FK_COMPANYID", key: "fk_companyID", width: 20 },
      { header: "FK_ADMINUSERID", key: "fk_adminUserID", width: 20 },
      { header: "FK_SOURCEADMINUSERID", key: "fk_sourceAdminUserID", width: 20 },
      { header: "DATEMODIFIED", key: "dateModified", width: 20 },
      { header: "BLNFINALIZED", key: "BLNFINALIZED", width: 20 },
      { header: "STORENAME", key: "storeName", width: 20 },
      { header: "STORECODE", key: "storeCode", width: 20 },
      { header: "STOREUSERFIRSTNAME", key: "STOREUSERFIRSTNAME", width: 20 },
      { header: "STOREUSERLASTNAME", key: "STOREUSERLASTNAME", width: 20 },
      { header: "STOREUSERCOMPANYNAME", key: "STOREUSERCOMPANYNAME", width: 20 }
    ];

    worksheet.columns = columns;

    // Format and add data to the worksheet
    for (const obj of this.dataSource) {
      if (obj.DATE) {
        obj.DATE = moment(obj.DATE).format('yyyy-MM-DD');
      }
      if (obj.DATEMODIFIED) {
        obj.DATEMODIFIED = moment(obj.DATEMODIFIED).format('yyyy-MM-DD');
      }
      const row = worksheet.addRow(obj);
      row.eachCell(cell => {
        cell.alignment = { horizontal: 'left' };
      });
    }

    // Save the worksheet to a file after a short delay
    setTimeout(() => {
      workbook.xlsx.writeBuffer().then((data: any) => {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        this.isExcelLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    }, 500);

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
