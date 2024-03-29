import { Route } from '@angular/router';
import { CanDeactivateGuard } from 'app/can-deactivate.guard';
import { OrderDashboardComponent } from './components/pages/order-dashboard/order-dashboard.component';
import { OrderDashboardDetailsComponent } from './components/pages/order-details/order-details.component';
import { OrderSchedulerComponent } from './components/pages/order-scheduler/order-scheduler.component';
import { QuoteDashboardComponent } from './components/pages/quote-dashboard/quote-dashboard.component';
import { QuoteDashboardDetailsComponent } from './components/pages/quote-details/quote-details.component';
import { QuoteOrderEmailComponent } from './components/pages/quote-order-emails/quote-order-emails.component';
import { QuoteSchedulerComponent } from './components/pages/quote-scheduler/quote-scheduler.component';
import { SmartArtComponent } from './components/smartart.component';
import { SmartArtStoresResolver, SmartArtUsersResolver } from './components/smartart.resolvers';
import { SmartartOrderEmailComponent } from './components/pages/order-emails/order-emails.component';

export const smartartRoutes: Route[] = [
    {
        path: '',
        component: SmartArtComponent,
        resolve: {
            // SmartArtStoresResolver, 
            SmartArtUsersResolver
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
                component: QuoteSchedulerComponent,
                data: {
                    title: 'Quote Scheduler',
                    url: 'quote-scheduler'
                }
            },
            {
                path: 'order-details',
                component: OrderDashboardDetailsComponent,
                data: {
                    title: 'Order Details',
                    url: 'order-details'
                }
            },
            {
                path: 'quote-details',
                component: QuoteDashboardDetailsComponent,
                data: {
                    title: 'Quote Details',
                    url: 'quote-details'
                }
            },
            {
                path: 'order-emails',
                component: SmartartOrderEmailComponent,
                data: {
                    title: 'Order Emails',
                    url: 'order-emails'
                }
            },
            {
                path: 'email-customer',
                component: QuoteOrderEmailComponent,
                data: {
                    title: 'Customer Email',
                    url: 'email-customer'
                }
            },
        ]
    },

];
