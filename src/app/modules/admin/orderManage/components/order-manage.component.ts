import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { LocationStrategy, PathLocationStrategy, Location } from '@angular/common';
import { PreventNavigation } from 'app/can-deactivate.guard';
import { fromEvent, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OrderManageService } from './order-manage.service';
import * as CryptoJS from 'crypto-js';

import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { AuthService } from 'app/core/auth/auth.service';
import { CatalogService } from '../../apps/catalog/components/catalog.service';
import { DashboardsService } from '../../dashboards/dashboard.service';
import moment from 'moment';



@Component({
    selector: 'app-order-manage',
    templateUrl: './order-manage.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [``]
})
export class OrderManageComponent {
    @ViewChild('drawer', { static: true }) sidenav: MatDrawer;
    isLoading: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // Sidebar stuff
    @ViewChild('topScrollAnchor') topScroll: ElementRef;
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'over';

    routes: any;
    selectedScreeen = '';
    selectedRoute = '';
    orderID: any;
    customerID: any;

    loginCheck: boolean = false;
    isLoginLoader: boolean = false;
    ngEmail = '';
    ngPassword = '';
    userData: any;

    status = 0;
    storesList: any = [];
    selectedStore: any;
    rangeStart: any = '';
    rangeEnd: any = '';
    customerKeyword = '';
    ngOrderID = '';
    maxDate = new Date();

    allStatus = [];
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        public _rapidService: OrderManageService,
        private commonService: DashboardsService,
        private route: ActivatedRoute,
    ) {
        if (sessionStorage.getItem('orderManage')) {
            this.loginCheck = true;
            this.userData = JSON.parse(sessionStorage.getItem('orderManage'));
        } else {
            this.loginCheck = false;
        }
        this.routes = this._rapidService.navigationLabels;
    }

    ngOnInit(): void {
        if (this.loginCheck) {
            this._router.events.subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.selectedScreeen = this.route.children[0].snapshot.data.title;
                    this.selectedRoute = this.route.children[0].snapshot.data.url;
                }
            })
            this.selectedScreeen = this.route.children[0].snapshot.data.title;
            this.selectedRoute = this.route.children[0].snapshot.data.url;
        }
        this.getStores();
        this.getStatuses();
    }
    getStatuses() {
        this.allStatus = [
            { pk_statusID: 1, statusName: 'New Orders' },
            { pk_statusID: 2, statusName: 'Artwork Approved' },
            { pk_statusID: 3, statusName: 'Purchase Order Sent' },
            { pk_statusID: 4, statusName: 'Purchase Order Acknowledged' },
            { pk_statusID: 5, statusName: 'Shipped' },
            { pk_statusID: 6, statusName: 'Delivered' },
            { pk_statusID: 8, statusName: 'Picked up' },
            { pk_statusID: 11, statusName: 'Billed' },
            { pk_statusID: 12, statusName: 'Paid' },
            { pk_statusID: 9, statusName: 'Backorder' },
            { pk_statusID: 15, statusName: 'Rush Orders' },
            { pk_statusID: 16, statusName: 'Fulfillment Orders' },
            { pk_statusID: 13, statusName: 'Hidden' },
            { pk_statusID: 10, statusName: 'Waiting For Group Order' },
            { pk_statusID: 14, statusName: 'Semi-Rush' },
        ]
        // this._rapidService.orderManageStatus$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        //     this.allStatus = res["data"];
        // });
    }
    getStores() {
        this.commonService.storesData$.pipe(
            takeUntil(this._unsubscribeAll),
            map(res => res["data"].filter(element => element.blnActive))
        ).subscribe(filteredData => {
            this.storesList.push({ storeName: 'All Stores', pk_storeID: '' });
            this.storesList.push(...filteredData);
            this.selectedStore = this.storesList[0];
        });
    }
    calledScreen(route) {
        if (this.selectedRoute != route) {
            this.selectedRoute = route;
            if (route == 'dashboard') {
                this.status = 2;
                this._changeDetectorRef.markForCheck();
                this._router.navigate([`ordermanage/${route}`], { queryParams: { status: 2 } });
            } else {
                this._router.navigate([`ordermanage/${route}`]);
            }
        }
    }
    filterOrderManageData(type) {
        if (type == 'enter') {
            this.status = 0;
        }
        const queryParams: NavigationExtras = {
            queryParams: {}
        };
        let start: any = '';
        let end: any = '';
        if (this.rangeStart) {
            start = moment(this.rangeStart).format('yyyy-MM-DD');
        }
        if (this.rangeEnd) {
            end = moment(this.rangeEnd).format('yyyy-MM-DD');
        }
        const parameters = {
            orderID: this.ngOrderID,
            keyword: this.customerKeyword,
            status: this.status,
            storeID: this.selectedStore.pk_storeID,
            range_start: start,
            range_end: end
        };
        for (const [param, value] of Object.entries(parameters)) {
            if (value) {
                queryParams.queryParams[param] = value;
            }
        }
        this._router.navigate(['/ordermanage/dashboard'], queryParams);
    }
    loginorderManage() {
        if (this.ngEmail == '' || this.ngPassword == '') {
            this._rapidService.snackBar('Email & password is required.');
            return;
        }
        let obj = {
            username: this.ngEmail,
            password: this.ngPassword
        }
        this.isLoginLoader = true;
        const secretKey = 'order_manage_login';
        const objectString = JSON.stringify(obj);
        const encryptedObject = CryptoJS.AES.encrypt(objectString, secretKey).toString();
        let payload = {
            payload: encryptedObject,
            order_manage_login_v2: true
        }
        this._rapidService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll),
            finalize(() => {
                this.isLoginLoader = false;
                this._changeDetectorRef.markForCheck();
            })).subscribe(res => {
                if (res["isLogin"]) {
                    this.loginCheck = true;
                    this.userData = res["data"][0];
                    sessionStorage.setItem('orderManage', JSON.stringify(res["data"][0]));
                    if (this._router.url == '/ordermanage/dashboard') {
                        this.status = 2;
                        this._router.navigate([this._router.url], { queryParams: { status: 2 } });
                    } else {
                        this._router.navigateByUrl(this._router.url);
                    }
                    this._changeDetectorRef.markForCheck();
                } else {
                    this._rapidService.snackBar('Please check your credentials');
                }

            });
    }
    logout() {
        this._router.navigateByUrl('/ordermanage');
        this.loginCheck = false;
        sessionStorage.removeItem('orderManage');
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
