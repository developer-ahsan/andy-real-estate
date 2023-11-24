import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { FormControl, FormGroup } from '@angular/forms';
import { AddFOBLocation, RemoveFOBLocation } from '../../vendors.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
declare var $: any;

@Component({
  selector: 'app-vendor-fob-locations',
  templateUrl: './vendor-fob-locations.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorFOBLocationComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['location', 'address', 'city', 'state', 'zip', 'action'];
  totalUsers = 0;
  tempTotalUsers = 0;
  page = 1;
  not_available = 'N/A';

  supplierData: any;

  mainScreen = 'Current'

  // States
  allStates = [];
  tempStates = [];
  totalStates = 0;

  searchStateCtrl = new FormControl();
  selectedState: any;
  isSearchingState = false;

  // Location Data for Update
  locationData: any;
  isUpdate: boolean = false;

  // Add FOB Location
  addLocationForm: FormGroup;
  isAddLoader: boolean = false;

  // Search By Keyword
  isSearching: boolean = false;
  keyword = '';
  // Modal
  removeModalData: any;
  @ViewChild('removeLocation') removeLocation: ElementRef;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService,
    private _comonService: DashboardsService
  ) { }

  initForm() {
    this.addLocationForm = new FormGroup({
      location_name: new FormControl(''),
      address: new FormControl(''),
      city: new FormControl(''),
      zip: new FormControl(''),
      add_fob_location: new FormControl(true)
    })
  }
  ngOnInit(): void {
    this.initForm();
    this.getStatesObservable();
    let params;
    this.searchStateCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          states: true,
          keyword: res
        }
        return res != null && res != '' && res != undefined
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allStates = [];
        this.isSearchingState = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._vendorService.getVendorsData(params)
        .pipe(
          finalize(() => {
            this.isSearchingState = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStates = data['data'];
    });
    this.isLoading = true;
    this.getVendorsData();
  };
  getStatesObservable() {
    this._vendorService.States$.pipe(takeUntil(this._unsubscribeAll)).subscribe(states => {
      this.allStates = states["data"];
      this.tempStates = states["data"];
      this.totalStates = states["totalRecords"];
      this.searchStateCtrl.setValue(this.allStates[0].state);
      this.selectedState = this.allStates[0].state;
    });
  }
  calledScreen(screen) {
    this.mainScreen = screen;
    if (screen == 'Add New Location') {
      this.allStates = this.tempStates;
      this.searchStateCtrl.setValue(this.allStates[0].state, { emitEvent: false });
      this.selectedState = this.allStates[0].state;
    } else {
      this.page = 1;
      this.dataSource = this.tempDataSource;
      this.totalUsers = this.tempTotalUsers;
      this._changeDetectorRef.markForCheck();
    }
  }
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.getFOBLocations(1, 'get');
    })
  }
  getFOBLocations(page, type) {
    let params = {
      fob_locations: true,
      page: page,
      keyword: this.keyword,
      size: 20,
      company_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.tempDataSource.length == 0) {
        this.tempDataSource = res["data"];
        this.tempTotalUsers = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddLoader = false;
        this.initForm();
        this.mainScreen = 'Current';
        this._vendorService.snackBar('F.O.B Location added successfully');
      }
      this.isSearching = false;
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getFOBLocations(this.page, 'get');
  };
  // Search By Keyword
  searchLocations() {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getFOBLocations(1, 'get');
  }
  resetSearch() {
    this.keyword = '';
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempTotalUsers;
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this._changeDetectorRef.markForCheck();
  }
  // Add New Location
  addNewLocation() {
    const { location_name, address, city, zip, add_fob_location } = this.addLocationForm.getRawValue();
    if (location_name == '' || address == '' || city == '' || zip == '') {
      this._vendorService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: AddFOBLocation = { location_name, supplier_id: this.supplierData.pk_companyID, address, city, state: this.selectedState, zip, add_fob_location }
    payload = this._comonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isAddLoader = true;
    this._vendorService.postVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getFOBLocations(1, 'add');
      } else {
        this.isAddLoader = false;
        this._vendorService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isAddLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // RemoveLocation
  deleteLocationModal(item) {
    this.removeModalData = item;
    $(this.removeLocation.nativeElement).modal('show');
  }
  deleteLocation(location) {
    $(this.removeLocation.nativeElement).modal('hide');
    location.delLoader = true;
    let payload: RemoveFOBLocation = {
      remove_fob_location: true,
      location_id: location.pk_FOBLocationID
    }
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      location.delLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.dataSource = this.dataSource.filter(item => item.pk_FOBLocationID != location.pk_FOBLocationID);
        this.totalUsers--;
        this.tempDataSource = this.tempDataSource.filter(item => item.pk_FOBLocationID != location.pk_FOBLocationID);
        this.tempTotalUsers--;
      }
      this._vendorService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      location.delLoader = false;
      this._vendorService.snackBar('Something went wrong');
      this._changeDetectorRef.markForCheck();
    });
  }
  toggleUpdate(data) {
    this.isUpdate = true;
    this.locationData = data;
    this.searchStateCtrl.setValue(data.state, { emitEvent: false });
    this.selectedState = data.state;
  }
  backTolist() {
    this.isUpdate = false;
    this._changeDetectorRef.markForCheck();
  }

  onSelected(ev) {
    this.selectedState = ev.option.value;
  }

  displayWith(value: any) {
    return value;
  }
  onBlur() {
    this.searchStateCtrl.setValue(this.selectedState, { emitEvent: false });
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
