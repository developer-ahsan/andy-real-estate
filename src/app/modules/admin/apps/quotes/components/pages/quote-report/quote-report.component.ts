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
      res["data"].forEach(element => {
        element.subTotal = Number(element.royaltyPrice) + Number(element.shippingGroundPrice);
        element.setupPriceTotal = 0;
        element.decorators = [];
        element.colors = [];
        element.artworkFiles = [];
        if (element.Decoration) {
          let decoration = element.Decoration.split("#_");
          decoration.forEach((imprint, index) => {
            let splitImprint = imprint.split('||');
            element.decorators.push({ artworkFiles: [], pk_cartLineID: element.pk_cartLineID, id: splitImprint[0], locationName: splitImprint[1], methodName: splitImprint[2], setupPrice: Number(splitImprint[3]), runningPrice: Number(splitImprint[4]), colors: splitImprint[5], price: Number(splitImprint[7]) });
            element.subTotal += Number(splitImprint[7]);
            element.setupPriceTotal += Number(splitImprint[3]);
            this.getArworkFiles(element, Number(splitImprint[0]));
          });
        }
        if (element.Colors) {
          let colors = element.Colors.split("#_");
          colors.forEach(color => {
            let splitColor = color.split('||');
            element.colors.push({ colorName: splitColor[0], unitPrice: splitColor[1], totalPrice: splitColor[2] });
            element.subTotal += Number(splitColor[2]);
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
  getArworkFiles(data, imprintID) {
    let payload = {
      files_fetch: true,
      path: `/artwork/temp/${this.selectedQuote.pk_cartID}/${data.pk_cartLineID}/${imprintID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._quotesService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      files["data"].forEach(file => {
        file.imprintID = imprintID;
        data.artworkFiles.push(file);
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
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

