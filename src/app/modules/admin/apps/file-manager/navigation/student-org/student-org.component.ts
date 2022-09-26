import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationDialogComponent, ConfirmDialogModel } from '../../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { I } from '@angular/cdk/keycodes';
@Component({
  selector: 'app-student-org',
  templateUrl: './student-org.component.html'
})
export class StudentOrgComponent implements OnInit, OnDestroy {

  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<any>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  locationsData: any;
  isPageLoading: boolean = false;
  isContactListLoading: boolean = false;

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

  filterBy = 'all';

  isCampusForm: FormGroup;
  isCampusUpdateLoader: boolean = false;
  isCampusUpdateMsg: boolean = false;

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initialize();
    this.getOrgsList('get');
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
  }
  getOrgsList(type) {
    if (type == 'get') {
      this.isPageLoading = true;
    }
    let params = {
      store_id: this.selectedStore.pk_storeID,
      getStudentOrgs: true
    }
    this._fileManagerService.getStoresData(params)
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
        this._fileManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
    if (name == '' || advisorEmail == '' || advisorName == '') {
      this._snackBar.open("Please Check Input Fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      this.isEditLoader = true;
      this._fileManagerService.putStoresData(this.isEditFormOrg.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
    if (name == '' || code == '') {
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
        fk_storeID, advisorEmail, advisorName, name, campus, code, add_student_org: true
      }
      this._fileManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
    if (advisorEmail == '' || advisorName == '') {
      this._snackBar.open("Please Check Input Fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      let payload = {
        advisorEmail, advisorName, campus, update_campus, fk_storeID: this.selectedStore.pk_storeID
      }
      this.isCampusUpdateLoader = true;
      this._fileManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
