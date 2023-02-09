import { Route } from '@angular/router';
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
                component: SmartArtComponent,
                data: {
                    title: 'Orders Dashboard',
                    url: 'orders-dashboard'
                }
            },
            {
                path: 'quotes-dashboard',
                component: SmartArtComponent,
                data: {
                    title: 'Quotes Dashboard',
                    url: 'quotes-dashboard'
                }
            },
            {
                path: 'order-scheduler',
                component: SmartArtComponent,
                data: {
                    title: 'Order Scheduler',
                    url: 'order-scheduler'
                }
            },
            {
                path: 'quote-scheduler',
                component: SmartArtComponent,
                data: {
                    title: 'Quote Scheduler',
                    url: 'quote-scheduler'
                }
            },
        ]
    },

];
