import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuotesService } from '../../quotes.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-quote-report',
  templateUrl: './quote-report.component.html',
  styles: ['.col-width {width: 11.11%} .data-width {width: 100px}']
})
export class QuoteReportsComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  processQuantities = new Array(30);
  productQuantities = new Array(8);
  horizontalArray = new Array(8);
  ngChargeCode = 0;
  ngCostCode: any = 0;
  getChargesLoader: boolean = false;
  chargesTableArray: any;

  isNewCharge: boolean = false;
  runSetupLoaderFetching: boolean;
  runSetupDistributorCodes: any;

  newChargeValue = 0;

  createNewChargeLoader: boolean = false;
  currentChargeValue: any;
  errMsg = '';
  isLoading: boolean = false;
  selectedQuote: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _quotesService: QuotesService,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.getQuoteDetails();
  };
  getQuoteDetails() {
    this._quotesService.qoutesDetails$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedQuote = res["data"][0];
    });
  }
  openPDF() {
    const quoteFileName = `${this.selectedQuote.storeName}-Quote-${this.selectedQuote.pk_cartID}.pdf`;
    let url = `https://assets.consolidus.com/globalAssets/Stores/quoteExports/${quoteFileName}`;
    window.open(url, '_blank');
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

