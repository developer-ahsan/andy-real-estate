import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SmartArtService } from '../../smartart.service';
import { sendQuoteCustomerEmail } from '../../smartart.types';
import { Location } from '@angular/common';

@Component({
  selector: 'app-quote-order-emails',
  templateUrl: './quote-order-emails.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./quote-order-emails.scss']
})
export class QuoteOrderEmailComponent implements OnInit, OnDestroy {
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
  ngSearchStore = '';
  ngSearchDesigner = '';
  ngFilterField = '2';
  ngFilterProduct = '';
  isFilterLoader: boolean = false;


  // Comment Toggle
  isCommentToggle: boolean = false;

  // loader
  isDetailLoader: boolean = false;

  // Order Details
  orderData: any;
  quoteData: any;
  quoteImprintdata: any;
  imprintdata: any;
  paramData: any;

  // Last Proof
  lastProofLoader: boolean = false;
  lastProofData: any;

  // User Details
  userData: any;
  // Comment
  ngComment = '';
  allColors: any;
  selectedImprint: any;
  selectedImprintColor = '';
  selectedMultipleColors: any;
  // Artwork templates
  artWorkLoader: boolean = false;
  artworktemplatesData: any;
  // Timer
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  intervalId: any;

  // Email Check
  emailCheckOrder: boolean = false;
  sendEmailLoader: boolean = false;
  ngFrom = '';
  ngTo = '';
  ngSubject = '';
  ngMessage = '';

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _smartartService: SmartArtService,
    private router: Router,
    private _location: Location,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.userData = this._authService.parseJwt(this._authService.accessToken);
    this._activeRoute.queryParams.subscribe(res => {
      this.paramData = res;
      if (res["fk_orderID"]) {
        this.emailCheckOrder = true;
        this.getOrderDetails();
      } else {
        this.getQuoteDetails();
      }
    });
  };
  getQuoteDetails() {
    let params = {
      quote_details: true,
      product_id: this.paramData.fk_productID,
      store_id: this.paramData.pk_storeID,
      cartLine_id: this.paramData.pk_cartLineID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderData = res["data"][0];

      this.ngFrom = this.orderData.companyEmail;
      this.getQuoteImpritData();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getQuoteImpritData() {
    let params = {
      quote_imprint_details: true,
      cartLine_id: this.paramData.pk_cartLineID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.imprintdata = res["data"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getOrderDetails() {
    let params = {
      order_online_details_v2: true,
      orderLine_id: this.paramData.pk_orderLineID,
      order_id: this.paramData.fk_orderID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderData = res["data"][0];
      this.getImpritData();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getImpritData() {
    let params = {
      order_online_details_imprints_colors: true,
      orderLine_id: this.paramData.pk_orderLineID,
      orderLineImprint_id: this.paramData.fk_imprintID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.imprintdata = res["data"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  senAutoArtRequest() {
    let imprintIDs = [];
    this.imprintdata.forEach(element => {
      imprintIDs.push(element.imprintID);
    });
    if (this.ngTo.trim() == '') {
      this._smartartService.snackBar('Please choose any email');
      return;
    }
    this.sendEmailLoader = true;
    let email = [];
    if (this.ngTo != '') {
      email.push(this.ngTo);
    }
    this.sendEmailLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: sendQuoteCustomerEmail = {
      to_email: email,
      from: this.ngFrom,
      subject: this.ngSubject,
      message: this.ngMessage,
      storeName: this.orderData.storeName,
      blnEProcurement: this.orderData.blnEProcurement,
      store_id: this.orderData.pk_storeID,
      userID: this.paramData.pfk_userID,
      storeURL: this.orderData.storeURL,
      cartLineID: this.paramData.pk_cartLineID,
      imprintNumList: imprintIDs,
      cartID: this.paramData.fk_cartID,
      cartLineImprintID: this.paramData.fk_imprintID,
      productName: this.orderData.productName[0],
      send_quote_customer_email: true
    };
    this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this._smartartService.snackBar(res["message"]);
        this._location.back();
      }
      this.sendEmailLoader = false;
      this.ngTo = '';
      this.ngSubject = '';
      this.ngFrom = '';
      this.ngMessage = '';
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.sendEmailLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backToList() {
    if (this.emailCheckOrder) {
      this.router.navigate(['/smartart/orders-dashboard']);
    } else {
      this.router.navigate(['/smartart/quotes-dashboard']);
    }
  }

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
