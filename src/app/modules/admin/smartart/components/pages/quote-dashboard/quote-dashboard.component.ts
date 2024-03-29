import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SmartArtService } from '../../smartart.service';
import { HideUnhideQuote, UpdateQuoteClaim, updateQuoteAttentionFlag, updateQuoteBulkStatusUpdate } from '../../smartart.types';
import moment from 'moment';
@Component({
  selector: 'app-quote-dashboard',
  templateUrl: './quote-dashboard.component.html',
  styles: [".mat-paginator  {border-radius: 16px !important} .mat-drawer-container {border-radius: 16px !important} ::-webkit-scrollbar {height: 3px !important}"]
})
export class QuoteDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('drawer', { static: true }) drawer: MatDrawer;
  @Input() isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['check', 'date', 'inhands', 'order', 'line', 'customer', 'product', 'supplier', 'status', 'age', 'store', 'proofContact', 'proof', 'action'];
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
  ngSearchStore = '';
  ngSearchDesigner = '';
  ngSearchField = '';
  ngUserField = '';
  ngFilterField = '2';
  isFilterLoader: boolean = false;

  smartArtUser: any = JSON.parse(sessionStorage.getItem('smartArt'));
  userData: any = JSON.parse(localStorage.getItem('userDetails'));

  paramsData: any;
  // BUlk Update
  status_id = 2;
  isBulkLoader: boolean = false;
  isSortingLoader: boolean = false;
  sortDirection: string = '';
  sortBy: string = '';

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _smartartService: SmartArtService,
    private router: Router,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._activeRoute.queryParams.subscribe(res => {
      this.paramsData = res;
      this.isLoading = true;
      this.getSmartArtList(1, 'get', '');
    });
    // this.isLoading = true;
    // this.searchableFields();
    // this.getSmartArtList(1, 'get');
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
      quote_dashboard_list: true,
      smartArt_userID: this.smartArtUser.pk_userID,
      page: page,
      size: 20,
      store_id: this.paramsData.store ? this.paramsData.store : '',
      designerID: this.paramsData.designer ? this.paramsData.designer : '',
      filter_field: this.paramsData.filterField ? this.paramsData.filterField : '2',
      search_field: this.paramsData.search ? this.paramsData.search : '',
      user_search_field: this.paramsData.customer ? this.paramsData.customer : '',
      sort_by: this.sortBy,
      sort_direction: this.sortDirection
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (this.isFilterLoader) {
        this.drawer.toggle();
      }
      res["data"].forEach(quote => {
        this.setColor(quote);
        quote.ageInHours = Math.floor(quote.age / 60);
        quote.proof = 'N/A';
        if (quote.qryLatestProof) {
          const [name, date] = quote.qryLatestProof.split('::');
          quote.proof = `${name} <br> ${date}`
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
  sortData(event) {
    this.isSortingLoader = true;
    this.sortDirection = event.direction;

    const sortByMapping = {
      'date': 'dateCreated',
      'inhands': 'inHandsDate',
      'order': 'fk_cartID',
      'line': 'pk_cartLineID',
      'customer': 'firstName',
      'product': 'productName',
      'supplier': 'supplierCompanyName',
      'age': 'ageInHours',
      'store': 'storeCode'
    };

    this.sortBy = sortByMapping[event.active] || '';

    this.getSmartArtList(1, 'get', '');
  }

  setColor(quote) {
    let theInHandsDate = moment(quote.dateCreated).add('days', quote.prodTimeMax[0]);
    quote.bgColor = '';
    if (quote.blnAttention) {
      quote.bgColor = '#75bbf5';
    } else if (quote.inHandsDate && (moment(quote.inHandsDate).isBefore(theInHandsDate))) {
      if (quote.blnRushFlexibility) {
        quote.bgColor = '#F2D1A0';
      } else {
        quote.bgColor = '#ffcaca';
      }
    } else if (quote.fk_orderGroupOrderID) {
      quote.bgColor = '#fca769';
    } else if (quote.blnReorder) {
      quote.bgColor = '#feee84';
    } else if (quote.blnGroupRun) {
      quote.bgColor = '#DBD7FF';
    }
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
  getSmartArtListProof(item) {
    item.proofLoader = true;
    let params = {
      art_proof: true,
      orderLine_id: item.pk_cartLineID,
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
  quoteDetails(item) {
    this._smartartService.routeData = item;
    const queryParams: NavigationExtras = {
      queryParams: { fk_imprintID: item.fk_imprintID, pfk_userID: item.pfk_userID, fk_cartID: item.fk_cartID, pk_cartLineID: item.pk_cartLineID, pk_storeID: item.pk_storeID, fk_productID: item.pk_productID, statusName: item.statusName }
    };
    this.router.navigate(['/smartart/quote-details'], queryParams);
  }
  // Customer Email
  customerEmail(item) {
    const queryParams: NavigationExtras = {
      queryParams: { fk_imprintID: item.fk_imprintID, pfk_userID: item.pfk_userID, fk_cartID: item.fk_cartID, pk_cartLineID: item.pk_cartLineID, pk_storeID: item.pk_storeID, fk_productID: item.pk_productID, statusName: item.statusName }
    };
    this.router.navigate(['/smartart/email-customer'], queryParams);
  }
  // Update order Hidden
  HideUnhideCart(item, check) {
    item.isHiddenLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: HideUnhideQuote = {
      blnHidden: check,
      cartline_id: Number(item.pk_cartLineID),
      imprint_id: Number(item.fk_imprintID),
      hide_unhide_quote: true
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
  // Update order Attention
  updateAttentionFlagOrder(item, check) {
    item.isFlagLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: updateQuoteAttentionFlag = {
      bln_attention: check,
      cartLine_id: Number(item.pk_cartLineID),
      imprint_id: Number(item.fk_imprintID),
      update_quote_attention_flag: true
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
  // Update Claim
  updateClaim(item, check) {
    item.isClaimLoader = true;
    let claimID = null;
    if (check) {
      claimID = this.userData.pk_userID;
    } else {
      claimID = null;
    }
    this._changeDetectorRef.markForCheck();
    let payload: UpdateQuoteClaim = {
      cartLineID: Number(item.pk_cartLineID),
      blnClaim: check,
      fk_smartArtDesignerClaimID: claimID,
      update_quote_claim: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._smartartService.snackBar(res["message"]);
      }
      item.isClaimLoader = false;
      item.fk_smartArtDesignerClaimID = claimID;
      // item.blnAttention = check;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.isClaimLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Bulk Update checked
  bulkUploadStatus() {
    let quotes = [];
    this.dataSource.forEach(element => {
      if (element.checked) {
        let additionalEmails = [];
        if (element.additionalEmails) {
          additionalEmails = element.additionalEmails?.split(',');
        }
        quotes.push({
          imprint_id: Number(element.fk_imprintID),
          status_id: element.pk_statusID,
          blnRespond: element.blnRespond,
          cartLine_id: element.pk_cartLineID,
          productNumber: element.productNumber,
          productName: element.productName,
          customerName: element.firstName + ' ' + element.lastName,
          customerEmail: element.email,
          customerAdditionalEmails: additionalEmails,
          customerCompanyName: element.companyName,
          locationName: element?.locationName ? element?.locationName : '',
          decorationName: element?.attributeName ? element?.attributeName : '',
          blnGroupRun: element.blnGroupRun,
          proofComments: '',
          cartID: element.pk_cartID,
          storeUserID: element.storeUserID,
          storeID: element.pk_storeID,
          storeName: element.storeName,
          blnAdditionalArtApproval: element.blnAdditionalArtApproval,
          blnAdditionalApprovalOverride: element.blnAdditionalApprovalOverride
        });
      }
    });
    if (quotes.length == 0) {
      this._smartartService.snackBar('Pleas check at least 1 quote');
      return;
    }
    this.isBulkLoader = true;
    let payload: updateQuoteBulkStatusUpdate = {
      status_id: this.status_id,
      quotes: quotes,
      smartArtLoggedInUserName: this.smartArtUser.userName,
      update_quote_bulk_status: true
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
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };


}
