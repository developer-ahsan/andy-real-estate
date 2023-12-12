import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationDialogComponent, ConfirmDialogModel } from '../../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
declare var $: any;

@Component({
  selector: 'app-student-org',
  templateUrl: './student-org.component.html'
})
export class StudentOrgComponent implements OnInit, OnDestroy {

  @ViewChild('changeProfile') changeProfile: ElementRef;

  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<any>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  locationsData: any;
  isPageLoading: boolean = false;
  isContactListLoading: boolean = false;
  importDataLoader: boolean = false;


  // Table
  displayedColumns: string[] = ['code', 'name', 'a_name', 'a_email', 'campus', 'active', 'action'];
  dataSource = [];
  tempDataSource = [];
  usersData: any;

  isEditStoreOrg: boolean = false;
  isEditFormOrg: FormGroup;
  isEditLoader: boolean = false;

  isAddFormOrg: FormGroup;
  isAddLoader: boolean = false;
  isAddMsg: boolean = false;
  isAddMsgText = '';

  studentForm: FormGroup;
  isStudentFormLoader: boolean = false

  filterBy = 'all';

  isCampusForm: FormGroup;
  isCampusUpdateLoader: boolean = false;
  isCampusUpdateMsg: boolean = false;
  images: { imageUpload: string | ArrayBuffer; fileType: any; };
  excelData: any;

  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.initialize();
        this.getOrgsList('get');
      });
  }
  initialize() {
    this.isEditFormOrg = new FormGroup({
      advisorEmail: new FormControl(''),
      advisorName: new FormControl(''),
      blnActive: new FormControl(''),
      name: new FormControl(''),
      campus: new FormControl(''),
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      pk_studentOrgID: new FormControl(''),
      update_student_org: new FormControl(true)
    })
    this.isAddFormOrg = new FormGroup({
      advisorEmail: new FormControl(''),
      advisorName: new FormControl(''),
      name: new FormControl(''),
      campus: new FormControl('Newark'),
      code: new FormControl(''),
      add_student_org: new FormControl(true)
    })
    this.isCampusForm = new FormGroup({
      advisorEmail: new FormControl(''),
      advisorName: new FormControl(''),
      campus: new FormControl('Newark'),
      update_campus: new FormControl(true)
    })

    this.studentForm = new FormGroup({
      campus: new FormControl(''),
      importOption: new FormControl('0')

    })
  }
  getOrgsList(type) {
    if (type == 'get') {
      this.isPageLoading = true;
    }
    let params = {
      store_id: this.selectedStore.pk_storeID,
      getStudentOrgs: true
    }
    this._storeManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        if (type == 'update') {
          this.isEditLoader = false;
          this.backToOrgList();
        } else if (type == 'add') {
          this.isAddLoader = false;
          this.isAddMsg = true;
          setTimeout(() => {
            this.isAddMsg = false;
            this._changeDetectorRef.markForCheck();
          }, 2000);
          this.initialize();
        }
        this.isPageLoading = false;
        this.dataSource = res["data"];
        this.tempDataSource = res["data"];
        this._changeDetectorRef.markForCheck();
      })
  }
  selectedTabValue(event) {
    // if (event.tab.textLabel == 'Top Customers' && this.topCustomers.length == 0) {
    // this.getDashboardGraphsData("top_customer");
    // }
  }
  editStoreOrg(obj) {
    this.isEditFormOrg.patchValue(obj);
    this.isEditStoreOrg = true;
  }
  backToOrgList() {
    this.isEditStoreOrg = false;
  }
  removeOrg(item) {
    const message = `Are you sure you want to remove this student organization?  This will remove this organization from all campus user approval contacts.  This cannot be undone. `;

    const dialogData = new ConfirmDialogModel("", message);

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
      maxWidth: "500px"
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        const fk_storeID = this.selectedStore.pk_storeID;

        item.deleteLoader = true;
        this._changeDetectorRef.markForCheck()
        let payload = {
          campus: item.campus,
          code: item.code,
          pk_studentOrgID: [item.pk_studentOrgID],
          delete_student_org: true,
          fk_storeID
        }
        this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          if (res["success"]) {
            item.deleteLoader = false;
            this.dataSource = this.dataSource.filter((value) => {
              return value.pk_studentOrgID != item.pk_studentOrgID;
            });
            this._snackBar.open("Student Organization Removed Successfully", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3000
            });
            this._changeDetectorRef.markForCheck();
          }
        }, err => {
          item.delLoader = false;
          this._changeDetectorRef.markForCheck();
        })
      }
    });
  }

  updateOrg(item) {
    const { name, advisorEmail, advisorName } = this.isEditFormOrg.getRawValue();
    if (name.trim() == '' || advisorEmail.trim() == '' || advisorName.trim() == '') {
      this._snackBar.open("Please Check Input Fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      this.isEditLoader = true;
      this._storeManagerService.putStoresData(this.replaceSingleQuotesWithDoubleSingleQuotes(this.isEditFormOrg.value)).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this.getOrgsList('update')
          this._changeDetectorRef.markForCheck();
        }
      }, err => {
        this.isEditLoader = false;
        this._changeDetectorRef.markForCheck();
      })
    }
  }

  addOrg() {
    const { advisorEmail, advisorName, name, campus, code, add_student_org } = this.isAddFormOrg.getRawValue();
    if (name.trim() == '' || code.trim() == '') {
      this._snackBar.open("Please Check Input Fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      this.isAddLoader = true;
      this._changeDetectorRef.markForCheck();
      const fk_storeID = this.selectedStore.pk_storeID;
      let payload = {
        fk_storeID, advisorEmail, advisorName, name: name.trim(), campus, code: code.trim(), add_student_org: true
      }
      this._storeManagerService.postStoresData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.isAddMsgText = res["message"];
        if (res["success"]) {
          this.getOrgsList('add')
        } else {
          this.isAddLoader = false;
          this.isAddMsg = true;
          setTimeout(() => {
            this.isAddMsg = false;
            this._changeDetectorRef.markForCheck();
          }, 2000);
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isAddLoader = false;
        this._changeDetectorRef.markForCheck();
      })
    }

  }

  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        obj[key] = obj[key]?.replace(/'/g, "''");
      }
    }
    return obj;
  }

  importData() {
    const { campus, importOption } = this.studentForm.getRawValue();
    if (!campus) {
      this._snackBar.open("Please select the campus you would like to upload the student organization data for.", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });

      return;
    }
    if (!this.excelData) {
      this._snackBar.open("There appears to be something wrong with the CSV file you provided. Please check the file to make sure the file extension for the file is .CSV and the file contains no special formatting (colors, bold, italics, etc.)", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    $(this.changeProfile.nativeElement).modal('hide');


    let excel = [];

    this.excelData.forEach((item: any) => {
      excel.push({
        fk_storeID: this.selectedStore.pk_storeID,
        advisorEmail: item.advisorEmail,
        advisorName: item.advisorName,
        status: item.status,
        name: item.organizationName,
        campus: campus,
        code: item.accountNumber,
        add_student_org: true,
      })
    })

    const payload = {
      import_option: importOption,
      campus: campus,
      fk_storeID: this.selectedStore.pk_storeID,
      import_data: excel,
      import_student_org: true
    }
    this.importDataLoader = true;
    this._storeManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.importDataLoader = false;
      this._snackBar.open("Data imported successfuly", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      this.getOrgsList('get');

      this._changeDetectorRef.markForCheck();
    }, err => {
      this.importDataLoader = false;
      this._snackBar.open("Error occured while importing the data", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      this._changeDetectorRef.markForCheck();
    })

  }

  openUpdateModal() {
    $(this.changeProfile.nativeElement).modal('show');
  }

  upload(event) {
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

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
  filterByCampus(ev) {
    const value = ev.value;
    if (value == 'all') {
      this.dataSource = this.tempDataSource;
    } else {
      this.dataSource = this.tempDataSource.filter(res => {
        return res.campus.toLowerCase().includes(value.toLowerCase());
      })
    }
  }
  updateCampusEmail() {
    const { advisorEmail, advisorName, campus, update_campus } = this.isCampusForm.getRawValue();
    if (advisorEmail.trim() == '' || advisorName.trim() == '') {
      this._snackBar.open("Please Check Input Fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      let payload = {
        advisorEmail: advisorEmail.trim(), advisorName: advisorName.trim(), campus, update_campus, fk_storeID: this.selectedStore.pk_storeID
      }
      this.isCampusUpdateLoader = true;
      this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this.isCampusUpdateMsg = true;
          this.initialize();
          this.isCampusUpdateLoader = false;
          setTimeout(() => {
            this.isCampusUpdateMsg = false;
            this._changeDetectorRef.markForCheck();

          }, 2000);
          this._changeDetectorRef.markForCheck();
        }
      }, err => {
        this.isCampusUpdateLoader = false;
        this._changeDetectorRef.markForCheck();
      })
    }
  }

}




