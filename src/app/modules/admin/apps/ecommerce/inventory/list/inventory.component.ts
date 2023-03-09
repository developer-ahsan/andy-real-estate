import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
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
import { ProductImprintsComponent } from './product-imprints/product-imprints';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { ImprintRunComponent } from '../navigation/imprint/imprint-run/imprint-run.component';

@Component({
    selector: 'inventory-list',
    templateUrl: './inventory.component.html',
    styles: ['.mat-tab-body-content {overflow: hidden !important} fuse-alert .fuse-alert-container .mat-icon {color: gray !important} fuse-alert.fuse-alert-appearance-soft.fuse-alert-type-info .fuse-alert-container .fuse-alert-message {color: gray !important} .img_wrp { display: inline - block; position: relative;} .close {position: absolute;top: 10px;right: 150px;}'],

    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class InventoryListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild('stepper') public myStepper: MatStepper;
    @ViewChild('prodStandardImprints') prodStandardImprints: ProductImprintsComponent;


    // Imprints List
    displayedColumns: string[] = ['location', 'method', 'decorator', 'active'];
    dataSource = [];
    totalImprints = 0;
    imprintPage = 1;
    imprintGetLoader: boolean = false;


    products$: Observable<InventoryProduct[]>;

    products: any;
    isLinear = true;
    isReviewFormReached = false;
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
    selectedDropdown;

    pricingDataArray = [];
    dropdownList = [];
    selectedItems: any;
    dropdownSettings: IDropdownSettings = {};
    imprintColorsDropdownSettings: IDropdownSettings = {};

    redPriceDropdownSettings: IDropdownSettings = {};
    selectedRedPriceItems = [];
    redPriceList = [];
    isCustomRedPrice: boolean = false;

    coOpProgramSettings: IDropdownSettings = {};
    selectedCoOpProgram = [];
    coops = [];
    selectedCooP = null;

    licensingTerms = [];
    dummyLicensingTerms = [];
    selectedTermObject;
    selectedRadioOption;
    supplierId = null;
    supplierName = "";

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
    sliderMinValue: number = 7;
    sliderMaxValue: number = 10;
    reviewFormSliderMinValue: number = 7;
    reviewFormSliderMaxValue: number = 10;
    sliderOptions: Options = {
        floor: 1,
        ceil: 120
    };
    selectedSex = 0;

    productsOnClearFilter = [];
    productsOnClearFilterCount: number;

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

    featureForm: FormGroup;
    items: FormArray;

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

    selectedExpansionLicensingTerm = null;
    keyword = 'companyName';
    redPriceCommentText = "";
    selectedStore = "All Stores";
    selectedSupplier = "All Suppliers";
    isSupplierNotReceived = true;
    isStoreNotReceived = true;
    createProductLoader = false;
    stepperOrientation: Observable<StepperOrientation>;
    isFiltering = false;
    productNumberText = "";
    addProductTypeRadios = [
        {
            name: 'Apparel Item',
            helperText: 'Weight per units is determined in the "sizes" section for apparel, after the item has been added.'
        },
        {
            name: 'Normal Promotional Material',
            helperText: ''
        }
    ];
    imageValue: { imageUpload: any | ArrayBuffer; type: any; };
    stepperIndex: any;
    reviewProductDetailLoader: boolean = false;
    isColorLoading: boolean = false;

    selectedColorsListArray = [];
    blnPromoStandard: boolean = false;

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

    checkProductExistOrNotLoader: boolean = false;
    add(event: MatChipInputEvent): void {
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




    netCostDefaultStandardCost = null;
    reviewForm = this._formBuilder.group({
        productName: ['', Validators.required],
        productNumber: ['', Validators.required],
        caseHeight: [''],
        caseWidth: [''],
        caseLength: [''],
        productDimensions: [''],
        productHeight: [''],
        productWidth: [''],
        productLength: [''],
        weight: [''],
        unitsInWeight: ['1'],
        flatRate: [''],
        doChargesApply: ['Yes'],
        brandName: ['', Validators.required],
        overPackageCharge: [''],
        supplierLink: [''],
        mainDescription: ['', Validators.required],
        miniDescription: ['', Validators.required],
        allowGroupRun: [true],
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
        internalComments: ['']
    });

    firstFormGroup = this._formBuilder.group({
        radio: ['', Validators.required],
        supplier: ['', Validators.required]
    });

    secondFormGroup = this._formBuilder.group({
        productName: ['', Validators.required],
        productNumber: ['', Validators.required],
        caseHeight: [''],
        caseWidth: [''],
        caseLength: [''],
        productDimensions: [''],
        productHeight: [''],
        productWidth: [''],
        productLength: [''],
        weight: [''],
        unitsInWeight: ['1'],
        flatRate: [''],
        doChargesApply: ['Yes'],
        allowGroupRun: [true],
        brandName: ['', Validators.required],
        overPackageCharge: [''],
        supplierLink: [''],
        mainDescription: ['', Validators.required],
        miniDescription: ['', Validators.required],
        keywords: [''],
        quantityOne: [''],
        quantityTwo: [''],
        quantityThree: [''],
        quantityFour: [''],
        quantityFive: [''],
        quantitySix: [''],
        unitsInShippingPackage: ['']
    });
    reviewsecondFormGroup = this._formBuilder.group({
        productName: ['', Validators.required],
        productNumber: ['', Validators.required],
        caseHeight: [''],
        caseWidth: [''],
        productDimensions: [''],
        caseLength: [''],
        productHeight: [''],
        productWidth: [''],
        productLength: [''],
        weight: [''],
        unitsInWeight: ['1'],
        flatRate: [''],
        doChargesApply: ['Yes'],
        allowGroupRun: [true],
        brandName: ['', Validators.required],
        overPackageCharge: [''],
        supplierLink: [''],
        mainDescription: ['', Validators.required],
        miniDescription: ['', Validators.required],
        keywords: [''],
        quantityOne: [''],
        quantityTwo: [''],
        quantityThree: [''],
        quantityFour: [''],
        quantityFive: [''],
        quantitySix: [''],
        unitsInShippingPackage: ['']
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

    imprintForm = this._formBuilder.group({
    })

    colorForm = this._formBuilder.group({
        colors: ['', Validators.required],
        run: ['0.00'],
        hex: ['']
    });
    colorsForm = this._formBuilder.group({
        colorId: [''],
        colorName: [''],
        run: ['0.00'],
        hex: [''],
        image: [null]
    });

    colorValue = '#000000';
    hexColor;
    colorTempImage = null;
    // Imprint values intializing
    runSetup: FormGroup;
    getChargesLoader = null;
    chargesTableArray = [];
    chargeDistribution: FormGroup;
    getImprintColorCollectionLoader = false;
    selectedDiscountCode = null;
    runSetupDistributorCodes = [];
    runSetupLoaderFetching = false;
    selectedMethod = null;
    selectedLocation = null;
    selectedDigitizer = null;
    addImprintLocations = [];
    addImprintMethods = [];
    addImprintDigitizers = [];
    areaValue = "";
    minQuantity: number;
    addImprintComment;
    addImprintDisplayOrderValue;
    favoriteSeason: string = "Per color (i.e. silk screening, pad printing, etc.)";
    defaultImprintColorSpecification = "Yes";
    maxColors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    maxColorSelected = 1;
    collectionIdsArray = [];
    colorsCollectionIdsArray = [];
    selectedCollectionId;
    priceInclusionArray = [
        {
            priceInclusionText: "Yes, when it's the only imprint, the first process is included in the product price.",
            value: "Yes"
        },
        {
            priceInclusionText: "No, all processes, including the first are extra.",
            value: "No"
        }
    ];
    priceInclusionSelected = this.priceInclusionArray[0];
    imprintItself = [
        {
            imprintItselfText: "Yes, this imprint can be ordered by itself.",
            value: "Yes"
        },
        {
            imprintItselfText: "No, this imprint cannot be ordered by itself.",
            value: "No"
        }
    ];
    imprintItselfSelected = this.imprintItself[0];
    specifyImrpintArray: string[] = [
        'Yes',
        'No'
    ];
    seasons: string[] = [
        'Per color (i.e. silk screening, pad printing, etc.)',
        'Per Stitch (embroidering)',
        'Simple Process (i.e. laser engraving, full color, etc.)'
    ];
    values = this._formBuilder.group({
        twoColorQ: [1],
        threeColorQ: [1],
        fourColorQ: [1],
        fiveColorQ: [1]
    });
    customColorId = null;
    imprintPayload = null;
    netCostPayload = null;
    imprintPayloadBoolean: boolean = true;
    netCostPayloadBoolean: boolean = true;
    colorPayload: boolean = true;
    uniqueFeaturesPayload: boolean = true;
    licensingTermPayload = null;
    licensingTermPayloadBoolean: boolean = true;


    productStepComplete: boolean = false;
    productId: any;
    pk_productId: any;
    createProductDetailLoader: boolean = false;
    updateProductLicensingLoader: boolean = false;
    updateProductFeatureLoader: boolean = false;
    updateProductColorLoader: boolean = false;
    updateProductCostLoader: boolean = false;
    updateProductImprintLoader: boolean = false;

    public colorName = new FormControl();
    results: any[];
    selectedColorsList: any = [];
    selectedColor: any = {};
    @ViewChild('colorpicker') colorpicker: ElementRef;
    isDefaultColor: boolean = false;
    customColorsList: any = [];

    // Imprints
    imprintsLocalList = [];
    imprintsLocalListLoader: boolean = false;
    imprintLocalTableColumns: string[] = ['location', 'method', 'decorator', 'action'];


    // 
    methodControl = new FormControl('');
    methodFilteredOptions: Observable<any>;
    locationControl = new FormControl('');
    locationFilteredOptions: Observable<any>;


    location_name: any = '';
    method_name: any = '';

    public locationSearchControl = new FormControl();
    isLoadings: boolean = false;
    public methodSearchControl = new FormControl();
    isMethodLoading: boolean = false;
    minLengthTerm = 3;


    clickButton(): void {
        this.colorpicker.nativeElement.click()
    }

    scrollStrategy: ScrollStrategy;

    getSizes: boolean = false;

    FOBLocations = [];
    checkedFOBLocations = [];
    fobLocationLoader: boolean = false;
    // Open Modal
    openModal() {
        const dialogRef = this.dialog.open(ImprintRunComponent, {
            // data: dialogData,
            minWidth: "300px",
            maxHeight: '90vh',
            scrollStrategy: this.scrollStrategy
        });
        dialogRef.afterClosed().subscribe(dialogResult => {
            this.runSetup.patchValue({
                run: this._inventoryService.run,
                setup: this._inventoryService.setup
            })
            if (dialogResult) {
            }
        })
    }
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _inventoryService: InventoryService,
        private _router: Router,
        breakpointObserver: BreakpointObserver,
        private _snackBar: MatSnackBar,
        private _httpClient: HttpClient,
        public dialog: MatDialog,
        private readonly sso: ScrollStrategyOptions

    ) {
        this.scrollStrategy = this.sso.noop();

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
    changeDefaultColor() {
        this.isDefaultColor = !this.isDefaultColor;
    }
    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.addImprintMethods.filter(option => option.methodName.toLowerCase().includes(filterValue));
    }
    private _filterLocation(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.addImprintLocations.filter(option => option.locationName.toLowerCase().includes(filterValue));
    }
    methodSelected(obj) {
        this.selectedMethod = obj;
        if (obj.methodName.includes('Embroidery') || obj.methodName.includes('Embroidering') || obj.methodName.includes('Embroidered')) {
            this.favoriteSeason = 'Per Stitch (embroidering)';
            this.selectedDigitizer = this.addImprintDigitizers.find(x => x.pfk_digitizerID == this.selectedSupplier) || this.addImprintDigitizers[0];
        }
        this.methodSearchControl.setValue(obj.methodName)
        // if (obj.pk_methodID == 20) {
        // }
        this._changeDetectorRef.markForCheck();
    }
    locationSelected(obj) {
        this.selectedLocation = obj;
        this.locationSearchControl.setValue(obj.locationName)
    }
    ngOnInit(): void {
        this.locationSearchControl.valueChanges.pipe(filter(res => {
            return res !== null && res.length >= this.minLengthTerm
        }),
            distinctUntilChanged(),
            debounceTime(300),
            tap(() => {
                this.addImprintLocations = [];
                this.isLoadings = true;
                this._changeDetectorRef.markForCheck();
            }),
            switchMap(value => this._inventoryService.getAllImprintLocations(value)
                .pipe(
                    finalize(() => {
                        this.isLoadings = false
                        this._changeDetectorRef.markForCheck();
                    }),
                )
            )
        )
            .subscribe((data: any) => {
                this.addImprintLocations.push({ locationName: 'New Location >>>', pk_locationID: null });
                data["data"].forEach(element => {
                    this.addImprintLocations.push(element);
                });
            });

        this.methodSearchControl.valueChanges
            .pipe(
                filter(res => {
                    return res !== null && res.length >= this.minLengthTerm
                }),
                distinctUntilChanged(),
                debounceTime(300),
                tap(() => {
                    this.addImprintMethods = [];
                    this.isMethodLoading = true;
                    this._changeDetectorRef.markForCheck();
                }),
                switchMap(value => this._inventoryService.getAllImprintMethods(value)
                    .pipe(
                        finalize(() => {
                            this.isMethodLoading = false
                            this._changeDetectorRef.markForCheck();
                        }),
                    )
                )
            )
            .subscribe((data: any) => {
                this.addImprintMethods.push({ methodName: 'New Method >>>', pk_methodID: null });
                data["data"].forEach(element => {
                    this.addImprintMethods.push(element);
                });
            });

        this.methodFilteredOptions = this.methodControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value || '')),
        );

        this.locationFilteredOptions = this.locationControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filterLocation(value || '')),
        );

        this.pageNo = 0;

        this.imprintColorsDropdownSettings = {
            singleSelection: false,
            idField: 'fk_collectionID',
            textField: 'collectionName',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 1,
            allowSearchFilter: true,
            limitSelection: 1
        };

        this.runSetup = this._formBuilder.group({
            run: [''],
            setup: ['']
        });

        this.chargeDistribution = this._formBuilder.group({
            charge: [0]
        });

        this.featureForm = new FormGroup({
            items: new FormArray([])
        });

        this.addItem();

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
            { item_id: 8, item_text: 'Price includes a deboss/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout' },
            { item_id: 9, item_text: 'Price includes imprint, setup, and run fees' },
            { item_id: 10, item_text: 'Setups and any other additional fees may apply and will be disclosed prior to checkout' },
            { item_id: 11, item_text: 'Item is sold blank' }
        ];;

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
        this._inventoryService.Suppliers$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((supplier) => {
                this.suppliers = supplier["data"];
                this.dropdownList = this.suppliers;
                this.isSupplierNotReceived = false;
                if (this._inventoryService.productSearchFilter.supplier) {
                    this.selectedSupplier = this._inventoryService.productSearchFilter.supplier;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }, err => {

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the stores
        this._inventoryService.stores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores) => {
                this.stores = stores["data"];
                this.isStoreNotReceived = false;
                if (this._inventoryService.productSearchFilter.store) {
                    this.selectedStore = this._inventoryService.productSearchFilter.store;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            }, err => {

                // Mark for check
                this._changeDetectorRef.markForCheck();
            })
        this.getDistributionCodes();


        const { store, supplier, term, product_id } = this._inventoryService.productSearchFilter;
        if (store) {
            this.onFilterData();
            this.selectByStore(store);
        } else if (supplier) {
            this.onFilterData();
            this.selectBySupplier(supplier);
        } else if (term) {
            this.onFilterData();
            this.searchKeyword(term);
        } else if (product_id) {
            this.onFilterData();
            this.searchByPID(product_id);
        } else {
            // Get the products
            this._inventoryService.products$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((products: ProductsList[]) => {
                    this.products = products["data"];
                    this.productsCount = products["totalRecords"];
                    this.productsOnClearFilter = products["data"];
                    this.productsOnClearFilterCount = products["totalRecords"];

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }



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

        // Color select autocomplete field
        this.colorName.valueChanges.pipe(
            filter((res: any) => {
                return res != null && res.length >= 3;
            }),
            distinctUntilChanged(),
            debounceTime(300),
            tap(() => {
                //   this.errorMsg = "";
                this.results = [];
                this.isColorLoading = true;
            }),
            switchMap(value => this._httpClient.get(environment.products + "?color=true&size=20&color_name=" + value)
                .pipe(
                    finalize(() => {
                        this.isColorLoading = false
                    }),
                )
            )
        )
            .subscribe(data => {
                this.results = data["data"] as any[];
                this._changeDetectorRef.markForCheck();
            });


        // this.colorName.valueChanges.subscribe(
        //     term => {
        //         if (term && term.length > 1) {
        //             this._inventoryService.getSearchedColors(term).subscribe(
        //                 result => {
        //                     this.results = result["data"] as any[];

        //                     // Mark for check
        //                     this._changeDetectorRef.markForCheck();
        //                 })
        //         }
        //     })
    };
    onFilterData() {
        this._inventoryService.products$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductsList[]) => {
                this.productsOnClearFilter = products["data"];
                this.productsOnClearFilterCount = products["totalRecords"];

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    searchLicensingTerm(event): void {
        const value = event.target.value;
        this.licensingTerms = this.dummyLicensingTerms.filter((item: any) => {
            return item.term.toLowerCase().includes(value.toLowerCase());
        });
        this._changeDetectorRef.markForCheck();
    };

    createItem(): FormGroup {
        return this._formBuilder.group({
            order: ['1'],
            feature: ['', Validators.required]
        });
    };

    addItem(): void {
        this.items = this.featureForm.get('items') as FormArray;
        this.items.push(this.createItem());
    };

    removeFeature(index: number): void {
        this.items = this.featureForm.get('items') as FormArray;
        this.items.removeAt(index);
    };

    getCoOps(): void {
        // Get the CoOps
        this._inventoryService.getProductCoops(this.supplierId)
            .subscribe((coops) => {
                this.coops = coops["data"];

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }, err => {
                this.getCoOps();

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    updateCost(event, selectField) {
        const { distrDiscount, distrDiscountCode } = event.value;
        const discountedValue = 1 - distrDiscount;
        if (distrDiscountCode == "COST") {
            return;
        };

        if (selectField == "standardCostOne") {

            if (distrDiscountCode == '0') {
                this.netCostForm.patchValue({
                    standardCostOne: this.netCostDefaultStandardCost.standardCostOne
                });
            }
            const { standardCostOne } = this.netCostForm.getRawValue();
            this.netCostForm.patchValue({
                standardCostOne: standardCostOne ? Number((standardCostOne * discountedValue)).toFixed(3) : null
            });

        } else if (selectField == "standardCostTwo") {

            if (distrDiscountCode == '0') {
                this.netCostForm.patchValue({
                    standardCostTwo: this.netCostDefaultStandardCost.standardCostTwo
                });
            }
            const { standardCostTwo } = this.netCostForm.getRawValue();
            this.netCostForm.patchValue({
                standardCostTwo: standardCostTwo ? Number((standardCostTwo * discountedValue)).toFixed(3) : null
            });

        } else if (selectField == "standardCostThree") {

            if (distrDiscountCode == '0') {
                this.netCostForm.patchValue({
                    standardCostThree: this.netCostDefaultStandardCost.standardCostThree
                });
            }
            const { standardCostThree } = this.netCostForm.getRawValue();
            this.netCostForm.patchValue({
                standardCostThree: standardCostThree ? Number((standardCostThree * discountedValue)).toFixed(3) : null
            });

        } else if (selectField == "standardCostFour") {

            if (distrDiscountCode == '0') {
                this.netCostForm.patchValue({
                    standardCostFour: this.netCostDefaultStandardCost.standardCostFour
                });
            }
            const { standardCostFour } = this.netCostForm.getRawValue();
            this.netCostForm.patchValue({
                standardCostFour: standardCostFour ? Number((standardCostFour * discountedValue)).toFixed(3) : null
            });

        } else if (selectField == "standardCostFive") {

            if (distrDiscountCode == '0') {
                this.netCostForm.patchValue({
                    standardCostFive: this.netCostDefaultStandardCost.standardCostFive
                });
            }
            const { standardCostFive } = this.netCostForm.getRawValue();
            this.netCostForm.patchValue({
                standardCostFive: standardCostFive ? Number((standardCostFive * discountedValue)).toFixed(3) : null
            });

        } else if (selectField == "standardCostSix") {

            if (distrDiscountCode == '0') {
                this.netCostForm.patchValue({
                    standardCostSix: this.netCostDefaultStandardCost.standardCostSix
                });
            }
            const { standardCostSix } = this.netCostForm.getRawValue();
            this.netCostForm.patchValue({
                standardCostSix: standardCostSix ? (standardCostSix * discountedValue).toFixed(3) : null
            });

        };

    };

    setDropdownValue(value: string) {
        this.selectedDropdown = this.distributionCodes.find(item => item.distrDiscountCode === value);
        const { distrDiscount } = this.selectedDropdown;

        const sample = {
            standardCostDropOne: this.selectedDropdown,
            standardCostDropTwo: this.selectedDropdown,
            standardCostDropThree: this.selectedDropdown,
            standardCostDropFour: this.selectedDropdown,
            standardCostDropFive: this.selectedDropdown,
            standardCostDropSix: this.selectedDropdown
        };

        this.netCostForm.patchValue(sample);

        if (this.netCostDefaultStandardCost) {
            // this.netCostForm.patchValue({
            //     standardCostOne: this.netCostDefaultStandardCost.standardCostOne,
            //     standardCostTwo: this.netCostDefaultStandardCost.standardCostTwo,
            //     standardCostThree: this.netCostDefaultStandardCost.standardCostThree,
            //     standardCostFour: this.netCostDefaultStandardCost.standardCostFour,
            //     standardCostFive: this.netCostDefaultStandardCost.standardCostFive,
            //     standardCostSix: this.netCostDefaultStandardCost.standardCostSix
            // });

            const { standardCostOne, standardCostTwo, standardCostThree, standardCostFour, standardCostFive, standardCostSix } = this.netCostForm.getRawValue();

            const sample = {
                standardCostOne: standardCostOne ? Number((standardCostOne * (1 - distrDiscount)).toFixed(3)) : null,
                standardCostTwo: standardCostTwo ? Number((standardCostTwo * (1 - distrDiscount)).toFixed(3)) : null,
                standardCostThree: standardCostThree ? Number((standardCostThree * (1 - distrDiscount)).toFixed(3)) : null,
                standardCostFour: standardCostFour ? Number((standardCostFour * (1 - distrDiscount)).toFixed(3)) : null,
                standardCostFive: standardCostFive ? Number((standardCostFive * (1 - distrDiscount)).toFixed(3)) : null,
                standardCostSix: standardCostSix ? Number((standardCostSix * (1 - distrDiscount)).toFixed(3)) : null
            };

            this.netCostForm.patchValue(sample);
        };
    };

    getDistributionCodes(): void {
        // Get distribution code for cost dropdowns
        this._inventoryService.distributionCodes$
            .subscribe((response) => {
                this.distributionCodes = response["data"];
                if (this.distributionCodes.length) {
                    const countryDefault = this.distributionCodes.find(c => c.distrDiscount == -1);
                    this.netCostForm.patchValue({
                        standardCostDropOne: countryDefault,
                        standardCostDropTwo: countryDefault,
                        standardCostDropThree: countryDefault,
                        standardCostDropFour: countryDefault,
                        standardCostDropFive: countryDefault,
                        standardCostDropSix: countryDefault
                    });
                };

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }, err => {
                this.getDistributionCodes();

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    getAllSuppliers(): void {
        // Get the suppliers
        this._inventoryService.Suppliers$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((supplier) => {
                this.suppliers = supplier["data"];
                this.dropdownList = this.suppliers;
                this.isSupplierNotReceived = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }, err => {

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    clearFields(): void {
        const sample = {
            standardCostOne: "",
            standardCostTwo: "",
            standardCostThree: "",
            standardCostFour: "",
            standardCostFive: "",
            standardCostSix: ""
        };
        this.netCostForm.patchValue(sample);
    };

    getAllStores(): void {
        // Get the stores
        this._inventoryService.stores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores) => {
                this.stores = stores["data"];
                this.isStoreNotReceived = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }, err => {

                // Mark for check
                this._changeDetectorRef.markForCheck();
            })
    }

    onItemSelect(item: any) {
        const { pk_companyID, companyName } = item;
        this.selectedItems = item;
        this.supplierId = pk_companyID;
        this.supplierName = companyName;
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
    };

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    selectByStore(event): void {
        const pk_storeID = event;
        this._inventoryService.productSearchFilter.store = pk_storeID;
        this.isFiltering = true;
        this.isLoading = true;
        // Get the products by selected suppliers
        this._inventoryService.getProductsByStoreId(pk_storeID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductsList[]) => {
                this.products = products["data"];
                this.productsCount = products["totalRecords"];
                this.isLoading = false;
                this.selectedSupplier = "All Suppliers";

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    selectBySupplier(event): void {
        const pk_companyID = event;
        this._inventoryService.productSearchFilter.supplier = pk_companyID;

        this.isFiltering = true;
        this.isLoading = true;
        // Get the products by selected suppliers
        this._inventoryService.getProductsBySupplierId(pk_companyID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductsList[]) => {
                this.products = products["data"];
                this.productsCount = products["totalRecords"];
                this.isLoading = false;
                this.selectedStore = "All Stores";

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    clearFilter() {
        this._inventoryService.productSearchFilter.supplier = null;
        this._inventoryService.productSearchFilter.store = null;
        this._inventoryService.productSearchFilter.product_id = null;
        this._inventoryService.productSearchFilter.term = null;
        this.isLoading = true;
        this.products = this.productsOnClearFilter;
        this.productsCount = this.productsOnClearFilterCount;
        this.selectedStore = "All Stores";
        this.selectedSupplier = "All Suppliers";
        this.isLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    };

    resetRunValue(): void {
        this.colorForm.patchValue({
            run: ['0.00']
        });
    };

    // copyColorToHex() {
    //     this.hexColor = this.colorValue
    // };

    changeColor(event) {
        const { value } = event.target;
        this.colorValue = value;
    };

    removeNull(array) {
        return array.filter(x => x !== null)
    };

    getFOBLocations() {
        this.fobLocationLoader = true;
        let params = {
            company: true,
            fob_location: true,
            supplier_id: this.supplierId
        }
        this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.fobLocationLoader = false;

            this.FOBLocations = res["data"];
            this.FOBLocations.forEach(element => {
                this.checkedFOBLocations.push(element.pk_FOBLocationID);
            });
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.fobLocationLoader = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    changeFobLocations(item, ev) {
        let checked = ev.checked;
        if (checked) {
            const index = this.checkedFOBLocations.findIndex(elem => elem == item.pk_FOBLocationID);
            if (index < 0) {
                this.checkedFOBLocations.push(item.pk_FOBLocationID);
            }
        } else {
            const index = this.checkedFOBLocations.findIndex(elem => elem == item.pk_FOBLocationID);
            this.checkedFOBLocations.splice(index, 1);
        }
    }

    createProduct(): void {
        const firstFormGroup = this.firstFormGroup.getRawValue();
        const finalForm = this.reviewForm.getRawValue();

        const { radio } = firstFormGroup;
        const { supplierLink, mainDescription, miniDescription, flatRate, weight, doChargesApply, unitsInWeight, caseWidth, caseLength, caseHeight, overPackageCharge, keywords, productNumber, productName, msrp, internalComments } = finalForm;

        const { firstQuantity, secondQuantity, thirdQuantity, fourthQuantity, fifthQuantity, sixthQuantity, standardCostOne, standardCostTwo, standardCostThree, standardCostFour, standardCostFive, standardCostSix } = finalForm;
        const { quantityOne, quantityTwo, quantityThree, quantityFour, quantityFive, quantitySix, productDimensions, productWidth, productHeight, productLength, allowGroupRun } = finalForm;

        let quantityList = [parseInt(firstQuantity) || null, parseInt(secondQuantity) || null, parseInt(thirdQuantity) || null, parseInt(fourthQuantity) || null, parseInt(fifthQuantity) || null, parseInt(sixthQuantity) || null];
        quantityList = this.removeNull(quantityList);

        let standardCost = [parseFloat(standardCostOne) || null, parseFloat(standardCostTwo) || null, parseFloat(standardCostThree) || null, parseFloat(standardCostFour) || null, parseFloat(standardCostFive) || null, parseFloat(standardCostSix) || null];
        standardCost = this.removeNull(standardCost);

        let caseQuantitiesList = [parseInt(quantityOne) || null, parseInt(quantityTwo) || null, parseInt(quantityThree) || null, parseInt(quantityFour) || null, parseInt(quantityFive) || null, parseInt(quantitySix) || null]
        caseQuantitiesList = this.removeNull(caseQuantitiesList);

        const productId = null;

        // const productDimensions = [
        //     productWidth ? productWidth : 0,
        //     productHeight ? productHeight : 0,
        //     productLength ? productLength : 0
        // ];

        const shipping = {
            bln_include_shipping: doChargesApply == "Yes" ? 1 : 0,
            fob_locations: this.checkedFOBLocations,
            prod_time_max: this.sliderMaxValue || 10,
            prod_time_min: this.sliderMinValue || 7,
            units_in_shipping_package: 1
        };

        const physics = {
            bln_apparel: radio.name === "Apparel Item" ? true : false,
            dimensions: productDimensions,
            over_pack_charge: overPackageCharge || null,
            product_id: productId,
            shipping: shipping,
            weight: weight || null,
            weight_in_units: unitsInWeight || null
        };

        const flatRateObj = {
            flat_rate_shipping: flatRate || null,
            product_id: null
        };

        const caseDimension = {
            case_height: caseHeight || null,
            case_length: caseLength || null,
            case_width: caseWidth || null,
            product_id: null
        };

        const caseQuantities = {
            case_quantities: caseQuantitiesList,
            product_id: null
        };

        let netCost = this.netCostPayloadBoolean ? {
            blank_cost_list: [],
            coop_id: this.selectedCooP || null,
            cost_comment: internalComments || null,
            cost_list: [...new Set(standardCost)],
            live_cost_comment: this.redPriceCommentText || null,
            msrp: msrp || null,
            product_id: productId,
            quantity_list: [...new Set(quantityList)]
        } : null;

        let keywordsString = null;
        if (keywords.length) {
            keywordsString = keywords;
        } else if (this.fruits.length) {
            const keywordsSliced = this.fruits.slice(0, 10)
            let names = keywordsSliced.map(function (item) {
                return item['name'];
            });
            keywordsString = names.toString().replace(/'/g, "-");
        };

        const description = {
            name: productName,
            product_number: productNumber,
            description: true,
            product_desc: mainDescription?.replace(/'/g, "''") || null,
            mini_desc: miniDescription?.replace(/'/g, "''") || null,
            keywords: keywordsString ? keywordsString : null,
            notes: null,
            purchase_order_notes: null,
            supplier_link: supplierLink || null,
            meta_desc: miniDescription?.replace(/'/g, "''") || null,
            sex: this.supplierType == "Apparel Item" ? Number(this.selectedSex) : 0,
            search_keywords: keywords || null,
            last_update_by: null,
            last_update_date: null,
            update_history: null,
            product_id: productId
        };

        let featureArray = [];
        const features = this.featureForm.getRawValue();
        for (const item of features["items"]) {
            const { order, feature } = item;
            featureArray.push({
                attribute_type_id: 1,
                attribute_text: feature,
                supplier_id: this.supplierId,
                product_id: null,
                order: order,
                user_full_name: null
            })
        };

        let uniqueFeatures = this.uniqueFeaturesPayload ? [...new Map(featureArray.map(item => [item["attribute_text"], item])).values()] : null;

        let licensing = this.licensingTermPayloadBoolean ? {
            licensing_term_id: this.selectedRadioOption.fk_licensingTermID,
            sub_category_id: this.selectedRadioOption.pk_licensingTermSubCategoryID,
            call_type: null,
            licensing_term: true
        } : null;

        const { colors, run, hex } = this.colorForm.getRawValue();
        var colorTempArray = colors?.length ? colors.split(',') : [];
        let colorArr = [];
        if (colorTempArray.length) {
            for (const color of colorTempArray) {
                colorArr.push(color.replace(/[^\w]/g, ""));
            }
        };

        let colorObj = this.colorPayload ? {
            product_id: null,
            color_name: colorArr?.length ? colorArr : [],
            color_id: [],
            the_run: [run],
            rgb: [hex || this.hexColor],
            color: true
        } : null;

        const payload = {
            product: true,
            supplier_id: this.supplierId,
            item_type: radio.name === "Apparel Item" ? 2 : 1,
            bln_group_run: allowGroupRun,
            permalink: null,
            description: description,
            physics: physics,
            flat_rate: flatRateObj,
            case_dimension: caseDimension,
            case_quantities: caseQuantities,
            shipping: shipping,
            net_cost: netCost,
            licensing_term: licensing,
            feature: uniqueFeatures,
            color: colorObj,
            imprint: this.imprintPayloadBoolean ? this.imprintPayload : null
        };

        this.createProductLoader = true;

        this._inventoryService.checkIfProductExist(productNumber, productName, this.supplierId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                const isDataExist = response["data_exists"];

                if (isDataExist) {
                    this.createProductLoader = false;
                    this._snackBar.open(`This product already exists under ${response["data"][0].companyName}`, '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                        duration: 3500
                    });
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                } else {
                    this._inventoryService.addProduct(payload)
                        .subscribe((response) => {
                            this.showFlashMessage(
                                response["success"] === true ?
                                    'success' :
                                    'error'
                            );
                            this.createProductLoader = false;
                            let productId = response["product_id"];
                            this._router.navigate([`/apps/ecommerce/inventory/${productId}`]);

                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        }, err => {
                            this._snackBar.open("Some error occured", '', {
                                horizontalPosition: 'center',
                                verticalPosition: 'bottom',
                                duration: 3500
                            });
                            this.createProductLoader = false;

                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
                }
            }, err => {
                this._snackBar.open("Some error occured", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                this.createProductLoader = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedProduct = null;
    };

    expansionOpened(license): void {
        const { pk_licensingTermID } = license;
        this.selectedTermObject = null;
        if (this.selectedExpansionLicensingTerm != pk_licensingTermID || this.selectedExpansionLicensingTerm == null) {
            this.expansionLoader = true;
            this.selectedExpansionLicensingTerm = pk_licensingTermID;
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
        };
    };

    selectedRadio(item: MatRadioChange) {
        this.selectedRadioOption = item.value;
    };

    selectedSubCategory(item) {
        this.selectedTermObject = item;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    };

    onSearchChange(event): void {
        this.productNumberText = event.target.value;

        if (this.productNumberText.includes("_")) {

            // check if product number has underscore to remove
            this.productNumberText = this.productNumberText.substring(0, this.productNumberText.indexOf('_'));
        };

        // Check for production number text
        if (this.productNumberText.startsWith("#")) {
            // check if product number has hash to remove
            this.productNumberText = this.productNumberText.replace('#', '');
        };
    };
    htmlDecode(str) {
        var div = document.createElement("div");
        div.innerHTML = str;
        return div.textContent || div.innerText;
    }
    fetchProductNumberData(): void {
        if (!this.supplierId) {
            this._snackBar.open("Please select a supplier", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };

        if (!this.productNumberText) {
            this._snackBar.open("Enter product number to fetch data", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };

        this.productNumberLoader = true;
        this.featureForm = new FormGroup({
            items: new FormArray([])
        });
        this._inventoryService.getPromoStandardProductDetails(this.productNumberText, this.supplierId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((productDetails) => {
                this.addItem();
                if (!productDetails["data"].success) {
                    this._snackBar.open("No data found for this supplier and product number", '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                        duration: 3500
                    });
                    this.productNumberLoader = false;

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                } else {
                    let customColorData = productDetails["data"]["result"]["Product"]["ProductPartArray"];
                    customColorData.forEach(element => {
                        if (element.ColorArray) {
                            element.ColorArray.forEach(colors => {
                                const index = this.customColorsList.findIndex(c => c.colorName.toLowerCase() == colors.colorName.toLowerCase());
                                if (index == -1) {
                                    this.customColorsList.push({ colorId: null, colorName: colors.colorName, image: null, run: '0.0', hex: colors.hex });
                                }
                            });
                        }
                    });
                    // Map Product Data
                    const { success } = productDetails["data"];
                    if (success) {
                        this.blnPromoStandard = true;
                        const details = productDetails["data"].result.Product;
                        let detailsDescription = "";
                        if (Array.isArray(details.description)) {
                            this.removeFeature(0);
                            details.description.forEach((element, index) => {
                                this.addItem();
                                setTimeout(() => {
                                    this.items.at(index).setValue({
                                        feature: element,
                                        order: index + 1
                                    });
                                }, 100);

                                // this.featureForm.get('items').con = element;
                            });

                            let val = !Array.isArray(details.description) ? [details.description] : details.description;
                            detailsDescription = details?.description.join('.').trim();
                        } else {
                            detailsDescription = details?.description;
                        }
                        // this.productId = details.productId;
                        const product = {
                            productName: this.htmlDecode(details.productName.replace(details?.productId, "").replace('.', '')),
                            productNumber: this.htmlDecode(details.productId),
                            brandName: this.htmlDecode(details.productBrand),
                            mainDescription: detailsDescription,
                            miniDescription: "Mini description"
                        };

                        if ("ProductKeywordArray" in details) {
                            const string = details.ProductKeywordArray[0].keyword;
                            if (string?.length) {
                                for (const value of string.split(',')) {
                                    let temp = {
                                        name: value
                                    }
                                    this.fruits.push(temp);
                                };
                            };
                        } else {
                            this.fruits = [];
                        }
                        this.secondFormGroup.patchValue(product);
                        if (this.supplierId == 25) {
                            if (customColorData[0]["ShippingPackageArray"]) {
                                this.secondFormGroup.patchValue({
                                    unitsInWeight: customColorData[0]["ShippingPackageArray"][0].quantity,
                                    unitsInShippingPackage: customColorData[0]["ShippingPackageArray"][0].quantity
                                });
                            }
                        }
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    } else {
                        this._snackBar.open("Product details not found", '', {
                            horizontalPosition: 'center',
                            verticalPosition: 'bottom',
                            duration: 3500
                        });
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    }
                    //  End Mapping

                    this._inventoryService.getPromoStandardProductPricingDetails(this.productNumberText, this.supplierId)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((productPricing) => {
                            if (productPricing["data"]["success"]) {
                                this._snackBar.open("Data fetched successfully", '', {
                                    horizontalPosition: 'center',
                                    verticalPosition: 'bottom',
                                    duration: 3500
                                });

                                this.pricingDataArray = productPricing["data"]["result"]["Envelope"]["Body"]["GetConfigurationAndPricingResponse"]["Configuration"]["PartArray"];

                                this.productNumberLoader = false;
                                // Move To Next Step
                                setTimeout(() => {
                                    this.myStepper.next();
                                    this._changeDetectorRef.markForCheck();
                                }, 200);
                                // End Next Step
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                            } else {
                                this._snackBar.open("Data not found against this product number", '', {
                                    horizontalPosition: 'center',
                                    verticalPosition: 'bottom',
                                    duration: 3500
                                });

                                const product = {
                                    productName: null,
                                    productNumber: null,
                                    brandName: null,
                                    mainDescription: null
                                };

                                // this.fruits = [];
                                // this.secondFormGroup.patchValue(product);
                                this.pricingDataArray = [];
                                this.productNumberLoader = false;
                                // Move To Next Step
                                setTimeout(() => {
                                    this.myStepper.next();
                                    this._changeDetectorRef.markForCheck();
                                }, 200);
                                // End Next Step
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                            };

                        }, err => {
                            this._snackBar.open("Some error occured", '', {
                                horizontalPosition: 'center',
                                verticalPosition: 'bottom',
                                duration: 3500
                            });
                            this.productNumberLoader = false;

                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
                }

            }, err => {
                this._snackBar.open("Some error occured", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                this.productNumberLoader = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    skipStep(stepper: MatStepper) {
        const { selectedIndex } = stepper;

        if (selectedIndex == 2) {
            this.netCostPayload = null;
            this.netCostPayloadBoolean = false;
        };

        if (selectedIndex == 3) {
            this.licensingTermPayload = null;
            this.licensingTermPayloadBoolean = false;
        };

        if (selectedIndex == 4) {
            this.featureForm.disable();
            this.uniqueFeaturesPayload = false;
        };

        if (selectedIndex == 5) {
            this.colorForm.disable();
            this.colorPayload = false;
        };

        if (selectedIndex == 6) {
            this.imprintPayload = null;
            this.imprintPayloadBoolean = false;
        };

        stepper.next();
    };

    goBack(stepper: MatStepper) {
        const { selectedIndex } = stepper;

        if (selectedIndex == 3) {
            this.netCostPayloadBoolean = true;
        };

        if (selectedIndex == 4) {
            this.licensingTermPayloadBoolean = true;
        };

        if (selectedIndex == 5) {
            this.featureForm.enable();
            this.uniqueFeaturesPayload = true;
        };

        if (selectedIndex == 6) {
            this.colorForm.enable();
            this.colorPayload = true;
        };

        if (selectedIndex == 4) {
            this.imprintPayloadBoolean = true;
        };

        stepper.previous();
    };

    goForward(stepper: MatStepper) {
        const { selectedIndex } = stepper;
        if (selectedIndex === 0) {
            if (!this.selectedItems) {
                this._snackBar.open("Please select a supplier", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                return;
            };

        };

        if (selectedIndex === 1) {
            const { mainDescription } = this.secondFormGroup.getRawValue();
            if (!mainDescription) {
                this._snackBar.open("Main description is required", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                return;
            };

            if (!this.fruits.length) {
                this._snackBar.open("Please add keywords", '', {
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
                this.getFOBLocations();
                this.secondFormGroup.controls['brandName'].disable();
                this.reviewForm.controls['brandName'].disable();
            };
        };

        // Net Cost screen



        if (selectedIndex === 6) {
            // const setupRunForm = this.runSetup.getRawValue();
            // const { run, setup } = setupRunForm;

            // if (!this.selectedLocation) {
            //     this._snackBar.open("New LOCATION was not specified correctly", '', {
            //         horizontalPosition: 'center',
            //         verticalPosition: 'bottom',
            //         duration: 3500
            //     });
            //     return;
            // };

            // if (this.areaValue === "") {
            //     this._snackBar.open("Imprint AREA has not been defined correctly.", '', {
            //         horizontalPosition: 'center',
            //         verticalPosition: 'bottom',
            //         duration: 3500
            //     });
            //     return;
            // };

            // if (this.defaultImprintColorSpecification === 'Yes') {
            //     if (!this.collectionIdsArray.length && !this.customColorId) {
            //         this._snackBar.open("Select a color collection", '', {
            //             horizontalPosition: 'center',
            //             verticalPosition: 'bottom',
            //             duration: 3500
            //         });
            //         return;
            //     };
            // };

            // if (run === "" || setup === "") {
            //     this._snackBar.open("Select a SETUP or RUN charge", '', {
            //         horizontalPosition: 'center',
            //         verticalPosition: 'bottom',
            //         duration: 3500
            //     });

            //     return;
            // };

            // let processMode;
            // if (this.favoriteSeason === 'Per color (i.e. silk screening, pad printing, etc.)') {
            //     processMode = 0;
            // } else if (this.favoriteSeason === 'Per Stitch (embroidering)') {
            //     processMode = 1;
            // } else if (this.favoriteSeason === 'Simple Process (i.e. laser engraving, full color, etc.)') {
            //     processMode = 2;
            // };

            // let second, third, fourth, fifth;
            // let multiValue;
            // if (processMode === 0) {
            //     const {
            //         twoColorQ,
            //         threeColorQ,
            //         fourColorQ,
            //         fiveColorQ
            //     } = this.values.getRawValue();
            //     second = twoColorQ;
            //     third = threeColorQ;
            //     fourth = fourColorQ;
            //     fifth = fiveColorQ;
            // };

            // const payload = {
            //     product_id: null,
            //     decorator_id: this.supplierId || null,
            //     method_id: this.selectedMethod.pk_methodID || null,
            //     location_id: this.selectedLocation.pk_locationID || null,
            //     digitizer_id: processMode == 1 ? this.selectedDigitizer.pfk_digitizerID : null,
            //     setup_charge_id: setup || 17,
            //     run_charge_id: run || 17,
            //     bln_includable: this.priceInclusionSelected.value === 'Yes' ? 1 : 0,
            //     area: this.areaValue,
            //     multi_color_min_id: 1,
            //     bln_user_color_selection: this.defaultImprintColorSpecification === 'Yes' ? 1 : 0,
            //     max_colors: this.defaultImprintColorSpecification === 'Yes' ? this.maxColorSelected : null,
            //     collection_id: this.collectionIdsArray.length ? this.selectedCollectionId[0].fk_collectionID : Number(this.customColorId),
            //     bln_process_mode: processMode,
            //     min_product_qty: this.minQuantity || 1,
            //     imprint_comments: this.addImprintComment || "",
            //     bln_active: 1,
            //     bln_singleton: this.imprintItselfSelected.value === 'Yes' ? true : false,
            //     bln_color_selection: this.defaultImprintColorSpecification === 'Yes' ? true : false,
            //     imprint_id: null,
            //     store_product_id_list: [],
            //     imprint_image: null,
            //     display_order: this.addImprintDisplayOrderValue || 1,
            //     imprint: true
            // };

            // if (payload.bln_process_mode === 0) {
            //     this._inventoryService.getMultiColorValue(second, third, fourth, fifth)
            //         .pipe(takeUntil(this._unsubscribeAll))
            //         .subscribe((multi_color) => {
            //             multiValue = multi_color["data"];
            //             payload.multi_color_min_id = multiValue?.length ? multiValue[0].pk_multiColorMinQID : 1;
            //             this.imprintPayload = payload;
            //             this._changeDetectorRef.markForCheck();
            //         });
            // } else {
            //     this.imprintPayload = payload;
            // };
        };

        stepper.next();
    };

    selectionChange(event) {
        const { radio } = this.firstFormGroup.value;
        const { name } = radio;
        const { selectedIndex, previouslySelectedIndex } = event;
        if (selectedIndex == 6) {
            this.getImprintsList(1);
        }
        if (previouslySelectedIndex > selectedIndex) {
            if (selectedIndex == 2) {
                this.netCostPayloadBoolean = true;
            };

            if (selectedIndex == 3) {
                this.licensingTermPayloadBoolean = true;
            };

            if (selectedIndex == 4) {
                this.featureForm.enable();
                this.uniqueFeaturesPayload = true;
            };

            if (selectedIndex == 5) {
                this.colorForm.enable();
                this.colorPayload = true;
            };

            if (selectedIndex == 6) {

                this.imprintPayloadBoolean = true;
            };
            return;
        };
        if (name != 'Apparel Item') {
            this.getSizes = false;
        }
        if (selectedIndex == 7 && name == 'Apparel Item') {
            this.getSizes = true;
        }

        // Description screen
        if (selectedIndex === 1) {

            const { radio } = this.firstFormGroup.value;
            const { name } = radio;
            this.supplierType = name;
            if (this.supplierType === 'Normal Promotional Material') {
                this.getFOBLocations();
                this.secondFormGroup.controls['brandName'].disable();
                this.reviewForm.controls['brandName'].disable();
            };

            this.getCoOps();
        };
        // Net Cost
        if (selectedIndex === 1) {
            const { radio } = this.firstFormGroup.value;
            const { name } = radio;
            let obj = {
                standardCostOne: null,
                standardCostTwo: null,
                standardCostThree: null,
                standardCostFour: null,
                standardCostFive: null,
                standardCostSix: null,
                firstQuantity: null,
                secondQuantity: null,
                thirdQuantity: null,
                fourthQuantity: null,
                fifthQuantity: null,
                sixthQuantity: null
            };
            let cost = [];
            let quantity = []

            let checkPrice = null;
            for (let i = 0; i <= 5; i++) {
                if (typeof (this.pricingDataArray[i]) == "object") {
                    if ("PartPriceArray" in this.pricingDataArray[i]) {
                        const { minQuantity, price } = this.pricingDataArray[i]["PartPriceArray"][0];
                        checkPrice = price;
                    }
                }
            }
            if (name === 'Normal Promotional Material') {
                if (this.pricingDataArray?.length) {
                    for (let i = 0; i <= 5; i++) {
                        if (typeof (this.pricingDataArray[i]) == "object") {
                            if ("PartPriceArray" in this.pricingDataArray[i]) {
                                const { minQuantity, price } = this.pricingDataArray[i]["PartPriceArray"][0];

                                if (i == 0) {
                                    quantity[i] = minQuantity;
                                    cost[i] = checkPrice;
                                }

                                if (i == 1) {
                                    quantity[i] = minQuantity + 1;
                                    cost[i] = checkPrice;
                                }

                                if (i == 2) {
                                    quantity[i] = minQuantity + 2;
                                    cost[i] = checkPrice;
                                }

                                if (i == 3) {
                                    cost[i] = checkPrice;
                                    quantity[i] = minQuantity + 3;
                                }

                                if (i == 4) {
                                    cost[i] = checkPrice;
                                    cost[i + 1] = checkPrice;
                                    quantity[i] = minQuantity + 4;
                                    quantity[i + 1] = minQuantity + 5;
                                }

                                if (i == 5) {
                                    obj["sixthQuantity"] = minQuantity;
                                    obj["standardCostSix"] = checkPrice;
                                }
                            };
                        };
                    };
                    // cost = cost.filter((value, index, self) => self.indexOf(value) === index)
                    cost.forEach((element, index) => {
                        if (index == 0) {
                            this.netCostDefaultStandardCost = { standardCostOne: element };
                            obj["standardCostOne"] = element;
                            obj["firstQuantity"] = quantity[index];
                        }
                        if (index == 1) {
                            this.netCostDefaultStandardCost = { standardCostTwo: element };
                            obj["standardCostTwo"] = element;
                            obj["secondQuantity"] = quantity[index];
                        }
                        if (index == 2) {
                            this.netCostDefaultStandardCost = { standardCostThree: element };
                            obj["standardCostThree"] = element;
                            obj["thirdQuantity"] = quantity[index];
                        }
                        if (index == 3) {
                            this.netCostDefaultStandardCost = { standardCostFour: element };
                            obj["standardCostFour"] = element;
                            obj["fourthQuantity"] = quantity[index];
                        }
                        if (index == 4) {
                            this.netCostDefaultStandardCost = { standardCostFive: element };
                            obj["standardCostFive"] = element;
                            obj["fifthQuantity"] = quantity[index];
                        }
                        if (index == 5) {
                            this.netCostDefaultStandardCost = { standardCostSix: element };
                            obj["standardCostSix"] = element;
                            obj["sixthQuantity"] = quantity[index];
                        }
                    });
                    // this.netCostDefaultStandardCost = {
                    //     standardCostOne: obj["standardCostOne"],
                    //     standardCostTwo: obj["standardCostTwo"],
                    //     standardCostThree: obj["standardCostThree"],
                    //     standardCostFour: obj["standardCostFour"],
                    //     standardCostFive: obj["standardCostFive"],
                    //     standardCostSix: obj["standardCostSix"]
                    // };

                } else {
                    obj = {
                        firstQuantity: null,
                        secondQuantity: null,
                        thirdQuantity: null,
                        fourthQuantity: null,
                        fifthQuantity: null,
                        sixthQuantity: null,
                        standardCostOne: null,
                        standardCostTwo: null,
                        standardCostThree: null,
                        standardCostFour: null,
                        standardCostFive: null,
                        standardCostSix: null
                    };
                }
            } else {
                if (this.pricingDataArray?.length) {
                    for (let i = 0; i <= 5; i++) {
                        if (typeof (this.pricingDataArray[i]) == "object") {
                            if ("PartPriceArray" in this.pricingDataArray[i]) {
                                const { price } = this.pricingDataArray[i]["PartPriceArray"][0];
                                if (!checkPrice) {
                                    checkPrice = price;
                                }
                                if (checkPrice > price) {
                                    checkPrice = price;
                                }
                                if (i == 0) {
                                    // obj["standardCostOne"] = price
                                    cost[i] = checkPrice
                                }

                                if (i == 1) {
                                    cost[i] = checkPrice
                                    // obj["standardCostTwo"] = price
                                }

                                if (i == 2) {
                                    cost[i] = checkPrice
                                    // obj["standardCostThree"] = price
                                }

                                if (i == 3) {
                                    cost[i] = checkPrice
                                    // obj["standardCostFour"] = price
                                }

                                if (i == 4) {
                                    // obj["standardCostFive"] = price
                                    cost[i] = checkPrice
                                    cost[i + 1] = checkPrice

                                    // obj["standardCostSix"] = price
                                }

                                // if (i == 5) {
                                //     obj["standardCostSix"] = price
                                // }
                            };
                        };
                    };

                    // cost = cost.filter((value, index, self) => self.indexOf(value) === index)
                    cost.forEach((element, index) => {
                        if (index == 0) {
                            this.netCostDefaultStandardCost = { standardCostOne: element };
                            obj["standardCostOne"] = element;
                        }
                        if (index == 1) {
                            this.netCostDefaultStandardCost = { standardCostTwo: element };
                            obj["standardCostTwo"] = element;
                        }
                        if (index == 2) {
                            this.netCostDefaultStandardCost = { standardCostThree: element };
                            obj["standardCostThree"] = element;
                        }
                        if (index == 3) {
                            this.netCostDefaultStandardCost = { standardCostFour: element };
                            obj["standardCostFour"] = element;
                        }
                        if (index == 4) {
                            this.netCostDefaultStandardCost = { standardCostFive: element };
                            obj["standardCostFive"] = element;
                        }
                        if (index == 5) {
                            this.netCostDefaultStandardCost = { standardCostSix: element };
                            obj["standardCostSix"] = element;
                        }
                    });
                    // this.netCostDefaultStandardCost = {
                    //     standardCostOne: obj["standardCostOne"],
                    //     standardCostTwo: obj["standardCostTwo"],
                    //     standardCostThree: obj["standardCostThree"],
                    //     standardCostFour: obj["standardCostFour"],
                    //     standardCostFive: obj["standardCostFive"],
                    //     standardCostSix: obj["standardCostSix"]
                    // };
                } else {
                    // obj = {
                    //     standardCostOne: null,
                    //     standardCostTwo: null,
                    //     standardCostThree: null,
                    //     standardCostFour: null,
                    //     standardCostFive: null,
                    //     standardCostSix: null
                    // };
                    obj.standardCostOne = null,
                        obj.standardCostTwo = null,
                        obj.standardCostThree = null,
                        obj.standardCostFour = null,
                        obj.standardCostFive = null,
                        obj.standardCostSix = null
                }
            };
            this.netCostForm.patchValue(obj);
        };
        // Licensing term screen
        if (selectedIndex === 3) {
            if (!this.licensingTerms.length) {
                // this.getLicenceTerms();
                // Get licensing company

            };
        };

        // Imprint screen callings
        if (selectedIndex === 2) {
            this.reviewsecondFormGroup.patchValue(this.secondFormGroup);
            // Get imprint methods
            this.getImprintMethods();

            // Get imprint digitizers
            this.getImprintDigitizers();
        };

        // Review Screen
        if (selectedIndex === 7 || selectedIndex == 8) {
            const finalForm = this.secondFormGroup.getRawValue();
            const { supplierLink, mainDescription, miniDescription, flatRate, weight, doChargesApply, unitsInWeight, caseWidth, caseLength, caseHeight, overPackageCharge, keywords, productNumber, productName, msrp, internalComments, productDimensions } = finalForm;

            const { firstQuantity, secondQuantity, thirdQuantity, fourthQuantity, fifthQuantity, sixthQuantity, standardCostOne, standardCostTwo, standardCostThree, standardCostFour, standardCostFive, standardCostSix } = finalForm;
            const { quantityOne, quantityTwo, quantityThree, quantityFour, quantityFive, quantitySix, productWidth, productHeight, productLength, allowGroupRun } = finalForm;
            this.reviewsecondFormGroup.patchValue(finalForm);
            // this.isReviewFormReached = true;
            // this.reviewFormSliderMaxValue = this.sliderMaxValue;
            // this.reviewFormSliderMinValue = this.sliderMinValue;
            // const firstForm = this.firstFormGroup.value;
            // const secondForm = this.secondFormGroup.value;
            // const thirdForm = this.netCostForm.value;
            // const finalForm = {
            //     ...firstForm,
            //     ...secondForm,
            //     ...thirdForm
            // };

            // this.reviewForm.patchValue(finalForm);
        };
    };
    getLicenceTerms() {
        this.licensingTermLoader = true;
        this._inventoryService.getLicensingCompany()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((licensingCompany) => {
                if (licensingCompany["totalRecords"] > 0) {
                    this._inventoryService.addProductGetLicensingTerms()
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((licensingTerms) => {
                            this.licensingTerms = licensingTerms["data"];
                            this.dummyLicensingTerms = this.licensingTerms;
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
    }
    setRun(e, value) {
        e.preventDefault();
        this.runSetup.controls['run'].setValue(value);
    };

    setSetup(e, value) {
        e.preventDefault();
        this.runSetup.controls['setup'].setValue(value);
    };

    getRunSetup() {
        if (!this.distributionCodes.length) {
            this.runSetupLoaderFetching = true;
            this._inventoryService.distributionCodes$
                .subscribe((response) => {
                    this.runSetupLoaderFetching = false;
                    this.runSetupDistributorCodes = response["data"];
                    this.selectedDiscountCode = this.runSetupDistributorCodes[0];

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        } else {
            this.runSetupDistributorCodes = this.distributionCodes;
            this.selectedDiscountCode = this.runSetupDistributorCodes[0];

            // Mark for check
            this._changeDetectorRef.markForCheck();
        };

    };

    getCharges() {
        const chargeForm = this.chargeDistribution.getRawValue();
        const { charge } = chargeForm;
        const { distrDiscount } = this.selectedDiscountCode;
        const roundedDiscount = distrDiscount.toFixed(5);
        const intCharge = Number(charge);
        let chargeValue = intCharge * (1 - roundedDiscount);
        chargeValue = Math.round(chargeValue * 10000) / 10000;

        this.getChargesLoader = true;
        this._inventoryService.getChargeValue(chargeValue)
            .subscribe((charges) => {
                if (!charges["data"]?.length) {
                    const errorLog = `No charges containing ${intCharge} x (1-${roundedDiscount}) = ${chargeValue} were found. Check your inputs or add a new charge.`;
                    this._snackBar.open(errorLog, '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                        duration: 3500
                    });
                    this.getChargesLoader = false;
                    this.chargesTableArray = [];

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    return;
                }

                let chargeArray = [];
                for (const response of charges["data"]) {
                    const { fk_chargeID } = response;
                    chargeArray.push(fk_chargeID)
                };

                this._inventoryService.getChargeValuesData(chargeArray.toString())
                    .subscribe((chargeValues) => {
                        this.getChargesLoader = false;

                        const responseArray = chargeValues["data"];
                        var array = responseArray,
                            grouped = Array.from(array.reduce((m, o) =>
                                m.set(o.fk_chargeID, (m.get(o.fk_chargeID) || []).concat(o)), new Map).values());

                        let tempArray = [];
                        for (const group of grouped) {
                            let array: any = group;
                            const obj = {
                                groupedObj: array,
                                uniqueProductQuantities: [...new Set(array.map(item => item.productQuantity))].sort(function (a: number, b: number) {
                                    return a - b;
                                }),
                                uniqueProcessQuantity: [...new Set(array.map(item => item.processQuantity))].sort(function (a: number, b: number) {
                                    return a - b;
                                })
                            };
                            tempArray.push(obj);
                        };

                        for (let i = 0; i < tempArray.length; i++) {
                            let array = tempArray[i].groupedObj;
                            let combinedChunkArray = [];
                            let processQuantities = tempArray[i]["uniqueProcessQuantity"];
                            let productQuantities = tempArray[i]["uniqueProductQuantities"];
                            let temporary = [];
                            for (let j = 0; j < processQuantities.length; j++) {
                                for (let k = 0; k < productQuantities.length; k++) {
                                    const data = this.returnChargeValueForAddImrpint(processQuantities[j], productQuantities[k], array);
                                    const charge = data[0].charge;
                                    combinedChunkArray.push([processQuantities[j], productQuantities[k], Math.round(charge * 1000) / 1000]);
                                }
                                temporary.push({
                                    renderedArray: this.filterByIds(combinedChunkArray, processQuantities[j]),
                                    verticalColumnName: processQuantities[j]
                                });
                            };

                            tempArray[i]["rowsRendering"] = temporary;
                            tempArray[i]["chargeId"] = array[0].fk_chargeID;
                        };

                        this.chargesTableArray = tempArray;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    }, err => {
                        this.getChargesLoader = false;

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    })
            });
    };

    filterByIds(data, value) {
        let temp = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i][0] === value) {
                temp.push(data[i]);
            }
        };
        return temp;
    };

    returnChargeValueForAddImrpint(processQuantity, productQuantity, array) {
        return array.filter(function (currentElement) {
            return currentElement.processQuantity === processQuantity && currentElement.productQuantity === productQuantity;
        })
    };

    generateCollectionId() {
        this.getImprintColorCollectionLoader = true;
        this.getSupplierColorCollections();
        this._inventoryService.getCollectionIds(this.supplierId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((collection_ids) => {
                this.collectionIdsArray = collection_ids["data"];
                this.collectionIdsArray = this.collectionIdsArray.filter((value, index, self) =>
                    index === self.findIndex((t) => (
                        t.place === value.place && t.fk_collectionID === value.fk_collectionID
                    ))
                )

                if (!this.collectionIdsArray.length) {
                    this._snackBar.open("No collections have been specified for this supplier.", '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                        duration: 3500
                    });
                    this.getImprintColorCollectionLoader = false;

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    return;
                };

                if (this.collectionIdsArray.length) {
                    // this.selectedCollectionId = this.collectionIdsArray[0]
                }
                this.getImprintColorCollectionLoader = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }, err => {
                this._snackBar.open("Unable to fetch imprint colors right now. Try again", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                this.getImprintColorCollectionLoader = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };
    getSupplierColorCollections() {
        let params = {
            supplier_available_colors: true,
            supplier_id: this.supplierId
        }
        this._inventoryService.getProductsData(params)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((colors) => {
                this.colorsCollectionIdsArray = colors["data"];
                this._changeDetectorRef.markForCheck();
            }, err => {
                this._snackBar.open("Unable to fetch imprint colors right now. Try again", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    onImprintColorSelect(item: any) {
        this.selectedCollectionId = [item];
        this.customColorId = item["fk_collectionID"];
    };

    addArea(value: string): void {
        this.areaValue = value;
    };

    addMinQuantity(value: number): void {
        this.minQuantity = value;
    }

    addImprintComments(value: string): void {
        this.addImprintComment = value;
    }

    addImprintDisplayOrder(value: number): void {
        this.addImprintDisplayOrderValue = value;
    }

    getImprintMethods() {
        this.addImprintMethods = [];
        this._inventoryService.getAllImprintMethods('')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((methods) => {
                // this.addImprintMethods = methods["data"];
                // this.selectedMethod = this.addImprintMethods.find(x => x.pk_methodID === 254) || this.addImprintMethods[0];
                // this.methodControl.setValue(this.selectedMethod.methodName);

                this.addImprintMethods.push({ methodName: 'New Method >>>', pk_methodID: null });
                this.addImprintMethods = [...this.addImprintMethods, ...methods["data"]];
                this.selectedMethod = this.addImprintMethods.find(x => x.pk_methodID === 254) || this.addImprintMethods[0];
                this.methodControl.setValue(this.selectedMethod.methodName);
                this.getImprintLocations();

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }, err => {
                this.getImprintMethods();

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    getImprintLocations() {
        this.addImprintLocations = [];
        this._inventoryService.getAllImprintLocations('')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((location) => {
                // this.selectedLocation = this.addImprintLocations[0];
                // this.locationControl.setValue(this.selectedLocation.locationName);

                this.addImprintLocations.push({ locationName: 'New Location >>>', pk_locationID: null });
                this.addImprintLocations = [...this.addImprintLocations, ...location["data"]];
                if (this.addImprintLocations) {
                    // const { pk_locationID } = data
                    this.selectedLocation = { locationName: 'New Location >>>', pk_locationID: null };
                    this.locationControl.setValue(this.selectedLocation.locationName);
                    // this.selectedLocation = this.addImprintLocations.find(x => x.pk_locationID === pk_locationID) || this.addImprintLocations[0];
                    // this.locationControl.setValue(this.selectedLocation.locationName);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }, err => {
                this.getImprintLocations();

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    getImprintDigitizers() {
        this._inventoryService.getAllDigitizers()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((digitizers) => {
                this.addImprintDigitizers = digitizers["data"];
                this.selectedDigitizer = this.addImprintDigitizers[0];

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }, err => {
                this.getImprintDigitizers();

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    };

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
    };

    updateQuantityQuickLinks(str: string) {
        const netCostFormValues = this.netCostForm.getRawValue();

        if (str == "secondQuantity") {
            const { firstQuantity } = netCostFormValues;
            this.netCostForm.patchValue({
                secondQuantity: firstQuantity * 2
            });
            this.reviewForm.patchValue({
                secondQuantity: firstQuantity * 2
            });
        } else if (str == "thirdQuantity") {
            const { secondQuantity } = netCostFormValues;
            this.netCostForm.patchValue({
                thirdQuantity: secondQuantity * 2
            });
            this.reviewForm.patchValue({
                thirdQuantity: secondQuantity * 2
            });
        } else if (str == "fourthQuantity") {
            const { thirdQuantity } = netCostFormValues;
            this.netCostForm.patchValue({
                fourthQuantity: thirdQuantity * 2
            });
            this.reviewForm.patchValue({
                fourthQuantity: thirdQuantity * 2
            });
        } else if (str == "fifthQuantity") {
            const { fourthQuantity } = netCostFormValues;
            this.netCostForm.patchValue({
                fifthQuantity: fourthQuantity * 2
            });
            this.reviewForm.patchValue({
                fifthQuantity: fourthQuantity * 2
            });
        } else if (str == "sixthQuantity") {
            const { fifthQuantity } = netCostFormValues;
            this.netCostForm.patchValue({
                sixthQuantity: fifthQuantity * 2
            });
            this.reviewForm.patchValue({
                sixthQuantity: fifthQuantity * 2
            });
        };

    };

    changeIsCustom(): void {
        this.isCustomRedPrice = !this.isCustomRedPrice
    };

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
    };

    searchByPID(event): void {
        let keyword = event ? event : '';

        if (!keyword) {
            this._inventoryService.productSearchFilter.product_id = null;
            this._snackBar.open("Enter PID to search", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };
        this.isLoading = true;
        this._inventoryService.productSearchFilter.product_id = keyword;
        this._inventoryService.getProductByProductId(keyword)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products) => {
                this.products = products["data"];
                this.productsCount = products["totalRecords"];
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }, err => {
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            })
    };

    searchKeyword(event): void {
        let keyword = event ? event : '';
        if (!keyword) {
            this._inventoryService.productSearchFilter.term = null;
            this._snackBar.open("Enter text to search", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };
        this.isLoading = true;
        this._inventoryService.productSearchFilter.term = keyword;

        this._inventoryService.searchProductKeywords(keyword)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products) => {
                this.products = products["data"];
                this.productsCount = products["totalRecords"];
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }, err => {
                this._snackBar.open("Some error occured", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    resetSearch(): void {
        this._inventoryService.productSearchFilter = {
            product_id: null,
            term: null,
            supplier: null,
            store: null
        };
        // Get the products
        this._inventoryService.products$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductsList[]) => {
                this.products = products["data"];
                this.productsCount = products["totalRecords"];
                this.backListLoader = false;
                this.selectedStore = "All Stores";
                this.selectedSupplier = "All Suppliers";
                this.enableProductAddForm = false;
                this.firstFormLoader = false;
            });
    };

    productDetails(productId) {
        this.isLoading = true;
        this._router.navigate([`/apps/ecommerce/inventory/${productId}`]);
    };

    getProductsList(): void {
        // Add products form multi stepper back to products

        this.backListLoader = true;  // Loader for the button

        // Get the products
        this._inventoryService.products$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductsList[]) => {
                this.products = products["data"];
                this.productsCount = products["totalRecords"];
                this.backListLoader = false;
                this.selectedStore = "All Stores";
                this.selectedSupplier = "All Suppliers";
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
                if (licensingCompany["totalRecords"] > 0) {
                    this._inventoryService.addProductGetLicensingTerms()
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((licensingTerms) => {
                            this.licensingTerms = licensingTerms["data"];
                            this.dummyLicensingTerms = this.licensingTerms;
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
            this._inventoryService.Suppliers$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((supplier) => {
                    this.suppliers = supplier["data"];
                    this.firstFormLoader = false;
                    this.enableProductAddForm = true;

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                })
        }
    };

    exportLoaderToggle(): void {
        this.exportLoader = !this.exportLoader;
    };

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
    };

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
    };

    // Add Product Details
    checkProductExistOrNot() {
        const finalForm = this.secondFormGroup.getRawValue();
        const { productNumber, productName } = finalForm;
        if (!this.supplierId) {
            this._snackBar.open("Supplier is required", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        }
        if (!productNumber) {
            this._snackBar.open("Product Number is required", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        }
        if (!productName) {
            this._snackBar.open("Product Name is required", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        }
        this.checkProductExistOrNotLoader = true;
        this._changeDetectorRef.markForCheck();
        this._inventoryService.checkIfProductExist(productNumber, productName, this.supplierId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                const isDataExist = response["data_exists"];
                this.checkProductExistOrNotLoader = false;
                if (isDataExist) {
                    this._snackBar.open(`This product already exists under ${response["data"][0].companyName}`, '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                        duration: 3500
                    });
                    // Mark for check
                } else {
                    this._snackBar.open("Product does not exists", '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                        duration: 3500
                    });
                }
                this._changeDetectorRef.markForCheck();
            }, err => {
                this._snackBar.open("Something went wrong", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                this.checkProductExistOrNotLoader = false;
                this._changeDetectorRef.markForCheck();
            });
    }
    addProductDetail() {
        const firstFormGroup = this.firstFormGroup.getRawValue();
        const finalForm = this.secondFormGroup.getRawValue();
        const { radio } = firstFormGroup;

        const { supplierLink, mainDescription, miniDescription, flatRate, weight, doChargesApply, unitsInWeight, caseWidth, caseLength, caseHeight, overPackageCharge, keywords, productNumber, productName, msrp, internalComments, unitsInShippingPackage } = finalForm;

        const { firstQuantity, secondQuantity, thirdQuantity, fourthQuantity, fifthQuantity, sixthQuantity, standardCostOne, standardCostTwo, standardCostThree, standardCostFour, standardCostFive, standardCostSix } = finalForm;
        const { quantityOne, quantityTwo, quantityThree, quantityFour, quantityFive, quantitySix, productDimensions, productWidth, productHeight, productLength, allowGroupRun } = finalForm;

        if (!productName) {
            this._snackBar.open("Product Name is required", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };
        if (!productNumber) {
            this._snackBar.open("Product Number is required", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };
        if (!mainDescription) {
            this._snackBar.open("Main description is required", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };
        if (!miniDescription) {
            this._snackBar.open("Meta description is required", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };

        if (!this.fruits.length) {
            this._snackBar.open("Please add keywords", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };
        this.createProductDetailLoader = true;
        let quantityList = [parseInt(firstQuantity) || null, parseInt(secondQuantity) || null, parseInt(thirdQuantity) || null, parseInt(fourthQuantity) || null, parseInt(fifthQuantity) || null, parseInt(sixthQuantity) || null];
        quantityList = this.removeNull(quantityList);

        let standardCost = [parseFloat(standardCostOne) || null, parseFloat(standardCostTwo) || null, parseFloat(standardCostThree) || null, parseFloat(standardCostFour) || null, parseFloat(standardCostFive) || null, parseFloat(standardCostSix) || null];
        standardCost = this.removeNull(standardCost);

        let caseQuantitiesList = [parseInt(quantityOne) || null, parseInt(quantityTwo) || null, parseInt(quantityThree) || null, parseInt(quantityFour) || null, parseInt(quantityFive) || null, parseInt(quantitySix) || null]
        caseQuantitiesList = this.removeNull(caseQuantitiesList);
        let productId;
        if (this.productId) {
            productId = this.productId;
        } else {
            productId = null;
            this.productId = null;
        }
        // const productDimensions = [
        //     productWidth ? productWidth : 0,
        //     productHeight ? productHeight : 0,
        //     productLength ? productLength : 0
        // ];

        const shipping = {
            bln_include_shipping: doChargesApply == "Yes" ? 1 : 0,
            fob_locations: this.checkedFOBLocations,
            prod_time_max: this.sliderMaxValue || 10,
            prod_time_min: this.sliderMinValue || 7,
            units_in_shipping_package: unitsInShippingPackage ? unitsInShippingPackage : 0
        };

        const physics = {
            bln_apparel: radio.name === "Apparel Item" ? true : false,
            dimensions: productDimensions,
            over_pack_charge: overPackageCharge || null,
            product_id: productId,
            shipping: shipping,
            weight: weight || null,
            weight_in_units: Number(unitsInWeight) || null
        };

        const flatRateObj = {
            flat_rate_shipping: Number(flatRate) || null,
            product_id: productId
        };

        const caseDimension = {
            case_height: Number(caseHeight) || null,
            case_length: Number(caseLength) || null,
            case_width: Number(caseWidth) || null,
            product_id: productId
        };

        const caseQuantities = {
            case_quantities: caseQuantitiesList,
            product_id: productId
        };

        let keywordsString = null;
        if (keywords.length) {
            keywordsString = keywords;
        } else if (this.fruits.length) {
            const keywordsSliced = this.fruits.slice(0, 10)
            let names = keywordsSliced.map(function (item) {
                return item['name'];
            });
            keywordsString = names.toString().replace(/'/g, "-");
        };

        const description = {
            name: String(productName.replace(/'/g, '"')),
            product_number: String(productNumber),
            product_desc: String(mainDescription?.replace(/'/g, "''")) || null,
            mini_desc: String(miniDescription?.replace(/'/g, "''")) || null,
            keywords: String(keywordsString) ? String(keywordsString) : null,
            notes: null,
            purchase_order_notes: null,
            supplier_link: String(supplierLink) || null,
            meta_desc: String(miniDescription?.replace(/'/g, "''")) || null,
            sex: this.supplierType == "Apparel Item" ? Number(this.selectedSex) : 0,
            search_keywords: String(keywords) || null,
            last_update_by: null,
            last_update_date: null,
            update_history: null,
            product_id: productId,
            supplier_id: this.supplierId,
            permalink: null
        };
        let payload = {
            description: description,
            physics: physics,
            item_type: radio.name === "Apparel Item" ? 2 : 1,
            supplier_id: this.supplierId,
            flat_rate: flatRateObj,
            case_dimension: caseDimension,
            case_quantities: caseQuantities,
            shipping: shipping,
            technologo_sku: null,
            blnPromoStandard: this.blnPromoStandard,
            bln_group_run: allowGroupRun,
            create_product: true
        }
        if (!this.productId) {
            this.createProductDetailLoader = true;
            this._changeDetectorRef.markForCheck();
            this._inventoryService.checkIfProductExist(productNumber, productName, this.supplierId)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((response: any) => {
                    const isDataExist = response["data_exists"];
                    if (isDataExist) {
                        this.createProductDetailLoader = false;
                        this._snackBar.open(`This product already exists under ${response["data"][0].companyName}`, '', {
                            horizontalPosition: 'center',
                            verticalPosition: 'bottom',
                            duration: 3500
                        });
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    } else {
                        this._inventoryService.createProductDetail(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                            this.createProductDetailLoader = false;
                            this.productStepComplete = true;
                            setTimeout(() => {
                                this.stepperIndex = res["product_id"];
                                this.myStepper.next();

                            }, 200);
                            this._changeDetectorRef.markForCheck();
                            this.productId = res["product_id"];
                        }, err => {
                            this._snackBar.open("Something went wrong", '', {
                                horizontalPosition: 'center',
                                verticalPosition: 'bottom',
                                duration: 3500
                            });
                            this.createProductDetailLoader = false;
                            this._changeDetectorRef.markForCheck();
                        })
                    }
                }, err => {
                    this._snackBar.open("Something went wrong", '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                        duration: 3500
                    });
                    this.createProductDetailLoader = false;
                    this._changeDetectorRef.markForCheck();
                });
        } else {
            let payload = {
                name: String(productName.replace(/'/g, '"')),
                product_number: productNumber.replace(/'/g, '"'),
                product_desc: String(mainDescription?.replace(/'/g, "''")) || null,
                mini_desc: String(miniDescription?.replace(/'/g, "''")) || null,
                keywords: String(keywordsString) ? String(keywordsString) : null,
                notes: null,
                supplier_link: String(supplierLink) || null,
                meta_desc: String(miniDescription?.replace(/'/g, "''")) || null,
                sex: this.supplierType == "Apparel Item" ? Number(this.selectedSex) : 0,
                search_keywords: String(keywords) || null,
                purchase_order_notes: null,
                last_update_by: null,
                last_update_date: null,
                update_history: null,
                product_id: this.productId,
                supplier_id: this.supplierId,
                permalink: null,
                flat_rate_shipping: Number(flatRate) || null,
                prod_time_max: this.sliderMaxValue || 10,
                prod_time_min: this.sliderMinValue || 7,
                units_in_shipping_package: unitsInShippingPackage ? unitsInShippingPackage : 0,
                bln_include_shipping: doChargesApply == "Yes" ? 1 : 0,
                fob_locations: this.checkedFOBLocations,
                dimensions: String(productDimensions).replace(/'/g, '"'),
                weight: weight || null,
                weight_in_units: Number(unitsInWeight) || null,
                over_pack_charge: overPackageCharge || null,
                bln_apparel: radio.name === "Apparel Item" ? true : false,
                update_new_product: true
            }
            this._inventoryService.UpdateProductDescription(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                this.createProductDetailLoader = false;
                this.productStepComplete = true;
                setTimeout(() => {
                    this.stepperIndex = this.productId;
                    this.myStepper.next();
                }, 200);
                this.productId = this.productId;
                this._changeDetectorRef.markForCheck();
            }, err => {
                this._snackBar.open("Something went wrong", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                this.createProductDetailLoader = false;
                this._changeDetectorRef.markForCheck();
            })
        }
    }
    addLicencingTerm() {
        if (!this.selectedTermObject) {
            this._snackBar.open("Please select one sub category", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };
        this.updateProductLicensingLoader = true;
        let payload = {
            product_id: this.productId,
            licensing_term_id: this.selectedTermObject.fk_licensingTermID,
            sub_category_id: this.selectedTermObject.pk_licensingTermSubCategoryID,
            create_product_licensing: true
        };
        this._inventoryService.updateProductLicensingTerm(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.updateProductLicensingLoader = false;
            this.myStepper.next();
            this._changeDetectorRef.markForCheck();
        }, err => {
            this._snackBar.open("Something went wrong", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            this.updateProductLicensingLoader = false;
            this._changeDetectorRef.markForCheck();
        })
    }
    addProductFeatures() {
        let featureArray = [];
        const features = this.featureForm.getRawValue();
        for (const item of features["items"]) {
            const { order, feature } = item;
            featureArray.push({
                attribute_type_id: 1,
                attribute_text: feature.replace(/'/g, "''"),
                supplier_id: this.supplierId,
                order: Number(order),
                user_full_name: null
            })
        };

        let uniqueFeatures = [...new Map(featureArray.map(item => [item["attribute_text"], item])).values()];
        this.updateProductFeatureLoader = true;
        let payload = {
            product_id: this.productId,
            features: uniqueFeatures,
            create_product_feature: true
        };
        this._inventoryService.UpdateProductFeature(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.updateProductFeatureLoader = false;
            this.myStepper.next();
            this._changeDetectorRef.markForCheck();
        }, err => {
            this._snackBar.open("Something went wrong", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            this.updateProductFeatureLoader = false;
            this._changeDetectorRef.markForCheck();
        })
    }
    // Colors
    addCustomColors(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        // Add our fruit
        if (value) {
            if (this.customColorsList.length == 0) {
                this.customColorsList.push({ colorId: null, colorName: value, image: null, run: '0.0', hex: '' });
            } else {
                const index = this.customColorsList.findIndex(color => color.colorName == value);
                if (index >= 0) {
                    this._snackBar.open("Color already exist in the list", '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                        duration: 3000
                    });
                } else {
                    this.customColorsList.push({ colorId: null, colorName: value, image: null, run: '0.0', hex: '' });
                }
            }
        }
        // Clear the input value
        event.chipInput!.clear();
    }

    removeCustomColor(color): void {
        const index = this.customColorsList.findIndex(colors => colors.colorName == color.colorName);
        if (index >= 0) {
            this.customColorsList.splice(index, 1);
        }
    }
    colorSelected(result: any): void {
        if (this.selectedColorsList.length == 0) {
            this.selectedColorsList.push({ colorId: result.pk_colorID, colorName: result.colorName });
            this.selectedColorsListArray.push({ colorId: result.pk_colorID, colorName: result.colorName, image: null, run: '0.0', hex: '' });
        } else {
            var obj = this.selectedColorsList.filter((val) => {
                return val.colorId == result.pk_colorID;
            });
            if (obj.length == 0) {
                this.selectedColorsList.push({ colorId: result.pk_colorID, colorName: result.colorName });
                this.selectedColorsListArray.push({ colorId: result.pk_colorID, colorName: result.colorName, image: null, run: '0.0', hex: '' });
                this.colorName.setValue('');
                this.colorTempImage = null;
            }
        }
        this.selectedColor = result;
        this.colorName.setValue(null);
    };
    addProductColor() {
        // const { run, hex } = this.colorsForm.getRawValue();
        // const { pk_colorID } = this.selectedColor;


        // if (!pk_colorID) {
        //     return this._snackBar.open("Please select color", '', {
        //         horizontalPosition: 'center',
        //         verticalPosition: 'bottom',
        //         duration: 3500
        //     });
        // };
        // if (this.imageValue) {
        //     const { imageUpload, type } = this.imageValue;
        //     if (imageUpload) {
        //         let paylaod = {
        //             imageUpload: imageUpload,
        //             type: type,
        //             name: pk_colorID
        //         }
        //         this.uploadColorMedia(paylaod);
        //     }
        // }
        // let colors: any = [];
        // this.selectedColorsList.forEach(element => {
        //     colors.push({
        //         color_id: element.colorId,
        //         the_run: run,
        //         rgb: hex
        //     })
        // });
        // const payload = {
        //     product_id: this.productId,
        //     create_product_color: true,
        //     colors: colors
        // };

        // this.updateProductColorLoader = true;
        // this._changeDetectorRef.markForCheck();
        // this._inventoryService.UpdateProductColors(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((response) => {
        //     this.updateProductColorLoader = false;
        //     this.myStepper.next();
        //     this._changeDetectorRef.markForCheck();
        // }, err => {
        //     this._snackBar.open("Something went wrong", '', {
        //         horizontalPosition: 'center',
        //         verticalPosition: 'bottom',
        //         duration: 3500
        //     });
        //     this.updateProductColorLoader = false;
        //     this._changeDetectorRef.markForCheck();
        // });
        if (this.selectedColorsListArray.length > 0 || this.customColorsList.length > 0) {

            // Upload Images
            // this.selectedColorsListArray.forEach(element => {
            //     if (element.image) {
            //         let paylaod = {
            //             imageUpload: element.image,
            //             type: 'image/jpeg',
            //             name: element.colorId
            //         }
            //         this.uploadColorMedia(paylaod);
            //     }
            // });

            let colors: any = [];
            this.selectedColorsListArray.forEach(element => {
                colors.push({
                    color_id: element.colorId,
                    the_run: element.run,
                    rgb: element.hex
                })
            });
            let custom_colors = [];
            this.customColorsList.forEach(element => {
                let hex = element.hex ? element.hex : '';
                custom_colors.push({
                    color_name: element.colorName,
                    the_run: element.run,
                    rgb: hex.replace('#', '')
                })
            });
            const payload = {
                product_id: this.productId,
                create_product_color: true,
                colors: colors,
                custom_colors: custom_colors
            };

            this.updateProductColorLoader = true;
            this._changeDetectorRef.markForCheck();
            this._inventoryService.UpdateProductColors(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((response) => {
                this.updateProductColorLoader = false;
                this.myStepper.next();
                this._changeDetectorRef.markForCheck();
            }, err => {
                this._snackBar.open("Something went wrong", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                this.updateProductColorLoader = false;
                this._changeDetectorRef.markForCheck();
            });
        } else {
            this.myStepper.next();
        }
    };
    uploadColorMedia(obj: any) {
        const { imageUpload, name, type } = obj;
        const payload = {
            file_upload: true,
            image_file: imageUpload,
            image_path: `/globalAssets/Products/Colors/${this.productId}/${name}.jpg`
        };
        this._inventoryService.addColorMedia(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((response) => {
            // Mark for check
            this._changeDetectorRef.markForCheck();
        })
    }
    uploadImage(event, index, check): void {
        this.imageValue = null;
        const file = event.target.files[0];
        let type = file["type"];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            this.imageValue = {
                imageUpload: reader.result,
                type: file["type"]
            };
            let image: any = new Image;
            image.src = reader.result;
            image.onload = () => {
                if (image.width != 600 || image.height != 600) {
                    this._snackBar.open("Dimentions allowed are 600px x 600px", '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                        duration: 3500
                    });
                    this.imageValue = null;
                    if (check == 'default') {
                        this.selectedColorsListArray[index]["image"] = null;
                    } else {
                        this.customColorsList[index]["image"] = null;
                    }
                    this.colorTempImage = null;
                    this._changeDetectorRef.markForCheck();
                    return;
                };

                if (type != "image/jpeg") {
                    this._snackBar.open("Image extensions are allowed in JPG", '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                        duration: 3500
                    });
                    this.colorTempImage = null;
                    if (check == 'default') {
                        this.selectedColorsListArray[index]["image"] = null;
                    } else {
                        this.customColorsList[index]["image"] = null;
                    }
                    this._changeDetectorRef.markForCheck();
                    return;
                }
                const base64 = this.imageValue.imageUpload.split(",")[1];
                if (check == 'default') {
                    this.selectedColorsListArray[index]["image"] = base64;
                } else {
                    this.customColorsList[index]["image"] = base64;
                }
                console.clear();
                this._changeDetectorRef.markForCheck();
            };
        }
    };
    // NetCost

    isArraySorted(arr) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i + 1] && (arr[i + 1] > arr[i])) {
                continue;
            } else if (arr[i + 1] && (arr[i + 1] < arr[i])) {
                return false;
            }
        }
        return true;
    }
    isArraySortedDesc(arr) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i + 1] && (arr[i + 1] < arr[i])) {
                continue;
            } else if (arr[i + 1] && (arr[i + 1] > arr[i])) {
                return false;
            }
        }
        return true;
    }

    checkIfArrayIsUnique(myArray) {
        return (new Set(myArray)).size !== myArray.length;
    }
    addNetCost() {

        const { firstQuantity, secondQuantity, thirdQuantity, fourthQuantity, fifthQuantity, sixthQuantity, standardCostOne, standardCostTwo, standardCostThree, standardCostFour, standardCostFive, standardCostSix, standardCostDropOne, standardCostDropTwo, standardCostDropThree, standardCostDropFour, standardCostDropFive, standardCostDropSix, msrp, internalComments, coOp } = this.netCostForm.getRawValue();

        let quantityList = [parseInt(firstQuantity) || null, parseInt(secondQuantity) || null, parseInt(thirdQuantity) || null, parseInt(fourthQuantity) || null, parseInt(fifthQuantity) || null, parseInt(sixthQuantity) || null];
        quantityList = this.removeNull(quantityList);

        let standardCost = [parseFloat(standardCostOne) || null, parseFloat(standardCostTwo) || null, parseFloat(standardCostThree) || null, parseFloat(standardCostFour) || null, parseFloat(standardCostFive) || null, parseFloat(standardCostSix) || null];
        standardCost = this.removeNull(standardCost);

        const realStandardCostList = this.removeNull(standardCost);
        const realQuantityList = this.removeNull(quantityList);


        const quantity_sort = this.isArraySorted(realQuantityList);
        const cost_sort = this.isArraySortedDesc(realStandardCostList);
        const quantity_unique = this.checkIfArrayIsUnique(realQuantityList);
        if (!quantity_sort) {
            this._snackBar.open("Quantity values must be entered in ascending order", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        }
        if (quantity_unique) {
            this._snackBar.open("Quantity values must be unique", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        }
        if (!cost_sort) {
            this._snackBar.open("Costs values must be entered in descending order", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        }
        if (quantityList.length != standardCost.length) {
            this._snackBar.open("Number of quantity list breaks must be equal to number of standard cost breaks", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        }
        // if (!this.checkIfArrayIsUnique(quantityList) || !this.checkIfArrayIsUnique(standardCost)) {
        //     this._snackBar.open("Note: Quantities and Cost should be unique", '', {
        //         horizontalPosition: 'center',
        //         verticalPosition: 'bottom',
        //         duration: 3500
        //     });
        //     return;
        // }
        this.updateProductCostLoader = true;

        let payload = {
            product_id: this.productId,
            quantity_list: quantityList,
            cost_list: standardCost,
            blank_cost_list: [],
            cost_comment: internalComments || null,
            coop_id: this.selectedCooP || null,
            live_cost_comment: this.redPriceCommentText || null,
            msrp: Number(msrp) || null,
            create_product_cost: true
        }
        this._inventoryService.UpdateProductNetCost(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((response) => {
            this.updateProductCostLoader = false;
            this.myStepper.next();
            this._changeDetectorRef.markForCheck();
        }, err => {
            this._snackBar.open("Something went wrong", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            this.updateProductCostLoader = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    // addImprints

    addProductLocalImprints() {
        const setupRunForm = this.runSetup.getRawValue();
        const { run, setup } = setupRunForm;

        if (!this.selectedMethod.pk_methodID && !this.method_name) {
            this._snackBar.open("New Method was not specified correctly", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };

        if (!this.selectedLocation.pk_locationID && !this.location_name) {
            this._snackBar.open("New LOCATION was not specified correctly", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };

        if (this.areaValue === "") {
            this._snackBar.open("Imprint AREA has not been defined correctly.", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };

        if (this.defaultImprintColorSpecification === 'Yes') {
            if (!this.collectionIdsArray.length && !this.customColorId) {
                this._snackBar.open("Select a color collection", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                return;
            };
        };

        if (run === "" || setup === "") {
            this._snackBar.open("Select a SETUP or RUN charge", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });

            return;
        };

        let processMode;
        if (this.favoriteSeason === 'Per color (i.e. silk screening, pad printing, etc.)') {
            processMode = 0;
        } else if (this.favoriteSeason === 'Per Stitch (embroidering)') {
            processMode = 1;
        } else if (this.favoriteSeason === 'Simple Process (i.e. laser engraving, full color, etc.)') {
            processMode = 2;
        };

        let second, third, fourth, fifth;
        let multiValue;
        if (processMode === 0) {
            const {
                twoColorQ,
                threeColorQ,
                fourColorQ,
                fiveColorQ
            } = this.values.getRawValue();
            second = twoColorQ;
            third = threeColorQ;
            fourth = fourColorQ;
            fifth = fiveColorQ;
        };
        let method = '';
        if (this.method_name && !this.selectedMethod.pk_methodID) {
            const index = this.addImprintMethods.findIndex(loc => loc.methodName == this.method_name);
            if (index >= 0) {
                this.selectedMethod = this.addImprintMethods[index];
                method = this.selectedMethod.methodName;
            } else {
                method = this.method_name;
            }
        } else {
            method = this.selectedMethod.methodName;
        }
        let location = '';
        if (this.location_name && !this.selectedLocation.pk_locationID) {
            const index = this.addImprintLocations.findIndex(loc => loc.locationName == this.location_name);
            if (index >= 0) {
                this.selectedLocation = this.addImprintLocations[index];
                location = this.selectedLocation.locationName;
            } else {
                location = this.location_name;
            }
        } else {
            location = this.selectedLocation.locationName;
        }
        const payload = {
            product_id: this.productId,
            decorator_id: this.supplierId || null,
            supplierName: this.supplierName,
            methodName: method,
            method_id: this.selectedMethod.pk_methodID || null,
            locationName: location,
            location_id: this.selectedLocation.pk_locationID || null,
            setup_charge_id: setup || 17,
            run_charge_id: run || 17,
            bln_includable: this.priceInclusionSelected.value === 'Yes' ? 1 : 0,
            area: this.areaValue.replace(/'/g, '"'),
            bln_user_color_selection: this.defaultImprintColorSpecification === 'Yes' ? 1 : 0,
            multi_color_min_id: 1,
            collection_id: this.collectionIdsArray.length ? this.selectedCollectionId[0].fk_collectionID : Number(this.customColorId),
            max_colors: this.defaultImprintColorSpecification === 'Yes' ? this.maxColorSelected : null,
            bln_process_mode: processMode,
            min_product_qty: this.minQuantity || 1,
            imprint_comments: this.addImprintComment || "",
            digitizer_id: processMode == 1 ? this.selectedDigitizer.pfk_digitizerID : null,
            bln_active: 1,
            bln_singleton: this.imprintItselfSelected.value === 'Yes' ? true : false,
            bln_color_selection: this.defaultImprintColorSpecification === 'Yes' ? true : false,
            imprint_id: null,
            store_product_id_list: [],
            imprint_image: null,
            display_order: Number(this.addImprintDisplayOrderValue) || 1,
            create_product_imprint: true,
        };

        let index = this.imprintsLocalList.findIndex(elem => elem.methodName == method && elem.locationName == location);
        if (index > -1) {
            this._snackBar.open("Imprint already listed", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
        } else {
            let imprints = this.imprintsLocalList;
            this.imprintsLocalList = [];
            if (payload.bln_process_mode === 0) {
                this.imprintsLocalListLoader = true;
                this._inventoryService.getMultiColorValue(second, third, fourth, fifth)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((multi_color) => {
                        multiValue = multi_color["data"];
                        payload.multi_color_min_id = multiValue?.length ? multiValue[0].pk_multiColorMinQID : 1;
                        imprints.push(payload)

                        // Clear Imprint Objects 
                        setTimeout(() => {
                            this.imprintsLocalList = imprints;
                            this.location_name = '';
                            this.method_name = '';
                            this.selectedLocation = { locationName: 'New Location >>>', pk_locationID: null };
                            this.selectedMethod = this.addImprintMethods.find(x => x.pk_methodID === 254) || this.addImprintMethods[0];
                            this.runSetup.reset();
                            this.priceInclusionSelected = this.priceInclusionArray[0];
                            this.areaValue = "";
                            this.defaultImprintColorSpecification = 'Yes';
                            this.defaultImprintColorSpecification = 'Yes';
                            this.maxColorSelected = 1;
                            this.addImprintComment = "";
                            this.selectedDigitizer = null;
                            this.imprintItselfSelected.value = 'Yes';
                            this.addImprintDisplayOrderValue = 1;
                            this.locationSearchControl.setValue('');
                            this.methodSearchControl.setValue('');
                            this.favoriteSeason = 'Per color (i.e. silk screening, pad printing, etc.)';
                            this.selectedCollectionId = null;
                            this.customColorId = null;
                            this._changeDetectorRef.markForCheck();
                        }, 100);
                        this._snackBar.open("Imprint listed successfully", '', {
                            horizontalPosition: 'center',
                            verticalPosition: 'bottom',
                            duration: 3500
                        });

                        this.imprintsLocalListLoader = false;
                        this._changeDetectorRef.markForCheck();
                    }, err => {
                        this.imprintsLocalListLoader = false;
                        this._changeDetectorRef.markForCheck();
                    });
            } else {
                imprints.push(payload)
                setTimeout(() => {
                    this.imprintsLocalList = imprints;
                    this.imprintsLocalList = imprints;
                    this.location_name = '';
                    this.method_name = '';
                    this.selectedLocation = { locationName: 'New Location >>>', pk_locationID: null };
                    this.selectedMethod = this.addImprintMethods.find(x => x.pk_methodID === 254) || this.addImprintMethods[0];
                    this.runSetup.reset();
                    this.priceInclusionSelected = this.priceInclusionArray[0];
                    this.areaValue = "";
                    this.defaultImprintColorSpecification = 'Yes';
                    this.defaultImprintColorSpecification = 'Yes';
                    this.maxColorSelected = 1;
                    this.addImprintComment = "";
                    this.selectedDigitizer = null;
                    this.imprintItselfSelected.value = 'Yes';
                    this.addImprintDisplayOrderValue = 1;
                    this.locationSearchControl.setValue('');
                    this.methodSearchControl.setValue('');
                    this.favoriteSeason = 'Per color (i.e. silk screening, pad printing, etc.)';
                    this.selectedCollectionId = null;
                    this.customColorId = null;
                    this._changeDetectorRef.markForCheck();
                }, 100);
                this._changeDetectorRef.markForCheck();
                this._snackBar.open("Imprint listed successfully", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
            }
        }

    }
    removeLocalImprints(index) {
        let imprints = this.imprintsLocalList;
        this.imprintsLocalList = [];
        imprints.splice(index, 1);

        setTimeout(() => {
            this.imprintsLocalList = imprints;
            this._changeDetectorRef.markForCheck();
        }, 100);
    }
    addProductImprints() {
        const { radio } = this.firstFormGroup.getRawValue();
        if (this.imprintsLocalList.length == 0) {
            if (radio.name != 'Apparel Item') {
                this.goToProductDeatailsPage();
            } else {
                this.myStepper.next();
            }
        } else {
            this.updateProductImprintLoader = true;
            let imprints = [];
            this.imprintsLocalList.forEach(element => {
                const { product_id, decorator_id, method_id, location_id, setup_charge_id, run_charge_id, bln_includable, area, bln_user_color_selection, multi_color_min_id, collection_id, max_colors, bln_process_mode, min_product_qty, imprint_comments, digitizer_id, bln_active, bln_singleton, bln_color_selection, imprint_id, store_product_id_list, imprint_image, display_order, methodName, locationName } = element;
                const payload = {
                    decorator_id,
                    method_id,
                    location_id,
                    setup_charge_id,
                    run_charge_id,
                    bln_includable,
                    area: area.replace(/'/g, '"'),
                    bln_user_color_selection,
                    multi_color_min_id,
                    collection_id,
                    max_colors,
                    bln_process_mode,
                    min_product_qty,
                    imprint_comments,
                    digitizer_id,
                    bln_active,
                    bln_singleton,
                    bln_color_selection,
                    imprint_id,
                    store_product_id_list,
                    imprint_image,
                    display_order,
                    method_name: methodName,
                    location_name: locationName
                };
                imprints.push(payload);
            });
            const payload = {
                product_id: this.productId,
                imprints: imprints,
                create_product_imprint: true
            };
            this._inventoryService.UpdateMultiProductImprint(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                this.updateProductImprintLoader = false;
                this._snackBar.open("Imprint saved successfully", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                if (radio.name != 'Apparel Item') {
                    this.goToProductDeatailsPage();
                } else {
                    this.myStepper.next();
                }
                this.imprintsLocalList = [];
                this._changeDetectorRef.markForCheck();
            }, err => {
                this.updateProductImprintLoader = false;
                this._changeDetectorRef.markForCheck();
            });
        }

        // this.updateProductImprintLoader = true;
        // this._changeDetectorRef.markForCheck();
        // if (payload.bln_process_mode === 0) {
        //     this._inventoryService.getMultiColorValue(second, third, fourth, fifth)
        //         .pipe(takeUntil(this._unsubscribeAll))
        //         .subscribe((multi_color) => {
        //             multiValue = multi_color["data"];
        //             payload.multi_color_min_id = multiValue?.length ? multiValue[0].pk_multiColorMinQID : 1;
        //             this.imprintPayload = payload;
        //             this._inventoryService.UpdateProductImprint(this.imprintPayload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        //                 this.updateProductImprintLoader = false;
        //                 // if (this._inventoryService.standardImprints) {
        //                 //     this.saveStandardImprints();
        //                 // }
        //                 this.myStepper.next();
        //                 this._changeDetectorRef.markForCheck();
        //             }, err => {
        //                 this.updateProductImprintLoader = false;
        //                 this._changeDetectorRef.markForCheck();
        //             });
        //         }, err => {
        //             this.updateProductImprintLoader = false;
        //             this._changeDetectorRef.markForCheck();
        //         });
        // } else {
        //     this.imprintPayload = payload;
        //     this._inventoryService.UpdateProductImprint(this.imprintPayload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        //         this.updateProductImprintLoader = false;
        //         this.myStepper.next();
        //         this._changeDetectorRef.markForCheck();
        //     }, err => {
        //         this.updateProductImprintLoader = false;
        //         this._changeDetectorRef.markForCheck();
        //     });
        // };
    }
    goToProductDetails() {
        const firstFormGroup = this.firstFormGroup.getRawValue();
        const finalForm = this.reviewsecondFormGroup.getRawValue();

        const { radio } = firstFormGroup;

        const { supplierLink, mainDescription, miniDescription, flatRate, weight, doChargesApply, unitsInWeight, caseWidth, caseLength, caseHeight, overPackageCharge, keywords, productNumber, productName, msrp, internalComments, unitsInShippingPackage, productDimensions } = finalForm;

        const { firstQuantity, secondQuantity, thirdQuantity, fourthQuantity, fifthQuantity, sixthQuantity, standardCostOne, standardCostTwo, standardCostThree, standardCostFour, standardCostFive, standardCostSix } = finalForm;
        const { quantityOne, quantityTwo, quantityThree, quantityFour, quantityFive, quantitySix, productWidth, productHeight, productLength, allowGroupRun } = finalForm;

        if (!mainDescription) {
            this._snackBar.open("Main description is required", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };
        if (!miniDescription) {
            this._snackBar.open("Meta description is required", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };

        if (!this.fruits.length) {
            this._snackBar.open("Please add keywords", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            return;
        };
        this.reviewProductDetailLoader = true;
        let quantityList = [parseInt(firstQuantity) || null, parseInt(secondQuantity) || null, parseInt(thirdQuantity) || null, parseInt(fourthQuantity) || null, parseInt(fifthQuantity) || null, parseInt(sixthQuantity) || null];
        quantityList = this.removeNull(quantityList);

        let standardCost = [parseFloat(standardCostOne) || null, parseFloat(standardCostTwo) || null, parseFloat(standardCostThree) || null, parseFloat(standardCostFour) || null, parseFloat(standardCostFive) || null, parseFloat(standardCostSix) || null];
        standardCost = this.removeNull(standardCost);

        let caseQuantitiesList = [parseInt(quantityOne) || null, parseInt(quantityTwo) || null, parseInt(quantityThree) || null, parseInt(quantityFour) || null, parseInt(quantityFive) || null, parseInt(quantitySix) || null]
        caseQuantitiesList = this.removeNull(caseQuantitiesList);
        let productId;
        if (this.productId) {
            productId = this.productId;
        }


        let keywordsString = null;
        if (keywords.length) {
            keywordsString = keywords;
        } else if (this.fruits.length) {
            const keywordsSliced = this.fruits.slice(0, 10)
            let names = keywordsSliced.map(function (item) {
                return item['name'];
            });
            keywordsString = names.toString().replace(/'/g, "-");
        };


        let payload = {
            name: String(productName),
            product_number: productNumber,
            product_desc: String(mainDescription?.replace(/'/g, "''")) || null,
            mini_desc: String(miniDescription?.replace(/'/g, "''")) || null,
            keywords: String(keywordsString) ? String(keywordsString) : null,
            notes: null,
            supplier_link: String(supplierLink) || null,
            meta_desc: String(miniDescription?.replace(/'/g, "''")) || null,
            sex: this.supplierType == "Apparel Item" ? Number(this.selectedSex) : 0,
            search_keywords: String(keywords) || null,
            purchase_order_notes: null,
            last_update_by: null,
            last_update_date: null,
            update_history: null,
            product_id: this.productId,
            supplier_id: this.supplierId,
            permalink: null,
            flat_rate_shipping: Number(flatRate) || null,
            prod_time_max: this.sliderMaxValue || 10,
            prod_time_min: this.sliderMinValue || 7,
            units_in_shipping_package: unitsInShippingPackage ? unitsInShippingPackage : 0,
            bln_include_shipping: doChargesApply == "Yes" ? 1 : 0,
            fob_locations: this.checkedFOBLocations,
            dimensions: productDimensions,
            weight: weight || null,
            weight_in_units: Number(unitsInWeight) || null,
            over_pack_charge: overPackageCharge || null,
            bln_apparel: radio.name === "Apparel Item" ? true : false,
            update_new_product: true
        }
        this._inventoryService.UpdateProductDescription(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.reviewProductDetailLoader = false;
            this._router.navigate([`/apps/ecommerce/inventory/${this.productId}`]);
            this.productId = this.productId;
            // this.myStepper.next();
            this._changeDetectorRef.markForCheck();
        }, err => {
            this._snackBar.open("Something went wrong", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
            this.reviewProductDetailLoader = false;
            this._changeDetectorRef.markForCheck();
        })
    }
    goToProductDeatailsPage() {
        this._router.navigate([`/apps/ecommerce/inventory/${this.productId}`]);
    }
    saveStandardImprints(): void {
        const { radio } = this.firstFormGroup.getRawValue();

        this.updateProductImprintLoader = true;
        this._changeDetectorRef.markForCheck();
        let count = 0;
        let imprintsToUpdate = [];
        for (const standardImprint of this._inventoryService.standardImprints) {
            let { sub_standard_imprints } = standardImprint;

            if (!sub_standard_imprints) {
                sub_standard_imprints = [];
            };

            if (sub_standard_imprints.length) {
                for (const sub_standard_imprint of sub_standard_imprints) {
                    if (sub_standard_imprint.isChecked) {
                        imprintsToUpdate.push(sub_standard_imprint);
                    }
                }
            };
            count = count + sub_standard_imprints.filter(function (s) { return s.isChecked }).length;
        };

        if (!count) {

            // return;
        } else {
            this._changeDetectorRef.markForCheck();
            const finalImprintPayload = [];
            for (const imprint of imprintsToUpdate) {
                const {
                    fk_decoratorID,
                    fk_methodID,
                    fk_locationID,
                    fk_setupChargeID,
                    fk_runChargeID,
                    blnIncludable,
                    area,
                    blnUserColorSelection,
                    maxColors,
                    fk_multiColorMinQID,
                    fk_collectionID,
                    blnSingleProcess,
                    minProductQty,
                    imprintComments,
                    fk_digitizerID,
                    blnActive,
                    blnSingleton,
                    pk_standardImprintID,
                    displayOrder
                } = imprint;
                const imprintObj = {
                    product_id: this.productId,
                    decorator_id: fk_decoratorID,
                    method_id: fk_methodID,
                    location_id: fk_locationID,
                    setup_charge_id: fk_setupChargeID,
                    run_charge_id: fk_runChargeID,
                    bln_includable: blnIncludable,
                    area: area,
                    bln_user_color_selection: blnUserColorSelection,
                    max_colors: maxColors,
                    multi_color_min_id: fk_multiColorMinQID,
                    collection_id: fk_collectionID,
                    bln_process_mode: blnSingleProcess,
                    min_product_qty: minProductQty,
                    imprint_comments: imprintComments,
                    digitizer_id: fk_digitizerID,
                    bln_active: blnActive,
                    bln_singleton: blnSingleton,
                    bln_color_selection: blnUserColorSelection,
                    imprint_id: pk_standardImprintID,
                    store_product_id_list: [],
                    display_order: displayOrder
                };
                finalImprintPayload.push(imprintObj);
            }

            const payload = {
                standard_imprint: true,
                imprint_obj: finalImprintPayload
            };

            this._inventoryService.addStandardImprints(payload)
                .subscribe((response) => {
                    this.updateProductImprintLoader = false;
                    this._snackBar.open("Standard Imprints saved successfully", '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                        duration: 3000
                    });
                    if (radio.name != 'Apparel Item') {
                        this.goToProductDeatailsPage();
                    } else {
                        this.myStepper.next();

                    }
                    this._changeDetectorRef.markForCheck();
                }, err => {
                    this.updateProductImprintLoader = false;
                    this._changeDetectorRef.markForCheck();
                })
        }

    }
    // Colors
    copyColorToHex(index, check) {
        if (check == 'default') {
            this.selectedColorsListArray[index]['hex'] = this.colorValue;
        } else {
            this.customColorsList[index]['hex'] = this.colorValue;
        }
    }
    addColorToArrayList() {
        const { run, hex, colorId, colorName, image } = this.colorsForm.getRawValue();
        if (colorId == '') {
            this._snackBar.open("Please select any color", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3000
            });
        } else {
            let color = this.selectedColorsListArray.filter(item => item.colorId == colorId);
            if (color.length > 0) {
                this._snackBar.open("Color already exist", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3000
                });
            } else {
                this.selectedColorsListArray.push({ run: run, hex: hex, colorId: colorId, colorName: colorName, image: image });
                this.colorsForm.patchValue({
                    colorId: '',
                    colorName: '',
                    run: '0.00',
                    hex: '',
                    image: null
                });
                this.colorName.setValue('');
                this.colorTempImage = null;
            }
        }
    }
    removeColorFromArrayList(index) {
        this.selectedColorsListArray.splice(index, 1);
        this.selectedColorsList.splice(index, 1);
    }
    removeColorImage(index, check) {
        if (check == 'default') {
            this.colorTempImage = null;
            this.selectedColorsListArray[index].image = null;
        } else {
            this.colorTempImage = null;
            this.customColorsList[index].image = null;
        }
        this._changeDetectorRef.markForCheck();
    }
    changeProcessMode(ev) {
        if (ev.value == 'Per Stitch (embroidering)') {
            let digitizer = this.addImprintDigitizers.filter(digitizer => digitizer.pk_companyID == this.selectedSupplier);
            if (digitizer) {
                this.selectedDigitizer = digitizer[0];
            }
            this._changeDetectorRef.markForCheck();
        }
    }
    getImprintsList(page?: number) {
        this.imprintGetLoader = true;
        this._changeDetectorRef.markForCheck();
        this._inventoryService.getImprints(this.productId, page)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((imprint) => {
                this.dataSource = imprint["data"];
                this.totalImprints = imprint["totalRecords"];

                this.imprintGetLoader = false;
                this._changeDetectorRef.markForCheck();
            }, err => {
                this.imprintGetLoader = false;
                this._changeDetectorRef.markForCheck();
            });
    }
    getNextImprintsData(event) {
        const { previousPageIndex, pageIndex } = event;
        if (pageIndex > previousPageIndex) {
            this.imprintPage++;
        } else {
            this.imprintPage--;
        };
        this.getImprintsList(this.imprintPage);
    }
}
