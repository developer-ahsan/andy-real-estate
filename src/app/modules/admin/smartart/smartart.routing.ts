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
                component: SmartArtComponent
            },
            {
                path: 'quotes-dashboard',
                component: SmartArtComponent
            },
            {
                path: 'order-scheduler',
                component: SmartArtComponent
            },
            {
                path: 'quote-scheduler',
                component: SmartArtComponent
            },
        ]
    },

];
