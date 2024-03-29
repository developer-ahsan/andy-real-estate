import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { QuotesService } from '../../quotes.service';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SmartArtService } from 'app/modules/admin/smartart/components/smartart.service';

@Component({
  selector: 'app-original-quote-report',
  templateUrl: './original-quote-report.component.html',
  styles: ['.col-width {width: 11.11%} .data-width {width: 100px}']
})
export class QuoteOriginalComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  url: string = '';
  urlSafe: SafeResourceUrl;

  selectedQuote: any;
  isOriginalReport: boolean = false
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public _QuotesService: QuotesService,
    private _smartartService: SmartArtService,
    public sanitizer: DomSanitizer
  ) {

  }

  ngOnInit(): void {
    this.isLoading = true;
    this.getQuoteDetails();
  };
  getQuoteDetails() {
    this._QuotesService.qoutesDetails$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedQuote = res["data"][0];
      this.url = `https://assets.consolidus.com/globalAssets/Quotes/originalQuoteReport/${this.selectedQuote.pk_cartID}.html`;
      this.checkFileExist(this.url)

    });
  }
  checkFileExist(url) {
    let params = {
      file_check: true,
      url: url
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isLoading = false;
      if (res["isFileExist"]) {
        this.isOriginalReport = true;
        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
      } else {
        this.isOriginalReport = false;
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
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
