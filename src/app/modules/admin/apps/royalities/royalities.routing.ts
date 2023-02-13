import { Route } from '@angular/router';
import { RoyaltyReportsComponent } from './components/pages/royality-reports/royality-reports.component';
import { RoyaltySettingsComponent } from './components/pages/royalty-settings/royalty-settings.component';
import { LicensingCompaniesComponent } from './components/pages/licensing-companies/licensing-companies.component';
import { RoyaltyComponent } from './components/royalities.component';
import { EmployeesListsResolver, FlpsLoginResolver, AdminCompaniesResolver, AdminStoresResolver } from './components/royalities.resolvers';

export const royalitiesRoutes: Route[] = [

    {
        path: '',
        component: RoyaltyComponent,
        resolve: {
            // employees: EmployeesListsResolver,
            // flpsLogin: FlpsLoginResolver,
            stores: AdminStoresResolver,
            companies: AdminCompaniesResolver
        },
        children: [
            {
                path: '',
                redirectTo: 'reports',
                pathMatch: 'full'
            },
            {
                path: 'reports',
                component: RoyaltyReportsComponent
            },
            {
                path: 'licensing-companies',
                component: LicensingCompaniesComponent
            },
            {
                path: 'settings',
                component: RoyaltySettingsComponent
            },
        ]
    },

];
