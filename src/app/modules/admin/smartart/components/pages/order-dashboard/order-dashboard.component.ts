import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SmartArtService } from '../../smartart.service';
import { HideUnhideCart, updateAttentionFlagOrder } from '../../smartart.types';
@Component({
  selector: 'app-order-dashboard',
  templateUrl: './order-dashboard.component.html',
  styles: [".mat-paginator  {border-radius: 16px !important} .mat-drawer-container {border-radius: 16px !important} ::-webkit-scrollbar {height: 3px !important}"]
})
export class OrderDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('drawer', { static: true }) drawer: MatDrawer;
  @Input() isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['check', 'date', 'inhands', 'order', 'line', 'customer', 'product', 'supplier', 'status', 'store', 'proof', 'action'];
  totalRecords = 0;
  tempRecords = 0;
  page = 1;


  // Search Stores
  allStores = [];
  searchStoreCtrl = new FormControl();
  selectedStore: any;
  isSearchingStore = false;
  // Search Designers
  allDesigners = [];
  searchDesignerCtrl = new FormControl();
  selectedDesigner: any;
  isSearchingDesigner = false;
  // Search Filters
  ngSearchField = '';
  ngCustomerField = '';
  ngSearchStore = '';
  ngSearchDesigner = '';
  ngFilterField = '2';
  ngFilterProduct = '';
  isFilterLoader: boolean = false;
  smartArtUser: any = JSON.parse(sessionStorage.getItem('smartArt'));
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _smartartService: SmartArtService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.searchableFields();
    this.getSmartArtList(1, 'get');
  };
  searchableFields() {
    this._smartartService.adminStores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStores.push({ storeName: 'All Stores', pk_storeID: null });
      this.allStores = this.allStores.concat(res['data']);
    });
    this._smartartService.smartArtUsers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allDesigners.push({ firstName: 'All', lastName: " Designers", pk_userID: null });
      this.allDesigners = this.allDesigners.concat(res['data']);
    });
    let params;
    this.searchStoreCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          stores: true,
          bln_active: 1,
          keyword: res
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allStores = [];
        this.isSearchingStore = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._smartartService.getSmartArtData(params)
        .pipe(
          finalize(() => {
            this.isSearchingStore = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStores.push({ storeName: 'All Stores', pk_storeID: null });
      this.allStores = this.allStores.concat(data['data']);
    });
    let params1;
    this.searchDesignerCtrl.valueChanges.pipe(
      filter((res: any) => {
        params1 = {
          smart_art_users: true,
          keyword: res
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allDesigners = [];
        this.isSearchingDesigner = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._smartartService.getSmartArtData(params1)
        .pipe(
          finalize(() => {
            this.isSearchingDesigner = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allDesigners.push({ firstName: 'All', lastName: " Designers", pk_userID: null });
      this.allDesigners = this.allDesigners.concat(data['data']);
    });

  }
  onSelected(ev) {
    this.selectedStore = ev.option.value;
  }
  displayWith(value: any) {
    return value?.storeName;
  }
  onSelectedDesigner(ev) {
    this.selectedDesigner = ev.option.value;
  }
  displayWithDesigner(value: any) {
    let name = '';
    if (value) {
      name = value?.firstName + ' ' + value.lastName;
    }
    return name;
  }
  getSmartArtList(page, type) {
    let params = {
      smart_art_userID: this.smartArtUser.pk_userID,
      smartart_list: true,
      page: page,
      size: 20,
      store_id: this.ngSearchStore,
      designerID: this.ngSearchDesigner,
      filter_field: this.ngFilterField,
      search_field: this.ngSearchField,
      user_search_field: this.ngCustomerField,
      product_search: this.ngFilterProduct
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (this.isFilterLoader) {
        this.drawer.toggle();
      }
      this.dataSource = res["data"];
      this.totalRecords = res["totalRecords"];
      if (this.tempDataSource.length == 0) {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      this.isLoading = false;
      this.isFilterLoader = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isFilterLoader = false;
      this.isLoading = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getSmartArtListProof(item) {
    item.proofLoader = true;
    let params = {
      art_proof: true,
      orderLine_id: item.pk_orderLineID,
      imprint_id: item.fk_imprintID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        item.lastProof = res["data"][0].proofSentDate;
      } else {
        item.lastProof = 'N/A';
      }
      item.proofLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.proofLoader = false;
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
    this.getSmartArtList(this.page, 'get');
  };
  onOrderStatusChange(ev) {
    this.isLoading = true;
    if (this.dataSource.length) {
      this.paginator.pageIndex = 0;
    }
    this.ngSearchField = '';
    this.ngCustomerField = '';
    this.ngSearchStore = '';
    this.ngSearchDesigner = '';
    this.ngFilterProduct = '';
    if (ev == 1) {
      this.ngFilterField = '';
    } else {
      this.ngFilterField = ev;
    }
    this.getSmartArtList(1, 'get');
  }
  filterSmartArtList() {
    this.isFilterLoader = true;
    if (this.dataSource.length) {
      this.paginator.pageIndex = 0;
    }
    if (this.selectedStore) {
      if (this.selectedStore.pk_storeID) {
        this.ngSearchStore = this.selectedStore.pk_storeID
      } else {
        this.ngSearchStore = null
      }
    }
    if (this.selectedDesigner) {
      if (this.selectedDesigner.pk_userID) {
        this.ngSearchDesigner = this.selectedDesigner.pk_userID
      } else {
        this.ngSearchDesigner = null
      }
    }
    this._changeDetectorRef.markForCheck();
    this.getSmartArtList(1, 'get');
  }
  // Order Details
  orderDetails(item) {
    console.log(item)
    this._smartartService.routeData = item;
    const queryParams: NavigationExtras = {
      queryParams: { pfk_userID: item.pfk_userID, fk_orderID: item.fk_orderID, fk_imprintID: item.fk_imprintID, pk_orderLineID: item.pk_orderLineID, statusName: item.statusName }
    };
    this.router.navigate(['/smartart/order-details'], queryParams);
  }
  // Customer Email
  customerEmail(item) {
    const queryParams: NavigationExtras = {
      queryParams: { pfk_userID: item.pfk_userID, fk_orderID: item.fk_orderID, fk_imprintID: item.fk_imprintID, pk_orderLineID: item.pk_orderLineID, statusName: item.statusName }
    };
    this.router.navigate(['/smartart/email-customer'], queryParams);
  }
  // Update order Attention
  updateAttentionFlagOrder(item, check) {
    item.isFlagLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: updateAttentionFlagOrder = {
      bln_attention: check,
      orderline_id: item.pk_orderLineID,
      imprint_id: Number(item.fk_imprintID),
      update_order_attention_flag: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar(res["message"]);
      item.isFlagLoader = false;
      item.blnAttention = check;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.isFlagLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Update order Hidden
  HideUnhideCart(item, check) {
    item.isHiddenLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: HideUnhideCart = {
      blnHidden: check,
      orderline_id: item.pk_orderLineID,
      imprint_id: Number(item.fk_imprintID),
      hide_unhide_cart: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar(res["message"]);
      item.isHiddenLoader = false;
      item.blnHidden = check;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.isHiddenLoader = false;
      this._changeDetectorRef.markForCheck();
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
