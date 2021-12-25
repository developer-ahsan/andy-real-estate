import { Route } from '@angular/router';
import { OrdersComponent } from 'app/modules/admin/apps/orders/orders-components/orders.component';
import { OrdersListComponent } from 'app/modules/admin/apps/orders/orders-components/list/orders.component';
import { OrdersBrandsResolver, OrdersCategoriesResolver, OrdersProductsResolver, OrdersTagsResolver, OrdersVendorsResolver } from 'app/modules/admin/apps/orders/orders-components/orders.resolvers';
import { CustomersComponent } from 'app/modules/admin/apps/ecommerce/customers/customers.component';
import { CustomersListComponent } from 'app/modules/admin/apps/ecommerce/customers/list/customers.component';
import { CustomersBrandsResolver, CustomersCategoriesResolver, CustomersProductsResolver, CustomersTagsResolver, CustomersVendorsResolver } from 'app/modules/admin/apps/ecommerce/customers/customers.resolvers';
import { CustomersTabComponent } from 'app/modules/admin/apps/ecommerce/customers/tabs/customers.component';

export const ordersRoutes: Route[] = [
    {
        path      : '',
        component: OrdersComponent,
        children : [
            {
                path     : '',
                component: OrdersListComponent,
                resolve  : {
                    brands    : OrdersBrandsResolver,
                    categories: OrdersCategoriesResolver,
                    products  : OrdersProductsResolver,
                    tags      : OrdersTagsResolver,
                    vendors   : OrdersVendorsResolver
                }
            }
        ]
    },
    
];
