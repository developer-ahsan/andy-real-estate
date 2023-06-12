import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { Subject } from 'rxjs';
import { AddUserLocation } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-locations',
  templateUrl: './user-locations.component.html'
})
export class UserLocationsComponent implements OnInit, OnDestroy {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  locations: [];
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
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 620) ? 1 : 4;
    const { pk_userID } = this.currentSelectedCustomer;
    this._customerService.getLocations(pk_userID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((locations) => {
        this.locations = locations["data"];
        this.locationsLength = locations["totalRecords"];
        this._changeDetectorRef.markForCheck();
      });

    this._customerService.getAvailableLocations(pk_userID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((available_locations) => {
        this.available_locations = available_locations["data"];
        this.availableLocationsLength = available_locations["totalRecords"];
        this.isLoadingChange.emit(false);
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
    this.secondaryLoader = !this.secondaryLoader;
    this.isLoadingChange.emit(true);
    this._customerService.getLocationAttribute(storeId)
      .subscribe((locationAttribute) => {
        this.locationAttributeFields = locationAttribute["data"];
        if (this.locationAttributeFields?.length) {
          this.isLocationAttrField = !this.isLocationAttrField;
          this.isLoadingChange.emit(false);
        }
      });
  }

  locationAttrSelected(attrId: string) {
    this.isLoadingChange.emit(true);
    this._customerService.getStoresLocation(attrId)
      .subscribe((locations) => {
        this.locationsField = locations["data"];
        if (this.locationsField?.length) {
          this.isLocationField = true;
          this.isLoadingChange.emit(false);
        }
      });
  }

  locationFinalSelected(location) {
    this.enableAddLocationButton = false;
    const { pk_locationID } = location;
    const { pk_userID } = this.currentSelectedCustomer;
    const payload = {
      user_location: true,
      user_id: pk_userID,
      location_id: pk_locationID
    };

    this.locationToAdd = payload;
  }

  addLocation() {
    this.updateLoader = true;
    this._customerService.addUserLocation(this.locationToAdd)
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
