import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { LocationStrategy, PathLocationStrategy, Location } from '@angular/common';
import { PreventNavigation } from 'app/can-deactivate.guard';
import { fromEvent, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RapidBuildService } from './rapid-build.service';
import * as CryptoJS from 'crypto-js';

import { SmartArtLogin } from './rapid-build.types';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { AuthService } from 'app/core/auth/auth.service';
import { CatalogService } from '../../apps/catalog/components/catalog.service';



@Component({
    selector: 'app-rapid-build',
    templateUrl: './rapid-build.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RapidBuildComponent {
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
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _rapidService: RapidBuildService,
        private route: ActivatedRoute,
    ) {
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

    }
    toggleDrawer() {
        this.sidenav.toggle();
    }
    calledScreen(route) {
        if (this.selectedRoute != route) {
            this.selectedRoute = route;
            this._router.navigate([`rapidbuild/${route}`]);
        }
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
