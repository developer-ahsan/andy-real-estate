import { Route } from '@angular/router';
import { SmartCentsDashboardComponent } from './components/pages/dashboard/dashboard.component';
import { ExportBillDataComponent } from './components/pages/export-bill/export-bill.component';
import { SmartCentsComponent } from './components/smartcents.component';
import { CustomerInvoiceComponent } from './components/pages/customer-invoice/customer-invoice.component';
import { SmartCentStoresResolver } from './components/smartcents.resolvers';
import { SmartCentsDetailsComponent } from './components/pages/smartcents-details/smartcents-details.component';

export const smartartRoutes: Route[] = [
    {
        path: '',
        component: SmartCentsComponent,
        resolve: {
            SmartCentStoresResolver
        },
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                // canDeactivate: [CanDeactivateGuard],
                component: SmartCentsDashboardComponent,
                data: {
                    title: 'Dashboard',
                    url: 'dashboard'
                }
            },
            {
                path: 'smartcents-details/:poid',
                // canDeactivate: [CanDeactivateGuard],
                component: SmartCentsDetailsComponent,
                data: {
                    title: 'SmartCents Details',
                    url: 'smartcents-details'
                }
            },
            {
                path: 'export-bill',
                component: ExportBillDataComponent,
                data: {
                    title: 'Export Vendor Bill Data',
                    url: 'export-bill'
                }
            },
            {
                path: 'customer-invoice',
                component: CustomerInvoiceComponent,
                data: {
                    title: 'Export Customer Invoice Data',
                    url: 'customer-invoice'
                }
            }
        ]
    },

];
