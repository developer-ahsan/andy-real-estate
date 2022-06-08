import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { InventoryBrand, InventoryCategory, InventoryPagination, InventoryProduct, InventoryTag, InventoryVendor, ProductsList } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatStepper, StepperOrientation } from '@angular/material/stepper';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Options } from '@angular-slider/ngx-slider';
import { MatRadioChange } from '@angular/material/radio';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'inventory-list',
    templateUrl: './inventory.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class InventoryListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    products$: Observable<InventoryProduct[]>;

    products: ProductsList[];
    isLinear = true;
    productNumberLoader = false;

    exportLoader = false;
    brands: InventoryBrand[];
    categories: InventoryCategory[];
    filteredTags: InventoryTag[];
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    pagination: InventoryPagination;
    productsCount: number = 0;
    productsTableColumns: string[] = ['pk_productID', 'productName'];
    searchInputControl: FormControl = new FormControl();
    selectedProduct: ProductsList | null = null;
    selectedProductForm: FormGroup;
    tags: InventoryTag[];
    backListLoader = false;
    tagsEditMode: boolean = false;
    enableProductAddForm = false;
    vendors: InventoryVendor[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    page = 1;
    supplierType: string;

    pricingDataArray = [];
    dropdownList = [];
    selectedItems = [];
    dropdownSettings: IDropdownSettings = {};

    redPriceDropdownSettings: IDropdownSettings = {};
    selectedRedPriceItems = [];
    redPriceList = [];

    coOpProgramSettings: IDropdownSettings = {};
    selectedCoOpProgram = [];
    coops = [];
    selectedCooP = null;

    licensingTerms = [];
    selectedTermObject;
    selectedRadioOption;
    supplierId = null;

    quillModules: any = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean']
        ]
    };

    // Slider
    sliderMinValue: number = 10;
    sliderMaxValue: number = 50;
    reviewFormSliderMinValue: number = 2;
    reviewFormSliderMaxValue: number = 10;
    sliderOptions: Options = {
        floor: 1,
        ceil: 120
    };

    pageNo: number;

    distributionCodes = [];

    // Filter dropdowns
    suppliers = [];
    stores = [];

    licensingTermLoader = false; // Licensing term Loader
    subCategoryItems = [];
    expansionLoader = false;

    firstFormLoader = false;

    filteredStates: Observable<any[]>;

    states: any[] = [
        {
            name: 'Price does not include imprint. You may add desired imprint(s) during the checkout process for an additional cost.'
        },
        {
            name: 'Price does not include imprint and is based on the white color option. You may add desired imprint(s) during the checkout process for an additional cost.'
        },
        {
            name: 'Price includes a one color/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout.'
        },
        {
            name: 'Price includes a laser engraved/one location imprint. Setups and any other additional fees may apply andwill be disclosed prior to checkout.'
        },
        {
            name: 'Price includes a laser etched/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout.'
        },
        {
            name: 'Price does not include imprint and is based on the white color option. You may add desired imprint(s) during the checkout process for an additional cost.'
        },
        {
            name: 'Price includes a full color/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout'
        },
        {
            name: 'Price includes imprint, setup, and run fees'
        },
        {
            name: 'Setups and any other additional fees may apply and will be disclosed prior to checkout'
        },
        {
            name: 'Item is sold blank.'
        }
    ];

    keyword = 'companyName';
    redPriceCommentText = "";
    selectedStore = null;
    selectedSupplier = null;
    isSupplierNotReceived = true;
    isStoreNotReceived = true;
    createProductLoader = false;
    stepperOrientation: Observable<StepperOrientation>;
    favoriteSeason: string;
    isFiltering = false;
    productNumberText = "";
    addProductTypeRadios = [
        {
            name: 'Normal Promotional Material',
            helperText: ''
        },
        {
            name: 'Apparel Item',
            helperText: 'Weight per units is determined in the "sizes" section for apparel, after the item has been added.'
        }
    ];

    selectEvent(item) {
        // do something with selected item
    }

    onChangeSearch(val: string) {
        // fetch remote data from here
        // And reassign the 'data' which is binded to 'data' property.
    }

    onFocused(e) {
        // do something when input is focused
    }
    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    fruits = [];

    add(event): void {
        const value = (event.value || '').trim();

        // Add our fruit
        if (value) {
            this.fruits.push({ name: value });
        }

        // Clear the input value
        event.chipInput!.clear();
    }

    remove(fruit): void {
        const index = this.fruits.indexOf(fruit);

        if (index >= 0) {
            this.fruits.splice(index, 1);
        }
    }

    reviewForm = this._formBuilder.group({
        productName: ['', Validators.required],
        productNumber: ['', Validators.required],
        caseHeight: [''],
        caseWidth: [''],
        caseLength: [''],
        productHeight: [''],
        productWidth: [''],
        productLength: [''],
        weight: [''],
        unitsInWeight: [''],
        doChargesApply: ['No'],
        brandName: ['', Validators.required],
        overPackageCharge: [''],
        technoLogo: [''],
        supplierLink: [''],
        mainDescription: [''],
        miniDescription: [''],
        sex: [''],
        allowGroupRun: [''],
        keywords: [''],
        quantityOne: [''],
        quantityTwo: [''],
        quantityThree: [''],
        quantityFour: [''],
        quantityFive: [''],
        quantitySix: [''],
        firstQuantity: [''],
        secondQuantity: [''],
        thirdQuantity: [''],
        fourthQuantity: [''],
        fifthQuantity: [''],
        sixthQuantity: [''],
        standardCostOne: [''],
        standardCostTwo: [''],
        standardCostThree: [''],
        standardCostFour: [''],
        standardCostFive: [''],
        standardCostSix: [''],
        standardCostDropOne: [''],
        standardCostDropTwo: [''],
        standardCostDropThree: [''],
        standardCostDropFour: [''],
        standardCostDropFive: [''],
        standardCostDropSix: [''],
        msrp: [''],
        internalComments: [''],
        order: ['1'],
        feature: ['', Validators.required]
    });

    firstFormGroup = this._formBuilder.group({
        radio: ['', Validators.required]
    });

    secondFormGroup = this._formBuilder.group({
        productName: ['', Validators.required],
        productNumber: ['', Validators.required],
        caseHeight: [''],
        caseWidth: [''],
        caseLength: [''],
        productHeight: [''],
        productWidth: [''],
        productLength: [''],
        weight: [''],
        unitsInWeight: [''],
        doChargesApply: ['No'],
        sex: [''],
        allowGroupRun: [''],
        brandName: ['', Validators.required],
        overPackageCharge: [''],
        technoLogo: [''],
        supplierLink: [''],
        mainDescription: [''],
        miniDescription: [''],
        keywords: [''],
        quantityOne: [''],
        quantityTwo: [''],
        quantityThree: [''],
        quantityFour: [''],
        quantityFive: [''],
        quantitySix: ['']
    });
    netCostForm = this._formBuilder.group({
        firstQuantity: [''],
        secondQuantity: [''],
        thirdQuantity: [''],
        fourthQuantity: [''],
        fifthQuantity: [''],
        sixthQuantity: [''],
        standardCostOne: [''],
        standardCostTwo: [''],
        standardCostThree: [''],
        standardCostFour: [''],
        standardCostFive: [''],
        standardCostSix: [''],
        standardCostDropOne: [''],
        standardCostDropTwo: [''],
        standardCostDropThree: [''],
        standardCostDropFour: [''],
        standardCostDropFive: [''],
        standardCostDropSix: [''],
        msrp: [''],
        internalComments: [''],
        coOp: [""]
    });

    licensingTermForm = this._formBuilder.group({
        licensingTerm: ['']
    });

    featureForm = this._formBuilder.group({
        order: ['1'],
        feature: ['', Validators.required]
    });

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _inventoryService: InventoryService,
        private _router: Router,
        breakpointObserver: BreakpointObserver,
        private _snackBar: MatSnackBar
    ) {
        this.stepperOrientation = breakpointObserver
            .observe('(min-width: 800px)')
            .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.pageNo = 0;

        this.firstFormGroup.controls['radio'].setValue(this.addProductTypeRadios[0]);

        // Red price comment
        this.redPriceList = [
            { item_id: 1, item_text: 'Price does not include imprint. You may add desired imprint(s) during the checkout process for an additional cost' },
            { item_id: 2, item_text: 'Price does not include imprint and is based on the white color option. You may add desired imprint(s) during the checkout process for an additional cost' },
            { item_id: 3, item_text: 'Price includes a one color/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout' },
            { item_id: 4, item_text: 'Price includes a laser engraved/one location imprint. Setups and any other additional fees may apply andwill be disclosed prior to checkout' },
            { item_id: 5, item_text: 'Price includes a laser etched/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout' },
            { item_id: 6, item_text: 'Price does not include imprint and is based on the white color option. You may add desired imprint(s) during the checkout process for an additional cost' },
            { item_id: 7, item_text: 'Price includes a full color/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout' },
            { item_id: 8, item_text: 'Price includes imprint, setup, and run fees' },
            { item_id: 9, item_text: 'Setups and any other additional fees may apply and will be disclosed prior to checkout' },
            { item_id: 10, item_text: 'Item is sold blank' }
        ];

        this.selectedRedPriceItems = [];

        this.redPriceDropdownSettings = {
            singleSelection: false,
            idField: 'item_id',
            textField: 'item_text',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 3,
            allowSearchFilter: true,
            limitSelection: 1
        };

        // Create the selected product form
        this.selectedProductForm = this._formBuilder.group({
            id: [''],
            category: [''],
            name: ['', [Validators.required]],
            description: [''],
            tags: [[]],
            sku: [''],
            barcode: [''],
            brand: [''],
            vendor: [''],
            stock: [''],
            reserved: [''],
            cost: [''],
            basePrice: [''],
            taxPercent: [''],
            price: [''],
            weight: [''],
            thumbnail: [''],
            images: [[]],
            currentImageIndex: [0], // Image index that is currently being viewed
            active: [false],
            productNumber: [''],
            productName: [''],
            pk_productID: [''],
        });

        // Get the suppliers
        this._inventoryService.getAllSuppliers()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((supplier) => {
                this._inventoryService.getSystemDistributorCodes()
                    .subscribe((response) => {
                        this.distributionCodes = response["data"];
                        this.suppliers = supplier["data"];
                        this.dropdownList = this.suppliers;
                        this.isSupplierNotReceived = false;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    });
            });

        // Get the CoOps
        this._inventoryService.getProductCoops()
            .subscribe((coops) => {
                this.coops = coops["data"];

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the stores
        this._inventoryService.getAllStores()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores) => {
                this.stores = stores["data"];
                this.isStoreNotReceived = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            })

        // Get the products
        this._inventoryService.products$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductsList[]) => {
                this.products = products["data"];
                this.productsCount = products["totalRecords"];

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._inventoryService.getProducts(0, 10, 'name', 'asc', query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();

        this.dropdownSettings = {
            singleSelection: false,
            idField: 'pk_companyID',
            textField: 'companyName',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 1,
            allowSearchFilter: true,
            limitSelection: 1
        };

        this.coOpProgramSettings = {
            singleSelection: false,
            idField: 'pk_coopID',
            textField: 'name',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 1,
            allowSearchFilter: true,
            limitSelection: 1
        };
    };

    onItemSelect(item: any) {
        const { pk_companyID } = item;
        this.supplierId = pk_companyID;
    };

    onRedPriceItemSelect(item: any) {
        const { item_text } = item;
        this.redPriceCommentText = item_text;
    };

    onCoOpProgramSelect(item: any) {
        const { pk_coopID } = item;
        this.selectedCooP = pk_coopID;
    };

    /**
     * After view init
     */
    ngAfterViewInit(): void {
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    selectByStore(event): void {
        const { pk_storeID } = event;
        this.isFiltering = true;
        this.isLoading = true;
        // Get the products by selected suppliers
        this._inventoryService.getProductsByStoreId(pk_storeID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductsList[]) => {
                this.products = products["data"];
                this.productsCount = products["totalRecords"];
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    selectBySupplier(event): void {
        const { pk_companyID } = event;

        this.isFiltering = true;
        this.isLoading = true;
        // Get the products by selected suppliers
        this._inventoryService.getProductsBySupplierId(pk_companyID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductsList[]) => {
                this.products = products["data"];
                this.productsCount = products["totalRecords"];
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    clearFilter() {

        this.isLoading = true;
        // Get the products
        this._inventoryService.getProductsList(1)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductsList[]) => {
                this.products = products["data"];
                this.productsCount = products["totalRecords"];
                this.isLoading = false;

                this.selectedStore = null;
                this.selectedSupplier = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    createProduct(): void {
        const firstFormGroup = this.firstFormGroup.getRawValue();
        const finalForm = this.reviewForm.getRawValue();

        const { radio } = firstFormGroup;
        const { technoLogo, supplierLink, mainDescription, miniDescription, weight, caseWidth, caseLength, caseHeight, overPackageCharge, keywords, productNumber, productName, msrp, internalComments } = finalForm;

        const productId = null;

        const shipping = {
            bln_include_shipping: 1,
            fob_location_list: [],
            prod_time_max: this.sliderMaxValue || 10,
            prod_time_min: this.sliderMinValue || 7,
            units_in_shipping_package: 1
        };

        const physics = {
            bln_apparel: radio.name === "Apparel Item" ? true : false,
            dimensions: null,
            over_pack_charge: overPackageCharge || null,
            product_id: productId,
            shipping: shipping,
            weight: weight || null,
            weight_in_units: null
        };

        const flatRate = {
            flat_rate_shipping: 1,
            product_id: null
        };

        const caseDimension = {
            case_height: caseHeight || null,
            case_length: caseLength || null,
            case_width: caseWidth || null,
            product_id: null
        };

        const caseQuantities = {
            case_quantities: [1, 2, 3, 4],
            product_id: null
        };

        const netCost = {
            blank_cost_list: [0, 1, 2],
            coop_id: this.selectedCooP || "",
            cost_comment: internalComments || "",
            cost_list: [1, 2, 3],
            live_cost_comment: this.redPriceCommentText || "",
            msrp: msrp || "",
            product_id: productId,
            quantity_list: [1, 2, 3]
        };

        const description = {
            name: productName,
            product_number: productNumber,
            description: true,
            product_desc: mainDescription.replace(/'/g, "''") || " ",
            mini_desc: miniDescription.replace(/'/g, "''") || null,
            keywords: keywords || null,
            notes: null,
            purchase_order_notes: null,
            supplier_link: supplierLink || null,
            meta_desc: miniDescription.replace(/'/g, "''") || null,
            sex: null,
            search_keywords: keywords || null,
            last_update_by: null,
            last_update_date: null,
            update_history: null,
            product_id: productId
        };

        const { fk_licensingTermID, pk_licensingTermSubCategoryID } = this.selectedRadioOption;
        const licensingTerm = {
            licensing_term_id: fk_licensingTermID,
            sub_category_id: pk_licensingTermSubCategoryID,
            call_type: null,
            licensing_term: true
        };

        const payload = {
            product: true,
            supplier_id: this.supplierId,
            item_type: radio.name === "Apparel Item" ? 2 : 1,
            technologo_sku: technoLogo || null,
            bln_group_run: false,
            permalink: null,
            description: description,
            physics: physics,
            flat_rate: flatRate,
            case_dimension: caseDimension,
            case_quantities: caseQuantities,
            shipping: shipping,
            net_cost: netCost,
            licensing_term: licensingTerm
        };

        this.createProductLoader = true;

        this._inventoryService.checkIfProductExist(productNumber, productName, this.supplierId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                const isDataExist = response["data_exists"];

                if (isDataExist) {
                    this.createProductLoader = false;
                    this._snackBar.open("Product already exists", '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                        duration: 3500
                    });
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                } else {
                    this._inventoryService.addProduct(payload)
                        .subscribe((response) => {
                            this.createProductLoader = false;
                            this.showFlashMessage(
                                response["success"] === true ?
                                    'success' :
                                    'error'
                            );
                        });
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                }
            })
    };

    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedProduct = null;
    }

    expansionOpened(license): void {
        this.expansionLoader = true;

        this._inventoryService.addProductGetLicensingSubCategory(license.pk_licensingTermID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((subCategories) => {
                this.subCategoryItems = subCategories["data"];
                this.subCategoryItems[0].Selected = true;
                this.selectedRadioOption = this.subCategoryItems[0];
                this.expansionLoader = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    selectedRadio(item: MatRadioChange) {
        this.selectedRadioOption = item.value;
    }

    selectedSubCategory(item) {
        this.selectedTermObject = item;
    };

    onSearchChange(event): void {
        this.productNumberText = event.target.value;
    }

    fetchProductNumberData(): void {
        if (this.productNumberText) {
            this.productNumberLoader = true;
            this._inventoryService.getPromoStandardProductDetails(this.productNumberText)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((productDetails) => {
                    this._inventoryService.getPromoStandardProductPricingDetails(this.productNumberText)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((productPricing) => {
                            this._snackBar.open("Data fetched successfully", '', {
                                horizontalPosition: 'center',
                                verticalPosition: 'bottom',
                                duration: 3500
                            });
                            const { success } = productDetails["data"];
                            if (success) {
                                const details = productDetails["data"].result.Product;
                                const product = {
                                    productName: details.productName,
                                    productNumber: details.productId,
                                    brandName: details.productBrand,
                                    mainDescription: details.description.toString().split(",").join("\n")
                                }
                                const string = details.ProductKeywordArray[0].keyword;
                                if (string?.length) {
                                    for (const value of string.split(',')) {
                                        let temp = {
                                            name: value
                                        }
                                        this.fruits.push(temp)
                                    }
                                };

                                this.secondFormGroup.patchValue(product);
                            }

                            if (productPricing["data"]["success"]) {
                                this.pricingDataArray = productPricing["data"]["result"]["Envelope"]["Body"]["GetConfigurationAndPricingResponse"]["Configuration"]["PartArray"];
                            }
                            this.productNumberLoader = false;

                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
                });
        } else {
            this._snackBar.open("Enter product number to fetch data", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
        }
    };

    goBack(stepper: MatStepper) {
        stepper.previous();
    };

    goForward(stepper: MatStepper) {
        const { selectedIndex } = stepper;
        if (selectedIndex === 0) {
            if (!this.selectedItems.length) {
                this._snackBar.open("Please select a supplier", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                return;
            };
        };

        // Description screen
        if (selectedIndex === 1) {
            const { radio } = this.firstFormGroup.value;
            const { name } = radio;
            this.supplierType = name;
            if (this.supplierType === 'Normal Promotional Material') {
                this.secondFormGroup.controls['brandName'].disable();
                this.reviewForm.controls['brandName'].disable();
            };
        };

        // Net Cost screen
        if (selectedIndex === 1) {
            // if (this.supplierId == 25) {
            const { radio } = this.firstFormGroup.value;
            const { name } = radio;
            let obj = {};
            if (name === 'Normal Promotional Material') {
                if (this.pricingDataArray?.length) {
                    for (let i = 0; i <= 5; i++) {
                        const { minQuantity, price } = this.pricingDataArray[i]["PartPriceArray"][0];
                        if (i == 0) {
                            obj["firstQuantity"] = minQuantity;
                            obj["standardCostOne"] = price;
                        }

                        if (i == 0) {
                            obj["firstQuantity"] = minQuantity;
                            obj["standardCostTwo"] = price;
                        }

                        if (i == 1) {
                            obj["secondQuantity"] = minQuantity;
                            obj["standardCostThree"] = price;
                        }

                        if (i == 2) {
                            obj["thirdQuantity"] = minQuantity;
                            obj["standardCostFour"] = price;
                        }

                        if (i == 3) {
                            obj["fourthQuantity"] = minQuantity;
                            obj["standardCostFive"] = price;
                        }

                        if (i == 4) {
                            obj["fifthQuantity"] = minQuantity;
                            obj["standardCostSix"] = price;
                        }

                        if (i == 5) {
                            obj["sixthQuantity"] = minQuantity;
                            obj["standardCostOne"] = price;
                        }
                    }
                }
            } else {
                if (this.pricingDataArray?.length) {
                    for (let i = 0; i <= 5; i++) {
                        const { price } = this.pricingDataArray[i]["PartPriceArray"][0];
                        if (i == 0) {
                            obj["standardCostOne"] = price
                        }

                        if (i == 0) {
                            obj["standardCostTwo"] = price
                        }

                        if (i == 1) {
                            obj["standardCostThree"] = price
                        }

                        if (i == 2) {
                            obj["standardCostFour"] = price
                        }

                        if (i == 3) {
                            obj["standardCostFive"] = price
                        }

                        if (i == 4) {
                            obj["standardCostSix"] = price
                        }

                        if (i == 5) {
                            obj["standardCostOne"] = price
                        }
                    }
                }
            }
            this.netCostForm.patchValue(obj);
            // };
        };

        if (selectedIndex === 3) {
            if (!this.selectedTermObject) {
                this._snackBar.open("Please select one sub category", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                return;
            };
        };

        stepper.next();
    };

    selectionChange(event) {
        const { selectedIndex } = event;

        // Description screen
        if (selectedIndex === 1) {
            const { radio } = this.firstFormGroup.value;
            const { name } = radio;
            this.supplierType = name;
            if (this.supplierType === 'Normal Promotional Material') {
                this.secondFormGroup.controls['brandName'].disable();
                this.reviewForm.controls['brandName'].disable();
            };
        };

        // Licensing term screen
        if (selectedIndex === 3) {
            if (!this.licensingTerms.length) {
                this.licensingTermLoader = true;

                // Get licensing company
                this._inventoryService.getLicensingCompany()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((licensingCompany) => {
                        if (licensingCompany["totalRecords"] === 1) {
                            this._inventoryService.addProductGetLicensingTerms()
                                .pipe(takeUntil(this._unsubscribeAll))
                                .subscribe((licensingTerms) => {
                                    this.licensingTerms = licensingTerms["data"];
                                    this.licensingTermLoader = false;

                                    // Mark for check
                                    this._changeDetectorRef.markForCheck();
                                })
                        } else {
                            this.licensingTermLoader = false;
                        }

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })
            };
        };

        // Review Screen
        if (selectedIndex === 5) {
            this.reviewFormSliderMaxValue = this.sliderMaxValue;
            this.reviewFormSliderMinValue = this.sliderMinValue;
            const firstForm = this.firstFormGroup.value;
            const secondForm = this.secondFormGroup.value;
            const thirdForm = this.netCostForm.value;
            const fourthForm = this.featureForm.value;
            const finalForm = {
                ...firstForm,
                ...secondForm,
                ...thirdForm,
                ...fourthForm
            };

            this.reviewForm.patchValue(finalForm);
        }
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    sortData(sort: Sort) {
        let sortedData = this.products.slice();
        const data = this.products.slice();
        if (!sort.active || sort.direction === '') {
            sortedData = data;
            return;
        }

        sortedData = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'pk_productID':
                    return this.compare(a.pk_productID, b.pk_productID, isAsc);
                case 'productName':
                    return this.compare(a.productName, b.productName, isAsc);
                default:
                    return 0;
            }
        });
        this.products = sortedData;
        this.productsCount = sortedData.length;
    }
    /**
     * Show flash message
     */
    showFlashMessage(type: 'success' | 'error'): void {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {

            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    searchKeyword(event): void {
        this.isLoading = true;
        let keyword;
        if (event.target.value) {
            keyword = event.target.value;
        } else {
            keyword = '';
        }

        this._inventoryService.searchProductKeywords(keyword)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products) => {
                this.products = products["data"];
                this.productsCount = products["totalRecords"];
                this.isLoading = false;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    productDetails(productId) {
        this.isLoading = true;
        this._router.navigate([`/apps/ecommerce/inventory/${productId}`]);
    };

    getProductsList(): void {
        // Add products form multi stepper back to products

        this.backListLoader = true;  // Loader for the button

        // Get the products
        this._inventoryService.getProductsList(1)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductsList[]) => {
                this.products = products["data"];
                this.productsCount = products["totalRecords"];
                this.backListLoader = false;
                this.enableProductAddForm = false;
                this.firstFormLoader = false;
            });
    };

    enableProductAddFormFn(): void {
        this.enableProductAddForm = true;
        this.licensingTermLoader = true;

        // Get licensing company
        this._inventoryService.getLicensingCompany()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((licensingCompany) => {
                if (licensingCompany["totalRecords"] === 1) {
                    this._inventoryService.addProductGetLicensingTerms()
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((licensingTerms) => {
                            this.licensingTerms = licensingTerms["data"];
                            this.licensingTermLoader = false;

                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        })
                } else {
                    this.licensingTermLoader = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            })
        if (!this.suppliers.length) {
            this.firstFormLoader = true;
            this._inventoryService.getAllSuppliers()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((supplier) => {
                    this.suppliers = supplier["data"];
                    this.firstFormLoader = false;
                    this.enableProductAddForm = true;
                })
        }
    };

    exportLoaderToggle(): void {
        this.exportLoader = !this.exportLoader;
    }

    exportProducts(): void {
        const size = this.productsCount;
        this.exportLoaderToggle();
        this._inventoryService.getProductsForExporting(size)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products) => {
                this.exportLoaderToggle();
                const data = products["data"];
                const today = new Date();
                const month = today.getMonth() + 1; // This method returns count from 0 to 11. It means the value 0 refers to January and so on
                const date = today.getDate();
                const year = today.getFullYear();
                const hours = today.getHours();
                const minutes = today.getMinutes();
                const seconds = today.getSeconds();
                const fileName = `Products_${month}_${date}_${year}_${hours}_${minutes}_${seconds}`;
                const workbook = new Excel.Workbook();
                const worksheet = workbook.addWorksheet("My Sheet");

                worksheet.columns = [
                    { header: "ID", key: "pk_productID", width: 10 },
                    { header: "PRODUCTNUMBER", key: "productNumber", width: 20 },
                    { header: "PRODUCTNAME", key: "productName", width: 32 },
                    { header: "PRODUCTDESCRIPTION", key: "productDesc", width: 120 },
                    { header: "MINIDESC", key: "miniDesc", width: 20 },
                    { header: "KEYWORDS", key: "keywords", width: 32 },
                    { header: "PERMALINK", key: "permalink", width: 10 },
                    { header: "PRICINGLASTUPDATEDDATE", key: "pricingLastUpdatedDate", width: 32 }
                ];

                for (const obj of data) {
                    worksheet.addRow(obj);
                }

                workbook.xlsx.writeBuffer().then((data: any) => {
                    const blob = new Blob([data], {
                        type:
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    });
                    let url = window.URL.createObjectURL(blob);
                    let a = document.createElement("a");
                    document.body.appendChild(a);
                    a.setAttribute("style", "display: none");
                    a.href = url;
                    a.download = `${fileName}.xlsx`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            })
    }

    getProducts(page: number): void {
        this._inventoryService.getProductsByPagination(page)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products) => {
                this.products = products["data"];
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            })
    };

    getNextData(event) {
        this.isLoading = true;
        const { previousPageIndex, pageIndex } = event;

        if (pageIndex > previousPageIndex) {
            this.page++;
        } else {
            this.page--;
        };
        this.getProducts(this.page);
    }
}
