import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersBrand, OrdersCategory, OrdersList, OrdersPagination, OrdersProduct, OrdersTag, OrdersVendor, SearchOrder } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { Router, ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { MatDrawer } from '@angular/material/sidenav';
@Component({
    selector: 'orders',
    templateUrl: './orders.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    orders: OrdersList[];
    ordersLength: number;
    isLoading: boolean = false;
    pagination: OrdersPagination;
    ordersCount: number = 0;
    ordersTableColumns: string[] = ['sku', 'name', 'price', 'stock', 'active'];
    searchInputControl: FormControl = new FormControl();
    selectedOrder: OrdersList | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    pageSize: number;
    pageNo: number;
    pageIndex = 0;
    keyword: string;
    @Output() isLoadingChange = new EventEmitter<boolean>();


    advancedSearch: boolean = false;
    storesList: any;
    advancedSearchForm: SearchOrder = {
        store_id: 0,
        range_end: '',
        range_start: '',
        search_order_id: 0,
        size: 20,
        order_type: 0
    };
    tempOrdersArray = [];
    tempTotalCount = 0;
    @ViewChild('drawer', { static: true }) sidenav: MatDrawer;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _orderService: OrdersService,
        private _router: Router,
        private route: ActivatedRoute
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this.pageSize = 20;
        this.pageNo = 1;
        this._orderService.orders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orders: OrdersList[]) => {
                this.orders = orders["data"];
                this.ordersLength = orders["totalRecords"];
                if (this.tempOrdersArray.length == 0) {
                    this.tempOrdersArray = orders["data"];
                    this.tempTotalCount = orders["totalRecords"];
                }
                this.isLoading = false;
                this.isLoadingChange.emit(false);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        // if (this._orderService._searchKeyword == '') {

        // } else {
        //     this.getOrders(20, 1);
        // }
        // Get the brands


        this.getStoresList();
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

    getOrders(sizes, pageNo) {
        let { store_id, range_end, range_start, search_order_id, size, order_type } = this.advancedSearchForm;
        if (!range_end) {
            range_end = '';
        } else {
            range_end = moment(range_end).format('MM/DD/YYYY');
        }
        if (!range_start) {
            range_start = '';
        } else {
            range_start = moment(range_start).format('MM/DD/YYYY');
        }
        let params = {
            list: true,
            size: sizes,
            // keyword: this.keyword,
            page: pageNo,
            store_id,
            range_end,
            range_start,
            order_type,
            search_order_id
        }
        this._orderService.getOrders(params)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orders) => {
                this.orders = orders["data"];
                this.ordersLength = orders["totalRecords"];
                this.isLoading = false;
                this.isLoadingChange.emit(false);
                this._orderService._searchKeyword = '';
                this.advancedSearchForm = {
                    store_id: 0,
                    range_end: '',
                    range_start: '',
                    search_order_id: 0,
                    size: 20,
                    order_type: 0
                };
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };


    pageEvents(event: any) {
        const { previousPageIndex, pageIndex } = event;
        if (pageIndex > previousPageIndex) {
            this.pageNo++;
        } else {
            this.pageNo--;
        };
        this.getOrders(20, this.pageNo);
    }



    orderDetails(id) {
        this.isLoading = true;
        this._router.navigate([`${id}/summary`], { relativeTo: this.route });
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

    openAdvancedSearch() {
        this.sidenav.toggle();
    }
    closeAdvancedSearch() {
        this.advancedSearch = false;
        this.advancedSearchForm = {
            store_id: 0,
            range_end: '',
            range_start: '',
            search_order_id: 0,
            size: 20,
            order_type: 0
        };
        this.orders = this.tempOrdersArray;
        this.ordersLength = this.tempTotalCount;
        this._changeDetectorRef.markForCheck();
    }
    getStoresList() {
        this.storesList = [];
        this._orderService.stores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.storesList.push({ storeName: 'All Stores', pk_storeID: 0 });
            this.storesList = this.storesList.concat(res["data"]);
        })
    }
    searchOrder() {
        this.openAdvancedSearch();
        this.pageNo = 1;
        this.pageIndex = 0;
        this.isLoading = true;
        // this.advancedSearch = false;
        this.pageSize = this.advancedSearchForm.size;
        this.getOrders(this.advancedSearchForm.size, 1);
    }
}

