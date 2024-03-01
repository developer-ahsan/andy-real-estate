import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SmartArtService } from '../../smartart.service';
import { HideUnhideCart, HideUnhideOrder, UpdateOrderLineClaim, sendOrderCustomerFollowUpEmail, updateAttentionFlagOrder, updateOrderBulkStatusUpdate } from '../../smartart.types';
import { AuthService } from 'app/core/auth/auth.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import moment from 'moment';
@Component({
  selector: 'app-order-dashboard',
  templateUrl: './order-dashboard.component.html',
  styles: [`.mat-paginator  {border-radius: 16px !important} .mat-drawer-container {border-radius: 16px !important} ::-webkit-scrollbar {height: 3px !important}
  .loading{
    width:5px;
    height:5px;
    background:#FFF;
    border-radius:100%;
    float:left;
    margin:5px;
  }
  .loading-0{
      -webkit-animation:bounce 1s infinite;
      -webkit-animation-delay:.1s;
      background:#6e6f70
  }
  .loading-1{
      -webkit-animation:bounce 1s infinite;
      -webkit-animation-delay:.3s;
      background:#6e6f70;
  }
  .loading-2{
      -webkit-animation:bounce 1s infinite ease;
      -webkit-animation-delay:.5s;
      background:#6e6f70;
  }
  @-webkit-keyframes bounce {
    0%, 100% {
      opacity:1;
    }
    60% {
      opacity:.0;
     
    }
  }`],
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
  displayedColumns: string[] = [];
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
  userData: any = JSON.parse(localStorage.getItem('userDetails'));
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
  checkAll: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _smartartService: SmartArtService,
    private router: Router,
    private _commonService: DashboardsService,
    private _authService: AuthService,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._activeRoute.queryParams.subscribe(res => {
      this.page = 1;
      this.paramsData = res;
      const filterFields = [3, 12, 13, 4];
      this.displayedColumns = ['check', 'date', 'inhands', 'order', 'line', 'customer', 'product', 'supplier', 'status', 'age', 'store'];
      if (filterFields.includes(Number(res.filterField)) || res.search || res.customer) {
        this.displayedColumns.push('proof_contact')
      }
      this.displayedColumns = this.displayedColumns.concat(['proof', 'pop', 'action']);
      this.isLoading = true;
      this.getSmartArtList(1, 'get', '');
    });
  };

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
    let filter_field = '2';
    if (this.paramsData.filterField) {
      if (this.paramsData.filterField == 0) {
        filter_field = '';
      } else {
        filter_field = this.paramsData.filterField;
      }
    }

    let params = {
      smart_art_userID: this.smartArtUser.pk_userID,
      // smartart_list: true,
      order_dashboard_list: true,
      page: page,
      size: 20,
      store_id: this.paramsData.store ? this.paramsData?.store : '',
      designerID: this.paramsData.designer ? this.paramsData.designer : '',
      filter_field: filter_field,
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
        element.fileLoader = true;
        this.setColor(element);
        element.ageInHours = Math.floor(element.age / 60);
        if (element.viewProofDetails) {
          const proof = element.viewProofDetails.split(';');
          element.proofDetails = proof[0].split(',');
        } else {
          element.proofDetails = null;
        }
        // Resesend Proof
        element.blnSendProof = false;
        const targetStatusIDs = [3, 12, 13];
        element.qryContact = null;
        if (targetStatusIDs.includes(element.pk_statusID)) {
          this.resendProofEmail(element);
        }

      });
      this.dataSource = res["data"];
      this.getFilesData();
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
  getFilesData() {
    const payload = this.dataSource.map(element => ({
      ID: element.pk_orderLineID,
      path: `/artwork/POProof/${element.pk_orderLineID}/`,
    }));

    this._smartartService.getMultipleFilesData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        if (element.data.length) {
          const foundItem = this.dataSource.find(item => item.pk_orderLineID === element.orderLineID);
          if (foundItem) {
            foundItem.fileProof = `https://assets.consolidus.com/artwork/POProof/${foundItem.pk_orderLineID}/${element.data?.[0]?.FILENAME || ''}`;
            this._changeDetectorRef.markForCheck();
          }
        }
      });
      this.dataSource.forEach(element => {
        element.fileLoader = false;
      });
      this._changeDetectorRef.markForCheck();

    });
  }
  setColor(element) {
    let theInHandsDate = moment(element.orderDate).add(element.prodTimeMax);
    element.bgColor = '';
    if (element.blnAttention) {
      element.bgColor = '#75bbf5';
    } else if (element.inHandsDate && (moment(element.inHandsDate).isBefore(theInHandsDate))) {
      if (element.blnRushFlexibility) {
        element.bgColor = '#F2D1A0';
      } else {
        element.bgColor = '#ffcaca';
      }
    } else if (element.fk_groupOrderID) {
      element.bgColor = '#fca769';
    } else if (element.blnReorder) {
      element.bgColor = '#feee84';
    } else if (element.blnGroupRun) {
      element.bgColor = '#DBD7FF';
    } else if (element.paymentDate) {
      element.bgColor = '#ADFFB6';
    }
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
    this.checkAll = false;
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
      queryParams: { pfk_userID: item.pfk_userID, fk_orderID: item.fk_orderID, fk_imprintID: item.fk_imprintID, pk_orderLineID: item.pk_orderLineID }
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
      this.setColor(item);
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
  updateClaim(item, check, confirm) {
    this.claimItem = item;
    this.claimCheck = check;
    if (confirm) {
      this._commonService.showConfirmation('This item is already claimed by someone else.  Are you sure you want to claim this?', (confirmed) => {
        if (confirmed) {
          this.ClaimUnClaimItem();
        }
      });
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
      claimID = Number(this.userData.pk_userID)
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
        this.dataSource.forEach(element => {
          if (element.pk_orderLineID == this.claimItem.pk_orderLineID) {
            element.fk_smartArtDesignerClaimID = claimID;
          }
        });
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
    order.checked = ev.checked;
  }
  selectAllOrders(ev) {
    this.dataSource.forEach(order => {
      order.checked = ev.checked;
    });
    this._changeDetectorRef.markForCheck();
  }
  bulkUploadStatus() {
    let orders = [];
    const approvedStatusIDs = [5, 6, 7, 9, 11, 16];
    this.dataSource.forEach(element => {
      if (element.checked) {
        let blnApprove = 0;
        if (approvedStatusIDs.includes(element.pk_statusID)) {
          blnApprove = 1;
        }
        orders.push({
          imprint_id: Number(element.fk_imprintID),
          ordeLine_id: Number(element.pk_orderLineID),
          blnGroupRun: element.blnGroupRun,
          fk_groupOrderID: element.fk_groupOrderID,
          product_id: element.pk_productID,
          productName: element.productName.replace(/'/g, "''"),
          productNumber: element.productNumber.replace(/'/g, "''"),
          blnApproved: blnApprove, // Check pk_statusID in the orderline 1 if statusID of imprint is "5,6,7,9,11,16" else 0
          storeID: element.pk_storeID,
          orderID: element.fk_orderID,
          storeName: element.storeName,
          firstName: element.firstName,
          lastName: element.lastName,
          email: element.email,
          orderDate: element.orderDate,
          inHandsDate: element.inHandsDate,
          blnRespond: element.blnRespond,
          companyName: element.companyName.replace(/'/g, "''"),
          tblLocationName: element.tblLocationName,
          methodName: element.methodName
        });
      }
    });
    if (orders.length == 0) {
      this._smartartService.snackBar('Pleas check at least 1 order');
      return;
    }
    this.isBulkLoader = true;
    let payload: updateOrderBulkStatusUpdate = {
      status_id: Number(this.status_id),
      orders: orders,
      smartArtLoggedInUserName: this.smartArtUser.firstName + ' ' + this.smartArtUser.lastName,
      update_order_bulk_status: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.checkAll = false;
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
  resendProofEmail(order) {
    order.blnSendProof = true;
    let store_user_approval_contact_id = 0;
    let art_approval_contact_id = 0;
    order.recpientsEmail = order.email;
    if (order.fk_storeUserApprovalContactID || order.fk_artApprovalContactID) {
      if (order.fk_storeUserApprovalContactID) {
        store_user_approval_contact_id = order.fk_storeUserApprovalContactID;
        art_approval_contact_id = 0;
      } else if (order.fk_artApprovalContactID) {
        store_user_approval_contact_id = 0;
        art_approval_contact_id = order.fk_artApprovalContactID;
      }
      let params = {
        resend_proof_contact: true,
        store_user_approval_contact_id, art_approval_contact_id
      }
      this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        order.recpientsEmail = res["data"][0].email;
        this._changeDetectorRef.markForCheck();
      });
    }
  }
  uploadResenedProofEmail(order) {
    order.isProofLoader = true;

    let params = {
      order_line_followUp_getCall: true,
      orderLine_id: order.pk_orderLineID,
      imprint_id: order.fk_imprintID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(colors => {
      let colorData = null;
      if (colors["data"].length > 0) {
        colorData = colors["data"][0].colorNameList;
      }
      const url = `https://assets.consolidus.com/globalAssets/Products/HiRes/${order.storeProductID}.jpg?${Math.random()}`;
      let storeImage: any = '';
      this._commonService.checkImageExistData(url).then(imgRes => {
        if (imgRes) {
          storeImage = url;
        } else {
          storeImage = 'https://assets.consolidus.com/globalAssets/Products/coming_soon.jpg';
        }
        let payload: sendOrderCustomerFollowUpEmail = {
          orderID: Number(order.fk_orderID),
          orderLineID: Number(order.pk_orderLineID),
          orderLineImprintID: Number(order.fk_imprintID),
          artApprovalContactID: order.fk_artApprovalContactID,
          storeUserApprovalContactID: order.fk_storeUserApprovalContactID,
          protocol: order.protocol,
          email_recipients: order.recpientsEmail.split(','),
          smartArtAdminEmail: this.smartArtUser.email,
          locationName: order.locationName,
          methodName: order.attributeName,
          imprintColors: colorData,
          productNumber: order.productNumber,
          productName: order.productName,
          primaryHighlight: order.storePrimaryHighlight,
          storeID: order.pk_storeID,
          storeName: order.storeName,
          storeCode: order.storeCode,
          storeProductID: order.storeProductID,
          quantity: order.quantity,
          storeProductImageURL: storeImage,
          storeUserFirstName: order.firstName,
          storeUserLastName: order.lastName,
          storeUserEmail: order.email,
          storeUserID: order.pfk_userID,
          storeUserCompanyName: order.companyName,
          blnStoreUserApprovalDone: order.blnStoreUserApprovalDone,
          send_order_customer_followUp_email: true
        }
        this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          order.isProofLoader = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
          if (res["success"]) {
            this._smartartService.snackBar(res["message"]);
            this._changeDetectorRef.markForCheck();
          }
        });
      });
    });

  }
}
