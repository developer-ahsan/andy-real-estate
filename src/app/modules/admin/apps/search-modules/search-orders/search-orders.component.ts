import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SearchService } from '../search.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
    selector: 'search-orders',
    templateUrl: './search-orders.component.html',
    styles: [".mat-paginator {border-radius: 16px !important} .ngx-pagination .current {background: #2c3344 !important}"],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchOrdersComponents implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    private _unsubscribeAll: Subject<any> = new Subject<any>();



    isOrderLoader: boolean = false;
    page = 1;
    ordersData = [];
    displayedColumns: string[] = ['date', 'name', 'price', 'type', 'status'];
    totalRecords = 0;
    isSearchLaoder: boolean = false;
    searchKeyword: any = '';
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _searchService: SearchService,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._searchService.orderKeyword$.subscribe(res => {
            if (res != this.searchKeyword || this.searchKeyword == '') {
                this.searchKeyword = res;
                this.isOrderLoader = true;
                this._changeDetectorRef.markForCheck();
                this.getOrdersData(1);
            }
        })
    }

    searchOrders() {
        if (this.searchKeyword == '') {
            return;
        }
        this.isSearchLaoder = true;
        this.page = 1;
        if (this.ordersData.length > 0) {
            this.paginator.pageIndex = 0;
        }
        this.getOrdersData(1);
    }
    getOrdersData(page) {
        let params = {
            keyword: this.searchKeyword,
            page: page,
            order_search: true
        }
        this._searchService.getOrdersSearchData(params).pipe(takeUntil(this._unsubscribeAll),
            finalize(() => {
                this.isSearchLaoder = false;
                this.isOrderLoader = false;
                this._changeDetectorRef.markForCheck();
            })).subscribe(res => {
                this.ordersData = res["data"];
                this.totalRecords = res["totalRecords"];
            }, err => {
                this.isSearchLaoder = false;
                this.isOrderLoader = false;
                this._changeDetectorRef.markForCheck();
            });
    };
    getNextOrderData(event) {
        const { previousPageIndex, pageIndex } = event;
        if (pageIndex > previousPageIndex) {
            this.page++;
        } else {
            this.page--;
        };
        this.getOrdersData(this.page);
    };
    orderDetails(id) {
        this._router.navigate([`apps/orders/${id}/summary`]);
    }
    /**
    * On destroy
    */
    ngOnDestroy(): void {
        this.searchKeyword.orderKeyword$.unsubscribe();

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
