import { Route } from '@angular/router';
import { SmartCentsDashboardComponent } from './components/pages/dashboard/dashboard.component';
import { ExportBillDataComponent } from './components/pages/export-bill/export-bill.component';
import { CustomerInvoiceComponent } from './components/pages/customer-invoice/customer-invoice.component';
import { SmartCentsDetailsComponent } from './components/pages/smartcents-details/smartcents-details.component';
import { SupportTicketsComponent } from './components/support-tickets.component';

export const supportRoutes: Route[] = [
    {
        path: '',
        component: SupportTicketsComponent,
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
