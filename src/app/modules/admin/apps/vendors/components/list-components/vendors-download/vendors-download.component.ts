import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
@Component({
  selector: 'app-vendors-download',
  templateUrl: './vendors-download.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorsDownloadComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;

  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  // Suppliers
  allSuppliers = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService,
    private _router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getAllSuppliers();
  };
  getAllSuppliers() {
    this._vendorService.Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isLoading = true;
      this.getSuppliers(res["totalRecords"]);
    });
  }

  getSuppliers(size) {
    let params = {
      supplier: true,
      fetch: 1,
      bln_active: 1,
      size: size,
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allSuppliers = res["data"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  downloadExcelWorkSheet() {
    const fileName = 'vendorDataFile';
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Vendors");
    // Columns
    worksheet.columns = [
      { header: "Address", key: "address", width: 30 },
      { header: "Company Name", key: "companyName", width: 30 },
      { header: "Content Manager Email", key: "contentManagerEmail", width: 30 },
      { header: "Content Manager Name", key: "contentManagerName", width: 30 },
      { header: "Email Artwork", key: "artworkEmail", width: 30 },
      { header: "Email Orders", key: "ordersEmail", width: 30 },
      { header: "Inside Rep", key: "insideRep", width: 30 },
      { header: "Inside Rep Email", key: "insideRepEmail", width: 30 },
      { header: "Inside Rep Phone", key: "insideRepPhone", width: 30 },
      { header: "State", key: "state", width: 10 },
      { header: "Zip", key: "zipCode", width: 10 },
    ];
    for (const obj of this.allSuppliers) {
      worksheet.addRow(obj);
    }
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      let url = window.URL.createObjectURL(blob);
      let a = document.createElement("a");
      document.body.appendChild(a);
      a.setAttribute("style", "display: none");
      a.href = url;
      a.download = `${fileName}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    });
    // Mark for check
    this._changeDetectorRef.markForCheck();
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
