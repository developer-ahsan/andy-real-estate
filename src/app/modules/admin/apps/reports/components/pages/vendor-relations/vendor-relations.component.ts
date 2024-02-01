import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';

@Component({
  selector: 'app-vendor-relations',
  templateUrl: './vendor-relations.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportVendorRelationsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  generateReportData: any;
  tempgenerateReportData: any;
  reportPage = 1;
  totalData = 0;
  temptotalData = 0;
  displayedColumns: string[] = ['id', 'company', 'relation', 'products'];

  vendorRelation = 1;
  isGenerateReportLoader: boolean;

  sortOrder: boolean = true;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public _reportService: ReportsService
  ) { }

  ngOnInit(): void {
  };
  // Reports
  generateReport() {
    if (!this._reportService.reporter.viewVendorRelationsReport) {
      this._reportService.snackBar('You do not have permission to access this section.');
      return;
    }
    this.isGenerateReportLoader = true;
    let params = {
      is_weekly: this._reportService.ngPlan == 'weekly' ? true : false,
      vendor_relations: true,
      relation: this.vendorRelation,
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      const { data } = res;

      if (data.length && data[0].vendorRelations) {
        const vendors = data[0].vendorRelations.split(',,');
        this.generateReportData = vendors.map(vendor => {
          const [companyName, pk_companyID, vendorRelation, productsCount] = vendor.split('::');
          return {
            pk_companyID: Number(pk_companyID),
            companyName,
            vendorRelation: Number(vendorRelation),
            productsCount: Number(productsCount)
          };
        });
      } else {
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
  sortVendors() {
    this.generateReportData.sort((a, b) => {
      if (this.sortOrder) {
        return a.companyName.localeCompare(b.companyName);
      } else {
        return b.companyName.localeCompare(a.companyName);
      }
    });
    this.sortOrder = !this.sortOrder; // Toggle the sorting order for the next click
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
