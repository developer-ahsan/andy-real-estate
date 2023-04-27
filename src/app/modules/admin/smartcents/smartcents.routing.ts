import { Route } from '@angular/router';
import { SmartCentsDashboardComponent } from './components/pages/dashboard/dashboard.component';
import { ExportBillDataComponent } from './components/pages/export-bill/export-bill.component';
import { SmartCentsComponent } from './components/smartcents.component';
import { RapidBuildStatusesResolver, RapidBuildStoresResolver } from './components/smartcents.resolvers';
import { CustomerInvoiceComponent } from './components/pages/customer-invoice/customer-invoice.component';

export const smartartRoutes: Route[] = [
    {
        path: '',
        component: SmartCentsComponent,
        resolve: {
            // RapidBuildStoresResolver, RapidBuildStatusesResolver
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