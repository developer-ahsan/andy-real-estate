import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
@Component({
  selector: 'art-approval-settings',
  templateUrl: './art-approval.component.html',
  styles: ['::ng-deep {.ql-container {height: auto} fuse-alert.fuse-alert-appearance-soft.fuse-alert-type-info .fuse-alert-container .fuse-alert-message {color: #525151 !important} fuse-alert.fuse-alert-appearance-soft.fuse-alert-type-info .fuse-alert-container .fuse-alert-icon {color: #525151 !important} .fuse-mat-rounded .mat-tab-group .mat-tab-header .mat-tab-label-container {padding: 0px}}']
})
export class ArtApprovalComponent implements OnInit, OnDestroy {

  mainScreen: string = "Settings";
  screens = [
    "Settings",
    "Default Approval Group",
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

  dropdownSettings: IDropdownSettings = {};

  dropdownList: string[] = []

  isDefaultGroupLoader: boolean = false;
  isDefaultGroupData: any = [];
  isDefaultGroupDataTotal: any;
  isDefaultGroupPage = 1;
  isDefaultGroupColumns: string[] = ['order', 'first', 'last', 'emails', 'royalities', 'ca', 'action'];


  addContactGroupForm: FormGroup;
  locationsList: any;
  subLocationsList: any;

  storeUsers: any;
  storeUsersLoader: boolean = false;
  usersDropDown: any[] = [];

  // Default Group
  isEditDefaultContactGroup: boolean = false;
  isEditDefaultContactLoader: boolean = false;
  isEditDefaultContactForm: FormGroup;

  selectedItems: any;
  constructor(
    private _storeService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
  }
  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      // itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.initialize();
  }
  initialize() {
    this.initEditEmailForm();
    this.initAddEmailForm();
    this.initEditDefaultGroupUpdateForm();
    this.contactForm = this.fb.group({
      contacts: new FormArray([])
    });
    this.addContactGroupForm = new FormGroup({
      name: new FormControl(''),
      location: new FormControl(''),
      sublocation: new FormControl('')
    })
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
  initEditDefaultGroupUpdateForm() {
    this.isEditDefaultContactForm = new FormGroup({
      listOrder: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      email: new FormControl(''),
      blnIncludeAdditionalEmails: new FormControl(true),
      blnStoreUserApprovalContacts: new FormControl(true),
      blnRoyalties: new FormControl(true),
      fk_storeUserID: new FormControl(''),
      pk_artApprovalContactID: new FormControl(''),
      update_approval_contact: new FormControl(true)
    })
  }

  calledScreen(screenName): void {
    this.mainScreen = screenName;
    if (screenName == 'Current Emails') {
      if (this.proofEmails.length == 0) {
        this.isEditEmail = false;
        this.getAdditionalEmails(1, 'get');
      }
    } else if (screenName == 'Add New Approval') {
      if (!this.locationsList) {
        this.getLocations();
      }
    } else if (screenName == 'Default Approval Group') {
      if (!this.storeUsers) {
        this.getUsersList();
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
  selectedTabValue(event) {
    if (event.tab.textLabel == 'Current Groups' && this.isDefaultGroupData.length == 0) {
      this.getDefaultGroup(1, 'get');
      this.backToDefaultGroupList();
    } else if (event.tab.textLabel == 'Add New Group Contact') {
      this.backToDefaultGroupList();
    }
  }
  getLocations() {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      store_locations: true,
      page: 1,
      size: 20
    }
    // Get the offline products
    this._storeService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.locationsList = response["data"];
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };
  getSubLocations(obj) {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      store_locations: true,
      sub_locations: true,
      attribute_id: obj.pk_attributeID
    }
    this._storeService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.subLocationsList = response["data"];
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
  getDefaultGroup(page, type) {
    if (page == 1 && type == 'get') {
      this.isDefaultGroupLoader = true;
    }
    let params = {
      art_approval_default_group: true,
      store_id: this.selectedStore.pk_storeID,
      size: 20,
      page: page
    }
    this._storeService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isDefaultGroupData = res["data"];
      this.isDefaultGroupDataTotal = res["totalRecords"];
      this.isDefaultGroupLoader = false;
      if (type == 'update') {
        this.isEditDefaultContactLoader = false;
        this._snackBar.open("Contact Updated Successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isDefaultGroupLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getNextDefaultGroupData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.isDefaultGroupPage++;
    } else {
      this.isDefaultGroupPage--;
    };
    this.getDefaultGroup(this.isDefaultGroupPage, 'get');
  };

  getUsersList() {
    this.storeUsersLoader = true;
    let params = {
      store_users: true,
      store_id: this.selectedStore.pk_storeID,
      bln_active: 1
    }
    this._storeService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.storeUsersLoader = false;
      this.storeUsers = res["data"];
      this.storeUsers.forEach(element => {
        this.usersDropDown.push({
          item_id: element.pfk_userID,
          item_text: element.firstName + ' ' + element.lastName
        })
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.storeUsersLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  isDefaultGroupEditToggle(obj) {
    this.isEditDefaultContactGroup = true;
    let user = obj.fk_storeUserID.split(',');
    this.selectedItems = [];
    user.forEach(element => {
      this.usersDropDown.filter(item => {
        if (item.item_id == element) {
          this.selectedItems.push({ item_id: item.item_id, item_text: item.item_text })
        }
      })
    });
    this.isEditDefaultContactForm.patchValue({
      listOrder: obj.listOrder,
      firstName: obj.firstName,
      lastName: obj.lastName,
      email: obj.email,
      blnIncludeAdditionalEmails: obj.blnIncludeAdditionalEmails,
      blnStoreUserApprovalContacts: obj.blnStoreUserApprovalContacts,
      blnRoyalties: obj.blnRoyalties,
      pk_artApprovalContactID: obj.pk_artApprovalContactID
    })


  }
  backToDefaultGroupList() {
    this.isEditDefaultContactGroup = false;
  }
  updateDefaulApprovalGroupContact() {
    let val = [];
    this.selectedItems.forEach(element => {
      val.push(element.item_id);
    });
    this.isEditDefaultContactForm.patchValue({
      fk_storeUserID: val.toString()
    })
    this.isEditDefaultContactLoader = true;
    this._storeService.putStoresData(this.isEditDefaultContactForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getDefaultGroup(1, 'update');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isEditDefaultContactLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }



  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
