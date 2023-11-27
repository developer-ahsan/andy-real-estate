import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from '../../../ecommerce/inventory/inventory.service';
import { FileManagerService } from '../../store-manager.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { updateStoreApparelDecorator } from '../../stores.types';
@Component({
  selector: 'app-apparel-decorator',
  templateUrl: './apparel-decorator.component.html'
})
export class ApparelDecoratorComponent implements OnInit, OnDestroy {

  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dropdownList = [];
  dropdownSettings: IDropdownSettings = {
    // singleSelection: true,
    idField: 'pk_companyID',
    textField: 'companyName',
    enableCheckAll: false,
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    allowSearchFilter: true,
    limitSelection: 1,
    clearSearchFilter: true,
    maxHeight: 197,
    itemsShowLimit: 5,
    searchPlaceholderText: 'Search Suppliers',
    noDataAvailablePlaceholderText: 'No Data Available',
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false,
  };
  selectedItems: any;

  totalSuppliers = 0;
  isPageLoading: boolean = false;
  isUpdateLoader: boolean = false;
  constructor(
    private _storeManagerService: FileManagerService,
    private _commonService: DashboardsService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.getStoreDetails();
  }
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.isPageLoading = true;
        this.getSuppliers();
      });
  }
  getSuppliers() {
    this.dropdownList.push({ companyName: 'NONE - Use master product level imprint settings', pk_companyID: 0 })
    this._commonService.suppliersData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.totalSuppliers = res.totalRecords;
      })
    this._storeManagerService.getAllSuppliersBln(this.totalSuppliers)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.isPageLoading = false;
        res["data"].forEach(element => {
          this.dropdownList.push(element);
        });
        // this.dropdownList = res["data"];
        this._changeDetectorRef.markForCheck();
      })
  }
  onItemSelect(item: any) {
    console.log(item);
    this.selectedItems = item;
  };

  saveChanges(): void {
    const { pk_storeID } = this.selectedStore;
    const { pk_companyID } = this.selectedItems;
    // blnInitiatorPays
    const payload: updateStoreApparelDecorator = {
      storeID: pk_storeID,
      decoratorID: pk_companyID,
      update_store_apparel_decorator: true
    };

    this.isUpdateLoader = true;
    this._storeManagerService.putStoresData(payload)
      .subscribe((response) => {
        this._storeManagerService.snackBar(response["message"]);
        this.isUpdateLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.isUpdateLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
