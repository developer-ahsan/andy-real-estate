import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs/operators';
import { QuotesService } from '../../../quotes.service';
import { Subject } from 'rxjs';
import { updateCartInfo, updateCartShipping } from '../../../quotes.types';
import moment from 'moment';

@Component({
  selector: 'app-quote-products',
  templateUrl: './quote-products.component.html',
  styles: [".tracker {background-color: #eee;} .tracker-active {background-color: green;color: #fff;} .progress {height: 2rem} ::-webkit-scrollbar {width: 3px !important}"]
})
export class QuoteProductsComponent implements OnInit {
  shippingForm: FormGroup;
  selectedQuoteDetail: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isBillingLoader: boolean = false;
  isShippingLoader: boolean = false;
  isLoading: boolean = false;
  constructor(
    private _quoteService: QuotesService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getQuotesDetails();
  }
  getQuotesDetails() {
    this._quoteService.qoutesDetails$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((quote) => {
        this.selectedQuoteDetail = quote["data"][0];
        this.getAllProducts();
        this._changeDetectorRef.markForCheck();
      });
  }
  getAllProducts() {
    let params = {
      modify_cart_current_products: true,
      store_id: this.selectedQuoteDetail.storeID
    }
    this._quoteService.getQuoteData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
      console.log(res);
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
}
