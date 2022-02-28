import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { InventoryBrand, InventoryCategory, InventoryPagination, InventoryProduct, InventoryTag, InventoryVendor, ProductsList } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/material/stepper';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

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

    pageSize: number;
    pageNo: number;

    firstFormLoader = false;
    options: any[] = [{ name: 'Mary' }, { name: 'Shelley' }, { name: 'Igor' }];
    filteredOptions: Observable<any[]>;

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

    createProductLoader = false;
    stepperOrientation: Observable<StepperOrientation>;
    favoriteSeason: string;
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

    firstFormGroup = this._formBuilder.group({
        supplierValue: ['', Validators.required],
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
        doChargesApply: ['No'],
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
        quantityOne: [''],
        quantityTwo: [''],
        quantityThree: [''],
        quantityFour: [''],
        quantityFive: [''],
        quantitySix: [''],
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
        redPriceComment: [''],
        coOp: [""]
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
        breakpointObserver: BreakpointObserver
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
        this.pageSize = 10;
        this.pageNo = 0;

        this.filteredOptions = this.firstFormGroup.get("supplierValue").valueChanges.pipe(
            startWith(''),
            map(value => (typeof value === 'string' ? value : value.storeName)),
            map(storeName => (storeName ? this._filter(storeName) : this.options.slice())),
        );

        this.filteredStates = this.netCostForm.get("redPriceComment").valueChanges.pipe(
            startWith(''),
            map(state => (state ? this._filterStates(state) : this.states.slice())),
        );

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
    }

    redPriceDisplayFn(user): string {
        return user && user.name ? user.name : '';
    }

    private _filterStates(value: string): any[] {
        const filterValue = value.toLowerCase();

        return this.states.filter(state => state.name.toLowerCase().includes(filterValue));
    }

    displayFn(user): string {
        return user && user.storeName ? user.storeName : '';
    }

    private _filter(storeName: string): any[] {
        const filterValue = storeName.toLowerCase();

        return this.options.filter(option => option.storeName.toLowerCase().includes(filterValue));
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // If the user changes the sort order...
        this._sort.sortChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                // Reset back to the first page
                this._paginator.pageIndex = 0;

                // Close the details
                this.closeDetails();
            });

        // Get products if sort or page changes
        merge(this._sort.sortChange, this._paginator.page).pipe(
            switchMap(() => {
                this.closeDetails();
                this.isLoading = true;
                return this._inventoryService.getProducts(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
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

    createProduct(): void {
        const featureForm = this.featureForm.getRawValue();
        const netCostForm = this.netCostForm.getRawValue();
        const secondFormGroup = this.secondFormGroup.getRawValue();
        const firstFormGroup = this.firstFormGroup.getRawValue();
        // console.log("featureForm", featureForm)
        // console.log("netCostForm", netCostForm)
        console.log("secondFormGroup", secondFormGroup)
        // console.log("firstFormGroup", firstFormGroup)

        const { supplierValue, radio } = firstFormGroup;
        const { technoLogo, supplierLink, mainDescription, weight, productWidth, productLength, productHeight, caseWidth, caseLength, caseHeight, overPackageCharge } = secondFormGroup;

        const productId = null;

        const shipping = {
            prod_time_min: 0 || null,
            prod_time_max: 5 || null,
            units_in_shipping_package: 1 || null,
            bln_include_shipping: 1 || null,
            fob_location_list: [1, 2]
        };

        const physics = {
            product_id: productId,
            weight: weight || null,
            weight_in_units: 1 || null,
            dimensions: `${productWidth},${productLength},${productHeight}` || null,
            over_pack_charge: overPackageCharge || null,
            bln_apparel: true,
            shipping: shipping || null
        };

        const flatRate = {
            product_id: productId,
            flat_rate_shipping: 1
        };

        const caseDimension = {
            product_id: productId,
            case_height: caseHeight || null,
            case_width: caseWidth || null,
            case_length: caseLength || null
        };
        // `${secondFormGroup.quantityOne},${secondFormGroup.quantityTwo},${secondFormGroup.quantityThree},${secondFormGroup.quantityFour},${secondFormGroup.quantityFive},${secondFormGroup.quantitySix}`
        const caseQuantities = {
            product_id: productId,
            case_quantities: [1, 2, 3] || null
        };

        const netCost = {
            product_id: productId,
            quantity_list: [1, 2, 3],
            cost_list: [1, 2, 3],
            blank_cost_list: [1, 2, 3],
            cost_comment: null,
            live_cost_comment: netCostForm.internalComments || null,
            coop_id: netCostForm.coOp || null,
            msrp: netCostForm.msrp || null
        };

        const description = {
            name: "test",
            product_number: "12354",
            product_desc: secondFormGroup.mainDescription || null,
            mini_desc: secondFormGroup.miniDescription || null,
            keywords: secondFormGroup.keywords || null,
            notes: null,
            supplier_link: secondFormGroup.supplierLink || null,
            meta_desc: secondFormGroup.string || null,
            sex: null,
            search_keywords: secondFormGroup.keywords || null,
            purchase_order_notes: null,
            last_update_by: null,
            last_update_date: null,
            update_history: null,
            product_id: productId
        };

        const payload = {
            product: true,
            supplier_id: supplierValue.pk_storeID || null,
            item_type: radio.name === "Apparel Item" ? 2 : 1,
            technologo_sku: technoLogo || null,
            bln_group_run: false || null,
            permalink: secondFormGroup.supplierLink || null,
            description: description,
            physics: physics,
            flat_rate: flatRate,
            case_dimension: caseDimension,
            case_quantities: caseQuantities,
            shipping: shipping,
            net_cost: netCost
        };
        // console.log("netCost =>", netCost);
        // console.log("caseQuantities =>", caseQuantities);
        // console.log("caseDimension =>", caseDimension);
        // console.log("flatRate =>", flatRate);
        // console.log("physics =>", physics);
        // console.log("shipping =>", shipping);
        console.log("payload =>", payload);
        const data = {
            product: true,
            supplier_id: 160,
            item_type: 2,
            technologo_sku: null,
            bln_group_run: false,
            permalink: "",
            description: {
                name: secondFormGroup.productName,
                product_number: secondFormGroup.productNumber,
                description: true,
                product_desc: "test description",
                mini_desc: null,
                keywords: null,
                notes: null,
                supplier_link: null,
                meta_desc: null,
                sex: null,
                search_keywords: null,
                purchase_order_notes: null,
                last_update_by: null,
                last_update_date: null,
                update_history: null,
                product_id: null
            },
            physics: {
                bln_apparel: true,
                dimensions: ",,",
                over_pack_charge: "",
                product_id: null,
                shipping: {
                    bln_include_shipping: 1,
                    fob_location_list: [1, 2],
                    prod_time_max: 5,
                    prod_time_min: 0,
                    units_in_shipping_package: 1
                },
                weight: null,
                weight_in_units: null
            },
            flat_rate: {
                flat_rate_shipping: 1,
                product_id: null
            },
            case_dimension: {
                case_height: null,
                case_length: null,
                case_width: null,
                product_id: null
            },
            case_quantities: {
                case_quantities: [1, 2, 3, 4],
                product_id: null
            },
            shipping: {
                bln_include_shipping: 1,
                fob_location_list: [2, 4],
                prod_time_max: 5,
                prod_time_min: 0,
                units_in_shipping_package: 1
            },
            net_cost: {
                blank_cost_list: [0, 1, 2],
                coop_id: "",
                cost_comment: "",
                cost_list: [1, 2, 3],
                live_cost_comment: "",
                msrp: "",
                product_id: null,
                quantity_list: [1, 2, 3]
            }
        };

        console.log("data", data)
        this.createProductLoader = true;
        this._inventoryService.addProduct(data)
            .subscribe((response) => {
                this.createProductLoader = false;
                this.showFlashMessage(
                    response["succcess"] === true ?
                        'success' :
                        'error'
                );
            });
    }
    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedProduct = null;
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

        this._inventoryService.getProductByProductId(keyword)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products) => {
                this.products = products["data"];
                this.isLoading = false;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    productDetails(productId) {
        this.isLoading = true;
        this._router.navigate([`/apps/ecommerce/inventory/${productId}`]);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    getList(): void {
        this.backListLoader = true;
        // Get the products
        this._inventoryService.getProductsList(10, 1)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: ProductsList[]) => {
                this.products = products["data"];
                this.productsCount = products["totalRecords"];
                this.backListLoader = true;
                this.firstFormLoader = false;
                this.enableProductAddForm = false;
            });
    }
    enableProductAddFormFn(): void {
        this.firstFormLoader = true;
        this._inventoryService.getAllStores()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((supplier) => {
                this.firstFormLoader = false;
                this.options = supplier["data"];
                this.enableProductAddForm = !this.enableProductAddForm;
                console.log("supplier", this.options);
            })
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
                    console.log("buffer");
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
            })
    }
}
