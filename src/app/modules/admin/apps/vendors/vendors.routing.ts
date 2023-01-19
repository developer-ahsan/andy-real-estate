import { Route } from '@angular/router';
import { VendorsDetailsComponent } from './components/details/details-vendors.component';
import { VendorTopOrderComponent } from './components/pages/top-order-products/top-order-products.component';
import { VendorBlanketComponent } from './components/pages/vendor-blanket-location/vendor-blanket-location.component';
import { VendorCoreProductsComponent } from './components/pages/vendor-core-products/vendor-core-products.component';
import { VendorFOBLocationComponent } from './components/pages/vendor-fob-locations/vendor-fob-locations.component';
import { VendorProductsStoreComponent } from './components/pages/vendor-product-store/vendor-product-store.component';
import { VendorProductsSummaryComponent } from './components/pages/vendor-products-summary/vendor-products-summary.component';
import { VendorProductsComponent } from './components/pages/vendor-products/vendor-products.component';
import { VendorSettingsComponent } from './components/pages/vendor-settings/vendor-settings.component';
import { VendorSizingChartComponent } from './components/pages/vendor-sizing-chart/vendor-sizing-chart.component';
import { VendorVideosComponent } from './components/pages/vendor-videos/vendor-videos.component';
import { VendorsInfoComponent } from './components/pages/vendors-info/vendors-info.component';
import { VendorsComponent } from './components/vendors.component';
import { SuppliersByIdResolver, SuppliersListsResolver } from './components/vendors.resolvers';

export const vendorsRoutes: Route[] = [

    {
        path: '',
        component: VendorsComponent,
        resolve: {
            suppliers: SuppliersListsResolver
        }
    },
    {
        path: ':id',
        component: VendorsDetailsComponent,
        resolve: {
            suplier: SuppliersByIdResolver
        },
        children: [
            {
                path: 'information',
                component: VendorsInfoComponent,
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
            },
            {
                path: 'vendor-products-store',
                component: VendorProductsStoreComponent,
                data: {
                    title: 'Products/Store',
                    url: 'vendor-products-store'
                }
            },
            {
                path: 'vendor-fob-locations',
                component: VendorFOBLocationComponent,
                data: {
                    title: 'F.O.B Locations',
                    url: 'vendor-fob-locations'
                }
            },
            {
                path: 'vendor-blnaket-fob',
                component: VendorBlanketComponent,
                data: {
                    title: 'Blanket F.O.B',
                    url: 'vendor-blnaket-fob'
                }
            },
            {
                path: 'vendor-sizing-charts',
                component: VendorSizingChartComponent,
                data: {
                    title: 'Sizing Charts',
                    url: 'vendor-sizing-charts'
                }
            },
            {
                path: 'vendor-videos',
                component: VendorVideosComponent,
                data: {
                    title: 'Product Videos',
                    url: 'vendor-videos'
                }
            }
        ]
    }

];
