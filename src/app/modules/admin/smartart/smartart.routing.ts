import { Route } from '@angular/router';
import { CanDeactivateGuard } from 'app/can-deactivate.guard';
import { OrderDashboardComponent } from './components/pages/order-dashboard/order-dashboard.component';
import { OrderSchedulerComponent } from './components/pages/order-scheduler/order-scheduler.component';
import { QuoteDashboardComponent } from './components/pages/quote-dashboard/quote-dashboard.component';
import { SmartArtComponent } from './components/smartart.component';

export const smartartRoutes: Route[] = [

    {
        path: '',
        component: SmartArtComponent,
        resolve: {
        },
        children: [
            {
                path: '',
                redirectTo: 'orders-dashboard',
                pathMatch: 'full'
            },
            {
                path: 'orders-dashboard',
                // canDeactivate: [CanDeactivateGuard],
                component: OrderDashboardComponent,
                data: {
                    title: 'Orders Dashboard',
                    url: 'orders-dashboard'
                }
            },
            {
                path: 'quotes-dashboard',
                component: QuoteDashboardComponent,
                data: {
                    title: 'Quotes Dashboard',
                    url: 'quotes-dashboard'
                }
            },
            {
                path: 'order-scheduler',
                component: OrderSchedulerComponent,
                data: {
                    title: 'Order Scheduler',
                    url: 'order-scheduler'
                }
            },
            {
                path: 'quote-scheduler',
                component: QuoteDashboardComponent,
                data: {
                    title: 'Quote Scheduler',
                    url: 'quote-scheduler'
                }
            },
        ]
    },

];
