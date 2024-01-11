import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { UpdateStoreOrder } from '../orders.types';

@Component({
    selector: 'orders-details',
    templateUrl: './details.orders.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class OrdersDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('topScrollAnchor') topScroll: ElementRef;

    isLoading: boolean = false;
    selectedOrderDetail: any = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    routes = [];
    selectedScreeen = '';
    selectedRoute = '';

    not_available: string = 'N/A';

    // Sidebar stuff
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    @ViewChild("panel") panel;

    allStores: any;
    ngSelectedStore: any;
    updateStoreLoader: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _orderService: OrdersService,
        private _commonService: DashboardsService,
        private route: ActivatedRoute,
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
    goToLockOrder() {
        this._router.navigate(['/apps/orders', this.selectedOrderDetail.pk_orderID, 'lock-order'])
    }
    doSomething() {
        this.panel.close();
    }

    ngOnInit(): void {
        // Initialize Screen
        this._router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.selectedScreeen = this.route.children[0].snapshot.data.title;
                this.selectedRoute = this.route.children[0].snapshot.data.url;
            }
        })
        this.selectedScreeen = this.route.children[0].snapshot.data.title;
        this.selectedRoute = this.route.children[0].snapshot.data.url;

        // get Order Details
        this.getOrderDetails();
        this.getAllStores();

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
    getAllStores() {
        this._commonService.storesData$.pipe(
            takeUntil(this._unsubscribeAll),
            map(res => res["data"].filter(element => element.blnActive))
        ).subscribe(filteredData => {
            this.allStores = filteredData;
        });
    }
    getOrderDetails() {
        this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(order => {
            order.testingPrimary = 'Ahsan';
            if (order["data"].length) {
                if (order["data"][0].managerDetails) {
                    let [managerFirstName, managerLastName, managerEmail, fk_adminUserID, primary] = order["data"][0].managerDetails.split('::');
                    if (primary == 1) {
                        order["data"][0].blnPrimary = true;
                    } else {
                        order["data"][0].blnPrimary = false;
                    }
                    order["data"][0].managerFirstName = managerFirstName;
                    order["data"][0].managerLastName = managerLastName;
                    order["data"][0].managerEmail = managerEmail;
                    order["data"][0].fk_adminUserID = fk_adminUserID;
                }
                this.selectedOrderDetail = order["data"][0];
                if (this.selectedOrderDetail.blnCancelled) {
                    this._orderService.OrderCancelled = true;
                } else {
                    this.getOrderStatus();
                }
                const { blnAdditionalArtApproval, blnProcurement, paymentDate, fk_groupOrderID, pk_orderID, gatewayTrxID } = this.selectedOrderDetail;
                if (blnAdditionalArtApproval) {
                    let index = this._orderService.navigationLabels[2].children.findIndex(item => item.title == 'Art Approval Settings');
                    if (index == -1) {
                        this._orderService.navigationLabels[2].children.push({ id: 10, title: 'Art Approval Settings', icon: 'mat_outline:settings', route: 'art-approval-settings' });
                    }
                }
                if (blnProcurement) {
                    let index = this._orderService.navigationLabels[2].children.findIndex(item => item.title == 'Procurement Data');
                    if (index == -1) {
                        this._orderService.navigationLabels[2].children.push({ id: 10, title: 'Procurement Data', icon: 'heroicons_outline:database', route: 'procurement-data' });
                    }
                }
                if (paymentDate) {
                    let index = this._orderService.navigationLabels[3].children.findIndex(item => item.title == 'Send Receipt Email');
                    if (index == -1) {
                        this._orderService.navigationLabels[3].children.push({
                            id: 10, title: 'Send Receipt Email', icon: 'mat_outline:email', route: 'reciept-email'
                        });
                    }
                }
                if (fk_groupOrderID) {
                    this.getGroupOrderDetails(pk_orderID);
                    let index = this._orderService.navigationLabels[2].children.findIndex(item => item.title == 'Group Order Details');
                    if (index == -1) {
                        this._orderService.navigationLabels[2].children.push(
                            { id: 10, title: 'Group Order Details', icon: 'heroicons_outline:document-report', route: 'group-order-details' },
                            { id: 10, title: 'Group Order Shipping', icon: 'heroicons_outline:document-report', route: 'group-order-shipping' }
                        );
                    }
                }
                if (!gatewayTrxID && !paymentDate) {
                    let index = this._orderService.navigationLabels[5].children.findIndex(item => item.title == 'Bill to Credit Card');
                    if (index == -1) {
                        this._orderService.navigationLabels[5].children.push(
                            { id: 111, title: 'Bill to Credit Card', icon: 'heroicons_outline:currency-dollar', route: 'bill-payments' },
                        );
                    }
                }
                this.routes = this._orderService.navigationLabels;
                this.ngSelectedStore = this.selectedOrderDetail.fk_storeID;
            } else {
                this._orderService.snackBar('Please check order number');
            }
        })
    }
    getOrderStatus() {
        this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.selectedOrderDetail['OrderStatus'] = res["resultStatus"];
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    getGroupOrderDetails(pk_orderID) {
        this._orderService.getGroupOrderDetails(pk_orderID).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
    clicked(item) {
        if (item.route != this.selectedRoute) {
            if (item.title == 'Customer Info') {
                let route = '/apps/customers/' + this.selectedOrderDetail.fk_storeUserID;
                this._router.navigate([route]);
            } else {
                this.selectedScreeen = item.title;
                this.selectedRoute = item.route;
                setTimeout(() => {
                    this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
                }, 100);
                this._router.navigate([item.route], { relativeTo: this.route });
            }
        }
    }

    toggleDrawer() {
        this.drawerOpened = !this.drawerOpened;
    }

    backToOrdersScreen(): void {
        this.isLoading = true;
        this._router.navigate(['/apps/orders']);
    }
    updateStoreOrder() {
        this.updateStoreLoader = true;
        let payload: UpdateStoreOrder = {
            store_id: this.ngSelectedStore,
            order_id: this.selectedOrderDetail.pk_orderID,
            update_order_store: true
        }
        this._orderService.updateOrderCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            let index = this.allStores.findIndex(store => store.pk_storeID == this.ngSelectedStore);
            this.selectedOrderDetail.fk_storeID = this.ngSelectedStore;
            this.selectedOrderDetail.storeName = this.allStores[index].storeName;
            this._orderService.snackBar(res["message"]);
            this.updateStoreLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.updateStoreLoader = false;
            this._changeDetectorRef.markForCheck();
        });
    }
}
