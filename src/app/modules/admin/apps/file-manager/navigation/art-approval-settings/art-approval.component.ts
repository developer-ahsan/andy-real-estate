import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'art-approval-settings',
  templateUrl: './art-approval.component.html',
  styles: ['::ng-deep {.ql-container {height: auto}}']
})
export class ArtApprovalComponent implements OnInit {

  mainScreen: string = "Settings";
  screens = [
    "Settings",
    "Approval Group",
    "Add New Approval",
    "Current Emails",
    "Create New Email"
  ];
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<any>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  quillModules: any = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: ["white"] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };


  locationsData: any;
  isPageLoading: boolean = false;
  isContactListLoading: boolean = false;

  // Table
  dataSource = [];
  usersData: any;
  contactListData: any;

  contactForm: FormGroup;

  isEditStoreOrg: boolean = false;
  isEditFormOrg: FormGroup


  isAddApprovalLoader: boolean = false;
  isAddApprovalMsg: boolean = false;

  isEditEmail: boolean = false;
  isEditEmailLoader: boolean = false;
  isEditEmailMsg: boolean = false;
  isEditEmailForm: FormGroup;

  isAddEmailLoader: boolean = false;
  isAddEmailMsg: boolean = false;
  isAddEmailForm: FormGroup;

  displayedColumns: string[] = ['subject', 'action'];
  proofEmails = [];
  isGetEmailLoader: boolean = false;
  dataSourceTotalRecord: any;
  page = 1;


  constructor(
    private _storeService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initialize();
  }
  initialize() {
    this.initEditEmailForm();
    this.initAddEmailForm();
    this.contactForm = this.fb.group({
      contacts: new FormArray([])
    });
  }
  initEditEmailForm() {
    this.isEditEmailForm = new FormGroup({
      subject: new FormControl('', Validators.required),
      body: new FormControl('', Validators.required),
      blnInvoice: new FormControl(false),
      blnProof: new FormControl(false),
      pk_emailID: new FormControl(),
      update_proof_email: new FormControl(true)
    })
  }
  initAddEmailForm() {
    this.isAddEmailForm = new FormGroup({
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      subject: new FormControl(''),
      body: new FormControl(''),
      blnInvoice: new FormControl(false),
      blnProof: new FormControl(false),
      add_proof_email: new FormControl(true)
    })
  }

  calledScreen(screenName): void {
    this.mainScreen = screenName;
    if (screenName == 'Current Emails') {
      if (this.proofEmails.length == 0) {
        this.isEditEmail = false;
        this.getAdditionalEmails(1, 'get');
      }
    }
  };
  updateArtApprovaSettings() {
    this.selectedStore.loader = true;
    let payload = {
      pk_storeID: this.selectedStore.pk_storeID,
      blnAdditionalArtApproval: this.selectedStore.blnAdditionalArtApproval,
      update_approval_setting: true
    };
    this._storeService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._storeService.getStoreByStoreId(this.selectedStore.pk_storeID).subscribe(res => {
          this.selectedStore.loader = false;
          this.selectedStore.loaderMsg = true;
          setTimeout(() => {
            this.selectedStore.loaderMsg = false;
          }, 200);
          this._changeDetectorRef.markForCheck();
        }, err => {
          this.selectedStore.loader = false;
          this.selectedStore.loaderMsg = false;
          this._changeDetectorRef.markForCheck();
        })
      }
    }, err => {
      this.selectedStore.loader = false;
      this.selectedStore.loaderMsg = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getAdditionalEmails(page, type) {
    if (page == 1 && type == 'get') {
      this.isGetEmailLoader = true;
    }
    let params = {
      store_id: this.selectedStore.pk_storeID,
      additional_proof_email: true,
      size: 20,
      page: page
    }
    this._storeService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.proofEmails = res['data'];
      this.dataSourceTotalRecord = res['totalRecords'];
      if (type == 'update') {
        this.isEditEmailLoader = false;
        this.isEditEmail = false;
        this.initEditEmailForm();
      } else if (type == 'add') {
        this.isAddEmailLoader = false;
        this.isAddEmailMsg = true;
        this.initAddEmailForm();
        setTimeout(() => {
          this.isAddEmailMsg = false;
          this._changeDetectorRef.markForCheck();
        }, 2000);
      } else {
        this.isGetEmailLoader = false;
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isGetEmailLoader = false;
      this.isEditEmailLoader = false;
      this.isAddEmailLoader = false;
      this.isAddEmailMsg = true;
      this._changeDetectorRef.markForCheck();
    })
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getAdditionalEmails(this.page, 'get');
  };
  removeAdditionalEmail(item) {
    console.log(item);
    item.delLoader = true;
    let payload = {
      pk_emailID: item.pk_emailID,
      delete_proof_email: true
    }
    this._storeService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        item.delLoader = false;
        this.proofEmails = this.proofEmails.filter((value) => {
          return value.pk_emailID != item.pk_emailID;
        });
        this._snackBar.open("Email Deleted Successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
        this.dataSourceTotalRecord--;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      item.delLoader = false;
      this._changeDetectorRef.markForCheck();
    })

  }

  isEdiEmailToggle(item) {
    this.isEditEmail = true;
    this.isEditEmailForm.patchValue(item);
  }
  updateProofEmail() {
    this.isEditEmailLoader = true;
    let payload = this.isEditEmailForm.value;
    this._storeService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getAdditionalEmails(1, 'update');
      }
    }, err => {
      this.isEditEmailLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  addProofEmail() {
    const { body, subject } = this.isAddEmailForm.getRawValue();
    if (!body || subject == '') {
      this._snackBar.open("Please Check Input Fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      this.isAddEmailLoader = true;
      let payload = this.isAddEmailForm.value;
      this._storeService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this.getAdditionalEmails(1, 'add');
        }
      }, err => {
        this.isAddEmailLoader = false;
        this._changeDetectorRef.markForCheck();
      })
    }

  }
  backToList() {
    this.isEditEmail = false;
  }
}
