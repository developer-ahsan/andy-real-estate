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
import Swal from 'sweetalert2'
import * as CryptoJS from 'crypto-js';
import { FlpsLogin } from './flps.types';

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
    flpsName = sessionStorage.getItem('FullName');
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
        this.routes = this._flpsService.navigationLabels;
        this.isLoading = false;
        this.panels = [
            {
                id: 'account',
                icon: 'heroicons_outline:document-report',
                title: 'Generate Report',
                description: 'Manage your reports'
            },
            {
                id: 'security',
                icon: 'heroicons_outline:users',
                title: 'User Management',
                description: 'Manage your flps users information'
            },
            {
                id: 'plan-billing',
                icon: 'mat_outline:settings',
                title: 'Store Management',
                description: 'Manage your stores information'
            },
            {
                id: 'logout',
                icon: 'heroicons_outline:logout',
                title: 'Logout',
                description: 'Logout to end your session'
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
    logout() {
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to end your session!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Logout'
        }).then((result) => {
            if (result.isConfirmed) {
                sessionStorage.removeItem('flpsAccessToken');
                localStorage.removeItem('flpsData');
                this.flpsToken = null;
                this._changeDetectorRef.markForCheck();
            }
        })
    }
    calledScreen(title) {
        if (title != this.selectedScreeen) {
            this.selectedScreeen = title;
            this.isLoading = true;
        }
        this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
    loginFLPS() {
        if (this.ngEmail == '' || this.ngPassword == '') {
            this._flpsService.snackBar('Username and password is required');
            return;
        }
        this.isLoginLoader = true;


        let obj = {
            username: this.ngEmail,
            password: this.ngPassword
        }
        this.isLoginLoader = true;
        const secretKey = 'flps_login';
        const objectString = JSON.stringify(obj);
        const encryptedObject = CryptoJS.AES.encrypt(objectString, secretKey).toString();

        let payload: FlpsLogin = {
            payload: encryptedObject,
            flps_login_v2: true
        }


        // let payload = {
        //     login_check: true,
        //     user_name: this.ngEmail,
        //     password: this.ngPassword
        // }
        this._flpsService.AddFlpsData(payload).subscribe(res => {
            if (res["success"]) {
                if (res["isLogin"]) {
                    this.flpsToken = 'userLoggedIn';
                    localStorage.setItem('flpsData', JSON.stringify(res["data"][0]));
                    sessionStorage.setItem('flpsAccessToken', 'userLoggedIn');
                    sessionStorage.setItem('FullName', res["data"][0].firstName + ' ' + res["data"][0].lastName);
                    sessionStorage.setItem('flpsLoginAdmin', res["data"][0].blnAdmin);
                    sessionStorage.setItem('flpsUserID', res["data"][0].pk_userID);
                    sessionStorage.setItem('flpsUserEmail', res["data"][0].email);
                    this._flpsService.snackBar(res["message"]);
                } else {
                    this._flpsService.snackBar(res["message"]);
                }
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
        if (this.selectedPanel == 'logout') {
            this.selectedPanel = 'account';
            this.logout();
        }
        this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
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
