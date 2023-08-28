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
    selector: 'search-quotes',
    templateUrl: './search-quotes.component.html',
    styles: [".mat-paginator {border-radius: 16px !important} .ngx-pagination .current {background: #2c3344 !important}"],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchQuotesComponents implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;

    @ViewChild('drawer', { static: true }) matDrawer: MatDrawer;


    contactsCount: number = 0;
    contactsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    private _unsubscribeAll: Subject<any> = new Subject<any>();


    isQuoteLoader: boolean = false;
    page = 1;
    quotesData = [];
    displayedColumns: string[] = ['date', 'name', 'price'];
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
            this.isQuoteLoader = true;
            this._changeDetectorRef.markForCheck();
            this.getQuotesData(1);
        });
    }
    searchProduct() {
        this.isSearchLaoder = true;
        this.page = 1;
        if (this.quotesData.length > 0) {
            this.paginator.pageIndex = 0;
        }
        this.getQuotesData(1);
    }
    getQuotesData(page) {
        let params = {
            cart_id: this.searchKeyword,
            page: page,
            list: true,
            size: 20
        }
        this._searchService.getQuoteSearchData(params).pipe(takeUntil(this._unsubscribeAll),
            finalize(() => {
                this.isSearchLaoder = false;
                this.isQuoteLoader = false;
                this._changeDetectorRef.markForCheck();
            })).subscribe(res => {
                this.quotesData = res["data"];
                this.totalRecords = res["totalRecords"];
            }, err => {
                this.isSearchLaoder = false;
                this.isQuoteLoader = false;
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
        this.getQuotesData(this.page);
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
    quoteDetails(id) {
        this._router.navigateByUrl('apps/quotes/' + id);
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
