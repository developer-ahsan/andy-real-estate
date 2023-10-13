import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexNonAxisChartSeries, ApexOptions, ApexPlotOptions, ApexResponsive, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent } from 'ng-apexcharts';
import { DashboardsService } from '../../dashboard.service';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'home-dashboard',
    templateUrl: './home-dashboard.component.html',

    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userData: any;
    cardsArray = [
        {
            link: ['/apps/ecommerce/inventory'],
            icon: 'heroicons_outline:archive',
            title: 'Products',
        },
        {
            link: ['/apps/promostandards'],
            icon: 'heroicons_outline:document-report',
            title: 'Promostandards',
        },
        {
            link: ['/apps/stores'],
            icon: 'mat_outline:storefront',
            title: 'Stores',
        },
        {
            link: ['/apps/orders'],
            icon: 'heroicons_outline:document-report',
            title: 'Orders',
        },
        {
            link: ['/apps/quotes'],
            icon: 'heroicons_outline:archive',
            title: 'Quotes',
        },
        {
            link: ['/apps/vendors'],
            icon: 'heroicons_outline:briefcase',
            title: 'Vendors',
        },
        {
            link: ['/apps/companies'],
            icon: 'heroicons_outline:briefcase',
            title: 'Companies',
        },
        {
            link: ['/apps/customers'],
            icon: 'heroicons_outline:user-group',
            title: 'Customers',
        },
        {
            link: ['/apps/reports'],
            icon: 'heroicons_outline:presentation-chart-line',
            title: 'Reports',
        },
        {
            link: ['/apps/flps'],
            icon: 'heroicons_outline:gift',
            title: 'FLPS',
        },
        {
            link: ['/apps/royalties'],
            icon: 'heroicons_outline:currency-dollar',
            title: 'Royalties',
        },
        {
            link: ['/apps/catalog'],
            icon: 'heroicons_outline:book-open',
            title: 'Catalog',
        },
        {
            link: ['/apps/system'],
            icon: 'heroicons_outline:cog',
            title: 'System',
        },
        {
            link: ['/apps/users'],
            icon: 'heroicons_outline:lock-open',
            title: 'Users',
        },
        {
            link: ['/import-export'],
            icon: 'mat_outline:import_export',
            title: 'Import/Export',
        },
        {
            link: ['/smartart/orders-dashboard'],
            icon: 'heroicons_outline:desktop-computer',
            title: 'SmartArt',
        },
        {
            link: ['/rapidbuild'],
            icon: 'heroicons_outline:office-building',
            title: 'RapidBuild',
        },
        {
            link: ['/ordermanage'],
            icon: 'heroicons_outline:briefcase',
            title: 'OrderManage',
        },
        {
            link: ['/smartcents'],
            icon: 'heroicons_outline:library',
            title: 'SmartCents',
        },
    ];

    constructor(
        private _dashboardService: DashboardsService,
        private _authService: AuthService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router
    ) {

    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.getUserRole();
    }
    getUserRole() {
        this.userData = JSON.parse(localStorage.getItem('userDetails'));
        let roles: any;
        let roleIDs: any = [];
        if (this.userData.roles) {
            roles = this.userData.roles.split(',,');
            roles.forEach(role => {
                const [id, name] = role.split('::');
                roleIDs.push(id);
            });
            const index = roleIDs.findIndex(role => role.id == 3);
            if (index > -1) {
                this.userData.roleName = roleIDs[index].roleName;
            } else {
                this.userData.roleName = roleIDs[0].roleName;
            }
        }

    }
    signOut() {
        this._router.navigate(['/sign-out']);
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
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
