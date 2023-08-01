import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SmartArtService } from '../../smartart.service';
import { HideUnhideCart, HideUnhideOrder, UpdateOrderLineClaim, updateAttentionFlagOrder, updateOrderBulkStatusUpdate } from '../../smartart.types';
import { AuthService } from 'app/core/auth/auth.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
@Component({
  selector: 'app-order-dashboard',
  templateUrl: './order-dashboard.component.html',
  styles: [".mat-paginator  {border-radius: 16px !important} .mat-drawer-container {border-radius: 16px !important} ::-webkit-scrollbar {height: 3px !important}"],
  animations: [
    trigger('modalAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(4rem) scale(0.95)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'translateY(0) scale(1)'
      })),
      transition(':enter', animate('300ms ease-out')),
      transition(':leave', animate('200ms ease-in'))
    ]),
    trigger('backdropAnimation', [
      state('void', style({
        opacity: 0
      })),
      state('*', style({
        opacity: 1
      })),
      transition(':enter', animate('300ms ease-out')),
      transition(':leave', animate('200ms ease-in'))
    ])
  ]
})
export class OrderDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('drawer', { static: true }) drawer: MatDrawer;
  @Input() isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['check', 'date', 'inhands', 'order', 'line', 'customer', 'product', 'supplier', 'status', 'age', 'store', 'proof', 'action'];
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
  paramsData: any;
  // BUlk Update
  status_id = 2;
  isBulkLoader: boolean = false;
  isClaimedModal: boolean = false;
  claimCheck: boolean = false;
  claimItem: any;
  isSortingLoader: boolean = false;
  sortBy = '';
  sortDirection = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _smartartService: SmartArtService,
    private router: Router,
    private _authService: AuthService,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._activeRoute.queryParams.subscribe(res => {
      this.paramsData = res;
      this.isLoading = true;
      this.getSmartArtList(1, 'get', '');
    });
    // this.searchableFields();
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
  getSmartArtList(page, type, msg) {
    if (page == 1) {
      if (this.dataSource.length) {
        this.paginator.pageIndex = 0;
      }
    }
    let params = {
      smart_art_userID: this.smartArtUser.pk_userID,
      smartart_list: true,
      page: page,
      size: 20,
      store_id: this.paramsData.store ? this.paramsData?.store : '',
      designerID: this.paramsData.designer ? this.paramsData.designer : '',
      filter_field: this.ngFilterField,
      search_field: this.paramsData.search ? this.paramsData.search : '',
      user_search_field: this.paramsData.customer ? this.paramsData.customer : '',
      product_search: this.paramsData.product ? this.paramsData.product : '',
      sort_by: this.sortBy,
      sort_direction: this.sortDirection
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (this.isFilterLoader) {
        this.drawer.toggle();
      }
      res["data"].forEach(element => {
        if (element.viewProofDetails) {
          element.proofDetails = element.viewProofDetails.split(',');
        } else {
          element.proofDetails = null;
        }
      });
      this.dataSource = res["data"];
      this.totalRecords = res["totalRecords"];
      if (this.tempDataSource.length == 0) {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      this.isLoading = false;
      this.isSortingLoader = false;
      this.isFilterLoader = false;
      if (type == 'update') {
        this.isBulkLoader = false;
        this._smartartService.snackBar(msg);
        this._changeDetectorRef.markForCheck();
      }
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isBulkLoader = false;
      this.isSortingLoader = false;
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
        item.lastProofName = res["data"][0].firstName + ' ' + res["data"][0].lastName;
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
    this.getSmartArtList(this.page, 'get', '');
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
    this.getSmartArtList(1, 'get', '');
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
    this.getSmartArtList(1, 'get', '');
  }
  // Order Details
  orderDetails(item) {
    this._smartartService.routeData = item;
    const queryParams: NavigationExtras = {
      queryParams: { pfk_userID: item.pfk_userID, fk_orderID: item.fk_orderID, fk_imprintID: item.fk_imprintID, pk_orderLineID: item.pk_orderLineID, statusName: item.statusName, statusID: item.pk_statusID }
    };
    this.router.navigate(['/smartart/order-details'], queryParams);
  }
  // Customer Email
  customerEmail(item) {
    const queryParams: NavigationExtras = {
      queryParams: { pk_orderLineID: item.pk_orderLineID, store_id: item.pk_storeID }
    };
    this.router.navigate(['/smartart/order-emails'], queryParams);
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
    let payload: HideUnhideOrder = {
      blnHidden: check,
      orderline_id: item.pk_orderLineID,
      imprint_id: Number(item.fk_imprintID),
      hide_unhide_order: true
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
  // Update Claim
  updateClaim(item, check) {
    this.claimItem = item;
    this.claimCheck = check;
    if (check) {
      if (!item.fk_smartArtDesignerClaimID) {
        this.ClaimUnClaimItem();
      } else {
        this.isClaimedModal = true;
        this._changeDetectorRef.markForCheck();
      }
    } else {
      this.ClaimUnClaimItem();
    }
  }
  cancelClaim() {
    this.isClaimedModal = false;
    this._changeDetectorRef.markForCheck();
  }
  ClaimUnClaimItem() {
    this.claimItem.isClaimLoader = true;
    let claimID = null;
    if (this.claimCheck) {
      claimID = Number(this.smartArtUser.adminUserID)
    } else {
      claimID = null;
    }
    this._changeDetectorRef.markForCheck();
    let payload: UpdateOrderLineClaim = {
      orderLineID: Number(this.claimItem.pk_orderLineID),
      blnClaim: this.claimCheck,
      fk_smartArtDesignerClaimID: claimID,
      update_orderline_claim: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._smartartService.snackBar(res["message"]);
        this.claimItem.fk_smartArtDesignerClaimID = claimID;
      }
      this.claimItem.isClaimLoader = false;
      this.isClaimedModal = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.claimItem.isClaimLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Update checked
  OrderSelectionChange(ev, order) {
    order.checked = ev.checked
  }
  bulkUploadStatus() {
    let orders = [];
    this.dataSource.forEach(element => {
      if (element.checked) {
        orders.push({
          imprint_id: Number(element.fk_imprintID),
          ordeLine_id: Number(element.pk_orderLineID)
        });
      }
    });
    if (orders.length == 0) {
      this._smartartService.snackBar('Pleas check at least 1 order');
      return;
    }
    this.isBulkLoader = true;
    let payload: updateOrderBulkStatusUpdate = {
      status_id: this.status_id,
      orders: orders,
      update_order_bulk_status: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getSmartArtList(1, 'update', res["message"]);
      } else {
        this.isBulkLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isBulkLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  sortData(event) {
    this.isSortingLoader = true;
    this.sortDirection = event.direction;
    if (event.active == 'date') {
      this.sortBy = 'orderDate';
    } else if (event.active == 'inhands') {
      this.sortBy = 'inHandsDate';
    } else if (event.active == 'order') {
      this.sortBy = 'fk_orderID';
    } else if (event.active == 'customer') {
      this.sortBy = 'firstName';
    } else if (event.active == 'product') {
      this.sortBy = 'productName';
    } else if (event.active == 'supplier') {
      this.sortBy = 'supplierCompanyName';
    } else if (event.active == 'store') {
      this.sortBy = 'storeCode';
    } else if (event.active == 'age') {
      this.sortBy = 'age';
    }
    this.getSmartArtList(1, 'get', '');
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
