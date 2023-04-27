import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { LocationStrategy, PathLocationStrategy, Location } from '@angular/common';
import { PreventNavigation } from 'app/can-deactivate.guard';
import { fromEvent, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RapidBuildService } from './smartcents.service';
import * as CryptoJS from 'crypto-js';

import { RapidBuildLogin, SmartArtLogin } from './smartcents.types';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';



@Component({
    selector: 'app-smartcents',
    templateUrl: './smartcents.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmartCentsComponent {
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


    // Stores
    allStores = [];
    searchStoreCtrl = new FormControl();
    selectedStore: any;
    isSearchingStore = false;
    // Statuses
    allStatus = [];
    ngStatus = 0;
    ngProductName = '';
    ngKeyword = '';

    // Login
    loginCheck: boolean = false;
    isLoginLoader: boolean = false;
    ngEmail = '';
    ngPassword = '';
    ngFilterView = 1;
    userData: any;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _rapidService: RapidBuildService,
        private route: ActivatedRoute,
    ) {
        // if (sessionStorage.getItem('rapidBuild')) {
        //     this.loginCheck = true;
        //     this.userData = JSON.parse(sessionStorage.getItem('rapidBuild'));
        // } else {
        //     this.loginCheck = false;
        // }
        this.routes = this._rapidService.navigationLabels;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */

    ngOnInit(): void {
        this._router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.selectedScreeen = this.route.children[0].snapshot.data.title;
                this.selectedRoute = this.route.children[0].snapshot.data.url;
            }
        })
        this.selectedScreeen = this.route.children[0].snapshot.data.title;
        this.selectedRoute = this.route.children[0].snapshot.data.url;
        this.initStores();
    }
    initStores() {
        this._rapidService.rapidBuildStores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(stores => {
            // this.allStores.push({ storeName: 'All Stores', pk_storeID: 0 });
            // this.allStores = this.allStores.concat(stores['data']);
        });
        let params;
        this.searchStoreCtrl.valueChanges.pipe(
            filter((res: any) => {
                params = {
                    stores: true,
                    keyword: res
                }
                return res !== null && res.length >= 3
            }),
            distinctUntilChanged(),
            debounceTime(300),
            tap(() => {
                this.allStores = [];
                this.isSearchingStore = true;
                this._changeDetectorRef.markForCheck();
            }),
            switchMap(value => this._rapidService.getRapidBuildStores(params)
                .pipe(
                    finalize(() => {
                        this.isSearchingStore = false
                        this._changeDetectorRef.markForCheck();
                    }),
                )
            )
        ).subscribe((data: any) => {
            this.allStores = [];
            this.allStores.push({ storeName: 'All Stores', pk_storeID: 0 });
            this.allStores = this.allStores.concat(data['data']);
        });
        // Statuses
        this._rapidService.rapidBuildStatuses$.pipe(takeUntil(this._unsubscribeAll)).subscribe(statuses => {
            // this.allStatus.push({ statusName: 'All statuses', pk_statusID: 0 });
            // this.allStatus = this.allStatus.concat(statuses['data']);
        });
    }
    onSelected(ev) {
        this.selectedStore = ev.option.value;
    }
    displayWith(value: any) {
        return value?.storeName;
    }
    toggleDrawer() {
        this.sidenav.toggle();
    }
    calledScreen(route) {
        if (this.selectedRoute != route) {
            this.selectedRoute = route;
            this._router.navigate([`smartcents/${route}`]);
        }
    }
    loginRapidBuild() {
        if (this.ngEmail == '' || this.ngPassword == '') {
            this._rapidService.snackBar('Email & password is required.');
            return;
        }
        let obj = {
            username: this.ngEmail,
            password: this.ngPassword
        }
        this.isLoginLoader = true;
        const secretKey = 'rapidBuild_login';
        const objectString = JSON.stringify(obj);
        const encryptedObject = CryptoJS.AES.encrypt(objectString, secretKey).toString();
        // const token = sign(obj, 'smart_art_login');
        let payload: RapidBuildLogin = {
            payload: encryptedObject,
            rapidbuild_login: true
        }
        this._rapidService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll),
            finalize(() => {
                this.isLoginLoader = false;
                this._changeDetectorRef.markForCheck();
            })).subscribe(res => {
                if (res["isLogin"]) {
                    this.loginCheck = true;
                    this.userData = res["data"][0];
                    sessionStorage.setItem('rapidBuild', JSON.stringify(res["data"][0]));
                    console.log(this._router.url);
                    this._router.navigateByUrl(this._router.url);
                    this._changeDetectorRef.markForCheck();
                } else {
                    this._rapidService.snackBar('Please check your credentials');
                }

            });
    }
    logout() {
        this._router.navigateByUrl('/rapidbuild');
        this.loginCheck = false;
        sessionStorage.removeItem('rapidBuild');
    }

    filterBuildData() {
        // let store_id = 0;
        // if (this.selectedStore) {
        //     store_id = this.selectedStore.pk_storeID;
        // }
        // const queryParams: NavigationExtras = {
        //     queryParams: { status: this.ngStatus, store_id: store_id, productName: this.ngProductName, keyword: this.ngKeyword }
        // };
        this.toggleDrawer();
        // this._router.navigate(['rapidbuild/image-management'], queryParams);
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