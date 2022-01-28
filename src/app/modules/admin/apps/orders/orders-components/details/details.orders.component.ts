import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { OrdersList, OrdersPagination } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';

@Component({
    selector: 'orders-details',
    templateUrl: './details.orders.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class OrdersDetailsComponent implements OnInit, OnDestroy {

    isLoading: boolean = false;
    pagination: OrdersPagination;
    ordersCount: number = 0;
    selectedOrder: OrdersList = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    routes = [];
    selectedIndex: number = 0;
    not_available: string = 'N/A';

    // Sidebar stuff
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _orderService: OrdersService,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.isLoading = true;

        const orderId = location.pathname.split('/')[3];

        this._orderService.getOrderDetails(orderId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orders) => {
                console.log("orders detailing", orders["data"][0]);
                this.selectedOrder = orders["data"][0];
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // this.drawerMode = "side";
        this.routes = this._orderService.navigationLabels;
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode and drawerOpened if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
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
    clicked(index) {
        if (index !== 1) {
            this.isLoading = true;
        }
        this.selectedIndex = index;
    }

    toggleDrawer() {
        this.drawerOpened = !this.drawerOpened;
    }

    backToOrdersScreen(): void {
        this.isLoading = true;
        this._router.navigate(['/apps/orders']);
    }
}
