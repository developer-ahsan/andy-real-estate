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
import { UpdateQuoteOptions, updateQuotePurchaseOrderComment, updateReorderNumber } from '../../smartart.types';
@Component({
  selector: 'app-quote-details',
  templateUrl: './quote-details.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./quote-details.scss']
})
export class QuoteDashboardDetailsComponent implements OnInit, OnDestroy {
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
      this.paramData = res;
      this.getQuoteDetails();
    });
    this.isLoading = true;
    this.artWorkLoader = true;
  };
  getQuoteDetails() {
    let params = {
      quote_details: true,
      product_id: this.paramData.fk_productID,
      store_id: this.paramData.pk_storeID,
      cartLine_id: this.paramData.pk_cartLineID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.quoteData = res["data"][0];
      let tags = this.quoteData.artworkTags.split(',');
      this.approvalHistoryData = res["approvalHistory"];
      tags.forEach(element => {
        let tag = element.split(':');
        this.artworktags.push({ id: tag[0], name: tag[1] });
      });
      // this.isLoading = false;
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
      cartLine_id: this.paramData.pk_cartLineID,
      product_id: this.paramData.fk_productID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.quoteImprintdata = res["data"];
      this.artworktemplatesData = res["artworkTemplates"];
      this.artWorkLoader = false;
      console.log(this.quoteImprintdata)
      if (this.quoteImprintdata.length > 0) {
        this.selectedImprint = this.quoteImprintdata[0].imprintID;
        this.selectedPurchaseImprint = this.quoteImprintdata[0];

        //   if (this.imprintdata[0].allColors) {
        //     let colors = this.imprintdata[0].allColors;
        //     let colorsArr = colors.split(',');
        //     let finalColor = [];
        //     colorsArr.forEach(element => {
        //       let color = element.split(':');
        //       finalColor.push({ id: color[0], name: color[1], hex: color[2] });
        //     });
        //     this.allColors = finalColor;
        //     this.selectedImprintColor = this.imprintdata[0].imprintColors;
        //   }
      }
      // this.getArtworkOther();
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backToList() {
    this.router.navigate(['/smartart/quotes-dashboard']);
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
    // this.orderData.internalComments = this.orderData.internalComments + comment;
    setTimeout(() => {
      const element = document.getElementById('scrollBottomComment');
      element.scrollIntoView({ behavior: 'smooth' });
      this._changeDetectorRef.markForCheck();
    }, 100);
  }
  // Purchase Order COmment
  purchaseOrderComment(event) {

  }
  // Imprint Colors
  onChangeColor(event) {
    // let imprint = this.imprintdata.filter(item => item.pk_imprintID == event.value);
    // this.selectedImprint = imprint[0].pk_imprintID;
    // if (imprint[0].allColors) {
    //   let colors = imprint[0].allColors;
    //   let colorsArr = colors.split(',');
    //   let finalColor = [];
    //   colorsArr.forEach(element => {
    //     let color = element.split(':');
    //     finalColor.push({ id: color[0], name: color[1], hex: color[2] });
    //   });
    //   this.allColors = finalColor;
    //   this.selectedImprintColor = imprint[0].imprintColors;
    // }
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
  // Update Reorder
  updateReorder(imprint) {
    imprint.reorderLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: updateReorderNumber = {
      reorderNumber: imprint.reorderNumber,
      cartLineID: this.paramData.pk_cartLineID,
      imprintID: imprint.imprintID,
      update_reorder_number: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar('Reorder updated successfully');
      imprint.reorderLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      imprint.reorderLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateQuote() {
    this.updateQuoteInfoLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: UpdateQuoteOptions = {
      blnAdditionalProofContacts: this.quoteData.blnAdditionalApprovalOverride,
      blnIgnoreAdditionalArtEmails: this.quoteData.blnIgnoreAdditionalArtEmails,
      eventName: this.quoteData.event,
      bypassScheduler: this.quoteData.bypassScheduler,
      pk_cartLineID: Number(this.paramData.pk_cartLineID),
      pk_cartID: Number(this.paramData.fk_cartID),
      update_quote_options: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar('Quote information updated successfully');
      this.updateQuoteInfoLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.updateQuoteInfoLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updatePurchaseComment() {
    this.isPurchaseCommentLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: updateQuotePurchaseOrderComment = {
      purchaseOrderComment: this.selectedPurchaseImprint.originalArtworkComment,
      cartLineID: Number(this.paramData.pk_cartLineID),
      imprintID: Number(this.selectedPurchaseImprint.imprintID),
      update_quote_purchase_comment: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar('Quote information updated successfully');
      this.isPurchaseCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isPurchaseCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    });
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
