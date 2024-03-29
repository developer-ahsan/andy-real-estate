import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { COMMA, ENTER, T } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ConfirmationDialogComponent, ConfirmDialogModel } from '../../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'art-approval-settings',
  templateUrl: './art-approval.component.html',
  styles: ['::ng-deep {.ql-container {height: auto} fuse-alert.fuse-alert-appearance-soft.fuse-alert-type-info .fuse-alert-container .fuse-alert-message {color: #525151 !important} fuse-alert.fuse-alert-appearance-soft.fuse-alert-type-info .fuse-alert-container .fuse-alert-icon {color: #525151 !important} .fuse-mat-rounded .mat-tab-group .mat-tab-header .mat-tab-label-container {padding: 0px}}']
})
export class ArtApprovalComponent implements OnInit, OnDestroy {

  mainScreen: string = "Settings";
  screens = [
    "Settings",
    "Approval Groups",
    "Current Emails",
    "Create New Email"
  ];
  selectedStore: any;
  isLoading: boolean;
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
  isDefaultGroupColumns: string[] = ['order', 'first', 'last', 'email', 'user', 'emails', 'royalities', 'ca', 'action'];


  locationsList: any;
  subLocationsList: any;

  storeUsers: any;
  storeUsersLoader: boolean = false;
  usersDropDown: any[] = [];

  // Default Group
  isEditDefaultContactGroup: boolean = false;
  isEditDefaultContactLoader: boolean = false;
  isEditDefaultContactForm: FormGroup;

  // Delete Default Group Contact



  // Get Approval Groups
  selectedGroup: any;
  selectedGroupItem: any;
  approvalGroupList: any;

  addContactGroupForm: FormGroup;

  addGroupForm: FormGroup;
  addGroupFormLoader: boolean = false;

  selectedItems: any;
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    public dialog: MatDialog
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
    this.getStoreDetails()
  }
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.initialize();
      });
  }
  initialize() {
    this.initEditEmailForm();
    this.initAddEmailForm();
    this.initEditDefaultGroupUpdateForm();
    this.initAddContactGroup();
    this.initAddGroupForm();
  }
  initAddGroupForm() {
    this.addGroupForm = new FormGroup({
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      name: new FormControl(''),
      fk_attributeID: new FormControl(''),
      fk_locationID: new FormControl(''),
      add_artContact_group: new FormControl(true)
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
  initAddContactGroup() {
    this.addContactGroupForm = new FormGroup({
      fk_artApprovalGroupID: new FormControl(''),
      listOrder: new FormControl(1),
      blnEmails: new FormControl(true),
      email: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      blnStoreUserApprovalContacts: new FormControl(true),
      blnRoyalties: new FormControl(true),
      storeUserID: new FormControl(''),
      add_artApproval_contact: new FormControl(true)
    })
  }
  initEditDefaultGroupUpdateForm() {
    this.isEditDefaultContactForm = new FormGroup({
      listOrder: new FormControl(1),
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
    } else if (screenName == 'Approval Groups') {
      if (!this.storeUsers) {
        this.getApprovalGroupList('get');
      }
      if (!this.locationsList) {
        this.getLocations();
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
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.getStoreByStoreId(this.selectedStore.pk_storeID).subscribe(res => {
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
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
    item.delLoader = true;
    let payload = {
      pk_emailID: item.pk_emailID,
      delete_proof_email: true
    }
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
    this._storeManagerService.putStoresData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getAdditionalEmails(1, 'update');
      }
      this._snackBar.open("Additional proof email updated successfuly", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    }, err => {
      this._snackBar.open("Error while updating Additional proof email", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      this.isEditEmailLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  addProofEmail() {
    const { body, subject } = this.isAddEmailForm.getRawValue();
    if ((body === null || body.trim() === '') || subject.trim() == '') {
      this._snackBar.open("Please fill out required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      this.isAddEmailLoader = true;
      let payload = this.isAddEmailForm.value;
      payload = this.replaceSingleQuotesWithDoubleSingleQuotes(payload);
      this._storeManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this.getAdditionalEmails(1, 'add');
        }
      }, err => {
        this.isAddEmailLoader = false;
        this._changeDetectorRef.markForCheck();
      })
    }

  }

  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/'/g, "''");
      }
    }
    return obj;
  }

  backToList() {
    this.isEditEmail = false;
  }
  selectedTabValue(event) {
    if (event.tab.textLabel == 'Current Groups') {
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
    this._storeManagerService.getStoresData(params)
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
    this._storeManagerService.getStoresData(params)
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
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {

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

  isDefaultGroupEditToggle(obj) {
    this.isEditDefaultContactGroup = true;
    if (obj.fk_storeUserID) {
      let user = obj.fk_storeUserID.split(',');
      this.selectedItems = [];
      user.forEach(element => {
        this.usersDropDown.filter(item => {
          if (item.item_id == element) {
            this.selectedItems.push({ item_id: item.item_id, item_text: item.item_text })
          }
        })
      });
    }

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

  updateDefaultToggleData(item) {
    item.updateLoader = true;
    this._changeDetectorRef.markForCheck();
    let fk_storeUserID = [];
    item.selectedItems.forEach(element => {
      fk_storeUserID.push(element.item_id)
    });
    this.isEditDefaultContactForm.patchValue({
      listOrder: item.listOrder,
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      blnIncludeAdditionalEmails: item.blnIncludeAdditionalEmails,
      blnStoreUserApprovalContacts: item.blnStoreUserApprovalContacts,
      blnRoyalties: item.blnRoyalties,
      pk_artApprovalContactID: item.pk_artApprovalContactID,
      fk_storeUserID: fk_storeUserID
    });
    this.updateDefaulApprovalGroupContact();
    setTimeout(() => {
      item.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, 300);
  }
  updateDefaulApprovalGroupContact() {
    const { listOrder, firstName, lastName, email, fk_storeUserID } = this.isEditDefaultContactForm.getRawValue();
    if (firstName.trim() == '' || lastName.trim() == '' || email.trim() == '') {
      this._snackBar.open("Please fill out required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      this.isEditDefaultContactForm.patchValue({
        fk_storeUserID: fk_storeUserID.toString()
      })
      this.isEditDefaultContactLoader = true;
      this._storeManagerService.putStoresData(this.isEditDefaultContactForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.getContactGroups(1, 'update', this.selectedGroup);
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isEditDefaultContactLoader = false;
        this._changeDetectorRef.markForCheck();
      })
    }

  }
  deleteDefaulApprovalGroupContact(item) {
    const message = `Are you sure you want to remove this art approval contact? `;

    const dialogData = new ConfirmDialogModel("Are you sure you want to continue?", message);

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
      maxWidth: "500px"
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        item.delLoader = true;
        this._changeDetectorRef.markForCheck();
        let payload = {
          fk_approvalContactID: item.pk_artApprovalContactID,
          delete_approval_contact: true
        }
        this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          item.delLoader = false;
          this.isDefaultGroupDataTotal = this.isDefaultGroupDataTotal - 1;
          this.isDefaultGroupData = this.isDefaultGroupData.filter((value) => {
            return value.pk_artApprovalContactID != item.pk_artApprovalContactID;
          });
          this._snackBar.open("Contact Deleted Successfully", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3000
          });
          this._changeDetectorRef.markForCheck();
        }, err => {
          item.delLoader = false;
          this._changeDetectorRef.markForCheck();
        })
      }
    })
  }
  getApprovalGroupList(type) {
    if (type == 'get') {
      this.storeUsersLoader = true;
    }
    let params = {
      art_approval_groups: true,
      store_id: this.selectedStore.pk_storeID
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.approvalGroupList = res["data"];
      if (type == 'add') {
        this.initAddGroupForm();
        this.addGroupFormLoader = false;
        this._snackBar.open("Group Created Successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
      }
      this.approvalGroupList.filter(item => {
        if (item.blnDefault) {
          this.selectedGroup = item.pk_artApprovalGroupID;
        }
      })
      // if (!this.storeUsers) {
      //   this.getUsersList();
      // } else {
      //   this.storeUsersLoader = false;
      // }
      this.getUsersList();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.storeUsersLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  getUsersList() {
    let params = {
      store_users: true,
      store_id: this.selectedStore.pk_storeID,
      bln_active: 1
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.storeUsersLoader = false;
      this.storeUsers = res["data"];
      this.storeUsers.forEach((element, index) => {
        this.usersDropDown.push({
          item_id: element.pfk_userID,
          item_text: element.firstName + ' ' + element.lastName
        });
        if (index == this.storeUsers.length - 1) {
          this.selectedGroupItem = this.approvalGroupList.filter(item => item.blnDefault == true)[0];
          this.getContactGroups(1, 'get', this.selectedGroupItem.pk_artApprovalGroupID);
        }
      });
      // if (this.isDefaultGroupData.length == 0) {

      // }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.storeUsersLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  onGroupChange(ev) {
    this.backToDefaultGroupList();
    const val = ev.value;
    this.selectedGroupItem = this.approvalGroupList.filter(item => item.pk_artApprovalGroupID == val)[0];
    this.getContactGroups(1, 'get', val);
  }

  isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  addApprovalContactGroup() {
    let { listOrder, firstName, lastName, email, storeUserID, fk_artApprovalGroupID, blnEmails, blnStoreUserApprovalContacts, blnRoyalties, add_artApproval_contact } = this.addContactGroupForm.getRawValue();



    if (listOrder == '' || firstName.trim() == '' || lastName.trim() == '' || email.trim() == '') {
      this._snackBar.open("Please fill out required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }

    if (listOrder < 0) {
      this._snackBar.open("List order should be a positive number", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }

    if (!this.isValidEmail(email)) {
      this._snackBar.open("Invalid email format", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }

    let val = [];
    storeUserID.forEach(element => {
      val.push(element.item_id);
    });
    let payload = {
      listOrder: listOrder, firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(),
      storeUserID: val,
      fk_artApprovalGroupID: this.selectedGroup,
      blnEmails, blnStoreUserApprovalContacts, blnRoyalties, add_artApproval_contact
    }
    this.isAddApprovalLoader = true;
    this._storeManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getContactGroups(1, 'add', this.selectedGroup);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddApprovalLoader = false;
      this._changeDetectorRef.markForCheck();
    })

  }

  getContactGroups(page, type, id) {
    if (page == 1 && type == 'get') {
      this.isDefaultGroupLoader = true;
    }
    let params = {
      art_approval_default_group: true,
      store_id: this.selectedStore.pk_storeID,
      size: 20,
      page: page,
      group_id: id
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isDefaultGroupData = res["data"];
      this.isDefaultGroupDataTotal = res["totalRecords"];
      this.isDefaultGroupData.forEach(element => {
        element.selectedItems = [];
        element.users = [];
        if (element.UsersList) {
          let users = element.UsersList.split('),');
          element.users = users;
        }
      });
      if (this.usersDropDown.length > 0) {
        res["data"].forEach(element => {
          if (element.fk_storeUserID) {
            let users = element.fk_storeUserID.split(',');
            users.forEach(user => {
              this.usersDropDown.filter(item => {
                if (item.item_id == user) {
                  element.selectedItems.push({ item_id: item.item_id, item_text: item.item_text })
                }
              });
            });
          }
        });
      }
      this.isDefaultGroupLoader = false;
      this._changeDetectorRef.markForCheck();
      if (type == 'update') {
        this.isEditDefaultContactLoader = false;
        this._snackBar.open("Contact Updated Successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
      } else if (type == 'add') {
        this.initAddContactGroup();
        this.isAddApprovalLoader = false;
        this._snackBar.open("Contact Created Successfully", '', {
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
  getNextContactGroupData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.isDefaultGroupPage++;
    } else {
      this.isDefaultGroupPage--;
    };
    this.getContactGroups(this.isDefaultGroupPage, 'get', this.selectedGroup);
  };

  addContactGroup() {
    let { name, fk_storeID, fk_attributeID, fk_locationID, add_artContact_group } = this.addGroupForm.getRawValue();
    if (name.trim() == '' || fk_attributeID == '') {
      this._snackBar.open("Please fill out required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {

      let payload = { name: name.trim(), fk_storeID, fk_attributeID, fk_locationID, add_artContact_group }
      this.addGroupFormLoader = true;
      this._storeManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.getApprovalGroupList('add');
      }, err => {
        this.addGroupFormLoader = false;
        this._changeDetectorRef.markForCheck();
      })
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
