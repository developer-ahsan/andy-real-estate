import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { AddUserLocation } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';

@Component({
  selector: 'app-user-locations',
  templateUrl: './user-locations.component.html'
})
export class UserLocationsComponent implements OnInit, OnDestroy {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  locations: any;
  available_locations: [];
  locationsLength: number = 0;
  availableLocationsLength: number = 0;
  displayedColumns: string[] = ['storeName', 'attributeName', 'locationName'];
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  locationForm: boolean = false;
  breakpoint: number;
  isLocationAttrField = false;
  locationAttributeFields: [];
  isLocationField = false;
  locationsField: [];
  secondaryLoader = true;
  enableAddLocationButton = true;
  locationToAdd: AddUserLocation = null;
  flashMessage: 'success' | 'error' | null = null;
  updateLoader = false;
  initialForm = false;

  departments: any;
  isAddLocation: boolean = false;
  ngDepartmentID = 0;
  isLocationLoader: boolean = false;

  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getCustomer();
  }
  getCustomer() {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        this.getLocations();
      });
  }
  getLocations() {
    let params = {
      view_user_locations: true,
      user_id: this.selectedCustomer.pk_userID
    }
    this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe((locations: any) => {
      this.locations = [];
      if (locations["data"][0].qryUserLocations) {
        const locationsData = locations["data"][0].qryUserLocations.split(',,');
        locationsData.forEach(location => {
          const [companyName, locationName, pk_locationID, departmentName, pk_departmentID, storeName] = location.split('::');
          this.locations.push({ companyName, locationName, pk_locationID, departmentName, pk_departmentID, storeName });
        });
      } else {
        this.isLocationLoader = true;
        this.getAvailableDepartments();
      }
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getAvailableDepartments() {
    let params = {
      get_user_departments: true,
      company_profile_id: this.selectedCustomer.companyProfileID
    }
    this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLocationLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe((deparmants: any) => {
      this.departments = deparmants["data"];
    }, err => {
      this.isLocationLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  addLocationApi() {
    this.isAddLocation = true;
    let payload = {
      departmentID: this.ngDepartmentID,
      userID: this.selectedCustomer.pk_userID,
      add_department_user: true
    }
    this._customerService.PostApiData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isAddLocation = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._customerService.snackBar(res["message"]);
        this.isLoading = true;
        this.getAvailableLoactions();
      }
    }, err => {
      this.isAddLocation = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  removeLocationApi(item) {
    item.deleteLoader = true;
    let payload = {
      departmentID: this.ngDepartmentID,
      userID: this.selectedCustomer.pk_userID,
      delete_department_user: true
    }
    this._customerService.PutApiData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._customerService.snackBar(res["message"]);
        this.isLoading = true;
        this.getAvailableLoactions();
      }
    });
  }
  getAvailableLoactions() {
    let params = {
      available_location: true,
      user_id: this.selectedCustomer.pk_userID
    }
    this._customerService.GetApiData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((available_locations) => {
        this.available_locations = available_locations["data"];
        this.availableLocationsLength = available_locations["totalRecords"];
        this._changeDetectorRef.markForCheck();
      });
  }

  locationFormToggle() {
    this.locationForm = !this.locationForm;
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 620) ? 1 : (event.target.innerWidth <= 880) ? 2 : 4;
  }

  locationSelected(storeId: string) {
    let param = {
      location_attribute: true,
      store_id: storeId
    }
    this.secondaryLoader = !this.secondaryLoader;
    this._customerService.GetApiData(param)
      .subscribe((locationAttribute) => {
        this.locationAttributeFields = locationAttribute["data"];
        if (this.locationAttributeFields?.length) {
          this.isLocationAttrField = !this.isLocationAttrField;
        }
      });
  }

  locationAttrSelected(attrId: string) {
    let params = {
      location: true,
      attribute_id: attrId
    }
    this._customerService.GetApiData(params)
      .subscribe((locations) => {
        this.locationsField = locations["data"];
        if (this.locationsField?.length) {
          this.isLocationField = true;
        }
      });
  }

  locationFinalSelected(location) {
    this.enableAddLocationButton = false;
    const { pk_locationID } = location;
    const { pk_userID } = this.selectedCustomer;
    const payload = {
      user_location: true,
      user_id: pk_userID,
      location_id: pk_locationID
    };

    this.locationToAdd = payload;
  }

  addLocation() {
    this.updateLoader = true;
    let payload = {
      user_location: true,
      user_id: this.selectedCustomer.pk_userID,
      location_id: this.locationToAdd
    }
    this._customerService.PostApiData(payload)
      .subscribe((response: any) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.updateLoader = false;
      });
  }



  /**
     * Show flash message
     */
  showFlashMessage(type: 'success' | 'error'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3000);
  }
}
