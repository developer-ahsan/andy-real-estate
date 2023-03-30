import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
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
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        public _rapidService: OrderManageService,
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

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */

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
    }
    toggleDrawer() {
        this.sidenav.toggle();
    }
    calledScreen(route) {
        if (this.selectedRoute != route) {
            this.selectedRoute = route;
            this._router.navigate([`ordermanage/${route}`]);
        }
    }
    searchOrder() {
        const queryParams: NavigationExtras = {
            queryParams: { orderID: this.orderID }
        };
        this.customerID = '';
        this._router.navigate(['/ordermanage/dashboard'], queryParams);
    }
    searchCustomer() {
        const queryParams: NavigationExtras = {
            queryParams: { keyword: this.customerID }
        };
        this.orderID = '';
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
        // const token = sign(obj, 'smart_art_login');
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
                    this._router.navigateByUrl(this._router.url);
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
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
