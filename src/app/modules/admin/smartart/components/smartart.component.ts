import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { LocationStrategy, PathLocationStrategy, Location } from '@angular/common';
import { PreventNavigation } from 'app/can-deactivate.guard';
import { fromEvent, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SmartArtService } from './smartart.service';
import * as CryptoJS from 'crypto-js';

import { SmartArtLogin } from './smartart.types';
import { MatDrawer } from '@angular/material/sidenav';
import { FormControl } from '@angular/forms';
import { DashboardsService } from '../../dashboards/dashboard.service';



@Component({
    selector: 'app-smartart',
    templateUrl: './smartart.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmartArtComponent {
    isLoading: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    routes = [];
    selectedScreeen = '';
    selectedRoute = '';
    // Sidebar stuff
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    @ViewChild("panel") panel;
    @ViewChild('topScrollAnchor') topScroll: ElementRef;
    @ViewChild('drawer', { static: true }) drawer: MatDrawer;


    loginCheck: boolean = false;
    isLoginLoader: boolean = false;
    ngEmail = '';
    ngPassword = '';

    // Search Stores
    allStores = [];
    searchStoreCtrl = new FormControl();
    selectedStore: any;
    isSearchingStore = false;
    // Search Designers
    allDesigners = [];
    searchDesignerCtrl = new FormControl();
    selectedDesigner: any;
    isSearchingDesigner = false;
    // Search Filters
    ngSearchField = '';
    ngCustomerField = '';
    ngSearchStore = '';
    ngSearchDesigner = '';
    ngFilterProduct = '';

    ngDashboardCheck = 0;
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _httpClient: HttpClient,
        private _smartartService: SmartArtService,
        private _commonService: DashboardsService,
        private _router: Router,
        private route: ActivatedRoute,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private locationStrategy: LocationStrategy,
        private location: Location
    ) {
        if (sessionStorage.getItem('smartArt')) {
            this.loginCheck = true;
        } else {
            this.loginCheck = false;
        }
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
                    if (this.selectedScreeen == 'Orders Dashboard' || this.selectedScreeen == 'Order Details' || this.selectedScreeen == 'Order Scheduler') {
                        this.ngDashboardCheck = 0;
                    } else {
                        this.ngDashboardCheck = 1;
                    }
                    this.ngSearchField = '';
                    this.ngCustomerField = '';
                    this.ngFilterProduct = '';
                }
            })
            this.selectedScreeen = this.route.children[0].snapshot.data.title;
            this.selectedRoute = this.route.children[0].snapshot.data.url;
            if (this.selectedScreeen == 'Orders Dashboard' || this.selectedScreeen == 'Order Details' || this.selectedScreeen == 'Order Scheduler') {
                this.ngDashboardCheck = 0;
            } else {
                this.ngDashboardCheck = 1;
            }
        }

        this.searchableFields();
        this.isLoading = false;
        this.sideDrawer();
    }
    searchableFields() {
        this._commonService.storesData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.allStores.push({ storeName: 'All Stores', pk_storeID: null });
            res["data"].forEach(element => {
                if (element.blnActive) {
                    this.allStores.push(element);
                }
            });
            // this.allStores = this.allStores.concat(res['data']);
            this.selectedStore = this.allStores[0];
        });
        this._smartartService.smartArtUsers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.allDesigners.push({ firstName: 'All', lastName: " Designers", pk_userID: null });
            this.allDesigners = this.allDesigners.concat(res['data']);
            this.selectedDesigner = this.allDesigners[0];
        });
        let params;
        this.searchStoreCtrl.valueChanges.pipe(
            filter((res: any) => {
                params = {
                    stores: true,
                    bln_active: 1,
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
            switchMap(value => this._smartartService.getSmartArtData(params)
                .pipe(
                    finalize(() => {
                        this.isSearchingStore = false
                        this._changeDetectorRef.markForCheck();
                    }),
                )
            )
        ).subscribe((data: any) => {
            this.allStores.push({ storeName: 'All Stores', pk_storeID: null });
            this.allStores = this.allStores.concat(data['data']);
        });
        let params1;
        this.searchDesignerCtrl.valueChanges.pipe(
            filter((res: any) => {
                params1 = {
                    smart_art_users: true,
                    keyword: res
                }
                return res !== null && res.length >= 3
            }),
            distinctUntilChanged(),
            debounceTime(300),
            tap(() => {
                this.allDesigners = [];
                this.isSearchingDesigner = true;
                this._changeDetectorRef.markForCheck();
            }),
            switchMap(value => this._smartartService.getSmartArtData(params1)
                .pipe(
                    finalize(() => {
                        this.isSearchingDesigner = false
                        this._changeDetectorRef.markForCheck();
                    }),
                )
            )
        ).subscribe((data: any) => {
            this.allDesigners.push({ firstName: 'All', lastName: " Designers", pk_userID: null });
            this.allDesigners = this.allDesigners.concat(data['data']);
        });

    }
    onSelected(ev) {
        this.selectedStore = ev.option.value;
    }
    displayWith(value: any) {
        return value?.storeName;
    }
    onSelectedDesigner(ev) {
        this.selectedDesigner = ev.option.value;
    }
    displayWithDesigner(value: any) {
        let name = '';
        if (value) {
            name = value?.firstName + ' ' + value.lastName;
        }
        return name;
    }
    // Close Drawer
    doSomething() {
        this.panel.close();
    }
    // Side Drawer 
    sideDrawer() {
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
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


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    clicked(item) {
        if (item.route != this.selectedRoute) {
            this.selectedScreeen = item.title;
            this.selectedRoute = item.route;
            setTimeout(() => {
                this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            this._router.navigate([item.route], { relativeTo: this.route });
        }
    }
    // Drawer Open Close
    toggleDrawer() {
        this.drawerOpened = !this.drawerOpened;
    }
    loginSmartArt() {
        if (this.ngEmail == '' || this.ngPassword == '') {
            this._smartartService.snackBar('Email & password is required.');
            return;
        }
        let obj = {
            username: this.ngEmail,
            password: this.ngPassword
        }
        this.isLoginLoader = true;
        const secretKey = 'smart_art_login';
        const objectString = JSON.stringify(obj);
        const encryptedObject = CryptoJS.AES.encrypt(objectString, secretKey).toString();
        // const token = sign(obj, 'smart_art_login');
        let payload: SmartArtLogin = {
            payload: encryptedObject,
            smartart_login: true
        }
        this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll),
            finalize(() => {
                this.isLoginLoader = false;
                this._changeDetectorRef.markForCheck();
            })).subscribe(res => {
                if (res["isLogin"]) {
                    this.loginCheck = true;
                    sessionStorage.setItem('smartArt', JSON.stringify(res["data"][0]));
                    this._router.navigateByUrl(this._router.url);
                    this._changeDetectorRef.markForCheck();
                } else {
                    this._smartartService.snackBar('Please check your credentials');
                }

            });
    }
    logout() {
        this._router.navigateByUrl('/smartart');
        this.loginCheck = false;
        sessionStorage.removeItem('smartArt');
    }
    filterSmartArtList(check) {
        if (check == 0) {
            const queryParams: NavigationExtras = {
                queryParams: { search: this.ngSearchField, store: this.selectedStore.pk_storeID, customer: this.ngCustomerField, designer: this.selectedDesigner.pk_userID, product: this.ngFilterProduct }
            };
            this._router.navigate(['/smartart/orders-dashboard'], queryParams);
        } else {
            const queryParams: NavigationExtras = {
                queryParams: { search: this.ngSearchField, store: this.selectedStore.pk_storeID, customer: this.ngCustomerField, designer: this.selectedDesigner.pk_userID }
            };
            this._router.navigate(['/smartart/quotes-dashboard'], queryParams);
        }

        // this.drawer.toggle();
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

