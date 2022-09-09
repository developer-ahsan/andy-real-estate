import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-student-org',
  templateUrl: './student-org.component.html'
})
export class StudentOrgComponent implements OnInit {

  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<any>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  locationsData: any;
  isPageLoading: boolean = false;
  isContactListLoading: boolean = false;

  // Table
  displayedColumns: string[] = ['code', 'name', 'a_name', 'a_email', 'campus', 'active', 'Action'];
  dataSource = [];
  usersData: any;
  contactListData: any;

  contactForm: FormGroup;

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initialize();
    this.getContactList();
  }
  initialize() {
    this.contactForm = this.fb.group({
      contacts: new FormArray([])
    });
  }
  get contactListArray(): FormArray {
    return this.contactForm.get('contacts') as FormArray;
  }
  getContactList() {
    this.isPageLoading = true;
    let params = {
      store_id: this.selectedStore.pk_storeID,
      getStudentOrgs: true
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.isPageLoading = false;
        this.dataSource = res["data"];
        for (let i = 0; i < res["data"].length; i++) {
          this.contactListArray.push(this.fb.group({
            'code': this.dataSource[i] && this.dataSource[i].code ? this.dataSource[i].code : '',
            'name': this.dataSource[i] && this.dataSource[i].name ? this.dataSource[i].name : '',
            'advisorEmail': this.dataSource[i] && this.dataSource[i].advisorEmail ? this.dataSource[i].advisorEmail : '',
            'advisorName': this.dataSource[i] && this.dataSource[i].advisorName ? this.dataSource[i].advisorName : '',
            'blnActive': this.dataSource[i] && this.dataSource[i].blnActive ? this.dataSource[i].blnActive : '',
            'campus': this.dataSource[i] && this.dataSource[i].campus ? this.dataSource[i].campus : '',
            'pk_studentOrgID': this.dataSource[i] && this.dataSource[i].pk_studentOrgID ? this.dataSource[i].pk_studentOrgID : ''
          }));
        }
        this._changeDetectorRef.markForCheck();
      })
  }
  selectedTabValue(event) {
    // if (event.tab.textLabel == 'Top Customers' && this.topCustomers.length == 0) {
    // this.getDashboardGraphsData("top_customer");
    // }
  }

}
