import { Route } from '@angular/router';
import { OrdersComponent } from 'app/modules/admin/apps/orders/orders-components/orders.component';
import { OrdersDetailsComponent } from 'app/modules/admin/apps/orders/orders-components/details/details.orders.component';
import { OrderDetailsResolver, OrderProductsLineResolver, OrdersListResolver, StoresListResolver } from 'app/modules/admin/apps/orders/orders-components/orders.resolvers';
import { IncidentReportsComponent } from './incident-reports.component';
import { IncidentReportsListComponent } from './incident-reports-list/incident-reports-list.component';
import { IncidentReportsUpdateComponent } from './incident-reports-update/incident-reports-update.component';

export const incidentRoutes: Route[] = [
    {
        path: '',
        component: IncidentReportsComponent,
        children: [
            {
                path: '',
                redirectTo: 'list',
                pathMatch: 'full'
            },
            {
                path: 'list',
                component: IncidentReportsListComponent
            },
            {
                path: 'update/:id',
                component: IncidentReportsUpdateComponent
            },
        ]
    }
];
