import { Route } from '@angular/router';
import { OrderManageDashboardComponent } from './components/pages/dashboard/dashboard.component';
import { OrderExportComponent } from './components/pages/export/export.component';
import { OrderManageComponent } from './components/order-manage.component';
import { OrderManageDetailsComponent } from './components/pages/order-details/order-details.component';
import { OrderManageStatusResolver } from './components/order-manage.resolvers';
import { OrderImportShippingComponent } from './components/pages/import-shipping/import-shipping.component';

export const orderManageRoutes: Route[] = [
    {
        path: '',
        component: OrderManageComponent,
        resolve: {
            OrderManageStatusResolver
        },
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                component: OrderManageDashboardComponent,
                data: {
                    title: 'Dashboard',
                    url: 'dashboard'
                }
            },
            {
                path: 'export',
                component: OrderExportComponent,
                data: {
                    title: 'Export',
                    url: 'export'
                }
            },
            {
                path: 'import',
                component: OrderImportShippingComponent,
                data: {
                    title: 'Import Shipping',
                    url: 'import'
                }
            },
            {
                path: 'order-details',
                component: OrderManageDetailsComponent,
                data: {
                    title: 'Order Details',
                    url: 'order-details'
                }
            }
        ]
    },

];
