import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'environments/environment';
import moment from 'moment';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { AddNewProduct, AddOption, AddProduct, UpdateAccessory, UpdateColorSize, UpdateModifyOrderImprints, UpdateProduct, UpdateRoyalties, UpdateShipping, addAccessory, addComment, addModifyOrderImprints, contactInfoObj, paymentInfoObj, shippingDetailsObj } from '../../orders.types';

@Component({
  selector: 'app-products-modify',
  templateUrl: './products-modify.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important} ::ng-deep {.ql-container {height: auto}}']
})
export class ProductsOrderModifyComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  orderDetail: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  orderTotal: any;
  orderProducts: any;
  orderLines: any;
  ngSelectedProduct: any;
  ngSelectedImprint: any;

  isRoyaltyLoader: boolean = false;
  isShippingLoader: boolean = false;

  isOrderLineDetailsLoader: boolean = false;

  // Add Product options
  ngColor = 0;
  ngSize = 0;
  ngQuantity = 0;
  ngOverrideShipping: boolean = false;
  isAddOptionLoader: boolean = false;
  // AddImprintOption
  ngImprintSelected: any;

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

  // Products
  allProducts = [];
  searchProductCtrl = new FormControl();
  currentSearchProductCtrl = new FormControl();
  selectedProduct: any;
  currentSelectedProduct: any;
  isSearchingProduct = false;
  orderLinesItems: any;
  ngSelectedAccessory: any;
  isAddAccessoryLoader: boolean = false;
  isUpdateAccessoryLoader: boolean = false;
  isUpdateImprintLoader: boolean = false;
  isAddImprintLoader: boolean = false;

  newProductQuantity: any = '';
  isAddNewProdLoader: boolean = false;
  newBlnTax: boolean = false;
  newBlnSample: boolean = false;
  newBlnOverride: boolean = false;

  isUpdateOptionLoader: boolean = false;

  // UpdateProduct 
  isUpdateProductLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService,
    private _authService: AuthService,
    private _snackBar: MatSnackBar
  ) { }


  ngOnInit(): void {
    this.isLoading = true;
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length) {
        this.orderDetail = res["data"][0];
        let params = {
          order_total: true,
          order_id: this.orderDetail.pk_orderID
        }
        this._orderService.getOrder(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          this.orderTotal = res["data"][0];
        })
      }
    })
    this.getOrderProducts();
    this.getProductsControl();
  }
  getProductsControl() {
    let data = this.orderLines.filter(data => data.pk_orderLineID == this.ngSelectedProduct?.order_line_id);

    let getGroupRunProducts = false;
    let getWarehouseProducts = false;
    let getProducts = false;
    if (data.length > 0) {
      if (data[0].blnGroupRun && data[0].groupRunOrderLineID) {
        getGroupRunProducts = true;
      } else if (data[0].blnWarehouse) {
        getWarehouseProducts = true;
      } else {
        getProducts = true;
      }
    }

    let params;
    this.searchProductCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          store_id: this.orderDetail.fk_storeID,
          groupRunProducts: getGroupRunProducts,
          getWarehouseProducts: getWarehouseProducts,
          getProducts: getProducts,
          modify_orders_current_products: true,
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
      switchMap(value => this._orderService.getOrderCommonCall(params)
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
    this.currentSearchProductCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          store_id: this.orderDetail.fk_storeID,
          groupRunProducts: getGroupRunProducts,
          getWarehouseProducts: getWarehouseProducts,
          getProducts: getProducts,
          modify_orders_current_products: true,
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
      switchMap(value => this._orderService.getOrderCommonCall(params)
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
  onCurrentSelected(ev) {
    this.currentSelectedProduct = ev.option.value;
  }
  displayWith(value: any) {
    return value?.productName;
  }
  getOrderProducts() {
    this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderLinesItems = res["data"];
      this.getOrderLineProducts(this.orderLinesItems[0]);
      let value = [];
      res["data"].forEach((element, index) => {
        value.push(element.pk_orderLineID);
        if (index == res["data"].length - 1) {
          this.getLineProducts(value.toString(), 0);
        }
      });
      this.orderLines = res["data"];
    })
  }
  getLineProducts(value, index) {
    let params = {
      order_line_item: true,
      order_line_id: value
    }
    this._orderService.getOrderLineProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let products = [];
      res["data"].forEach(element => {
        element.colors = [];
        element.sizes = [];
        element.imprintColorsData = [];
        // colorsList
        if (element.colorsList) {
          let colors = element.colorsList.split(',');
          colors.forEach((color, index) => {
            let colorData = color.split(':');
            if (index == 0) {
              this.ngColor = Number(colorData[0]);
            }
            element.colors.push({ id: Number(colorData[0]), name: colorData[1], setup: colorData[2], run: colorData[3] });
          });
        } else {
          element.colors = [];
        }
        // sizes
        if (element.sizesList) {
          let sizes = element.sizesList.split(',');
          sizes.forEach(size => {
            let sizeData = size.split(':');
            element.sizes.push({ id: Number(sizeData[0]), name: sizeData[1] });
          });
        } else {
          element.sizes = [];
        }
        // ImprintColors
        if (element.imprintColors) {
          let imprintColors = element.imprintColors.split(',');
          imprintColors.forEach(color => {
            let imprintColorsData = color.split(':');
            element.imprintColorsData.push({ name: imprintColorsData[0], id: imprintColorsData[1], code: imprintColorsData[2] });
          });
        } else {
          element.imprintColorsData = [];
        }
        let prod = [];
        if (products.length == 0) {
          let royaltyPrice = element.royaltyPrice;
          let shippingCost = element.shippingCost;
          let shippingPrice = element.shippingPrice;
          let cost = (element.runCost * element.quantity) + element.shippingCost;
          let price = (element.runPrice * element.quantity) + element.shippingPrice + element.royaltyPrice;
          let totalRunintCost = (element.runCostInit + element.cost) * element.quantity;
          let totalRunintPrice = (element.runPriceInit + element.price) * element.quantity;
          prod.push(element);
          products.push({ products: prod, order_line_id: element.fk_orderLineID, allProducts: [], accessories: [], imprints: [], totalQuantity: element.quantity, totalMercandiseCost: cost, totalMerchendisePrice: price, royaltyPrice: royaltyPrice, shippingCost: shippingCost, shippingPrice: shippingPrice, colors: element.colors, sizes: element.sizes, imprintColorsData: element.imprintColorsData, totalRunintCost: totalRunintCost, totalRunintPrice: totalRunintPrice });
        } else {
          const index = products.findIndex(item => item.order_line_id == element.fk_orderLineID);
          if (index < 0) {
            let shippingCost = element.shippingCost;
            let shippingPrice = element.shippingPrice;
            let cost = (element.runCost * element.quantity) + element.shippingCost;
            let price = (element.runPrice * element.quantity) + element.shippingPrice + element.royaltyPrice;
            let royaltyPrice = element.royaltyPrice;
            let totalRunintCost = (element.runCostInit + element.cost) * element.quantity;
            let totalRunintPrice = (element.runPriceInit + element.price) * element.quantity;
            prod.push(element);
            products.push({ products: prod, order_line_id: element.fk_orderLineID, allProducts: [], accessories: [], imprints: [], totalQuantity: element.quantity, totalMercandiseCost: cost, totalMerchendisePrice: price, royaltyPrice: royaltyPrice, shippingCost: shippingCost, shippingPrice: shippingPrice, colors: element.colors, sizes: element.sizes, imprintColorsData: element.imprintColorsData, totalRunintCost: totalRunintCost, totalRunintPrice: totalRunintPrice });
          } else {
            let cost = (element.runCost * element.quantity);
            let price = (element.runPrice * element.quantity) + element.royaltyPrice;
            let totalRunintCost = (element.runCostInit + element.cost) * element.quantity;
            let totalRunintPrice = (element.runPriceInit + element.price) * element.quantity;
            prod = products[index].products;
            prod.push(element);
            products[index].products = prod;
            products[index].royaltyPrice = products[index].royaltyPrice + element.royaltyPrice;
            products[index].totalQuantity = products[index].totalQuantity + element.quantity;
            products[index].shippingCost = products[index].shippingCost + element.shippingCost;
            products[index].shippingPrice = products[index].shippingPrice + element.shippingPrice;
            products[index].totalMercandiseCost = products[index].totalMercandiseCost + cost;
            products[index].totalMerchendisePrice = products[index].totalMerchendisePrice + price;
            products[index].totalRunintCost = products[index].totalRunintCost + totalRunintCost;
            products[index].totalRunintPrice = products[index].totalRunintPrice + totalRunintPrice;
          }
        }
      });
      if (res["accessories"].length > 0) {
        res["accessories"].forEach(element => {
          let cost = (element.runCost * element.quantity) + element.setupCost;
          let price = (element.runPrice * element.quantity) + element.setupPrice;
          const index = products.findIndex(item => item.order_line_id == element.orderLineID);
          products[index].accessories.push(element);
          products[index].totalMercandiseCost = products[index].totalMercandiseCost + cost;
          products[index].totalMerchendisePrice = products[index].totalMerchendisePrice + price;
        });
      }
      // this.getProductImprints(value, products);
      this.orderProducts = products;
      this.getOrderLineDetails(this.orderProducts[0].order_line_id, index);
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getOrderLineProducts(data) {
    let getGroupRunProducts = false;
    let getWarehouseProducts = false;
    let getProducts = false;
    if (data.blnGroupRun && data.groupRunOrderLineID) {
      getGroupRunProducts = true;
    } else if (data.blnWarehouse) {
      getWarehouseProducts = true;
    } else {
      getProducts = true;
    }
    let params = {
      store_id: this.orderDetail.fk_storeID,
      groupRunProducts: getGroupRunProducts,
      getWarehouseProducts: getWarehouseProducts,
      getProducts: getProducts,
      modify_orders_current_products: true,
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allProducts = res["data"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }

  getOrderLineDetails(id, check) {
    let params = {
      order_line_details: true,
      order_lineID: id
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderProducts[check].color_sizes = res["color_sizes"];
      this.orderProducts[check].imprintsSelected = [];
      this.orderProducts[check].imprintsUnSelected = [];
      this.orderProducts[check].accessoriesSelected = res["orderline_accessories"];
      this.orderProducts[check].accessoriesUnSelected = res["dropdown_accessories"];
      if (this.orderProducts[check].accessoriesUnSelected.length > 0) {
        this.ngSelectedAccessory = this.orderProducts[check].accessoriesUnSelected[0];
      }
      res["dropdown_imprints"].forEach((element) => {
        if (element.isSelected == 0) {
          this.orderProducts[check].imprintsUnSelected.push(element);
        } else {
          this.orderProducts[check].imprintsSelected.push(element);
        }
      });
      this.orderProducts[check].imprints = res["imprints"];
      this.orderProducts[check].dropdown_imprints = res["dropdown_imprints"];
      res["main_imprints"].forEach(element => {
        if (element.imprintColors) {
          element.colorsList = element.imprintColors.split(',');
        } else {
          element.colorsList = '';
        }
      });
      this.orderProducts[check].main_imprints = res["main_imprints"];
      this.orderProducts[check].allProducts = this.allProducts;
      this.ngSelectedProduct = this.orderProducts[check];
      if (this.ngSelectedProduct.imprintsUnSelected.length > 0) {
        this.ngImprintSelected = this.ngSelectedProduct.imprintsUnSelected[0];
      }
      this.currentSearchProductCtrl.setValue(this.ngSelectedProduct.products[0]);
      this.currentSelectedProduct = this.ngSelectedProduct.products[0];
      // console.log(this.ngSelectedProduct)
      this.isOrderLineDetailsLoader = false;
      this.isUpdateProductLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isOrderLineDetailsLoader = false;
      this.isUpdateProductLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  changeOrderLine(item) {
    let index = this.orderProducts.findIndex(data => data.order_line_id == item.order_line_id);
    let orderLine = this.orderLines.findIndex(data => data.pk_orderLineID == item.order_line_id);
    if (item.allProducts.length == 0) {
      this.getOrderLineProducts(this.orderLinesItems[orderLine]);
    }
    if (item.color_sizes) {
      this.ngSelectedProduct = item;
    } else {
      this.isOrderLineDetailsLoader = true;
      this._changeDetectorRef.markForCheck();
      this.getOrderLineDetails(item.order_line_id, index);
    }
  }
  updateRoyalties() {
    let price = 0;
    if (this.ngSelectedProduct.royaltyPrice) {
      price = this.ngSelectedProduct.royaltyPrice;
    }
    let paylaod: UpdateRoyalties = {
      royalty_price: price,
      orderLine_id: this.ngSelectedProduct.order_line_id,
      update_royalty: true
    }
    this.isRoyaltyLoader = true;
    this._orderService.updateOrderCalls(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._orderService.snackBar(res["message"]);
      }
      this.isRoyaltyLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isRoyaltyLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateShipping() {
    let price = 0;
    if (this.ngSelectedProduct.royaltyPrice) {
      price = this.ngSelectedProduct.royaltyPrice;
    }
    let paylaod: UpdateShipping = {
      shipping_price: Number(this.ngSelectedProduct.products[0].shippingPrice),
      shipping_cost: Number(this.ngSelectedProduct.products[0].shippingCost),
      orderLine_id: this.ngSelectedProduct.order_line_id,
      update_shipping: true
    }
    this.isShippingLoader = true;
    this._orderService.updateOrderCalls(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        let value = [];
        this.orderLines.forEach((element, index) => {
          value.push(element.pk_orderLineID);
          if (index == this.orderLines.length - 1) {
            let index = this.orderProducts.findIndex(data => data.order_line_id == this.ngSelectedProduct.order_line_id);
            this.getLineProducts(value.toString(), index);
          }
        });
        this._orderService.snackBar(res["message"]);
      }
      this.isShippingLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isShippingLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getOrderLineDetailsAfterUpdateOrAdd(msg) {
    let params = {
      order_line_details: true,
      order_lineID: this.ngSelectedProduct.order_line_id
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.ngSelectedProduct.color_sizes = res["color_sizes"];
      this.ngSelectedProduct.imprintsSelected = [];
      this.ngSelectedProduct.imprintsUnSelected = [];
      this.ngSelectedProduct.accessoriesSelected = res["orderline_accessories"];
      this.ngSelectedProduct.accessoriesUnSelected = res["dropdown_accessories"];
      if (this.ngSelectedProduct.accessoriesUnSelected.length > 0) {
        this.ngSelectedAccessory = this.ngSelectedProduct.accessoriesUnSelected[0];
      }
      res["dropdown_imprints"].forEach((element) => {
        if (element.isSelected == 0) {
          this.ngSelectedProduct.imprintsUnSelected.push(element);
        } else {
          this.ngSelectedProduct.imprintsSelected.push(element);
        }
      });
      this.ngSelectedProduct.imprints = res["imprints"];
      this.ngSelectedProduct.dropdown_imprints = res["dropdown_imprints"];
      res["main_imprints"].forEach(element => {
        if (element.imprintColors) {
          element.colorsList = element.imprintColors.split(',');
        } else {
          element.colorsList = '';
        }
      });
      this.ngSelectedProduct.main_imprints = res["main_imprints"];
      this.ngSelectedProduct.allProducts = this.allProducts;
      this.ngSelectedProduct = this.ngSelectedProduct;
      if (this.ngSelectedProduct.imprintsUnSelected.length > 0) {
        this.ngImprintSelected = this.ngSelectedProduct.imprintsUnSelected[0];
      }
      this.currentSearchProductCtrl.setValue(this.ngSelectedProduct.products[0]);
      this._orderService.snackBar(msg);
      this.isAddOptionLoader = false;
      this.isUpdateImprintLoader = false;
      this.isUpdateOptionLoader = false;
      this.isAddNewProdLoader = false;
      this.isAddImprintLoader = false;
      this.isUpdateProductLoader = false;
      this.isAddAccessoryLoader = false;
      this.isUpdateAccessoryLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateImprintLoader = false;
      this.isAddOptionLoader = false;
      this.isUpdateOptionLoader = false;
      this.isAddImprintLoader = false;
      this.isAddNewProdLoader = false;
      this.isUpdateProductLoader = false;
      this.isAddAccessoryLoader = false;
      this.isUpdateAccessoryLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  addProductOptions() {
    if (this.ngQuantity == 0) {
      this._orderService.snackBar('Quantity should be greater than 0');
      return;
    }
    let payload: AddOption = {
      order_lineID: this.ngSelectedProduct.order_line_id,
      color_id: this.ngColor,
      size_id: this.ngSize,
      quantity: Number(this.ngQuantity),
      bln_apparel: this.ngSelectedProduct.products[0].blnApparel,
      blnOverride: this.ngOverrideShipping,
      add_options: true
    }
    this.isAddOptionLoader = true;
    this._orderService.orderPostCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getOrderLineDetailsAfterUpdateOrAdd(res["message"]);
      } else {
        this.isAddOptionLoader = false;
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddOptionLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateProductOptions() {
    let options = [];
    this.ngSelectedProduct.color_sizes.forEach(element => {
      options.push({
        color_id: element.fk_colorID,
        size_id: element.fk_sizeID,
        quantity: element.quantity,
        cost: element.runCost,
        price: element.runPrice,
        bln_override: element.blnOverride,
        option_id: element.pk_optionID
      })
    });
    let payload: UpdateColorSize = {
      orderline_id: this.ngSelectedProduct.order_line_id,
      options: options,
      standard_cost: this.ngSelectedProduct.products[0].runCost,
      standard_price: this.ngSelectedProduct.products[0].runPrice,
      update_options: true
    }
    this.isUpdateOptionLoader = true;
    this._orderService.updateOrderCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      if (res) {
        if (res["success"]) {
          this.getOrderLineDetailsAfterUpdateOrAdd(res["message"]);
        } else {
          this.isUpdateOptionLoader = false;
        }
      } else {
        this.isUpdateOptionLoader = false;
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateOptionLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Update Product
  updateModifyProduct() {
    let estimated_date = null;
    if (this.ngSelectedProduct.products[0].estimatedShippingDate) {
      estimated_date = moment(this.ngSelectedProduct.products[0].estimatedShippingDate).format('L');
    }
    let payload: UpdateProduct = {
      orderLine_id: this.ngSelectedProduct.order_line_id,
      estimated_shipping_date: estimated_date,
      product_id: Number(this.currentSelectedProduct.fk_productID),
      quantity: Number(this.currentSelectedProduct.minQuantity),
      bln_override: this.ngSelectedProduct.products[0].blnOverride,
      bln_sample: this.ngSelectedProduct.products[0].blnSample,
      bln_taxable: this.ngSelectedProduct.products[0].blnTaxable,
      bln_royalty: this.ngSelectedProduct.products[0].blnRoyalty,
      modify_order_update_product: true
    }
    this.isUpdateProductLoader = true;
    this._orderService.updateOrderCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      if (res) {
        if (res["success"]) {
          this.isOrderLineDetailsLoader = true;
          this._changeDetectorRef.markForCheck();
          let value = [];
          this.orderLines.forEach((element, index) => {
            value.push(element.pk_orderLineID);
            if (index == this.orderLines.length - 1) {
              let index = this.orderProducts.findIndex(data => data.order_line_id == this.ngSelectedProduct.order_line_id);
              this.getLineProducts(value.toString(), index);
            }
          });

          // this.getOrderLineDetailsAfterUpdateOrAdd(res["message"]);
        } else {
          this.isUpdateProductLoader = false;
        }
      } else {
        this.isUpdateProductLoader = false;
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateProductLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Add Accessories
  addAccoryOptionOptions() {
    let payload: addAccessory = {
      orderLine_id: this.ngSelectedProduct.order_line_id,
      packaginID: this.ngSelectedAccessory.fk_packagingID,
      quantity: this.ngSelectedAccessory.quantity,
      runCost: this.ngSelectedAccessory.run,
      setupCost: this.ngSelectedAccessory.setup,
      runPrice: this.ngSelectedAccessory.run,
      setupPrice: this.ngSelectedAccessory.setup,
      modify_order_add_accessory: true
    }
    this.isAddAccessoryLoader = true;
    this._orderService.orderPostCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getOrderLineDetailsAfterUpdateOrAdd(res["message"]);
      } else {
        this.isAddAccessoryLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAddAccessoryLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Update Accessories
  updateAccessoriesOptions() {
    let accessories = [];
    let accessories_selected = this.ngSelectedProduct.accessoriesSelected;
    accessories_selected.forEach(element => {
      accessories.push({
        accessory_id: element.fk_packagingID,
        quantity: element.quantity,
        runCost: element.runCost,
        runPrice: element.runPrice,
        setupCost: element.setupCost,
        setupPrice: element.setupPrice,
        bln_decorator: element.blnDecoratorPO,
      })
    });
    let payload: UpdateAccessory = {
      orderline_id: this.ngSelectedProduct.order_line_id,
      accessories: accessories,
      modify_order_update_accessory: true
    }
    this.isUpdateAccessoryLoader = true;
    this._orderService.updateOrderCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getOrderLineDetailsAfterUpdateOrAdd(res["message"]);
      } else {
        this.isUpdateAccessoryLoader = false;
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateAccessoryLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Update Imprints
  updateImprintOptions() {
    let Imprint = [];
    let imprints = this.ngSelectedProduct.main_imprints;
    imprints.forEach(element => {
      Imprint.push({
        imprint_id: element.fk_imprintID,
        new_imprint_id: element.fk_imprintID,
        process_quantity: element.processQuantity,
        imprint_colors: element.colorsList.toString(),
        runCost: element.runCost,
        runPrice: element.runPrice,
        setupCost: element.setupCost,
        setupPrice: element.setupPrice,
        blnOverrideRunSetup: element.blnOverride,
        customerArtworkComment: element.customerArtworkComment
      })
    });
    let payload: UpdateModifyOrderImprints = {
      imprints: Imprint,
      orderLineId: this.ngSelectedProduct.order_line_id,
      update_modify_order_imprint: true
    }
    this.isUpdateImprintLoader = true;
    this._orderService.updateOrderCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getOrderLineDetailsAfterUpdateOrAdd(res["message"]);
      } else {
        this.isUpdateImprintLoader = false;
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateImprintLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Add Imprints
  addImprintOptions() {
    let Imprint = [];
    Imprint.push({
      imprint_id: this.ngImprintSelected.pk_imprintID,
      new_imprint_id: this.ngImprintSelected.pk_imprintID,
      process_quantity: 1,
      imprint_colors: this.ngImprintSelected.imprintColors,
      decoratorFOBzip: Number(this.ngImprintSelected.decoratorFOBzip),
      customerArtworkComment: this.ngImprintSelected.customerArtworkComment,
    })
    let payload: addModifyOrderImprints = {
      imprints: Imprint,
      orderLineId: this.ngSelectedProduct.order_line_id,
      add_modify_order_imprint: true
    }
    this.isAddImprintLoader = true;
    this._orderService.orderPostCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getOrderLineDetailsAfterUpdateOrAdd(res["message"]);
      } else {
        this.isAddImprintLoader = false;
        this._changeDetectorRef.markForCheck();
      }

    }, err => {
      this.isAddImprintLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Add New Product
  addNewProduct() {
    if (this.newProductQuantity == 0) {
      this._orderService.snackBar('Quantity should be greater than 0');
      return;
    }
    if (!this.selectedProduct) {
      this._orderService.snackBar('No product is selected');
      return;
    }
    let payload: AddNewProduct = {
      orderLine_id: this.ngSelectedProduct.order_line_id,
      product_id: this.selectedProduct.fk_productID,
      store_product_id: this.selectedProduct.pk_storeProductID,
      bln_apparel: this.ngSelectedProduct.products[0].blnApparel,
      bln_warehouse: this.ngSelectedProduct.products[0].blnWarehouse,
      quantity: this.newProductQuantity,
      bln_override: this.newBlnOverride,
      bln_sample: this.newBlnSample,
      bln_taxable: this.newBlnTax,
      bln_royalty: false,
      modify_order_add_product: true
    }
    this.isAddNewProdLoader = true;
    this._orderService.orderPostCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        // this.getOrderLineDetailsAfterUpdateOrAdd(res["message"]);
      } else {
        this.isAddNewProdLoader = false;
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddNewProdLoader = false;
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

