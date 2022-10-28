import { Route } from '@angular/router';
import { OrdersComponent } from 'app/modules/admin/apps/orders/orders-components/orders.component';
import { OrdersListComponent } from 'app/modules/admin/apps/orders/orders-components/list/orders.component';
import { OrdersDetailsComponent } from 'app/modules/admin/apps/orders/orders-components/details/details.orders.component';
import { OrderProductsLineResolver, OrdersBrandsResolver, OrdersCategoriesResolver, OrdersListResolver, OrdersProductsResolver, OrdersTagsResolver, OrdersVendorsResolver, StoresListResolver } from 'app/modules/admin/apps/orders/orders-components/orders.resolvers';

export const ordersRoutes: Route[] = [
    {
        path: '',
        component: OrdersComponent,
        resolve: {
            orders: OrdersListResolver,
            stores: StoresListResolver
        },
        children: [
            {
                path: '',
                component: OrdersListComponent,
                resolve: {
                    // brands: OrdersBrandsResolver,
                    // categories: OrdersCategoriesResolver,
                    // products: OrdersProductsResolver,
                    // tags: OrdersTagsResolver,
                    // vendors: OrdersVendorsResolver,
                    // orders: OrdersListResolver,
                    // stores: StoresListResolver
                }
            },
            {
                path: ':id',
                pathMatch: 'full',
                component: OrdersDetailsComponent,
                resolve: {
                    products: OrderProductsLineResolver
                    // brands    : OrdersBrandsResolver,
                    // categories: OrdersCategoriesResolver,
                    // products  : OrdersProductsResolver,
                    // tags      : OrdersTagsResolver,
                    // vendors   : OrdersVendorsResolver,
                    // orders    : OrdersListResolver
                }
            },
        ]
    }
];
