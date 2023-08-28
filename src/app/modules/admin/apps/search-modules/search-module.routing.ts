import { Route } from '@angular/router';
import { SearchComponents } from './search.component';
import { SearchProductsComponents } from './search-products/search-products.component';
import { SearchOrdersComponents } from './search-orders/search-orders.component';
import { SearchCustomersComponents } from './search-customers/search-customers.component';
import { SearchVendorsComponents } from './search-vendors/search-vendors.component';
import { SearchQuotesComponents } from './search-quotes/search-quotes.component';

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
                path: 'products/:value',
                component: SearchProductsComponents
            },
            {
                path: 'orders/:value',
                component: SearchOrdersComponents
            },
            {
                path: 'customers/:value',
                component: SearchCustomersComponents
            },
            {
                path: 'vendors/:value',
                component: SearchVendorsComponents
            },
            {
                path: 'quotes/:value',
                component: SearchQuotesComponents
            }
        ]
    }
];
