import { Route } from '@angular/router';
import { OrderManageDashboardComponent } from './components/pages/dashboard/dashboard.component';
import { OrderExportComponent } from './components/pages/export/export.component';
import { OrderManageComponent } from './components/order-manage.component';
import { OrderManageDetailsComponent } from './components/pages/order-details/order-details.component';

export const orderManageRoutes: Route[] = [
    {
        path: '',
        component: OrderManageComponent,
        // resolve: {
        //     SmartArtStoresResolver, SmartArtUsersResolver
        // },
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
