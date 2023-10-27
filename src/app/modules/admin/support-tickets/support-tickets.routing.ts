import { Route } from '@angular/router';
import { SmartCentsDashboardComponent } from './components/pages/dashboard/dashboard.component';
import { TicketsDetailsComponent } from './components/pages/tickets-details/tickets-details.component';
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
                path: '',
                component: SmartCentsDashboardComponent,
                data: {
                    title: 'Dashboard',
                    url: 'dashboard'
                }
            },
            {
                path: 'detail/:id',
                component: TicketsDetailsComponent,
            },
        ]
    },

];
