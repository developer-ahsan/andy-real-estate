import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FLPSService } from './flps.service';
import { UserService } from 'app/core/user/user.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
    selector: 'flps',
    templateUrl: './flps.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FLPSComponent {
    isLoading: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    routes = [];
    selectedScreeen = 'Generate Report';

    flpsToken = sessionStorage.getItem('flpsAccessToken');
    ngEmail = '';
    ngPassword = '';
    isLoginLoader: boolean = false;
    user: any;
    // Sidebar stuff
    @ViewChild('topScrollAnchor') topScroll: ElementRef;


    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: string = 'account';
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _flpsService: FLPSService,
        private _router: Router,
        private _authService: AuthService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */

    ngOnInit(): void {
        this.loginCheck();
        this.routes = this._flpsService.navigationLabels;
        this.isLoading = false;
        this.panels = [
            {
                id: 'account',
                icon: 'heroicons_outline:document-report',
                title: 'Generate Report',
                description: 'Manage your public profile and private information'
            },
            {
                id: 'security',
                icon: 'heroicons_outline:users',
                title: 'User Management',
                description: 'Manage your password and 2-step verification preferences'
            },
            {
                id: 'plan-billing',
                icon: 'mat_outline:settings',
                title: 'Store Management',
                description: 'Manage your subscription plan, payment method and billing information'
            },
            {
                id: 'notifications',
                icon: 'heroicons_outline:logout',
                title: 'Logout',
                description: 'Manage when you\'ll be notified on which channels'
            }
        ];

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode and drawerOpened
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
    calledScreen(title) {
        if (title != this.selectedScreeen) {
            this.selectedScreeen = title;
            this.isLoading = true;
        }
        this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
    loginCheck() {
        this.user = this._authService.parseJwt(this._authService.accessToken);
        let payload = {
            login_check: true,
            user_name: this.user.name
        }
        this._flpsService.getFlpsData(payload).subscribe(res => {
            if (res["success"]) {
                sessionStorage.setItem('flpsAccessToken', 'userLoggedIn');
                this.flpsToken = 'userLoggedIn';
            }
        })
    }
    loginFLPS() {
        if (this.ngEmail == '' || this.ngPassword == '') {
            this._flpsService.snackBar('Username and password is required');
            return;
        }
        this.isLoginLoader = true;
        let payload = {
            login_check: true,
            user_name: this.ngEmail,
            password: this.ngPassword
        }
        this._flpsService.getFlpsData(payload).subscribe(res => {
            if (res["success"]) {
                this.flpsToken = 'userLoggedIn';
                sessionStorage.setItem('flpsAccessToken', 'userLoggedIn');
            } else {
                this._flpsService.snackBar(res["message"]);
            }
            this.isLoginLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isLoginLoader = false;
            this._changeDetectorRef.markForCheck();
        })
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    goToPanel(panel: string): void {
        this.selectedPanel = panel;

        // Close the drawer on 'over' mode
        if (this.drawerMode === 'over') {
            this.drawer.close();
        }
    }

    /**
     * Get the details of the panel
     *
     * @param id
     */
    getPanelInfo(id: string): any {
        return this.panels.find(panel => panel.id === id);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
