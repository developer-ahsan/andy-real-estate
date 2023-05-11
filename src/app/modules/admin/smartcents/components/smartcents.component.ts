import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { LocationStrategy, PathLocationStrategy, Location } from '@angular/common';
import { PreventNavigation } from 'app/can-deactivate.guard';
import { fromEvent, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SmartCentsService } from './smartcents.service';
import * as CryptoJS from 'crypto-js';

import { RapidBuildLogin, SmartArtLogin } from './smartcents.types';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import moment from 'moment';



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
    ngProductName = '';
    ngKeyword = '';

    // Login
    loginCheck: boolean = false;
    isLoginLoader: boolean = false;
    ngEmail = '';
    ngPassword = '';

    ngFilterView = 1;

    userData: any;

    ngOrderType = 2;
    ngStatus = 0;
    ngTerms = '';
    ngPayment = '';
    ngStartDate: any = '';
    ngEndDate: any = '';
    ngOrderKeyword: any = '';
    ngCompanyKeyword: any = '';
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private __smartCentsService: SmartCentsService,
        private route: ActivatedRoute,
    ) {
    }
    ngOnInit(): void {
        this.routes = this.__smartCentsService.navigationLabels;

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
        this.__smartCentsService.smartCentsStores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(stores => {
            this.allStores.push({ storeName: 'All Stores', pk_storeID: 0 });
            this.allStores = this.allStores.concat(stores['data']);
            this.searchStoreCtrl.setValue(this.allStores[0]);
            this.selectedStore = this.allStores[0];
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
            switchMap(value => this.__smartCentsService.getApiData(params)
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
    changeOrderType(ev) {
        this.ngStatus = 0;
        this.ngTerms = '';
        this.ngPayment = '';
    }
    filterBuildData() {
        let query_parmas: any;
        let store_id = this.selectedStore.pk_storeID;
        let start_date;
        let end_date;
        if (this.ngStartDate) {
            start_date = moment(this.ngStartDate).format('L');
        }
        if (this.ngEndDate) {
            end_date = moment(this.ngEndDate).format('L');
        }
        if (this.ngOrderType == 1) {
            query_parmas = { order_type: this.ngOrderType, store_id: store_id, start_date: start_date, end_date: end_date, keyword: this.ngOrderKeyword, company_keyword: this.ngCompanyKeyword };
        } else if (this.ngOrderType == 2) {
            query_parmas = { order_type: this.ngOrderType, store_id: store_id, start_date: start_date, end_date: end_date, status: this.ngStatus, keyword: this.ngOrderKeyword, company_keyword: this.ngCompanyKeyword };
        } else if (this.ngOrderType == 3) {
            query_parmas = { order_type: this.ngOrderType, store_id: store_id, start_date: start_date, end_date: end_date, status: this.ngStatus, keyword: this.ngOrderKeyword, company_keyword: this.ngCompanyKeyword };
        } else if (this.ngOrderType == 4) {
            query_parmas = { order_type: this.ngOrderType, store_id: store_id, start_date: start_date, end_date: end_date, status: this.ngStatus, keyword: this.ngOrderKeyword, company_keyword: this.ngCompanyKeyword };
        } else if (this.ngOrderType == 5) {
            query_parmas = { order_type: this.ngOrderType, store_id: store_id, start_date: start_date, end_date: end_date, status: this.ngStatus, keyword: this.ngOrderKeyword, company_keyword: this.ngCompanyKeyword };
        }
        const queryParams: NavigationExtras = {
            queryParams: query_parmas
        };
        this.toggleDrawer();
        this._router.navigate(['smartcents/dashboard'], queryParams);
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
