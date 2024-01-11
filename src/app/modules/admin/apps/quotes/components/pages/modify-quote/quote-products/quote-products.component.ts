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
  currentSelectedProduct: any;
  currentSearchProductCtrl = new FormControl();
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
  quillModules: any = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };
  // Add new Product
  newProductQuantity: any = '';
  newProductColor: any = '';
  newProductSize: any = '';
  newBlnOverride: boolean = true;
  newBlnSample: boolean = false;
  newBlnTax: boolean = true;
  newBlnRoyalty: boolean = true;

  // Add New Product Option
  ngColor = 0;
  ngSize = 0;
  ngQuantity = 0;
  ngOverrideShipping: boolean = false;


  orderProducts: any = [];
  cartLines: any;
  selectedCartLine: any;
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
        this.cartLines = quote["cartLines"];
        console.log(this.cartLines);
        this.refactorCartLinesData();
        this.getProductsCtrl();
        this.getAllProducts();
        this.selectedCartLine = this.cartLines[0];
        this.currentSelectedProduct = this.cartLines[0];
        this.currentSearchProductCtrl.setValue(this.cartLines[0]);

        // this.getSelectedProducts();
        this._changeDetectorRef.markForCheck();
      });
  }
  refactorCartLinesData() {
    this.selectedQuoteDetail.shippingGroundCost = 0;
    this.selectedQuoteDetail.royaltyPrice = 0;
    this.selectedQuoteDetail.shippingGroundPrice = 0;
    this.cartLines.forEach(cartLine => {
      cartLine.blnOverrideShippingShipping = true;
      cartLine.totalQuantity = 0;
      cartLine.totalRunCost = 0;
      cartLine.totalRunPrice = 0;
      this.selectedQuoteDetail.shippingGroundCost = cartLine.shippingGroundCost;
      this.selectedQuoteDetail.shippingGroundPrice = cartLine.shippingGroundPrice;
      this.selectedQuoteDetail.royaltyPrice = cartLine.royaltyPrice;
      this.getCartLineImprints(cartLine);
      //  Accessories
      cartLine.AccessoriesData = [];
      if (cartLine.Accessories) {
        const cartsData = cartLine.Accessories.split('#_');
        cartsData.forEach(cart => {
          const [packagingID, quantityPerPackage, packagingName, cartLineAccessoryRunPrice, cartLineAccessorySetupPrice, totalSetupRunPrice] = cart.split('||');
          cartLine.AccessoriesData.push({ packagingID, quantityPerPackage, packagingName, cartLineAccessoryRunPrice, cartLineAccessorySetupPrice, totalSetupRunPrice });
        });
      }
      // Decorations
      cartLine.DecorationData = [];
      if (cartLine.Decoration) {
        const decorationData = cartLine.Decoration.split('#_');
        decorationData.forEach(decoration => {
          const [imprintID, locationName, decorationName, cartLineImprintSetupPrice, cartLineImprintRunPrice, colorNameList, logoBankID, totalSetupRunPrice] = decoration.split('||');
          cartLine.DecorationData.push({ imprintID, locationName, decorationName, cartLineImprintSetupPrice, cartLineImprintRunPrice, colorNameList, logoBankID, totalSetupRunPrice });
        });
      }
      // Colors
      cartLine.ColorsData = [];
      if (cartLine.Colors) {
        const colorsData = cartLine.Colors.split('#_');
        colorsData.forEach((colors, index) => {
          const [pk_colorID, pk_sizeID, quantity, colorName, runCost, runPrice] = colors.split('||');
          cartLine.ColorsData.push({ pk_colorID: Number(pk_colorID), quantity, colorName, runCost: Number(runCost), runPrice: Number(runPrice), pk_sizeID: Number(pk_sizeID) });
          if (index == 0) {
            this.ngColor = Number(pk_colorID);
          }
          cartLine.totalQuantity += Number(quantity);
          cartLine.totalRunCost += Number(quantity) * (Number(runCost) + cartLine.cartLineBaseCost);
          cartLine.totalRunPrice += Number(quantity) * (Number(runPrice) + cartLine.cartLineBasePrice);
        });
      }
      // colorsList
      cartLine.ColorsListData = [];
      if (cartLine.colorsList) {
        const colorsData = cartLine.colorsList.split(',,');
        colorsData.forEach(colors => {
          const [pk_colorID, colorName, setup, run] = colors.split(':');
          cartLine.ColorsListData.push({ pk_colorID: Number(pk_colorID), colorName, setup, run });
        });
      }
      // imprintColors
      cartLine.imprintColorsData = [];
      if (cartLine.imprintColors) {
        const imprintData = cartLine.imprintColors.split(',,');
        imprintData.forEach(imprint => {
          const [pk_imprintColorID, imprintColorName, RGB] = imprint.split(':');
          cartLine.imprintColorsData.push({ pk_imprintColorID, imprintColorName, RGB });
        });
      }
      // imprintDetails
      cartLine.imprintDetailsData = [];
      if (cartLine.imprintDetails) {
        const imprintData = cartLine.imprintDetails.split('#_');
        imprintData.forEach(imprint => {
          const [imprintID, locationID, decoratorID, customerLogoBankID, locationLogoBankID, locationName, decorationName, customerArtworkComment, logoBankID, statusName, blnRespond, pk_statusID] = imprint.split('||');
          cartLine.imprintDetailsData.push({ imprintID, locationID, decoratorID, customerLogoBankID, locationLogoBankID, locationName, decorationName, customerArtworkComment, logoBankID, statusName, blnRespond, pk_statusID });
        });
      }
      // sizesList
      cartLine.sizesListData = [];
      if (cartLine.sizesList) {
        const sizeData = cartLine.sizesList.split(',,');
        sizeData.forEach((size, index) => {
          const [pk_sizeID, sizeName, setup, run, weight, unitsPerWeight] = size.split(':');
          cartLine.sizesListData.push({ pk_sizeID: Number(pk_sizeID), sizeName, setup, run, weight, unitsPerWeight });
          if (index == 0) {
            this.ngSize = Number(pk_sizeID);
          }
        });
      }
    });
  }
  getCartLineImprints(cartLine) {
    let params = {
      cartline_imprints: true,
      cartLineID: cartLine.pk_cartLineID
    }
    this._quoteService.getQuoteData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      cartLine.selectedImprints = [];
      cartLine.unSelectedImprints = [];
      res["dropdown_imprints"].forEach(imprint => {
        if (imprint.isSelected) {
          cartLine.selectedImprints.push(imprint);
        } else {
          cartLine.unSelectedImprints.push(imprint);
        }
      });
    });
  }
  changeCartLine(cartLine) {
    this.currentSelectedProduct = cartLine;
    this.selectedCartLine = cartLine;
    this.currentSelectedProduct = cartLine;
    this.currentSearchProductCtrl.setValue(cartLine);

    this._changeDetectorRef.markForCheck();
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
      // this.currentSelectedProduct = this.allProducts[0];
      this.searchProductCtrl.setValue(this.selectedProduct)
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
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
    let params1;
    this.currentSearchProductCtrl.valueChanges.pipe(
      filter((res: any) => {
        params1 = {
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
  onSelectedCurrent(ev) {
    this.currentSelectedProduct = ev.option.value;
  }
  displayWith(value: any) {
    return value?.productName;
  }
  updateRoyalties() {
    const { royaltyPrice } = this.selectedCartLine;

    if (royaltyPrice < 0) {
      this._quoteService.snackBar('Royalties should be 0 or positive value');
      return;
    }
    let paylaod = {
      royalty_price: royaltyPrice,
      cartLine_id: this.selectedCartLine.pk_cartLineID,
      update_cart_royalty: true
    }
    this.selectedCartLine.isRoyaltyLoader = true;
    this._quoteService.UpdateQuoteData(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._quoteService.snackBar(res["message"]);
        this.refactorCartLinesData();
      }
      this.selectedCartLine.isRoyaltyLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.selectedCartLine.isRoyaltyLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  updateShipping() {
    const { shippingGroundCost, shippingGroundPrice } = this.selectedCartLine;
    if (shippingGroundCost < 0 || shippingGroundPrice < 0) {
      this._quoteService.snackBar('Shipping Price should be 0 or positive value');
      return;
    }
    let paylaod = {
      shippingGroundPrice,
      shippingGroundCost,
      cartLine_id: this.selectedCartLine.pk_cartLineID,
      update_cart_shipping: true
    }
    this.selectedCartLine.isShippingLoader = true;
    this._quoteService.UpdateQuoteData(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.refactorCartLinesData();
        this._quoteService.snackBar(res["message"]);
      }
      this.selectedCartLine.isShippingLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.selectedCartLine.isShippingLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Implement methods for functionality
  updateProductOptions() {
    // Implement logic to update product options
    // Access and modify ngSelectedProduct properties accordingly
    // e.g., this.ngSelectedProduct.totalQuantity = ...;
    // Implement API calls or other business logic as needed
  }
}
