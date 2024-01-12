import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { QuotesService } from '../../../quotes.service';
import { Subject } from 'rxjs';
import { updateCartInfo, updateCartShipping } from '../../../quotes.types';
import moment from 'moment';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

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

  // Add New Accessory 
  ngSelectedAccessory: any;

  orderProducts: any = [];
  cartLines: any;
  selectedCartLine: any;
  constructor(
    private _quoteService: QuotesService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _commonService: DashboardsService
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
  getQuoteFromAPI() {
    this.isLoading = true;
    let params = {
      single_cart: true,
      cart_id: this.selectedQuoteDetail.pk_cartID
    }
    this._quoteService.getQuoteMainDetail(params).subscribe(quote => {
      this.cartLines = quote["cartLines"];
      this.refactorCartLinesData();
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  refactorCartLinesData() {
    this.selectedQuoteDetail.isFulfillmentCart = true;
    this.selectedQuoteDetail.shippingGroundCost = 0;
    this.selectedQuoteDetail.royaltyPrice = 0;
    this.selectedQuoteDetail.shippingGroundPrice = 0;
    this.cartLines.forEach(cartLine => {
      cartLine.blnOverrideShippingProductInfo = false;
      cartLine.blnOverrideShippingShipping = true;
      cartLine.totalQuantity = 0;
      cartLine.totalRunCost = 0;
      cartLine.totalRunPrice = 0;
      this.selectedQuoteDetail.shippingGroundCost += cartLine.shippingGroundCost;
      this.selectedQuoteDetail.shippingGroundPrice += cartLine.shippingGroundPrice;
      this.selectedQuoteDetail.royaltyPrice += cartLine.royaltyPrice;
      if (cartLine.blnWarehouse) {
        this.selectedQuoteDetail.isFulfillmentCart = true;
      } else {
        this.selectedQuoteDetail.isFulfillmentCart = false;
      }
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
      cartline_fk_ProductID: cartLine.fk_productID,
      cartLineID: cartLine.pk_cartLineID
    }
    this._quoteService.getQuoteData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["selectedImprints"].forEach(imprint => {
        imprint.colorsList = [];
        if (imprint.colorNameList) {
          imprint.colorsList = imprint.colorNameList.split(',');
        }
      });
      cartLine.selectedImprints = res["selectedImprints"];
      cartLine.selectedAccessories = res["selectedAccessories"];
      cartLine.unselectedImprints = res["unselectedImprints"];
      cartLine.unselectedAccessories = res["unselectedAccessories"];
      if (res["unselectedAccessories"].length) {
        cartLine.ngSelectedAccessory = res["unselectedAccessories"][0];
      }
      if (res["unselectedImprints"].length) {
        cartLine.ngImprintSelected = res["unselectedImprints"][0];
      }
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
  updateProduct() {
    this._commonService.showConfirmation('Changing the item on this quote line will remove all options and imprints, including any artwork comments and attached artwork.  If you need this information, please save it first before changing the product.  Are you sure you want to continue?  This action cannot be undone.', (confirmed) => {
      if (confirmed) {
        const user = JSON.parse(localStorage.getItem('userDetails'));
        const { blnSample, blnTaxable, blnRoyaltyStore, blnRoyalty, blnApparel, blnOverrideShippingProductInfo, blnOverrideShippingShipping, pk_storeProductID, pk_cartLineID, fk_productID, productName, fk_cartID, warehouseDeliveryOption, event, eventDate, isFulfillmentCart, orderQuantity, shippingGroundCost, shippingGroundPrice } = this.selectedCartLine;
        let isProductChanged = false;
        if (this.currentSelectedProduct.productName != productName) {
          isProductChanged = true;
        }
        let payload = {
          bln_sample: blnSample,
          bln_royalty: blnRoyalty,
          bln_taxable: blnTaxable,
          bln_apparel: blnApparel,
          bln_overRide: blnOverrideShippingProductInfo,
          product_id: this.currentSelectedProduct.fk_productID,
          storeProductID: pk_storeProductID,
          isProductChanged: isProductChanged,
          previous_product_name: productName,
          product_number: this.currentSelectedProduct.productNumber,
          product_name: this.currentSelectedProduct.productName,
          supplier_id: this.currentSelectedProduct.fk_supplierID,
          min_quantity: this.currentSelectedProduct?.minQuantity ? this.currentSelectedProduct?.minQuantity : this.currentSelectedProduct?.minOrderQuantity,
          unitsInShippingPackage: this.currentSelectedProduct.unitsInShippingPackage,
          admin_user_id: user.pk_userID,
          min_cost: this.currentSelectedProduct.minCost,
          min_price: this.currentSelectedProduct.minPrice,
          cartLine_id: pk_cartLineID,
          cart_id: fk_cartID,
          warehouse_delivery_option: warehouseDeliveryOption ? warehouseDeliveryOption : 0,
          event_name: event,
          event_date: eventDate,
          isFulfillmentCart: this.selectedQuoteDetail.isFulfillmentCart,
          orderQuantity: orderQuantity,
          cartLineGroundCost: shippingGroundCost,
          cartLineGroundPrice: shippingGroundPrice,
          storeID: this.selectedQuoteDetail.storeID,
          update_cart_product: true
        };
        this.selectedCartLine.updateProductLoader = true;
        this._quoteService.UpdateQuoteData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          if (res["success"]) {
            this._quoteService.snackBar(res["message"]);
            this.getQuoteFromAPI();
          }
          this.selectedCartLine.updateProductLoader = false;
          this._changeDetectorRef.markForCheck();
        }, err => {
          this.selectedCartLine.updateProductLoader = false;
          this._changeDetectorRef.markForCheck();
        });
      }
    });
  }
  removeCartProduct() {
    if (this.cartLines.length == 1) {
      this._quoteService.snackBar('You cannot remove the last item on a quote. Please add another item first and then remove this one.');
      return;
    }
    this._commonService.showConfirmation('NOTE:  Removing an item removes all of the imprints for that item, as well as the attached artwork files and customer comments for said imprints.  If you still need these files or comments, please save them before removing the item.  Are you sure you want to remove this item from this order?  This action cannot be undone.', (confirmed) => {
      if (confirmed) {
        let paylaod = {
          blnGroupRun: this.selectedCartLine.blnGroupRun,
          groupRunCartLineID: this.selectedCartLine.groupRunCartLineID,
          cartLine_id: this.selectedCartLine.pk_cartLineID,
          cart_id: this.selectedCartLine.fk_cartID,
          delete_cart_product: true
        }
        this.selectedCartLine.removeCartLoader = true;
        this._quoteService.UpdateQuoteData(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          if (res["success"]) {
            this._quoteService.snackBar(res["message"]);
            this.getQuoteFromAPI();
          }
          this.selectedCartLine.removeCartLoader = false;
          this._changeDetectorRef.markForCheck();
        }, err => {
          this.selectedCartLine.removeCartLoader = false;
          this._changeDetectorRef.markForCheck();
        });
      }
    });

  }
  addProductOptions() {
    const user = JSON.parse(localStorage.getItem('userDetails'));
    const { blnSample, blnTaxable, blnRoyaltyStore, blnRoyalty, blnApparel, blnOverrideShippingProductInfo, blnOverrideShippingShipping, pk_storeProductID, pk_cartLineID, fk_productID, productName, fk_cartID, warehouseDeliveryOption, event, blnGroupRun, groupRunCartLineID } = this.selectedCartLine;
    let colorName = '';
    let sizeName = '';
    if (this.ngColor != 0) {
      colorName = this.selectedCartLine.ColorsListData.find(item => item.pk_colorID == this.ngColor)?.colorName;
    }
    if (this.ngSize != 0) {
      sizeName = this.selectedCartLine.sizesListData.find(item => item.pk_sizeID == this.ngSize)?.sizeName;
    }
    if (this.ngQuantity <= 0) {
      this._quoteService.snackBar('Quantity should be positive or greater than 0');
      return;
    }
    let paylaod = {
      cart_id: fk_cartID,
      cartline_id: pk_cartLineID,
      color_id: this.ngColor,
      color_name: colorName,
      size_id: this.ngSize,
      size_name: sizeName,
      product_id: fk_productID,
      product_name: productName,
      isApparel: blnApparel,
      groupRunCartLineID: groupRunCartLineID,
      blnGroupRun: blnGroupRun,
      quantity: this.ngQuantity,
      admin_user_id: user.pk_userID,
      blnOverrideShippingNewOption: this.ngOverrideShipping,
      add_cart_product_option: true
    };
    this.selectedCartLine.addProductOption = true;
    this._quoteService.AddQuoteData(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.ngColor = 0;
        this.ngSize = 0;
        this.ngQuantity = 0;
        this.ngOverrideShipping = false;
        this._quoteService.snackBar(res["message"]);
        this.getQuoteFromAPI();
      }
      this.selectedCartLine.addProductOption = false;
      this._changeDetectorRef.markForCheck();
    }, res => {
      this.selectedCartLine.addProductOption = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Implement methods for functionality
  updateProductOptions() {
    const { fk_productID, } = this.selectedCartLine;
    console.log(this.selectedCartLine.ColorsData);
    // export interface updateProductOption {
    //   cart_line_options: cart_line_option[];
    //   remove_option_ids: cart_line_option[];
    // }

    // export interface cart_line_option {
    //   product_id: number;
    //   color_id: number;
    //   color_name: string;
    //   quantity: number;
    //   size_id: number;
    //   size_name: string;
    //   cart_line_option_run_cost: number;
    //   cart_line_option_run_price: number;
    //   cart_line_option_setup_cost: number;
    //   cart_line_option_setup_price: number;
    //   bln_override: boolean;
    //   option_id: number;
    //   bln_quantity_changed: boolean;
    //   product_name: string;
    // }
    // let options = [];
    // this.ngSelectedProduct.color_sizes.forEach(element => {
    //   options.push({
    //     color_id: element.fk_colorID,
    //     size_id: element.fk_sizeID,
    //     quantity: element.quantity,
    //     cost: element.runCost,
    //     price: element.runPrice,
    //     bln_override: element.blnOverride,
    //     option_id: element.pk_optionID
    //   })
    // });
    // let payload = {
    //   cart_line_options: [],
    //   remove_option_ids: []
    // }
    // this.isUpdateOptionLoader = true;
    // this._orderService.updateOrderCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
    //   if (res) {
    //     if (res["success"]) {
    //       this.getOrderLineDetailsAfterUpdateOrAdd(res["message"]);
    //     } else {
    //       this.isUpdateOptionLoader = false;
    //     }
    //   } else {
    //     this.isUpdateOptionLoader = false;
    //   }
    //   this._changeDetectorRef.markForCheck();
    // }, err => {
    //   this.isUpdateOptionLoader = false;
    //   this._changeDetectorRef.markForCheck();
    // });
  }
}
