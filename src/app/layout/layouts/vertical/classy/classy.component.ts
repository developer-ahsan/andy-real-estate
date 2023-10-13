import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService } from '@fuse/components/navigation';
import { InitialData } from 'app/app.types';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.model';
import { AuthService } from 'app/core/auth/auth.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
    data: InitialData;
    isScreenSmall: boolean;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: User;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _userService: UserService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _authService: AuthService,
        private _dashboardService: DashboardsService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get login user details
        this.user = this._authService.parseJwt(this._authService.accessToken);

        this._activatedRoute.data.subscribe((data: Data) => {
            this.data = data.initialData;
            this.getUserRole();
        });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }
    getUserRole() {
        const user = JSON.parse(localStorage.getItem('userDetails'));
        let roles: any;
        let roleIDs: any = [];
        if (user.roles) {
            roles = user.roles.split(',,');
            roles.forEach(role => {
                const [id, name] = role.split('::');
                roleIDs.push(id);
            });
        }
        const checkID = roleIDs.find(id => id == 3);
        if (user.blnManager) {
            this.data.navigation.default[0].children[0].children.push(
                {
                    id: 'apps.reports.store-sales',
                    title: 'Employee Dashboard',
                    type: 'basic',
                    icon: 'mat_outline:analytics',
                    link: '/dashboards/employee',
                },
                {
                    id: 'apps.reports.store-sales',
                    title: 'Manager Dashboard', //Company Overview
                    type: 'basic',
                    icon: 'heroicons_outline:view-boards',
                    link: '/dashboards/manager',
                },
                {
                    id: 'apps.reports.store-sales',
                    title: 'Employee Reports',
                    type: 'basic',
                    icon: 'heroicons_outline:document-report',
                    link: '/dashboards/reports',
                },
                // {
                //     id: 'apps.reports.store-sales',
                //     title: 'Home Dashboard',
                //     type: 'basic',
                //     icon: 'mat_outline:home',
                //     link: '/dashboards/home',
                // },
            )
        } else if (checkID == 3) {
            this.data.navigation.default[0].children[0].children.push(
                {
                    id: 'apps.reports.store-sales',
                    title: 'Employee Dashboard',
                    type: 'basic',
                    icon: 'mat_outline:analytics',
                    link: '/dashboards/employee',
                },
                // {
                //     id: 'apps.reports.store-sales',
                //     title: 'Home Dashboard',
                //     type: 'basic',
                //     icon: 'mat_outline:home',
                //     link: '/dashboards/home',
                // },
            )
        } else {
            // this.data.navigation.default[0].children[0].children.push(
            //     {
            //         id: 'apps.reports.store-sales',
            //         title: 'Home Dashboard',
            //         type: 'basic',
            //         icon: 'mat_outline:home',
            //         link: '/dashboards/home',
            //     },
            // )
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent(name);

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }
}
