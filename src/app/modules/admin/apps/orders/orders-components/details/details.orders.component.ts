import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
    selectedOrderDetail: any = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    routes = [];
    selectedIndex: number = 0;
    selectedScreeen = 'Summary';
    not_available: string = 'N/A';

    // Sidebar stuff
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    @ViewChild("panel") panel;

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
    doSomething() {
        //do stuff
        this.panel.close();
    }
    getOrderDetail(orderId) {
        let params = {
            main: true,
            order_id: orderId
        }
        this._orderService.getOrderMainDetail(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.selectedOrderDetail = res["data"][0];
            const { blnAdditionalArtApproval, blnProcurement, paymentDate } = this.selectedOrderDetail;
            if (blnAdditionalArtApproval) {
                this._orderService.navigationLabels[2].children.push({ id: 10, title: 'Art Approval Settings', icon: 'mat_outline:settings' });
            }
            if (blnProcurement) {
                this._orderService.navigationLabels[2].children.push({ id: 10, title: 'Procurement Data', icon: 'heroicons_outline:database' });
            }
            if (paymentDate) {
                this._orderService.navigationLabels[3].children.push({
                    id: 10, title: 'Send Receipt Email', icon: 'mat_outline:email'
                });
            }
            this.routes = this._orderService.navigationLabels;

            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        })
    }
    getOrderStatus(orderId) {
        let params = {
            order_status: true,
            order_id: orderId
        }
        this._orderService.getOrderStatus(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.selectedOrder['OrderStatus'] = res.resultStatus;
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        })
    }
    ngOnInit(): void {
        this.isLoading = true;

        const orderId = location.pathname.split('/')[3];

        this._orderService.getOrderDetails(orderId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orders) => {
                this.selectedOrder = orders["data"][0];
                if (!this.selectedOrder.blnCancelled) {
                    this.getOrderStatus(orderId);
                } else {
                    this.selectedOrder['OrderStatus'] = false;
                    this._orderService.OrderCancelled = true;
                }
                this.getOrderDetail(orderId);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }, err => {
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            });


        // this.drawerMode = "side";

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
    clicked(title) {
        this.selectedScreeen = title;
        if (this.selectedScreeen !== 'Entities List') {
            this.isLoading = true;
        }
        if (this.selectedScreeen == 'Customer Info') {
            let route = '/apps/ecommerce/customer';
            this._router.navigate([route], { queryParams: { customerId: this.selectedOrderDetail.fk_storeUserID } });
        }
    }

    toggleDrawer() {
        this.drawerOpened = !this.drawerOpened;
    }

    backToOrdersScreen(): void {
        this.isLoading = true;
        this._router.navigate(['/apps/orders']);
    }
}
