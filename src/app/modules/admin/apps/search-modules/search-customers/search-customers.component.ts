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
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
    selector: 'search-customers',
    templateUrl: './search-customers.component.html',
    styles: [".mat-paginator {border-radius: 16px !important} .ngx-pagination .current {background: #2c3344 !important}"],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchCustomersComponents implements OnInit, OnDestroy {
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
    displayedColumns: string[] = ['_id', 'first_name', 'last_name', 'customer_email', 'customer_store', 'customer_company', 'mrp'];
    totalRecords = 0;
    isSearchLaoder: boolean = false;
    searchKeyword: any = '';

    tempProdData: any;
    imprintLoader: boolean = false;
    costLoader: boolean = false;
    allStores: any = [];
    ngSelectedStore = 0;
    ngSelectedStatus = -1;
    ngSelectedReminder = -1;
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _searchService: SearchService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _commonService: DashboardsService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._activatedRoute.params.subscribe(params => {
            this.allStores = [];
            this.searchKeyword = params.value;
            this.isProductLoader = true;
            this._changeDetectorRef.markForCheck();
            this.getStoresList();
            this.getCustomersData(1);
        });
    }
    getStoresList() {
        this.allStores = [];
        this._commonService.storesData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.allStores.push({ pk_storeID: 0, storeName: 'All Stores' });
            this.allStores = this.allStores.concat(res["data"]);
        });
    }
    searchProduct() {
        if (this.searchKeyword == '') {
            return;
        }
        this.isSearchLaoder = true;
        this._searchService.customerKeyword = this.searchKeyword;
        this.page = 1;
        if (this.productsData.length > 0) {
            this.paginator.pageIndex = 0;
        }
        this.getCustomersData(1);
    }
    getCustomersData(page) {
        let params = {
            keyword: this.searchKeyword,
            page: page,
            store_id: this.ngSelectedStore,
            user_status: this.ngSelectedStatus,
            bln_reminder: this.ngSelectedReminder,
            list: true,
            size: 20,
            sort_by: 'storeName',
            sort_order: 'ASC'
        }
        this._searchService.getCustomersSearchData(params).pipe(takeUntil(this._unsubscribeAll),
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
        this.getCustomersData(this.page);
    };

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
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
