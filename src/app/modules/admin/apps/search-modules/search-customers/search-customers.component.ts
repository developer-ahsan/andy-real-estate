import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Observable, Subject } from 'rxjs';
import { filter, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Contact, Country } from 'app/modules/admin/apps/contacts/contacts.types';
import { ContactsService } from 'app/modules/admin/apps/contacts/contacts.service';
import { SearchService } from '../search.service';
import { MatPaginator } from '@angular/material/paginator';

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

    contacts$: Observable<Contact[]>;

    contactsCount: number = 0;
    contactsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];
    countries: Country[];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedContact: Contact;
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
        this._activatedRoute.params.subscribe(params => {
            this.searchKeyword = params.value;
            this.isProductLoader = true;
            this._changeDetectorRef.markForCheck();
            this.getCustomersData(1);
        })


        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected contact when drawer closed
                this.selectedContact = null;

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
                this.createContact();
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
            list: true,
            size: 20
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
        this._searchService.getCustomersSearchData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
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
        this._searchService.getCustomersSearchData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
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
    createContact(): void {
        // Create the contact
        this._searchService.createContact().subscribe((newContact) => {

            // Go to the new contact
            this._router.navigate(['./', newContact.id], { relativeTo: this._activatedRoute });

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
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
