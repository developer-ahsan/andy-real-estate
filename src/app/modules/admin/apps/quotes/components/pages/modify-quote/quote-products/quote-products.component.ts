import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { QuotesService } from '../../../quotes.service';
import { Subject } from 'rxjs';
import { AddImprints, RemoveCartProduct, UpdateCartShipping, addAccessory, addGroupRunProduct, addNewProduct, deleteImprints, updateAccessories, updateCartInfo, updateCartShipping, updateGroupRun, updateImprints } from '../../../quotes.types';
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
  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
    // height: '200px'
  };
  isLoading: boolean = false;
  allProducts = [];
  currentSelectedProduct: any;
  currentSearchProductCtrl = new FormControl();
  searchProductCtrl = new FormControl();
  isSearchingProduct: boolean = false;
  selectedProduct: any;


  // Add new Product
  newProductQuantity: any = '';
  newProductColor: any = '';
  newProductSize: any = '';
  ngNewProduct: any;
  ngSelectedProduct: any;
  newBlnOverride: boolean = true;
  newBlnSample: boolean = false;
  newBlnTax: boolean = true;
  newBlnRoyalty: boolean = true;
  dropdownSettings = {
    singleSelection: false,
    idField: 'fk_productID',
    textField: 'displayText',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    limitSelection: 1
  };

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
  ngCurrentProduct: any;
  isAddNewProdLoader: boolean = false;

  // Add New Group Run Product
  ngCurrentGroupProduct: any;
  newGroupProductQuantity: any = '';
  newGroupBlnOverride: boolean = true;
  newGroupBlnSample: boolean = false;
  newGroupBlnTax: boolean = true;
  newGroupBlnRoyalty: boolean = true;
  isAddNewGroupProdLoader: boolean = false;
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
        this.ngCurrentProduct = [this.cartLines[0]];
        this.ngCurrentProduct[0].displayText = this.ngCurrentProduct[0].pk_storeProductID + ' - ' + this.ngCurrentProduct[0].productNumber + ': ' + this.ngCurrentProduct[0].productName;
        this.currentSearchProductCtrl.setValue(this.cartLines[0]);
        // Group Run Master
        this.ngCurrentGroupProduct = [this.cartLines[0]];
        this.ngCurrentGroupProduct[0].displayText = this.ngCurrentGroupProduct[0].pk_storeProductID + ' - ' + this.ngCurrentGroupProduct[0].productNumber + ': ' + this.ngCurrentGroupProduct[0].productName;

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
      cartLine.blnOverrideShippingNewAccessory = true;
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
        colorsData.forEach((colors, index) => {
          const [pk_colorID, colorName, setup, run] = colors.split(':');
          cartLine.ColorsListData.push({ pk_colorID: Number(pk_colorID), colorName, setup, run });
          if (index == 0) {
            this.newProductColor = Number(pk_colorID);
          }
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
            this.newProductSize = Number(pk_sizeID);
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
  onItemSelect(item: any) {
    this.ngNewProduct = [this.allProducts.find(product => product.fk_productID == item.fk_productID)];
    this._changeDetectorRef.markForCheck();
  };
  onItemSelectUpdate(item: any) {
    this.ngCurrentProduct = [this.allProducts.find(product => product.fk_productID == item.fk_productID)];
    this._changeDetectorRef.markForCheck();
  };
  OnItemSelectUpdateGroup(item: any) {
    // Group Run Master
    this.ngCurrentGroupProduct = [this.allProducts.find(product => product.fk_productID == item.fk_productID)];
    this._changeDetectorRef.markForCheck();
  }
  changeCartLine(cartLine) {
    this.selectedCartLine = cartLine;
    this.currentSelectedProduct = cartLine;
    this.currentSearchProductCtrl.setValue(cartLine);
    this.ngCurrentProduct = cartLine;
    this.ngCurrentProduct[0].displayText = this.ngCurrentProduct[0].pk_storeProductID + ' - ' + this.ngCurrentProduct[0].productNumber + ': ' + this.ngCurrentProduct[0].productName

    // Group Run Master
    this.ngCurrentGroupProduct = cartLine;
    this.ngCurrentGroupProduct[0].displayText = this.ngCurrentGroupProduct[0].pk_storeProductID + ' - ' + this.ngCurrentGroupProduct[0].productNumber + ': ' + this.ngCurrentGroupProduct[0].productName
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
      res["data"].forEach(element => {
        element.displayText = element.pk_storeProductID + ' - ' + element.productNumber + ': ' + element.productName
      });
      this.selectedProduct = this.allProducts[0];
      this.ngNewProduct = [this.allProducts[0]];
      console.log(this.ngNewProduct);
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
    const { shippingGroundCost, shippingGroundPrice, isFulfillmentCart, pk_cartLineID, warehouseDeliveryOption, cartLineCost, cartLinePrice, orderQuantity, blnOverrideShippingShipping } = this.selectedCartLine;
    if (shippingGroundCost < 0 || shippingGroundPrice < 0) {
      this._quoteService.snackBar('Shipping Price should be 0 or positive value');
      return;
    }
    let paylaod: UpdateCartShipping = {
      shippingGroundPrice,
      shippingGroundCost,
      cartLine_id: pk_cartLineID,
      blnOverrideShippingNewAccessory: blnOverrideShippingShipping,
      orderQuantity: orderQuantity,
      isFulfillmentCart,
      warehouse_delivery_option: warehouseDeliveryOption ? warehouseDeliveryOption : 0,
      cartLineGroundCost: cartLineCost,
      cartLineGroundPrice: cartLinePrice,
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
        if (this.ngCurrentProduct[0].productName != productName) {
          isProductChanged = true;
        }
        let payload = {
          bln_sample: blnSample,
          bln_royalty: blnRoyalty,
          bln_taxable: blnTaxable,
          bln_apparel: blnApparel,
          bln_overRide: blnOverrideShippingProductInfo,
          product_id: this.ngCurrentProduct[0].fk_productID,
          storeProductID: pk_storeProductID,
          isProductChanged: isProductChanged,
          previous_product_name: productName,
          product_number: this.ngCurrentProduct[0].productNumber,
          product_name: this.ngCurrentProduct[0].productName,
          supplier_id: this.ngCurrentProduct[0].fk_supplierID,
          min_quantity: this.ngCurrentProduct[0]?.minQuantity ? this.ngCurrentProduct[0]?.minQuantity : this.ngCurrentProduct[0]?.minOrderQuantity,
          unitsInShippingPackage: this.ngCurrentProduct[0].unitsInShippingPackage,
          admin_user_id: user.pk_userID,
          min_cost: this.ngCurrentProduct[0].minCost,
          min_price: this.ngCurrentProduct[0].minPrice,
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
  makeGroupRunMaster(check) {
    let msg;
    if (check) {
      msg = 'This will convert the selected product to a group run master, and then allow you to add products to that group run.';
    } else {
      msg = 'This will clear the selected product of a group run master, converting it to just a regular product.  This will also convert all sub-products in this group run to regular products.  This cannot be undone.  Are you sure you want to continue?';
    }
    this._commonService.showConfirmation('Changing the item on this quote line will remove all options and imprints, including any artwork comments and attached artwork.  If you need this information, please save it first before changing the product.  Are you sure you want to continue?  This action cannot be undone.', (confirmed) => {
      if (confirmed) {
        let payload: updateGroupRun = {
          blnGroupRun: check,
          quantity: this.ngCurrentProduct[0]?.minQuantity,
          cartLineID: this.selectedCartLine.pk_cartLineID,
          update_group_run: true
        }
        this.selectedCartLine.isUpdateGroupRunLoader = true;
        this._quoteService.UpdateQuoteData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          if (res["success"]) {
            this.selectedCartLine.blnGroupRun = check;
            this._quoteService.snackBar(res["message"]);
            this.getQuoteFromAPI();
          }
          this.selectedCartLine.isUpdateGroupRunLoader = false;
          this._changeDetectorRef.markForCheck();
        }, err => {
          this.selectedCartLine.isUpdateGroupRunLoader = false;
          this._changeDetectorRef.markForCheck();
        });
      }
    });
  }
  removeCartProduct() {
    const user = JSON.parse(localStorage.getItem('userDetails'));

    if (this.cartLines.length == 1) {
      this._quoteService.snackBar('You cannot remove the last item on a quote. Please add another item first and then remove this one.');
      return;
    }
    // blnGroupRun
    this._commonService.showConfirmation('NOTE:  Removing an item removes all of the imprints for that item, as well as the attached artwork files and customer comments for said imprints.  If you still need these files or comments, please save them before removing the item.  Are you sure you want to remove this item from this order?  This action cannot be undone.', (confirmed) => {
      if (confirmed) {
        let paylaod: RemoveCartProduct = {
          blnGroupRun: this.selectedCartLine.blnGroupRun,
          groupRunCartLineID: this.selectedCartLine.groupRunCartLineID,
          cartLine_id: this.selectedCartLine.pk_cartLineID,
          cart_id: this.selectedCartLine.fk_cartID,
          loggedInUserID: user.pk_userID,
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
  // addAccoryOptionOptions
  addAccoryOptionOptions() {
    const user = JSON.parse(localStorage.getItem('userDetails'));

    const { fk_cartID, pk_cartLineID, fk_productID, orderQuantity, productName, warehouseDeliveryOption, cartLineCost, cartLinePrice } = this.selectedCartLine;
    const { fk_packagingID, packagingName, unitsPerPackage, setup, run, blnOverrideShippingNewAccessory } = this.selectedCartLine.ngSelectedAccessory;
    let paylaod: addAccessory = {
      cartID: fk_cartID,
      loggedInUserID: user.pk_userID,
      cartLineID: pk_cartLineID,
      cartline_fkProductID: fk_productID,
      orderQuantity: orderQuantity,
      packagingID: fk_packagingID,
      packagingName: packagingName,
      productName: productName,
      quantityPerPackage: unitsPerPackage,
      setup,
      run,
      blnOverrideShippingNewAccessory,
      isFulfillmentCart: this.selectedQuoteDetail.isFulfillmentCart,
      warehouse_delivery_option: warehouseDeliveryOption,
      cartLineGroundCost: cartLineCost,
      cartLineGroundPrice: cartLinePrice,
      add_modify_quote_accessory: true
    }
    paylaod = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(paylaod);
    this.selectedCartLine.isAddAccessoryLoader = true;
    this._quoteService.AddQuoteData(paylaod).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.selectedCartLine.isAddAccessoryLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._quoteService.snackBar(res["message"]);
        this.getQuoteFromAPI();
      }
    });
  }

  updateAccessories() {
    const user = JSON.parse(localStorage.getItem('userDetails'));
    const { fk_cartID, pk_cartLineID, blnGroupRun, orderQuantity, productName, warehouseDeliveryOption, cartLineCost, cartLinePrice, blnOverrideShippingNewAccessory } = this.selectedCartLine;
    let selectedAccessories = [];
    let unSelectedAccessories = [];
    for (const accessory of this.selectedCartLine.selectedAccessories) {
      if (!accessory.isSelected) {
        if (accessory.cartLineAccessoryRunPrice < 0 || accessory.cartLineAccessoryRunCost < 0 || accessory.cartLineAccessorySetupPrice < 0 || accessory.cartLineAccessorySetupCost < 0 || accessory.quantityPerPackage <= 0) {
          this._quoteService.snackBar('Values should be positive & quntity should be greater than 0');
          return;
        }
        selectedAccessories.push(
          {
            packagingName: accessory.packagingName,
            quantityPerPackage: accessory.quantityPerPackage,
            runPrice: accessory.cartLineAccessoryRunPrice,
            runCost: accessory.cartLineAccessoryRunCost,
            setupPrice: accessory.cartLineAccessorySetupPrice,
            setupCost: accessory.cartLineAccessorySetupCost,
            packagingID: accessory.packagingID,
            blnDecoratorPO: accessory.blnDecoratorPO
          }
        )
      } else {
        unSelectedAccessories.push({
          packagingID: accessory.packagingID,
          packagingName: accessory.packagingName
        });
      }
    }
    let payload: updateAccessories = {
      cartID: fk_cartID,
      cartLineID: pk_cartLineID,
      blnGroupRun,
      productName: productName,
      loggedInUserID: user.pk_userID,
      accessories: selectedAccessories,
      deleteAccessories: unSelectedAccessories,
      blnOverrideShippingNewAccessory,
      orderQuantity,
      isFulfillmentCart: this.selectedQuoteDetail.isFulfillmentCart,
      warehouse_delivery_option: warehouseDeliveryOption,
      cartLineGroundCost: cartLineCost,
      cartLineGroundPrice: cartLinePrice,
      update_modify_quote_accessory: true
    }
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.selectedCartLine.isUpdateAccessoryLoader = true;
    this._quoteService.UpdateQuoteData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._quoteService.snackBar(res["message"]);
        this.getQuoteFromAPI();
      }
      this.selectedCartLine.isUpdateAccessoryLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.selectedCartLine.isUpdateAccessoryLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // imprints
  removeImprintOption(imprint) {
    const msg = 'Removing this imprint will remove all attached artwork and customer comments.  Are you sure you want to remove this imprint?  This action cannot be undone.';
    this._commonService.showConfirmation(msg, (confirmed) => {
      if (confirmed) {
        const user = JSON.parse(localStorage.getItem('userDetails'));
        const { fk_cartID, pk_cartLineID, blnGroupRun, orderQuantity, productName, warehouseDeliveryOption, cartLineCost, cartLinePrice, blnOverrideShippingNewAccessory } = this.selectedCartLine;
        let selectedAccessories = [];
        let unSelectedAccessories = [];
        for (const accessory of this.selectedCartLine.selectedAccessories) {
          if (!accessory.isSelected) {
            if (accessory.cartLineAccessoryRunPrice < 0 || accessory.cartLineAccessoryRunCost < 0 || accessory.cartLineAccessorySetupPrice < 0 || accessory.cartLineAccessorySetupCost < 0 || accessory.quantityPerPackage <= 0) {
              this._quoteService.snackBar('Values should be positvie & quntity shoul be greater than 0');
              return;
            }
            selectedAccessories.push(
              {
                packagingName: accessory.packagingName,
                quantityPerPackage: accessory.quantityPerPackage,
                runPrice: accessory.cartLineAccessoryRunPrice,
                runCost: accessory.cartLineAccessoryRunCost,
                setupPrice: accessory.cartLineAccessorySetupPrice,
                setupCost: accessory.cartLineAccessorySetupCost,
                packagingID: accessory.packagingID,
                blnDecoratorPO: accessory.blnDecoratorPO
              }
            )
          } else {
            unSelectedAccessories.push({
              packagingID: accessory.packagingID,
              packagingName: accessory.packagingName
            });
          }
        }
        let payload: deleteImprints = {
          cartID: fk_cartID,
          cartLineID: pk_cartLineID,
          blnGroupRun,
          productName,
          loggedInUserID: user.pk_userID,
          imprintID: imprint.imprintID,
          locationName: imprint.locationName,
          decorationName: imprint.decorationName,
          delete_modify_quote_imprint: true
        }
        payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
        imprint.isRemoveImprintLoader = true;
        this._quoteService.UpdateQuoteData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          if (res["success"]) {
            this._quoteService.snackBar(res["message"]);
            this.getQuoteFromAPI();
          }
          imprint.isRemoveImprintLoader = false;
          this._changeDetectorRef.markForCheck();
        }, err => {
          imprint.isRemoveImprintLoader = false;
          this._changeDetectorRef.markForCheck();
        });
      }
    });

  }
  addImprintOptions() {
    const user = JSON.parse(localStorage.getItem('userDetails'));

    const { fk_cartID, pk_cartLineID, fk_productID, orderQuantity, productName, warehouseDeliveryOption, cartLineCost, cartLinePrice, blnGroupRun } = this.selectedCartLine;
    const { pk_imprintID, fk_locationID, locationName, fk_decoratorID, methodName } = this.selectedCartLine.ngImprintSelected;
    let paylaod: AddImprints = {
      cartID: fk_cartID,
      cartLineID: pk_cartLineID,
      blnGroupRun,
      productName,
      loggedInUserID: user.pk_userID,
      imprintID: pk_imprintID,
      locationID: fk_locationID,
      locationName,
      decoratorID: fk_decoratorID,
      decorationName: methodName,
      processQuantity: 0,
      imprintColorName: '0',
      runCost: 0,
      runPrice: 0,
      setupCost: 0,
      setupPrice: 0,
      add_modify_quote_imprint: true
    }
    paylaod = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(paylaod);
    this.selectedCartLine.isAddImprintLoader = true;
    this._quoteService.AddQuoteData(paylaod).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.selectedCartLine.isAddImprintLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._quoteService.snackBar(res["message"]);
        this.getQuoteFromAPI();
      }
    });
  }
  updateImprintsOptions() {
    const user = JSON.parse(localStorage.getItem('userDetails'));
    const { fk_cartID, pk_cartLineID, blnGroupRun, orderQuantity, productName, warehouseDeliveryOption, cartLineCost, cartLinePrice, blnOverrideShippingNewAccessory } = this.selectedCartLine;
    let selectedImprints = [];
    for (const imprints of this.selectedCartLine.selectedImprints) {
      if (imprints.cartLineImprintRunCost < 0 || imprints.cartLineImprintRunPrice < 0 || imprints.cartLineImprintSetupCost < 0 || imprints.cartLineImprintSetupPrice < 0 || imprints.quantityPerPackage <= 0) {
        this._quoteService.snackBar('Values should be positive');
        return;
      }
      selectedImprints.push({
        imprintID: imprints.imprintID,
        processQuantity: imprints.processQuantity,
        locationName: imprints.locationName,
        decorationName: imprints.decorationName,
        colorNameList: imprints.colorsList.toString(),
        pmsColors: imprints.pmsColors ? imprints.pmsColors : '',
        cartLineImprintRunCost: imprints.cartLineImprintRunCost,
        cartLineImprintRunPrice: imprints.cartLineImprintRunPrice,
        cartLineImprintSetupCost: imprints.cartLineImprintSetupCost,
        cartLineImprintSetupPrice: imprints.cartLineImprintSetupPrice,
        blnOverride: imprints.blnOverride,
        customerArtworkComment: imprints.customerArtworkComment ? imprints.customerArtworkComment : '',
        decoratorID: imprints.decorationID,
        runCost: imprints.cartLineImprintRunCost,
        runPrice: imprints.cartLineImprintRunPrice,
        setupCost: imprints.cartLineImprintSetupCost,
        setupPrice: imprints.cartLineImprintSetupPrice,
        blnOverrideRunSetup: imprints.blnOverrideRunSetup ? imprints.blnOverrideRunSetup : false
      })
    }
    let payload: updateImprints = {
      cartID: fk_cartID,
      cartLineID: pk_cartLineID,
      blnGroupRun,
      productName: productName,
      loggedInUserID: user.pk_userID,
      imprints: selectedImprints,
      update_modify_quote_imprint: true
    }
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.selectedCartLine.isUpdateImprintsLoader = true;
    this._quoteService.UpdateQuoteData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._quoteService.snackBar(res["message"]);
        this.getQuoteFromAPI();
      }
      this.selectedCartLine.isUpdateImprintsLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.selectedCartLine.isUpdateImprintsLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // addNewProduct
  addNewProduct() {
    const user = JSON.parse(localStorage.getItem('userDetails'));
    const { pk_cartID, storeID } = this.selectedQuoteDetail;
    const { pk_cartLineID } = this.selectedCartLine;
    const { minQuantity, pk_productID, productName, productNumber } = this.ngNewProduct[0];
    const prodQty = this.newProductQuantity;
    const colorID = this.newProductColor;
    const sizeID = this.newProductSize;
    const blnOverRide = this.newBlnOverride;
    const blnSample = this.newBlnSample;
    const blnTaxable = this.newBlnTax;
    const blnRoyalty = this.newBlnRoyalty;
    if (prodQty < minQuantity) {
      this._quoteService.snackBar(`Quantity must be greater than or equal to ${minQuantity}`);
      return;
    }
    let payload: addNewProduct = {
      newProductSizeID: sizeID,
      newProductColorID: colorID,
      blnTaxable,
      blnSample,
      blnRoyalty,
      blnOverRide,
      cartID: pk_cartID,
      cartLineID: pk_cartLineID,
      quantity: prodQty,
      storeID,
      productID: pk_productID,
      productNumber,
      productName,
      loggedInUserID: user.pk_userID,
      add_new_product: true
    }
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isAddNewProdLoader = true;
    this._quoteService.AddQuoteData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isAddNewProdLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._quoteService.snackBar(res["message"]);
        this.getQuoteFromAPI();
      }
    });
  }
  // addGroupRunProduct
  addGroupRunProduct() {
    const user = JSON.parse(localStorage.getItem('userDetails'));
    const { pk_cartID, storeID } = this.selectedQuoteDetail;
    const { pk_cartLineID } = this.selectedCartLine;
    const { minQuantity, pk_productID, productName, productNumber } = this.ngCurrentGroupProduct[0];
    const prodQty = this.newGroupProductQuantity;
    const blnOverRide = this.newGroupBlnOverride;
    const blnSample = this.newGroupBlnSample;
    const blnTaxable = this.newGroupBlnTax;
    const blnRoyalty = this.newGroupBlnRoyalty;
    if (prodQty < minQuantity) {
      this._quoteService.snackBar(`Quantity must be greater than or equal to ${minQuantity}`);
      return;
    }
    let payload: addGroupRunProduct = {
      blnTaxable,
      blnRoyalty,
      blnSample,
      blnOverRide,
      cartID: pk_cartID,
      cartLineID: pk_cartLineID,
      quantity: prodQty,
      storeID,
      productID: pk_productID,
      productNumber,
      productName,
      loggedInUserID: user.pk_userID,
      add_group_run_product: true
    }
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isAddNewGroupProdLoader = true;
    this._quoteService.AddQuoteData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isAddNewGroupProdLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._quoteService.snackBar(res["message"]);
        this.getQuoteFromAPI();
      }
    });
  }

}
