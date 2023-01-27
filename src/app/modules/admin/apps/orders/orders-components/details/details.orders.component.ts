import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';

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

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _orderService: OrdersService,
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
    getOrderDetails() {
        this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(order => {
            if (order["data"].length) {
                this.selectedOrderDetail = order["data"][0];
                if (this.selectedOrderDetail.blnCancelled) {
                    this._orderService.OrderCancelled = true;
                } else {
                    this.getOrderStatus();
                }
                const { blnAdditionalArtApproval, blnProcurement, paymentDate, fk_groupOrderID } = this.selectedOrderDetail;
                if (blnAdditionalArtApproval) {
                    this._orderService.navigationLabels[2].children.push({ id: 10, title: 'Art Approval Settings', icon: 'mat_outline:settings', route: 'art-approval-settings' });
                }
                if (blnProcurement) {
                    this._orderService.navigationLabels[2].children.push({ id: 10, title: 'Procurement Data', icon: 'heroicons_outline:database', route: 'procurement-data' });
                }
                if (paymentDate) {
                    this._orderService.navigationLabels[3].children.push({
                        id: 10, title: 'Send Receipt Email', icon: 'mat_outline:email', route: 'reciept-email'
                    });
                }
                if (fk_groupOrderID) {
                    this._orderService.navigationLabels[2].children.push(
                        { id: 10, title: 'Group Order Details', icon: 'heroicons_outline:document-report', route: 'group-order-details' },
                        { id: 10, title: 'Group Order Shipping', icon: 'heroicons_outline:document-report', route: 'group-order-shipping' }
                    );
                }
                this.routes = this._orderService.navigationLabels;
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
                let route = '/apps/ecommerce/customers/' + this.selectedOrderDetail.fk_storeUserID;
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
}
