import { Route } from '@angular/router';
import { InventoryComponent } from 'app/modules/admin/apps/ecommerce/inventory/inventory.component';
import { InventoryListComponent } from 'app/modules/admin/apps/ecommerce/inventory/list/inventory.component';
import { ProductDescriptionResolver, ProductsListsResolver, StoresListResolver, SuppliersListResolver, SystemDistributorCodes } from 'app/modules/admin/apps/ecommerce/inventory/inventory.resolvers';
import { CustomersComponent } from 'app/modules/admin/apps/ecommerce/customers/customers.component';
import { CustomersListComponent } from 'app/modules/admin/apps/ecommerce/customers/list/customers.component';
import { CustomersBrandsResolver, CustomersCategoriesResolver, CustomersProductsResolver, CustomersTagsResolver, CustomersVendorsResolver } from 'app/modules/admin/apps/ecommerce/customers/customers.resolvers';
import { CustomersTabComponent } from 'app/modules/admin/apps/ecommerce/customers/tabs/customers.component';
import { ProductDetailsComponent } from 'app/modules/admin/apps/ecommerce/inventory/details/product-details.component';
import { ProductStoreComponent } from './product-store/store.component';
import { StoreProductDetailsComponent } from './product-store/details/product-store-details.component';

export const ecommerceRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'inventory'
    },
    {
        path: 'inventory',
        component: InventoryComponent,
        resolve: {
            distributor: SystemDistributorCodes,
            suppliers: SuppliersListResolver
        },
        children: [
            {
                path: '',
                component: InventoryListComponent,
                resolve: {
                    products: ProductsListsResolver,
                    stores: StoresListResolver
                }
            },
            {
                path: ':id',
                pathMatch: 'full',
                component: ProductDetailsComponent,
                resolve: {
                    product: ProductDescriptionResolver
                }
            },
            {
                path: 'storeProduct/:id',
                pathMatch: 'full',
                component: ProductDetailsComponent,
                resolve: {
                }
            },
        ]
    },
    {
        path: 'customers',
        component: CustomersComponent,
        children: [
            {
                path: '',
                component: CustomersListComponent,
                resolve: {
                    brands: CustomersBrandsResolver,
                    categories: CustomersCategoriesResolver,
                    products: CustomersProductsResolver,
                    tags: CustomersTagsResolver,
                    vendors: CustomersVendorsResolver
                }
            }
        ]
    },
    {
        path: 'customer',
        component: CustomersComponent,
        children: [
            {
                path: '',
                component: CustomersTabComponent,
                resolve: {
                    brands: CustomersBrandsResolver,
                    categories: CustomersCategoriesResolver,
                    products: CustomersProductsResolver,
                    tags: CustomersTagsResolver,
                    vendors: CustomersVendorsResolver
                }
            }
        ]
    },
    {
        path: 'store',
        component: ProductStoreComponent,
        children: [
            {
                path: ':id',
                component: StoreProductDetailsComponent,
                resolve: {
                    // brands: CustomersBrandsResolver,
                    // categories: CustomersCategoriesResolver,
                    // products: CustomersProductsResolver,
                    // tags: CustomersTagsResolver,
                    // vendors: CustomersVendorsResolver
                }
            }
        ]
    }
];
