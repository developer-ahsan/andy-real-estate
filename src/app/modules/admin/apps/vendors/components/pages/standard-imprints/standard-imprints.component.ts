import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { AddColor, AddImprintColor, AddImprintMethod, AddStandardImprintGroup, DeleteColor, DeleteImprintColor, DeleteStandardImprint, DeleteStandardImprintGroup, UpdateColor, UpdateImprintColor, UpdateImprintMethod, UpdateStandardImprintGroup } from '../../vendors.types';
import { fuseAnimations } from '@fuse/animations';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';

@Component({
  selector: 'app-standard-imprints',
  templateUrl: './standard-imprints.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"],
  animations: fuseAnimations
})
export class StandardImprintsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'action', 'list'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  mainScreen: string = 'Current Imprint Methods';
  keyword = '';
  not_available = 'N/A';


  isSearching: boolean = false;

  // Add Method
  ngName: string = '';
  ngDesc: string = '';
  isAddGroupLoader: boolean = false;

  // Update Color
  isUpdateMethodLoader: boolean = false;
  isUpdateMethod: boolean = false;
  updateMethodData: any;
  ngRGBUpdate = '';

  // Group Imprint
  groupImprintData: any;
  subImprintsPage = 1;
  viewImprintLoader: boolean = false;
  isAddNewImprint: boolean = false;
  imprintGroupData: any;
  isError: boolean = false;


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _VendorsService: VendorsService,
    private _inventoryService: InventoryService,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStandardGroup(1, 'get');
    this.getAllImprintMethods();

    // forkJoin([
    //   this.getAllImprintMethods(),
    //   this.getAllImprintDigitizer(),
    //   this.getAllImprintLocation(),
    //   this.getAllDistributionCodes()
    // ]);
  };
  calledScreen(value) {
    this.mainScreen = value;
  }
  getStandardGroup(page, type) {
    this.isError = false;
    let params = {
      imprint: true,
      standard_group: true,
      keyword: this.keyword,
      page: page,
      size: 20
    }
    this._VendorsService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.keyword == '') {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddGroupLoader = false;
        this.ngName = '';
        this.ngDesc = '';
        this._VendorsService.snackBar('Method Added Successfully');
        this.mainScreen = 'Current Imprint Methods';
      }
      this.isLoading = false;
      this.isSearching = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isError = true;
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
    this.getStandardGroup(this.page, 'get');
  };
  searchColor(value) {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.page = 1;
    this.keyword = value;
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getStandardGroup(1, 'get');
  }
  resetSearch() {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.keyword = '';
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempRecords;
  }

  openedAccordion(item) {
    this.groupImprintData = item;
    if (!item.sub_imprints) {
      item.subLoader = true;
      this._changeDetectorRef.markForCheck();
      this.getStandardImprints(1);
    } else {
      item.subLoader = false;
      this._changeDetectorRef.markForCheck();
    }
  }
  getStandardImprints(page) {
    let params = {
      imprint: true,
      standard_group_id: this.groupImprintData.pk_standardImprintGroupID,
      standard_imprint: true,
      // keyword: this.keyword,
      page: page,
      size: 10
    }
    this._VendorsService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!this.groupImprintData.sub_imprints) {
        this.groupImprintData.sub_imprints = res["data"];
        this.groupImprintData.sub_imprints_total = res["totalRecords"];
      } else {
        res["data"].forEach(element => {
          this.groupImprintData.sub_imprints.push(element);
        });
      }

      this.viewImprintLoader = false;
      this.groupImprintData.subLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.viewImprintLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  ViewMoreStandardImprints() {
    this.viewImprintLoader = true;
    this._changeDetectorRef.markForCheck();
    this.subImprintsPage++;
    this.getStandardImprints(this.subImprintsPage);
  }
  toggleNewImprint(element, data) {
    this.imprintGroupData = null;
    if (element && !data) {
      element.check = 'add';
      this.imprintGroupData = element;
      this.imprintGroupData.imprintData = null;
    } else if (element && data) {
      element.check = 'update';
      this.imprintGroupData = element;
      this.imprintGroupData.imprintData = data;
    }
    this.isAddNewImprint = !this.isAddNewImprint;
  }


  getAllImprintMethods() {
    this._VendorsService.imprintMethods$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._VendorsService.getAllImprintMethodsObs('').pipe(takeUntil(this._unsubscribeAll)).subscribe(methods => {
        });
      } else {
        this.getAllImprintLocation();
      }
    });
  }
  getAllImprintLocation() {
    this._VendorsService.imprintLocations$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._VendorsService.getAllImprintLocationsObs('').pipe(takeUntil(this._unsubscribeAll)).subscribe(locations => {
        });
      } else {
        this.getAllImprintDigitizer();
      }
    });
  }

  getAllImprintDigitizer() {
    this._VendorsService.imprintDigitizer$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._VendorsService.getAllDigitizers().pipe(takeUntil(this._unsubscribeAll)).subscribe(digitizers => {
        });
      } else {
        this.getAllDistributionCodes();
      }
    });
  }

  getAllDistributionCodes() {
    this._inventoryService.distributionCodes$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._inventoryService.getSystemDistributorCodes().pipe(takeUntil(this._unsubscribeAll)).subscribe(codes => {
        });
      }
    });
  }
  addNewGroup() {
    if (this.ngName == '') {
      this._VendorsService.snackBar('Imprint group name is required');
      return;
    }
    let payload: AddStandardImprintGroup = {
      name: this.ngName,
      add_standard_imprint_group: true
    }
    this.isAddGroupLoader = true;
    this._VendorsService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getStandardGroup(1, 'add')
      } else {
        this.isAddGroupLoader = false;
        this._VendorsService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddGroupLoader = false;
      this._VendorsService.snackBar('Something went wrong');
    })
  }
  // Delete Color
  deleteGroup(item) {
    item.delLoader = true;
    let payload: DeleteStandardImprintGroup = {
      standardImprintGroupID: item.pk_standardImprintGroupID,
      delete_standard_imprint_group: true
    }
    this._VendorsService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(elem => elem.pk_standardImprintGroupID != item.pk_standardImprintGroupID);
      this.tempDataSource = this.tempDataSource.filter(elem => elem.pk_standardImprintGroupID != item.pk_standardImprintGroupID);
      this.totalUsers--;
      this.tempRecords--;
      this._VendorsService.snackBar('Group Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._VendorsService.snackBar('Something went wrong');
    });
  }
  // Update Method
  updateMethodToggle(item) {
    console.log(item)
    this.updateMethodData = item;
    this.isUpdateMethod = !this.isUpdateMethod;
  }
  updateGroup(element) {
    if (element.name == '') {
      this._VendorsService.snackBar('Imprint group name is required');
      return;
    }
    let payload: UpdateStandardImprintGroup = {
      standardImprintGroupID: element.pk_standardImprintGroupID,
      name: element.name,
      update_standard_imprint_group: true
    }
    element.updateLoader = true;
    this._VendorsService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      element.updateLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      element.updateLoader = false;
      this._VendorsService.snackBar('Group Name Updated Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      element.updateLoader = false;
      this._VendorsService.snackBar('Something went wrong');
      this._changeDetectorRef.markForCheck();
    });
  }
  deleteImprint(element, item) {
    item.delLoader = true;
    let payload: DeleteStandardImprint = {
      pk_standardImprintID: item.pk_standardImprintID,
      delete_standard_imprint: true
    }
    this._VendorsService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      element.sub_imprints = element.sub_imprints.filter(elem => elem.pk_standardImprintID != item.pk_standardImprintID);
      element.sub_imprints_total--;
      this._VendorsService.snackBar('Imprint Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._VendorsService.snackBar('Something went wrong');
    });
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
