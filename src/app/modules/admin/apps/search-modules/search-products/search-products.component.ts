import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Observable, Subject } from 'rxjs';
import { filter, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { SearchService } from '../search.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
    selector: 'search-products',
    templateUrl: './search-products.component.html',
    styles: [".mat-paginator {border-radius: 16px !important} .ngx-pagination .current {background: #2c3344 !important}"],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchProductsComponents implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;

    @ViewChild('drawer', { static: true }) matDrawer: MatDrawer;


    contactsCount: number = 0;
    contactsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();


    isProductLoader: boolean = false;
    page = 1;
    productsData = [];
    displayedColumns: string[] = ['id', 'number', 'name', 'supplier', 'status', 'core', 'image', 'action'];
    totalRecords = 0;
    isSearchLaoder: boolean = false;
    searchKeyword: any = '';

    tempProdData: any;
    imprintLoader: boolean = false;
    costLoader: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _searchService: SearchService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._activatedRoute.params.subscribe(param => {
            this.searchKeyword = param.value;
            this.isProductLoader = true;
            this._changeDetectorRef.markForCheck();
            this.getProductsData(1);
        });
        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected contact when drawer closed

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                }
                else {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Listen for shortcuts
        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(event =>
                    (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                    && (event.key === '/') // '/'
                )
            )
            .subscribe(() => {
            });
    }
    searchProduct() {
        if (this.searchKeyword == '') {
            return;
        }
        this.isSearchLaoder = true;
        this._searchService.productKeyword = this.searchKeyword;
        this.page = 1;
        if (this.productsData.length > 0) {
            this.paginator.pageIndex = 0;
        }
        this.getProductsData(1);
    }
    getProductsData(page) {
        let params = {
            keyword: this.searchKeyword,
            page: page,
            search_product: true
        }
        this._searchService.getProductSearchData(params).pipe(takeUntil(this._unsubscribeAll),
            finalize(() => {
                this.isSearchLaoder = false;
                this.isProductLoader = false;
                this._changeDetectorRef.markForCheck();
            })).subscribe(res => {
                this.productsData = res["data"];
                this.totalRecords = res["totalRecords"];
            }, err => {
                this.isSearchLaoder = false;
                this.isProductLoader = false;
                this._changeDetectorRef.markForCheck();
            });
    }
    goToProductDetails(val) {
        this._router.navigateByUrl(`apps/ecommerce/inventory/${val.pk_productID}`);
    }
    goToVendorsDetails(val) {
        this._router.navigateByUrl(`apps/vendors/${val.pk_companyID}/information`);
    }
    getNextProductData(event) {
        const { previousPageIndex, pageIndex } = event;
        if (pageIndex > previousPageIndex) {
            this.page++;
        } else {
            this.page--;
        };
        this.getProductsData(this.page);
    };
    toggleDrawer(product) {
        this.imprintLoader = false;
        this.costLoader = false;
        this.matDrawer.toggle();
        product.page = 1;
        product.totalImprints = 0;
        this.getImprintsForProduct(product)
        if (!product.costs) {
            this.getProductNetCost(product);
        }
        this.tempProdData = product;
        this._changeDetectorRef.markForCheck();
    }
    getNextImprintsForProduct(event) {
        this.tempProdData.page = event;
        this.getImprintsForProduct(this.tempProdData);
    };
    getImprintsForProduct(product) {
        product.imprints = [];
        this.imprintLoader = true;
        let params = {
            imprint: true,
            product_id: product.pk_productID,
            page: product.page,
            size: 10
        }
        this._searchService.getProductSearchData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
            this.imprintLoader = false;
            this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
            product.imprints = res["data"];
            product.totalImprints = res["totalRecords"];
            this.tempProdData = product;
        })
    }
    getProductNetCost(product) {
        product.costs = [];
        this.costLoader = true;
        let params = {
            net_cost: true,
            cost: true,
            product_id: product.pk_productID
        }
        this._searchService.getProductSearchData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
            this.costLoader = false;
            this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
            product.costs = res["data"];
            this.tempProdData = product;
        })
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
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    /**
     * Create contact
     */
    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
