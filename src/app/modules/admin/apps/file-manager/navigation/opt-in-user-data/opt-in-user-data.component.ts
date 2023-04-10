import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as Excel from 'exceljs/dist/exceljs.min.js';
@Component({
  selector: 'app-opt-in-user-data',
  templateUrl: './opt-in-user-data.component.html'
})
export class OptInUserDataComponent implements OnInit, OnDestroy {

  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isPageLoading: boolean = false;
  fileUserRecord: any;
  ngFilterType = 'all';
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.getStoreDetails();
  }
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0]
      });
  }
  getUserData() {
    let params: any;
    if (this.ngFilterType == 'all') {
      params = {
        store_id: this.selectedStore.pk_storeID,
        optIn_data: true
      }
    } else {
      params = {
        store_id: this.selectedStore.pk_storeID,
        optIn_data: true,
        bln_active: this.ngFilterType
      }
    }
    this.isPageLoading = true;
    this._storeManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.fileUserRecord = res["data"];
        this.createWorkSheet();
        this._changeDetectorRef.markForCheck();
      })
  }
  createWorkSheet() {
    const fileName = `${this.selectedStore.pk_storeID}_optinDataFile`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");
    // Columns
    worksheet.columns = [
      { header: "StoreName", key: "storeName", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Active", key: "blnActive", width: 10 }
    ];
    for (const obj of this.fileUserRecord) {
      if (obj.blnActive) {
        obj.blnActive = 1;
      } else {
        obj.blnActive = 0;
      }
      worksheet.addRow(obj);
    }
    this.isPageLoading = false;
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
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
