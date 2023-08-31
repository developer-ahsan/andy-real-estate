import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { FormControl, FormGroup } from '@angular/forms';
import { AddFOBLocation, RemoveFOBLocation } from '../../reports.types';
import moment from 'moment';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-item-report',
  templateUrl: './item-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportItemsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  storesList = [];
  storesLoader: boolean = false;
  storesPage = 1;
  totalStores = 0;

  generateReportData: any;
  reportPage = 1;
  totalData = 0;
  displayedColumns: string[] = ['store', 'sales', 'py', 'percent', 'difference', 'n_sales', 'pyns', 'avg', 'margin'];
  isGenerateReportLoader: boolean = false;

  // ReportDropdowns
  rangeBasedOn = 'order';
  blnShowCancelled = 0;
  paymentStatus = 1;
  ngStore = 637;
  ngSelectedColumns = ['price', 'setups', 'runs', 'shipping', 'subtotal', 'paid', 'internalRoyalty', 'zip'];
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService,
    private commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.getStores();
  };
  getStores() {
    this.commonService.storesData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        const activeStores = res["data"].filter(element => element.blnActive);
        this.storesList.push(...activeStores);
      });
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
      itemized_report: true,
      payment_status: this.paymentStatus,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      stores_list: selectedStores.toString(),
      rangeBasedOn: this.rangeBasedOn
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        this.downloadExcelWorkSheet(res["data"]);
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
  downloadExcelWorkSheet(data) {
    // Define filename with the current date-time format
    const fileName = `ItemReport_${moment().format('MM-DD-yy-hh-mm-ss')}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Items");

    // Basic columns
    let columns = [
      { header: "ID", key: "ID", width: 10 },
      { header: "Store", key: "Store", width: 30 },
      { header: "InvoiceDate", key: "InvoiceDate", width: 30 },
      { header: "Customer", key: "Customer", width: 30 },
      { header: "Location", key: "LocationName", width: 30 },
      { header: "Item", key: "Item", width: 20 },
      { header: "Description", key: "Description", width: 60 },

    ];

    const unitPriceColumn = {
      price: { header: "UnitPrice", key: "UnitPrice", width: 10 }
    }
    this.ngSelectedColumns.forEach(item => {
      if (unitPriceColumn[item]) {
        columns.push(unitPriceColumn[item]);
      }
    });
    // Column map for the dynamic columns
    const columnMap = {
      setups: { header: "Setups", key: "Setups", width: 10 },
      runs: { header: "Runs", key: "Runs", width: 10 },
      shipping: { header: "Shipping", key: "Shipping", width: 10 },
      subtotal: { header: "Subtotal", key: "Subtotal", width: 10 },
      paid: { header: "Paid", key: "Paid", width: 10 },
      internalRoyalty: { header: "InternalRoyalty", key: "InternalRoyalty", width: 20 },
      zip: { header: "BillingZip", key: "BillingZip", width: 20 }
    };
    columns.push(
      { header: "Quantity", key: "Quantity", width: 10 },
      { header: "ExtendedPrice", key: "ExentdedPrice", width: 20 }
    );
    // Push the selected columns based on the map
    this.ngSelectedColumns.forEach(item => {
      if (columnMap[item]) {
        columns.push(columnMap[item]);
      }
    });

    // Additional static columns
    columns.push(
      { header: "CustomerPO", key: "CustomerPO", width: 20 },
      { header: "AccountChargeCode", key: "AccountChargeCode", width: 20 },
      { header: "CostCenterCode", key: "CostCenterCode", width: 20 },
      { header: "GovMVMTContractNumber", key: "GovMVMTContractNumber", width: 20 }
    );

    worksheet.columns = columns;
    // Format and add data to the worksheet

    const lastIDs = [];

    for (const obj of data) {
      if (obj.Description.includes('ACCESSORY:')) {
        obj.Runs = '';
        obj.Item = '';
      } else {
        const index = lastIDs.findIndex(idObj => idObj.ID == obj.ID && idObj.Item === obj.Item);
        if (index > -1) {
          obj.Setups = 0;
          obj.Shipping = 0;
          obj.Runs = 0;
        } else {
          lastIDs.push({ ID: obj.ID, Item: obj.Item });
        }
      }
      obj.InvoiceDate = moment(obj.InvoiceDate).format('yyyy-MM-DD');
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
        this.isGenerateReportLoader = false;
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