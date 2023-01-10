import { Route } from '@angular/router';
import { VendorsDetailsComponent } from './components/details/details-vendors.component';
import { VendorTopOrderComponent } from './components/pages/top-order-products/top-order-products.component';
import { VendorCoreProductsComponent } from './components/pages/vendor-core-products/vendor-core-products.component';
import { VendorProductsSummaryComponent } from './components/pages/vendor-products-summary/vendor-products-summary.component';
import { VendorProductsComponent } from './components/pages/vendor-products/vendor-products.component';
import { VendorSettingsComponent } from './components/pages/vendor-settings/vendor-settings.component';
import { VendorsComponent } from './components/vendors.component';
import { StoresListsResolver, SuppliersListsResolver } from './components/vendors.resolvers';

export const vendorsRoutes: Route[] = [

    {
        path: '',
        component: VendorsComponent,
        resolve: {
            stores: StoresListsResolver,
            suppliers: SuppliersListsResolver
        }
    },
    {
        path: ':id',
        component: VendorsDetailsComponent,
        children: [
            {
                path: 'information',
                component: VendorTopOrderComponent,
                data: {
                    title: 'Vendor Information',
                    url: 'information'
                }
            },
            {
                path: 'top-order-products',
                component: VendorTopOrderComponent,
                data: {
                    title: 'Top Order Products',
                    url: 'top-order-products'
                }
            },
            {
                path: 'vendor-settings',
                component: VendorSettingsComponent,
                data: {
                    title: 'Vendor Settings',
                    url: 'vendor-settings'
                }
            },
            {
                path: 'vendor-products',
                component: VendorProductsComponent,
                data: {
                    title: 'Products',
                    url: 'vendor-products'
                }
            },
            {
                path: 'vendor-core-products',
                component: VendorCoreProductsComponent,
                data: {
                    title: 'Core Products',
                    url: 'vendor-core-products'
                }
            },
            {
                path: 'vendor-products-summary',
                component: VendorProductsSummaryComponent,
                data: {
                    title: 'Products/Updates',
                    url: 'vendor-products-summary'
                }
            }
        ]
    }

];
