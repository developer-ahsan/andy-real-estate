import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../system.service';
import { AddColor, AddImprintColor, AddImprintMethod, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod } from '../../system.types';
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
  isAddMethodLoader: boolean = false;

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
    private _systemService: SystemService,
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
        this._systemService.snackBar('Method Added Successfully');
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
      keyword: this.keyword,
      page: page,
      size: 10
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
    if (element && !data) {
      element.check = 'add';
      this.imprintGroupData = element;
    } else if (element && data) {
      element.check = 'update';
      this.imprintGroupData = element;
      this.imprintGroupData.imprintData = data;
    }
    this.isAddNewImprint = !this.isAddNewImprint;
  }


  getAllImprintMethods() {
    this._systemService.imprintMethods$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._systemService.getAllImprintMethodsObs().pipe(takeUntil(this._unsubscribeAll)).subscribe(methods => {
        });
      } else {
        this.getAllImprintLocation();
      }
    });
  }
  getAllImprintLocation() {
    this._systemService.imprintLocations$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._systemService.getAllImprintLocationsObs().pipe(takeUntil(this._unsubscribeAll)).subscribe(locations => {
        });
      } else {
        this.getAllImprintDigitizer();
      }
    });
  }

  getAllImprintDigitizer() {
    this._systemService.imprintDigitizer$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._systemService.getAllDigitizers().pipe(takeUntil(this._unsubscribeAll)).subscribe(digitizers => {
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
        this.getStandardGroup(1, 'add')
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
  updateMethodToggle(item) {
    console.log(item)
    this.updateMethodData = item;
    this.isUpdateMethod = !this.isUpdateMethod;
  }
  updateMethod() {
    if (this.updateMethodData.imprintColorName == '') {
      this._systemService.snackBar('Color name is required');
      return;
    }
    const rgb = this.ngRGBUpdate.replace('#', '');
    let payload: UpdateImprintMethod = {
      method_id: this.updateMethodData.pk_methodID,
      method_name: this.updateMethodData.methodName,
      description: this.updateMethodData.methodDescription,
      update_imprint_method: true
    }
    this.isUpdateMethodLoader = true;
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateMethodLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource.filter(elem => {
        if (elem.pk_methodID == this.updateMethodData.pk_methodID) {
          elem.methodName = this.updateMethodData.methodName;
          elem.methodDescription = this.updateMethodData.methodDescription;
        }
      });
      this._systemService.snackBar('Method Updated Successfully');
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
