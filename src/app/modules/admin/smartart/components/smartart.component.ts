import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { UsersService } from './users.service';
import { UserService } from 'app/core/user/user.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatDrawer } from '@angular/material/sidenav';
import Swal from 'sweetalert2'
import { FormControl } from '@angular/forms';
import { VendorsService } from '../../apps/vendors/components/vendors.service';
import { LocationStrategy, PathLocationStrategy, Location } from '@angular/common';
import { PreventNavigation } from 'app/can-deactivate.guard';
import { fromEvent, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';


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
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _httpClient: HttpClient,
        private _vendorsService: VendorsService,
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
        this.isLoginLoader = true;
        setTimeout(() => {
            sessionStorage.setItem('smartArt', 'test');
            this.loginCheck = true;
            this._router.navigateByUrl(this._router.url);
            this.isLoginLoader = false;
            this._changeDetectorRef.markForCheck();
        }, 2000);

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

