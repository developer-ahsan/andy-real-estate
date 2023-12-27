import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject } from 'rxjs';
import { OrderManageService } from '../../order-manage.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import moment from 'moment';
import { finalize, takeUntil } from 'rxjs/operators';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-import-shipping-order',
  templateUrl: './import-shipping.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class OrderImportShippingComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isExcelLoader: boolean = false;
  exportData: any = [];
  userData: any;
  @ViewChild('fileInput') fileInput: ElementRef;
  excelData: any = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrderManageService) { }

  ngOnInit(): void {
    this.userData = JSON.parse(sessionStorage.getItem('orderManage'));
  };
  onFileChange(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      this.excelData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      this._changeDetectorRef.markForCheck();
    };

    reader.readAsBinaryString(file);
  }
  importShippingData() {
    if (this.excelData.length == 0) {
      this._orderService.snackBar('Excel Sheet is empty');
      return;
    }
    this.isExcelLoader = true;
    let payload = {
      qryImportFiles: this.excelData,
      import_shipping: true
    }
    this._orderService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isExcelLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe((res: any) => {
      this._orderService.snackBar(res?.message);
      this.fileInput.nativeElement.value = '';
      this.excelData = [];
    }, err => {
      this._orderService.snackBar('File is not according to the format.');
    });
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
