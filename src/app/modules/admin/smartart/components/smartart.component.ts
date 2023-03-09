import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { LocationStrategy, PathLocationStrategy, Location } from '@angular/common';
import { PreventNavigation } from 'app/can-deactivate.guard';
import { fromEvent, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SmartArtService } from './smartart.service';
import * as CryptoJS from 'crypto-js';

import { SmartArtLogin } from './smartart.types';



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


    loginCheck: boolean = false;
    isLoginLoader: boolean = false;
    ngEmail = '';
    ngPassword = '';
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _httpClient: HttpClient,
        private _smartArtService: SmartArtService,
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
        console.log(this._router.url)
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


        this.isLoading = false;
        this.sideDrawer();
    }
    displayWith(value: any) {
        return value?.companyName;
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
            this._smartArtService.snackBar('Email & password is required.');
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
        this._smartArtService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll),
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
                    this._smartArtService.snackBar('Please check your credentials');
                }

            });
    }
    logout() {
        this._router.navigateByUrl('/smartart');
        this.loginCheck = false;
        sessionStorage.removeItem('smartArt');
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

