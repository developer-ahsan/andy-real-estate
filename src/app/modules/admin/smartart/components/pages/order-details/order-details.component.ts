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
import { interval } from 'rxjs';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./order-detail.scss']
})
export class OrderDashboardDetailsComponent implements OnInit, OnDestroy {
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
  // Virtual Proof Images
  virtualProofData: any;
  // Approval History
  approvalHistoryData: any;

  // Timer
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  intervalId: any;


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _smartartService: SmartArtService,
    private router: Router,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userData = this._authService.parseJwt(this._authService.accessToken);
    this._activeRoute.queryParams.subscribe(res => {
      this.paramData = res
    });
    this.isLoading = true;
    this.getOrderDetails();
  };
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
      this.approvalHistoryData = res["approvalHistory"];
      this.imprintdata = res["data"];
      if (this.imprintdata.length > 0) {
        this.selectedImprint = this.imprintdata[0].pk_imprintID;
        if (this.imprintdata[0].allColors) {
          let colors = this.imprintdata[0].allColors;
          let colorsArr = colors.split(',');
          let finalColor = [];
          colorsArr.forEach(element => {
            let color = element.split(':');
            finalColor.push({ id: color[0], name: color[1], hex: color[2] });
          });
          this.allColors = finalColor;
          this.selectedImprintColor = this.imprintdata[0].imprintColors;
        }
      }
      this.getArtworkOther();
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getArtworkOther() {
    this.artWorkLoader = true;
    let params = {
      order_online_details_artApproval: true,
      orderLine_id: this.paramData.pk_orderLineID,
      imprint_id: this.paramData.fk_imprintID,
      product_id: this.orderData.fk_productID,
      store_id: this.orderData.pk_storeID,
      store_product_id: this.orderData.pk_storeProductID
    }
    this.artworktemplatesData = [];
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["artworkTemplate"]) {
        this.artworktemplatesData = res["artworkTemplate"];
      }
      if (res["virtualProof"]) {
        this.virtualProofData = res["virtualProof"];
      }
      this.artWorkLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.artWorkLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backToList() {
    this.router.navigate(['/smartart/orders-dashboard']);
  }
  // Last Proof
  lastProof() {
    let params = {
      art_proof: true,
      orderLine_id: this.paramData.pk_orderLineID,
      imprint_id: this.paramData.fk_imprintID
    }
    this.lastProofLoader = true;
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        this.lastProofData = res["data"][0].proofSentDate;
      } else {
        this.lastProofData = 'N/A';
      }
      this.lastProofLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.lastProofLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Add Comment
  addComment() {
    let comment = `<b><span class="fa fa-circle disabled"></span> ${this.userData.name}</b> said on ${moment().format('MMM DD YYYY')} | ${moment().format('h:mm:ss')}<br>${this.ngComment}<br><br>`;
    this.orderData.internalComments = this.orderData.internalComments + comment;
    setTimeout(() => {
      const element = document.getElementById('scrollBottomComment');
      element.scrollIntoView({ behavior: 'smooth' });
      this._changeDetectorRef.markForCheck();
    }, 100);
  }
  // Imprint Colors
  onChangeColor(event) {
    let imprint = this.imprintdata.filter(item => item.pk_imprintID == event.value);
    this.selectedImprint = imprint[0].pk_imprintID;
    if (imprint[0].allColors) {
      let colors = imprint[0].allColors;
      let colorsArr = colors.split(',');
      let finalColor = [];
      colorsArr.forEach(element => {
        let color = element.split(':');
        finalColor.push({ id: color[0], name: color[1], hex: color[2] });
      });
      this.allColors = finalColor;
      this.selectedImprintColor = imprint[0].imprintColors;
    }
  }
  // Timer
  startTimer() {
    this.resetTimer();
    this.intervalId = setInterval(() => {
      this.seconds++;
      if (this.seconds === 60) {
        this.seconds = 0;
        this.minutes++;
      }
      if (this.minutes === 60) {
        this.minutes = 0;
        this.hours++;
      }
      this._changeDetectorRef.markForCheck();
    }, 1000);
  }
  resetTimer() {
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    clearInterval(this.intervalId);
    this._changeDetectorRef.markForCheck();
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    clearInterval(this.intervalId);
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
