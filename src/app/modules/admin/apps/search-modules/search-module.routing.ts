import { Route } from '@angular/router';
import { CanDeactivateContactsDetails } from 'app/modules/admin/apps/contacts/contacts.guards';
import { ContactsContactResolver, ContactsCountriesResolver, ContactsResolver, ContactsTagsResolver } from 'app/modules/admin/apps/contacts/contacts.resolvers';
import { ContactsListComponents } from './list/list.component';
import { ContactsDetailsComponents } from './details/details.component';
import { SearchComponents } from './search.component';
import { SearchProductsComponents } from './search-products/search-products.component';
import { SearchOrdersComponents } from './search-orders/search-orders.component';

export const searchRoutes: Route[] = [
    {
        path: '',
        component: SearchComponents,
        children: [
            {
                path: '',
                redirectTo: 'products',
                pathMatch: 'full'
            },
            {
                path: 'products',
                component: SearchProductsComponents
            },
            {
                path: 'orders',
                component: SearchOrdersComponents
            }
        ]
    }
];
