import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SystemService } from '../../system.service';
import { AddColor, AddImprintColor, AddImprintMethod, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod } from '../../system.types';

@Component({
  selector: 'app-po-archives',
  templateUrl: './po-archives.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class POArchivesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['id', 'store', 'date', 'supplier', 'customer', 'customer_company', 'status'];
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
  stores: any;
  suppliers: any;


  allSuppliers = [];
  searchSupplierCtrl = new FormControl();
  selectedSupplier: any;
  isSearchingSupplier = false;

  allStores = [];
  searchStoreCtrl = new FormControl();
  selectedStore: any;
  isSearchingStore = false;


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService
  ) { }

  ngOnInit(): void {
    this._systemService.stores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStores = res["data"];
      this.stores = res["data"];
    });
    this._systemService.Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.suppliers = res["data"];
      this.allSuppliers = res["data"];
    });
    let params;
    this.searchSupplierCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          supplier: true,
          bln_active: 1,
          keyword: res
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allSuppliers = [];
        this.isSearchingSupplier = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._systemService.getSystemsData(params)
        .pipe(
          finalize(() => {
            this.isSearchingSupplier = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allSuppliers = data['data'];
    });
    // Stores
    // let paramsStore;
    // this.searchStoreCtrl.valueChanges.pipe(
    //   filter((res: any) => {
    //     params = {
    //       stores_list: true,
    //       keyword: res
    //     }
    //     return res !== null && res.length >= 3
    //   }),
    //   distinctUntilChanged(),
    //   debounceTime(300),
    //   tap(() => {
    //     this.allStores = [];
    //     this.isSearchingStore = true;
    //     this._changeDetectorRef.markForCheck();
    //   }),
    //   switchMap(value => this._systemService.getSystemsData(paramsStore)
    //     .pipe(
    //       finalize(() => {
    //         this.isSearchingStore = false
    //         this._changeDetectorRef.markForCheck();
    //       }),
    //     )
    //   )
    // ).subscribe((data: any) => {
    //   this.allStores = data['data'];
    // });
    setTimeout(() => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck()
    }, 100);

    // this.isLoading = true;
    // this.getImprintMethods(1, 'get');
  };
  onSelected(ev) {
    this.selectedSupplier = ev.option.value;
  }
  displayWith(value: any) {
    return value?.companyName;
  }
  // Stores
  onSelectedStore(ev) {
    this.selectedStore = ev.option.value;
  }
  displayWithStore(value: any) {
    return value?.storeName;
  }
  calledScreen(value) {
    this.mainScreen = value;
  }
  getImprintMethods(page, type) {
    let params = {
      imprint_methods: true,
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
    this.getImprintMethods(this.page, 'get');
  };
  searchColor(value) {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.page = 1;
    this.keyword = value;
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getImprintMethods(1, 'get');
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
        this.getImprintMethods(1, 'add')
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
