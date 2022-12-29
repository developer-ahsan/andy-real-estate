import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../vendors.service';
import { AddColor, AddImprintColor, AddImprintMethod, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod, UpdateLocation } from '../../vendors.types';

@Component({
  selector: 'app-imprint-locations',
  templateUrl: './imprint-locations.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ImprintLocationsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['id', 'name', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  keyword = '';
  not_available = 'N/A';


  isSearching: boolean = false;

  // Add Method
  ngName: string = '';
  ngDesc: string = '';
  isAddMethodLoader: boolean = false;

  // Update Color
  isUpdateLocationLoader: boolean = false;
  isUpdateLocation: boolean = false;
  updateLocationData: any;
  ngRGBUpdate = '';
  ngLocationName: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getImprintLocations(1, 'get');
  };
  getImprintLocations(page, type) {
    let params = {
      imprint_locations: true,
      keyword: this.keyword,
      page: page,
      size: 20
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.keyword == '') {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddMethodLoader = false;
        this.ngName = '';
        this.ngDesc = '';
        this._systemService.snackBar('Location Added Successfully');
      }
      this.isLoading = false;
      this.isSearching = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSearching = false;
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
    this.getImprintLocations(this.page, 'get');
  };
  searchColor(value) {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.page = 1;
    this.keyword = value;
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getImprintLocations(1, 'get');
  }
  resetSearch() {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.keyword = '';
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempRecords;
  }

  addNewMethod() {
    if (this.ngName == '') {
      this._systemService.snackBar('Imprint Method name is required');
      return;
    }
    let payload: AddImprintMethod = {
      method_name: this.ngName,
      method_description: this.ngDesc,
      add_imprint_method: true
    }
    this.isAddMethodLoader = true;
    this._systemService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getImprintLocations(1, 'add')
      } else {
        this.isAddMethodLoader = false;
        this._systemService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddMethodLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }
  // Delete Color
  deleteColor(item) {
    item.delLoader = true;
    let payload: DeleteImprintColor = {
      imprint_color_id: item.pk_imprintColorID,
      delete_imprint_color: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(color => color.pk_imprintColorID != item.pk_imprintColorID);
      this.totalUsers--;
      this._systemService.snackBar('Color Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
    });
  }
  // Update Method
  updateLocationToggle(item) {
    if (item) {
      this.ngLocationName = item.locationName;
      this.updateLocationData = item;
    }
    this.isUpdateLocation = !this.isUpdateLocation;
  }
  updateLocation() {
    if (this.ngLocationName == '') {
      this._systemService.snackBar('Location name is required');
      return;
    }
    let payload: UpdateLocation = {
      location_name: this.ngLocationName,
      location_id: this.updateLocationData.pk_locationID,
      update_imprint_location: true
    }
    this.isUpdateLocationLoader = true;
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateLocationLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.updateLocationData.locationName = this.ngLocationName;
      this._systemService.snackBar('Location Updated Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
    })
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
