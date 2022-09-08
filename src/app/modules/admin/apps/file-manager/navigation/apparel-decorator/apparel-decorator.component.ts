import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from '../../../ecommerce/inventory/inventory.service';
import { FileManagerService } from '../../store-manager.service';
@Component({
  selector: 'app-apparel-decorator',
  templateUrl: './apparel-decorator.component.html'
})
export class ApparelDecoratorComponent implements OnInit {

  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dropdownList = [];
  dropdownSettings: IDropdownSettings = {
    // singleSelection: true,
    idField: 'companyName',
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
  selectedItems = [];

  totalSuppliers = 0;
  isPageLoading: boolean = false;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.isPageLoading = true;
    this.getSuppliers();
  }
  getSuppliers() {
    this.dropdownList.push({ companyName: 'NONE - Use master product level imprint settings' })
    this._fileManagerService.suppliers$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.totalSuppliers = res.totalRecords;
      })
    this._fileManagerService.getAllSuppliersBln(this.totalSuppliers)
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
    const { pk_companyID, companyName } = item;
  };

}
