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
import * as Excel from 'exceljs/dist/exceljs.min.js'

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
    tagsEditMode: boolean = false;
    enableProductAddForm = false;
    vendors: InventoryVendor[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    options: string[] = ['One', 'Two', 'Three'];
    filteredOptions: Observable<string[]>;

    pageSize: number;
    pageNo: number;

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
        perPackageShippingUnit: [''],
        overPackageCharge: [''],
        technoLogo: [''],
        supplierLink: [''],
        mainDescription: [''],
        miniDescription: [''],
        keywords: [''],
        internalKeywords: ['']
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
    imprintForm = this._formBuilder.group({
    });
    colorForm = this._formBuilder.group({
    });
    featureForm = this._formBuilder.group({
    });

    stepperOrientation: Observable<StepperOrientation>;
    suppliers = ["albert.eisntein", "leonardo_da_vinci",
        "jagadish_chandra_bose@ya", "alan_turing", "srinivasa.ramanujan",
        "bjarne_stroustrup", "max.planck", "nikola.tesla",
        "galileo_galilei", "a.p.j.abdul.kalam", "richard.stallman@inbox.com", "devin.guffy@yandex.com"];
    favoriteSeason: string;
    seasons: string[] = ['Normal Promotional Material', 'Apparel Item', 'Service Item'];

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

        this.filteredOptions = this.netCostForm.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value)),
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

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.options.filter(option => option.toLowerCase().includes(filterValue));
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

    /**
     * Toggle product details
     *
     * @param productId
     */
    toggleDetails(productId: string): void {
        // If the product is already selected...
        // if (this.selectedProduct && this.selectedProduct.pk_productID === productId) {
        //     // Close the details
        //     this.closeDetails();
        //     return;
        // }

        // // Get the product by id
        // this._inventoryService.getProductById(productId)
        //     .subscribe((product) => {

        //         // Set the selected product
        //         this.selectedProduct = product;

        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();

        //         // Fill the form
        //         this.selectedProductForm.patchValue(product);

        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
    }

    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedProduct = null;
    }

    /**
     * Cycle through images of selected product
     */
    cycleImages(forward: boolean = true): void {
        // Get the image count and current image index
        // const count = this.selectedProductForm.get('images').value.length;
        // const currentIndex = this.selectedProductForm.get('currentImageIndex').value;

        // // Calculate the next and previous index
        // const nextIndex = currentIndex + 1 === count ? 0 : currentIndex + 1;
        // const prevIndex = currentIndex - 1 < 0 ? count - 1 : currentIndex - 1;

        // // If cycling forward...
        // if (forward) {
        //     this.selectedProductForm.get('currentImageIndex').setValue(nextIndex);
        // }
        // // If cycling backwards...
        // else {
        //     this.selectedProductForm.get('currentImageIndex').setValue(prevIndex);
        // }
    }



    /**
     * Create product
     */
    createProduct(): void {
        // Create the product
        // this._inventoryService.createProduct().subscribe((newProduct) => {

        //     // Go to new product
        //     this.selectedProduct = newProduct;

        //     // Fill the form
        //     this.selectedProductForm.patchValue(newProduct);

        //     // Mark for check
        //     this._changeDetectorRef.markForCheck();
        // });
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

    enableProductAddFormFn(): void {
        this.enableProductAddForm = !this.enableProductAddForm;
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
