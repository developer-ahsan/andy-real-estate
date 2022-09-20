import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fuseAnimations } from '@fuse/animations';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmDialogModel } from '../../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations
})
export class LocationsComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  mainScreen: string = "Users";
  screens = [
    "Users",
    "Add New Users"
  ];

  displayedColumns: string[] = ['categoryName', 'isTopRated', 'subCategories'];
  dataSource = [];
  duplicatedDataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;

  paginatedLoading: boolean = false;

  subCategoriesLoader = false;
  subCategories = [];
  selectedCategory = null;

  updateAttributeVal = '';
  updateAttributeId: any;


  isAddSublocationLoader: boolean = false;
  ngSublocationName = '';

  isUserScreen: boolean = false;
  subLocationData: any;
  subLocationUsers: any;
  isSubLocationLoader: boolean = true;
  subUserColumns: String[] = ['id', 'name', 'company', 'action'];

  usersList: any;
  userTotalRecords: number;
  userPage = 1;
  isUserListLoader: boolean = false;

  checkedUserArray: any = [];
  isDeleteUserLoader: boolean = false;

  isAddMainLocationLoader: boolean = false;
  ngAddMainLocation = '';
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.dataSourceLoading = true;
    this.getLocations(1, 'get');
    this.isLoadingChange.emit(false);
  };
  calledScreen(screenName): void {
    this.mainScreen = screenName;
    if (!this.usersList) {
      this.getAllUserList(1);
    }
  };
  getLocations(page, type) {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      store_locations: true,
      page: page,
      size: 10
    }
    // Get the offline products
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;
        this.paginatedLoading = false;

        if (type == 'add') {
          this.isAddMainLocationLoader = false;
          this.ngAddMainLocation = '';
          this._snackBar.open("Location Added Successfully", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3000
          });
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    this.paginatedLoading = true;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getLocations(this.page, 'page');
  };

  /**
     * Close the details
     */
  closeDetails(): void {
    this.selectedCategory = null;
  }

  openedAccordion(data): void {
    this.ngSublocationName = '';
    const { pk_attributeID, attributeName } = data;
    this.updateAttributeVal = attributeName;
    this.updateAttributeId = pk_attributeID;
    // If the customer is already selected...
    if (this.selectedCategory && this.selectedCategory.pk_attributeID === pk_attributeID) {
      // Close the details
      this.closeDetails();
      return;
    };


    this.selectedCategory = data;

    this.subCategoriesLoader = true;

    let params = {
      store_id: this.selectedStore.pk_storeID,
      store_locations: true,
      sub_locations: true,
      attribute_id: pk_attributeID
    }
    // Get the offline products
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.subCategories = response["data"];
        this.subCategoriesLoader = false;
        this.paginatedLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  updateAttributeLocationName(item) {
    item.updateLoader = true;
    let payload = {
      attributeName: item.attributeName,
      pk_attributeID: item.pk_attributeID,
      update_attribute_name: true
    }
    this._fileManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['success']) {
        item.updateLoader = false;
        this._snackBar.open("Attribute Location Updated Successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      item.updateLoader = false;
      this._changeDetectorRef.markForCheck()
    })
  }
  removeLocation(item) {
    item.deleteLoader = true;
    let payload = {
      pk_locationID: item.pk_locationID,
      delete_attribute_location: true
    }
    this._fileManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        item.deleteLoader = false;
        this.subCategories = this.subCategories.filter((value) => {
          return value.pk_locationID != item.pk_locationID;
        });
        this._snackBar.open("Location Deleted Successfully", '', {
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
  addSubLocation() {
    if (this.ngSublocationName) {
      this.isAddSublocationLoader = true;
      let payload = {
        fk_attributeID: this.updateAttributeId,
        locationName: this.ngSublocationName,
        add_attribute_location: true,
      }
      this._fileManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this.refreshSubCategories();
        }
      }, err => {
        this.isAddSublocationLoader = false;
      })
    } else {
      this._snackBar.open("Location name is empty", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    }

  }
  refreshSubCategories() {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      store_locations: true,
      sub_locations: true,
      attribute_id: this.updateAttributeId
    }
    // Get the offline products
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.subCategories = response["data"];
        this.ngSublocationName = '';
        this.isAddSublocationLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
  updateSubLocationName(item) {
    item.updateLoader = true;
    let payload = {
      locationName: item.locationName,
      pk_locationID: item.pk_locationID,
      update_sub_location: true
    }
    this._fileManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['success']) {
        item.updateLoader = false;
        this._snackBar.open("Sub Location Updated Successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      item.updateLoader = false;
      this._changeDetectorRef.markForCheck()
    })
  }


  openUsersScreen(element) {
    this.isUserScreen = true;
    this.subLocationData = element;
    this.getSubLocationsUserList('get');
  }
  backToLocations() {
    this.isUserScreen = false;
    this.mainScreen = 'Users';
  }
  getSubLocationsUserList(type) {
    if (type == 'get') {
      this.isSubLocationLoader = true;
    }
    let params = {
      users_per_location: true,
      location_id: this.subLocationData.pk_locationID
    }
    this._fileManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.subLocationUsers = res["data"];
      this.isSubLocationLoader = false;
      if (type == 'delete') {
        this.isDeleteUserLoader = false;
        this._snackBar.open("User Removed Successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSubLocationLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getAllUserList(page) {
    if (page == 1) {
      this.isUserListLoader = true;
    }
    let params = {
      available_location_users: true,
      store_id: this.selectedStore.pk_storeID,
      page: page,
      size: 20
    }
    this._fileManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.usersList = res["data"];
      this.userTotalRecords = res["totalRecords"];

      this.isUserListLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSubLocationLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getNextUserData(event) {
    const { previousPageIndex, pageIndex } = event;
    // this.paginatedLoading = true;

    if (pageIndex > previousPageIndex) {
      this.userPage++;
    } else {
      this.userPage--;
    };
    this.getAllUserList(this.userPage);
  };
  checkBoxList(ev, item) {
    if (ev.checked) {
      if (this.checkedUserArray.includes(item.fk_userID)) {

      } else {
        this.checkedUserArray.push(item.fk_userID)
      }
    } else {
      this.checkedUserArray.splice(this.checkedUserArray.indexOf(item.fk_userID), 1);
    }
  }
  deleteSelectedUser() {
    this.isDeleteUserLoader = true;
    let payload = {
      location_id: this.subLocationData.pk_locationID,
      user_ids: this.checkedUserArray,
      delete_users_association: true
    }
    this._fileManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getSubLocationsUserList('delete');
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isDeleteUserLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  addMainLocation() {
    if (this.ngAddMainLocation) {
      this.isAddMainLocationLoader = true;
      let payload = {
        store_id: this.selectedStore.pk_storeID,
        location_name: this.ngAddMainLocation,
        add_main_location: true,
      }
      this._fileManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this.getLocations(1, 'add');
        }
      }, err => {
        this.isAddMainLocationLoader = false;
        this._changeDetectorRef.markForCheck();
      })
    } else {
      this._snackBar.open("Location name is empty", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    }
  }
  removeMainLocation(item) {

    const message = `Removing this location attribute will remove all locations associated with this attribute, as well as dissociate any users with these locations. `;

    const dialogData = new ConfirmDialogModel("Are you sure you want to continue?", message);

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
      maxWidth: "500px"
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        item.deleteLoader = true;
        this._changeDetectorRef.markForCheck()
        let payload = {
          attribute_id: item.pk_attributeID,
          delete_main_location: true
        }
        this._fileManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          if (res["success"]) {
            item.deleteLoader = false;
            this.dataSource = this.dataSource.filter((value) => {
              return value.pk_attributeID != item.pk_attributeID;
            });
            this._snackBar.open("Location Deleted Successfully", '', {
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
}
