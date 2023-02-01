import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { UsersService } from './users.service';
import { UserService } from 'app/core/user/user.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatDrawer } from '@angular/material/sidenav';
import Swal from 'sweetalert2'
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
    selectedPanel: string = 'admin';
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _UsersService: UsersService,
        private _router: Router,
        private route: ActivatedRoute,
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
        if (this._router.url.includes('commentors')) {
            this.selectedPanel = 'commentors';
        } else if (this._router.url.includes('admin')) {
            this.selectedPanel = 'admin';
        } else if (this._router.url.includes('smartart')) {
            this.selectedPanel = 'smartart';
        } else if (this._router.url.includes('order')) {
            this.selectedPanel = 'order';
        } else if (this._router.url.includes('rapid')) {
            this.selectedPanel = 'rapid';
        } else if (this._router.url.includes('role')) {
            this.selectedPanel = 'role';
        }
        this.routes = this._UsersService.navigationLabels;
        this.isLoading = false;
        this.panels = [
            {
                id: 'admin',
                icon: 'heroicons_outline:users',
                title: 'Admin Users',
                description: 'Manage admin users',
                route: 'admin-users'
            },
            {
                id: 'commentors',
                icon: 'heroicons_outline:user-group',
                title: 'Admin Commentors',
                description: 'Manage admin commentors',
                route: 'admin-commentors'
            },
            {
                id: 'smartart',
                icon: 'mat_outline:settings',
                title: 'SmartArt Users',
                description: 'Manage smartart users',
                route: 'smartart-users'
            },
            {
                id: 'order',
                icon: 'heroicons_outline:document-report',
                title: 'OrderManage Users',
                description: 'Manage order users',
                route: 'order-users'
            },
            {
                id: 'rapid',
                icon: 'heroicons_outline:user-circle',
                title: 'RapidBuild Users',
                description: 'Manage rapidbuild users',
                route: 'rapidbuild-users'
            },
            {
                id: 'role',
                icon: 'heroicons_outline:user',
                title: 'Company Roles',
                description: 'Manage company roles',
                route: 'company-roles'
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
            this._UsersService.snackBar('Username and password is required');
            return;
        }
        this.isLoginLoader = true;
        let payload = {
            login_check: true,
            user_name: this.ngEmail,
            password: this.ngPassword
        }
        this._UsersService.getAdminsData(payload).subscribe(res => {
            if (res["success"]) {
                this.flpsToken = 'userLoggedIn';
                sessionStorage.setItem('flpsAccessToken', 'userLoggedIn');
                sessionStorage.setItem('FullName', res["data"][0].firstName + ' ' + res["data"][0].lastName);
                this._UsersService.snackBar(res["message"]);
            } else {
                this._UsersService.snackBar(res["message"]);
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
    goToPanel(panel): void {
        this.selectedPanel = panel.id;

        // Close the drawer on 'over' mode
        if (this.drawerMode === 'over') {
            this.drawer.close();
        }
        this._router.navigate([panel.route], { relativeTo: this.route })
        // this._router.navigateByUrl('admin-users');
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
