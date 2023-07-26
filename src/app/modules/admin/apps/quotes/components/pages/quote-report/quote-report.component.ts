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

  quoteReportData: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _quotesService: QuotesService,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getQuoteDetails();
  };
  getQuoteDetails() {
    this._quotesService.qoutesDetails$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedQuote = res["data"][0];
      this.getQuotesData();
    });
  }
  getQuotesData() {
    let params = {
      quote_report: true,
      cart_id: this.selectedQuote.pk_cartID
    }
    this._quotesService.getQuoteData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      console.log(res);
      res["data"].forEach(element => {
        element.decorators = [];
        element.colors = [];
        if (element.Decoration) {
          let decoration = element.Decoration.split("::");
          decoration.forEach(imprint => {
            let splitImprint = imprint.split('||');
            element.decorators.push({ locationName: splitImprint[0], methodName: splitImprint[1] });
          });
        }
        if (element.Colors) {
          let colors = element.Colors.split("::");
          colors.forEach(color => {
            let splitColor = color.split('||');
            element.colors.push({ colorName: splitColor[0], unitPrice: splitColor[1], totalPrice: splitColor[2] });
          });
        }
      });
      this.quoteReportData = res["data"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
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

