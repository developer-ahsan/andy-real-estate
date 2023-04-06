import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { RapidBuildService } from '../../rapid-build.service';
import { sendAutoRequest, UpdateArtworkTgas, UpdateQuoteOptions, updateQuotePurchaseOrderComment, updateReorderNumber } from '../../rapid-build.types';
@Component({
  selector: 'app-rapid-details',
  templateUrl: './rapid-details.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./rapid-details.scss']
})
export class RapidBuildDetailsComponent implements OnInit, OnDestroy {
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
  quoteData: any;
  quoteImprintdata: any;
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
  selectedProofImprint: any;
  selectedImprintColor = '';
  selectedMultipleColors: any;
  // Artwork templates
  artWorkLoader: boolean = false;
  artworktemplatesData: any = [];
  // artwork tags
  artworktags: any = [];
  selectedMultipleTags: any;
  // Approval History
  approvalHistoryData: any;
  // Purchase Comments
  selectedPurchaseImprint: any;
  // Timer
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  intervalId: any;

  // Updates
  updateQuoteInfoLoader: boolean = false;
  isPurchaseCommentLoader: boolean = false;
  isArtworkTagsLoader: boolean = false;
  isAutoRequestLoader: boolean = false;
  isManualProofLoader: boolean = false;
  imageValue: any;

  allStatus: any;
  buildDetails: any;
  imprintDetails: any;
  colorsData: any;
  logoData: any;
  isLogoBankLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _rapidService: RapidBuildService,
    private router: Router,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userData = JSON.parse(sessionStorage.getItem('rapidBuild'));
    this._activeRoute.params.subscribe(res => {
      this.isLoading = true;
      this.getRapidBuildDetails(res.id);
    });
    this._rapidService.rapidBuildStatuses$.pipe(takeUntil(this._unsubscribeAll)).subscribe(statuses => {
      this.allStatus = statuses['data'];
    });
  };
  getRapidBuildDetails(rbid) {
    let params = {
      rbid: rbid,
      rapidbuild_details: true
    }
    this._rapidService.getRapidBuildData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.buildDetails = res["data"][0];
      this.getImprintData(this.buildDetails.pk_productID);
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getImprintData(pid) {
    let params = {
      product_id: pid,
      rapidbuild_imprints: true,
      size: 50
    }
    this._rapidService.getRapidBuildData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.imprintDetails = res["data"];
      this.getColorsData(this.buildDetails.fk_storeProductID);
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getColorsData(spid) {
    let params = {
      spid: spid,
      rapidbuild_colors: true,
      size: 50
    }
    this._rapidService.getRapidBuildData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.colorsData = res["data"];
      this.isLogoBankLoader = true;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
      this.getLogoBank()
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getLogoBank() {
    let params = {
      store_id: this.buildDetails.pk_storeID,
      rapidbuild_logobanks: true,
      size: 50
    }
    this._rapidService.getRapidBuildData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.logoData = res["data"];
      this.isLogoBankLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLogoBankLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backToList() {
    this.router.navigate(['/rapidbuild/image-management']);
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
