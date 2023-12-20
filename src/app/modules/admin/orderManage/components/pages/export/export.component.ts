import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject } from 'rxjs';
import { OrderManageService } from '../../order-manage.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import moment from 'moment';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-export-order',
  templateUrl: './export.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class OrderExportComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  ngstatusID = 1;
  exportStatusOptions = [
    { value: 1, label: 'New orders' },
    { value: 2, label: 'Artwork approved' },
    { value: 3, label: 'Purchase order sent' },
    { value: 4, label: 'Purchase order acknowledged' },
    { value: 5, label: 'Shipped' },
    { value: 6, label: 'Delivered' },
    { value: 8, label: 'Picked up' },
    { value: 9, label: 'Backorder' },
    { value: 10, label: 'Waiting for group order to close' },
    { value: 11, label: 'Rush orders' },
    { value: 12, label: 'Fulfillment orders' }
  ];
  isExcelLoader: boolean = false;
  exportData: any;
  userData: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _orderService: OrderManageService,
    private router: Router,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userData = JSON.parse(sessionStorage.getItem('orderManage'));
  };

  getExportData() {
    this.isExcelLoader = true;
    let params = {
      user_id: this.userData.pk_userID,
      status: this.ngstatusID,
      is_export: true,
      view_dashboard: true
    }
    this._orderService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.exportData = res["data"];
      this.downloadExcelWorkSheet();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isExcelLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  downloadExcelWorkSheet() {
    // Define filename with the current date-time format
    const fileName = `Order_Manage_Data+_${moment().format('MM-DD-yy-hh-mm-ss')}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Items");

    // Basic columns
    let columns = [
      { header: "Date", key: "orderDate", width: 15 },
      { header: "ESD", key: "shippingDate", width: 15 },
      { header: "In-Hands", key: "inHandsDate", width: 15 },
      { header: "Order", key: "fk_orderID", width: 15 },
      { header: "PO Number", key: "CPO", width: 15 },
      { header: "Customer", key: "Customer", width: 20 },
      { header: "Product", key: "productName", width: 40 },
      { header: "Vendor", key: "supplierName", width: 20 },
      { header: "Status", key: "statusName", width: 15 },
      { header: "Age", key: "Age", width: 15 },
      { header: "Store Name", key: "storeName", width: 20 },
      { header: "Store", key: "storeCode", width: 15 },
      { header: "CPO", key: "CPO", width: 15 },
      { header: "CC", key: "CC", width: 15 },
      { header: "Paid", key: "Paid", width: 15 },
      { header: "TRX", key: "trackingNumber", width: 15 }
    ];

    worksheet.columns = columns;

    // Format and add data to the worksheet
    const transformedData = this.exportData.map(obj => {
      const transformedObj = {
        ...obj,
        orderDate: obj.orderDate ? moment(obj.orderDate).format('yyyy-MM-DD') : '---',
        shippingDate: obj.shippingDate ? moment(obj.shippingDate).format('yyyy-MM-DD') : '---',
        inHandsDate: obj.inHandsDate ? moment(obj.inHandsDate).format('yyyy-MM-DD') : '---',
        Customer: `${obj.firstName} ${obj.lastName}`,
        Age: `${obj.Age} hrs`,
        Paid: obj.paymentDate ? 'Yes' : 'No'
      };
      return transformedObj;
    });

    transformedData.forEach(obj => {
      const row = worksheet.addRow(obj);
      row.eachCell(cell => {
        cell.alignment = { horizontal: 'left' };
      });
    });
    workbook.xlsx.writeBuffer().then(data => {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = 'none';
      a.href = url;
      a.download = `${fileName}.xlsx`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      this.isExcelLoader = false;
      this._changeDetectorRef.markForCheck();
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
