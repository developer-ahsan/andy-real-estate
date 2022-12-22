import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FLPSService } from '../../flps.service';

@Component({
    selector: 'app-stores-management',
    templateUrl: './stores-management.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FLPSStoresManagementComponent implements OnInit {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    mainScreen: string = 'Quick Reference';
    ordersLoader: boolean = true;
    ordersDataSource = [];
    tempOrdersDataSource = [];
    displayedStoresColumns: string[] = ['store', 'user', 'commission', 'd_commission', 'management'];
    displayedTypesColumns: string[] = ['store', 'action'];
    totalOrders = 0;
    tempTotalOrders = 0;
    ordersPage = 1;
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _flpsService: FLPSService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.getUserOrders(1);
    }
    calledScreen(value) {
        this.mainScreen = value;
    }
    getUserOrders(page) {
        let payload = {
            view_user_orders: true,
            user_id: 52,
            page: page,
            size: 20
        };
        this.ordersLoader = true;
        this._flpsService.getFlpsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.ordersDataSource = res["data"];
            this.totalOrders = res["totalRecords"];
            if (this.tempOrdersDataSource.length == 0) {
                this.tempOrdersDataSource = res["data"];
                this.tempTotalOrders = res["totalRecords"];
            }
            this.ordersLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.ordersLoader = false;
            this._changeDetectorRef.markForCheck();
        })
    }
    getNextOrderdData(event) {
        const { previousPageIndex, pageIndex } = event;
        if (pageIndex > previousPageIndex) {
            this.ordersPage++;
        } else {
            this.ordersPage--;
        };
        this.getUserOrders(this.ordersPage);
    };
}
