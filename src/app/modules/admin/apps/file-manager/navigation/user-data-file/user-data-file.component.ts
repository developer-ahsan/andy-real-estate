import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import moment from "moment";

@Component({
  selector: 'app-user-data-file',
  templateUrl: './user-data-file.component.html',
  styles: ['.select-all{margin: 5px 17px;}']
})
export class UserDataFileComponent implements OnInit {

  @ViewChild('select') select: MatSelect;
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  includeCheckArray = [
    { value: 'Title', viewValue: 'Title' },
    { value: 'Company Name', viewValue: 'Company Name' },
    { value: 'Location', viewValue: 'Location' },
    { value: 'Address 1', viewValue: 'Address 1' },
    { value: 'Address 2', viewValue: 'Address 2' },
    { value: 'City', viewValue: 'City' },
    { value: 'State', viewValue: 'State' },
    { value: 'Zip code', viewValue: 'Zip code' },
    { value: 'Zip Code Extension', viewValue: 'Zip Code Extension' },
    { value: 'Email', viewValue: 'Email' },
    { value: 'Phone', viewValue: 'Phone' },
    { value: 'Active', viewValue: 'Active' },
    { value: 'Registered Date', viewValue: 'Registered Date' }
  ]

  ngFileType = 'xlsx';
  allSelected = true;
  isPageLoading: boolean = false;
  fileUserRecord: any;

  ngStartDate: any;
  ngEndDate: any;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.isLoadingChange.emit(false);
    // setTimeout(() => {
    //   this.select.options.forEach((item: MatOption) => {
    //     item.select()
    //   });
    // }, 1000);
  }
  getUserData() {
    this.isPageLoading = true;
    let params = {
      store_id: this.selectedStore.pk_storeID,
      user_data: true
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.fileUserRecord = res["data"];
        this.createWorkSheet();
        this._changeDetectorRef.markForCheck();
      })
  }
  createWorkSheet() {
    const today = new Date();
    const month = today.getMonth() + 1; // This method returns count from 0 to 11. It means the value 0 refers to January and so on
    const date = today.getDate();
    const year = today.getFullYear();
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const seconds = today.getSeconds();
    const fileName = `${this.selectedStore.pk_storeID}_customerDataFile-${month}-${date}-${year}-${hours}-${minutes}-${seconds}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");
    // Columns
    worksheet.columns = [
      { header: "FirstName", key: "firstName", width: 15 },
      { header: "LastName", key: "lastName", width: 15 },
      { header: "Title", key: "title", width: 32 },
      { header: "CompanyName", key: "companyName", width: 32 },
      { header: "Location", key: "locationName", width: 20 },
      { header: "Address1", key: "address1", width: 32 },
      { header: "Address2", key: "address2", width: 10 },
      { header: "City", key: "city", width: 20 },
      { header: "State", key: "state", width: 20 },
      { header: "ZipCode", key: "zipCode", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "dayPhone", width: 20 },
      { header: "ZipCodeExtension", key: "zipCodeExt", width: 10 },
      { header: "Active", key: "blnActive", width: 10 },
      { header: "RegisteredDate", key: "date", width: 30 },
    ];
    for (const obj of this.fileUserRecord) {
      if (obj.blnActive) {
        obj.blnActive = 1;
      } else {
        obj.blnActive = 0;
      }
      obj.date = moment.utc(obj.date).format("lll")
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
      a.download = `${fileName}.${this.ngFileType}`;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    });

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }
  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }
  optionClick() {
    let newStatus = true;
    this.select.options.forEach((item: MatOption) => {
      if (!item.selected) {
        newStatus = false;
      }
    });
    this.allSelected = newStatus;
  }

}
