import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import moment from 'moment';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-inventory-summary-report',
  templateUrl: './inventory-summary-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportInventorySummaryComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['pid', 'spid', 'sid', 'store', 'product', 'inventory', 'threshold'];
  totalData = 0;
  page = 1;


  allStores = [];
  searchStoresCtrl = new FormControl();
  selectedStores: any;
  isSearchingStores = false;
  isGenerateReportLoader: boolean;
  generateExcelLoader: boolean = false;
  keyword = '';
  inventory = 0;
  generateReportData: any;
  initialReportData = [];
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService,
    private commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStores();
  };
  getStores() {
    let param = {
      inventory_summary_stores: true
    }
    this._reportService.getAPIData(param).subscribe(res => {
      this.allStores = [
        { storeName: 'All Stores', storeID: '' },
        ...res["data"]
      ];
      this.selectedStores = this.allStores[0];
      this.generateReport();
    });
  }
  generateReport() {
    let is_weekly = false;
    if (this._reportService.ngPlan == 'weekly') {
      is_weekly = true;
    }
    this.isGenerateReportLoader = true;
    this.isLoading = true;
    let params = {
      inventory_summary: true,
      inventory: this.inventory,
      keyword: this.keyword,
      store_list: this.selectedStores.storeID,
      is_weekly
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let stores: any = Object.values(res["data"].reduce((acc, element) => {
        const { pk_storeID, storeName } = element;
        if (element.inventory <= 0) {
          element.bgColor = 'bg-red-200';
        } else if (element.inventory <= element.inventoryThreshold) {
          element.bgColor = 'bg-orange-200';
        }
        if (!acc[pk_storeID]) {
          acc[pk_storeID] = { data: [element], pk_storeID: pk_storeID, storeName };
        } else {
          acc[pk_storeID].data.push(element);
        }

        return acc;
      }, {}));
      stores.sort((a, b) => a.storeName.localeCompare(b.storeName));
      this.generateReportData = stores;
      this.initialReportData = res["data"];
      this.totalData = res["totalRecords"];


      this.dataSource = res["data"];
      this.totalData = res["totalRecords"];
      this.isGenerateReportLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isGenerateReportLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  customSort(event: Sort) {
    if (this.initialReportData) {
      const stores: any = Object.values(this.initialReportData.reduce((acc, element) => {
        const { pk_storeID, storeName } = element;
        if (element.inventory <= 0) {
          element.bgColor = 'bg-red-200';
        } else if (element.inventory <= element.inventoryThreshold) {
          element.bgColor = 'bg-orange-200';
        }
        if (!acc[pk_storeID]) {
          acc[pk_storeID] = { data: [element], pk_storeID: pk_storeID, storeName };
        } else {
          acc[pk_storeID].data.push(element);
        }

        if (event.direction == 'asc') {
          acc[pk_storeID].data.sort((a, b) => {
            const aValue = typeof a[event.active] === 'number' ? a[event.active] : a[event.active].toString();
            const bValue = typeof b[event.active] === 'number' ? b[event.active] : b[event.active].toString();

            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          });
        } else {
          acc[pk_storeID].data.sort((a, b) => {
            const aValue = typeof a[event.active] === 'number' ? a[event.active] : a[event.active].toString();
            const bValue = typeof b[event.active] === 'number' ? b[event.active] : b[event.active].toString();

            return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
          });
        }
        return acc;
      }, {}));
      stores.sort((a, b) => a.storeName.localeCompare(b.storeName));
      this.generateReportData = stores;
      this._changeDetectorRef.markForCheck();
    }
  }
  downloadExcelWorkSheet() {
    this.generateExcelLoader = true;
    const fileName = `InventorySummary_${moment(new Date()).format('MM-DD-yy-hh-mm-ss')}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("InventorySummary");
    // Columns
    let columns = [
      { header: "PK_STOREPRODUCTID", key: "pk_storeProductID", width: 30 },
      { header: "STORENAME", key: "storeName", width: 50 },
      { header: "PK_STOREID", key: "pk_storeID", width: 30 },
      { header: "PK_PRODUCTID", key: "pk_productID", width: 30 },
      { header: "PRODUCTNAME", key: "productName", width: 30 },
      { header: "PRODUCTNUMBER", key: "productNumber", width: 30 },
      { header: "INVENTORY", key: "inventory", width: 30 },
      { header: "INVENTORYTHRESHOLD", key: "inventoryThreshold", width: 30 }
    ]
    worksheet.columns = columns;
    for (const element of this.initialReportData) {
      worksheet.addRow(element);
    }
    workbook.xlsx.writeBuffer()
      .then((data: any) => {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        return URL.createObjectURL(blob);
      })
      .then(url => {
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
        this.generateExcelLoader = false;
        this._changeDetectorRef.markForCheck();
      });
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
