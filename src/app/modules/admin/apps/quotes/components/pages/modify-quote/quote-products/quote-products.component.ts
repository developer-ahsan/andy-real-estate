import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
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
  selectedQuoteDetail: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isLoading: boolean = false;
  allProducts = [];
  searchProductCtrl = new FormControl();
  isSearchingProduct: boolean = false;
  selectedProduct: any;

  ngSelectedProduct: any = {
    royaltyPrice: '',
    shippingCost: '',
    shippingPrice: '',
    blnOverride: '',
    // Initialize the structure according to your data model
    products: [
      {
        cost: 0, // Provide initial values as per your application logic
        price: 0,
        blnOverride: false,
        blnSample: false,
        blnTaxable: false
        // Add more properties if needed
      }
    ],
    color_sizes: [],
    colors: [], // Initialize with available colors
    sizes: [], // Initialize with available sizes
    totalQuantity: 0,
    totalRunintCost: 0,
    totalRunintPrice: 0,
    // Add more properties as per your application's data structure
  };


  orderProducts: any = [];
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
        this.getProductsCtrl();
        this.getAllProducts();
        // this.getSelectedProducts();
        this._changeDetectorRef.markForCheck();
      });
  }
  getSelectedProducts() {
    let params = {
      modify_cart_current_products: true,
      cart_id: this.selectedQuoteDetail.pk_cartID
    }
    this._quoteService.getQuoteData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderProducts = res["data"];
      this.selectedProduct = this.allProducts[0];
      this.searchProductCtrl.setValue(this.selectedProduct)
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getAllProducts() {
    let params = {
      modify_cart_current_products: true,
      store_id: this.selectedQuoteDetail.storeID
    }
    this._quoteService.getQuoteData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allProducts = res["data"];
      this.selectedProduct = this.allProducts[0];
      this.searchProductCtrl.setValue(this.selectedProduct)
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
      console.log(res);
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getProductsCtrl() {
    let params;
    this.searchProductCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          modify_cart_current_products: true,
          store_id: this.selectedQuoteDetail.storeID
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allProducts = [];
        this.isSearchingProduct = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._quoteService.getQuoteData(params)
        .pipe(
          finalize(() => {
            this.isSearchingProduct = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allProducts = data['data'];
    });
  }
  onSelected(ev) {
    this.selectedProduct = ev.option.value;
  }
  displayWith(value: any) {
    return value?.productName;
  }




  
  isUpdateOptionLoader: boolean = false;

  // Implement methods for functionality
  updateProductOptions() {
    // Implement logic to update product options
    // Access and modify ngSelectedProduct properties accordingly
    // e.g., this.ngSelectedProduct.totalQuantity = ...;
    // Implement API calls or other business logic as needed
  }
}
