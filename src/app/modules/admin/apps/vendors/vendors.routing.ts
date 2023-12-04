import { Route } from '@angular/router';
import { VendorsDetailsComponent } from './components/details/details-vendors.component';
import { StandardImprintsComponent } from './components/pages/standard-imprints/standard-imprints.component';
import { VendorTopOrderComponent } from './components/pages/top-order-products/top-order-products.component';
import { VendorApplicationComponent } from './components/pages/vendor-application/vendor-application.component';
import { VendorBlanketCoopComponent } from './components/pages/vendor-blanket-coop/vendor-blanket-coop.component';
import { VendorBlanketColorsComponent } from './components/pages/vendor-blanket-imprint-colors/vendor-blanket-imprint-colors.component';
import { VendorBlanketComponent } from './components/pages/vendor-blanket-location/vendor-blanket-location.component';
import { VendorCommentsComponent } from './components/pages/vendor-comments/vendor-comments.component';
import { VendorCoopComponent } from './components/pages/vendor-coop/vendor-coop.component';
import { VendorCoreProductsComponent } from './components/pages/vendor-core-products/vendor-core-products.component';
import { VendorFOBLocationComponent } from './components/pages/vendor-fob-locations/vendor-fob-locations.component';
import { VendorImprintColorsComponent } from './components/pages/vendor-imprint-colors/imprint-colors.component';
import { VendorOrdersComponent } from './components/pages/vendor-orders/vendor-orders.component';
import { VendorProductsStoreComponent } from './components/pages/vendor-product-store/vendor-product-store.component';
import { VendorProductsSummaryComponent } from './components/pages/vendor-products-summary/vendor-products-summary.component';
import { VendorProductsComponent } from './components/pages/vendor-products/vendor-products.component';
import { VendorRunChargesComponent } from './components/pages/vendor-run-charges/vendor-run-charges.component';
import { VendorSettingsComponent } from './components/pages/vendor-settings/vendor-settings.component';
import { VendorSetupChargesComponent } from './components/pages/vendor-setup-charges/vendor-setup-charges.component';
import { VendorSizingChartComponent } from './components/pages/vendor-sizing-chart/vendor-sizing-chart.component';
import { VendorStatusComponent } from './components/pages/vendor-status/vendor-status.component';
import { VendorUsersComponent } from './components/pages/vendor-users/vendor-users.component';
import { VendorVideosComponent } from './components/pages/vendor-videos/vendor-videos.component';
import { VendorsInfoComponent } from './components/pages/vendors-info/vendors-info.component';
import { VendorsComponent } from './components/vendors.component';
import { SuppliersByIdResolver, SuppliersListsResolver } from './components/vendors.resolvers';
import { VendorsProfileComponent } from './components/pages/vendor-profile/vendor-profile.component';
import { DesignerNotesComponent } from './components/pages/designer-notes/designer-notes.component';
import { OpenPurchaseOrdersComponent } from './components/pages/open-purchase-orders/open-purchase-orders.component';
export const vendorsRoutes: Route[] = [

    {
        path: '',
        component: VendorsComponent,
        resolve: {
            // suppliers: SuppliersListsResolver
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
                path: '',
                redirectTo: 'information',
                pathMatch: 'full'
            },
            {
                path: 'information',
                component: VendorsInfoComponent,
                data: {
                    title: 'Vendor Information',
                    url: 'information'
                }
            },
            {
                path: 'accounting-profile',
                component: VendorsProfileComponent,
                data: {
                    title: 'Accounting Profile',
                    url: 'accounting-profile'
                }
            },
            {
                path: 'top-order-products',
                component: VendorTopOrderComponent,
                data: {
                    title: 'Top Ordered Products',
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
                path: 'designer-notes',
                component: DesignerNotesComponent,
                data: {
                    title: 'Designer Notes',
                    url: 'designer-notes'
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
            },
            {
                path: 'vendor-coops',
                component: VendorCoopComponent,
                data: {
                    title: 'Co-Ops',
                    url: 'vendor-coops'
                }
            },
            {
                path: 'vendor-blanket-coops',
                component: VendorBlanketCoopComponent,
                data: {
                    title: 'Blanket Coop',
                    url: 'vendor-blanket-coops'
                }
            },
            {
                path: 'vendor-comments',
                component: VendorCommentsComponent,
                data: {
                    title: 'Vendor Comments',
                    url: 'vendor-comments'
                }
            },
            {
                path: 'vendor-orders',
                component: VendorOrdersComponent,
                data: {
                    title: 'Vendor Orders',
                    url: 'vendor-orders'
                }
            },
            {
                path: 'purchase-orders',
                component: OpenPurchaseOrdersComponent,
                data: {
                    title: 'Open POs',
                    url: 'purchase-orders'
                }
            },
            {
                path: 'vendor-application',
                component: VendorApplicationComponent,
                data: {
                    title: 'Supplier Application',
                    url: 'vendor-application'
                }
            },
            {
                path: 'vendor-standard-imprints',
                component: StandardImprintsComponent,
                data: {
                    title: 'Standard Imprints',
                    url: 'vendor-standard-imprints'
                }
            },
            {
                path: 'vendor-imprint-colors',
                component: VendorImprintColorsComponent,
                data: {
                    title: 'Imprint Colors',
                    url: 'vendor-imprint-colors'
                }
            },
            {
                path: 'vendor-blanket-collections',
                component: VendorBlanketColorsComponent,
                data: {
                    title: 'Blanket Collections',
                    url: 'vendor-blanket-collections'
                }
            },
            {
                path: 'vendor-run-charges',
                component: VendorRunChargesComponent,
                data: {
                    title: 'Blanket Run Charges',
                    url: 'vendor-run-charges'
                }
            },
            {
                path: 'vendor-setup-charges',
                component: VendorSetupChargesComponent,
                data: {
                    title: 'Blanket Setup Charges',
                    url: 'vendor-setup-charges'
                }
            },
            {
                path: 'vendor-users',
                component: VendorUsersComponent,
                data: {
                    title: 'Vendor Users',
                    url: 'vendor-users'
                }
            },
            {
                path: 'vendor-status',
                component: VendorStatusComponent,
                data: {
                    title: 'Vendor Status',
                    url: 'vendor-status'
                }
            }
        ]
    }

];
