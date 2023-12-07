import { Route } from '@angular/router';
import { SystemComponent } from './components/system.component';
import { StoresListsResolver, SuppliersListsResolver } from './components/system.resolvers';
import { ColorsComponent } from './components/pages/colors/colors.component';
import { SizesComponent } from './components/pages/sizes/sizes.component';
import { PackAndAccessoriesComponent } from './components/pages/pack-accessories/pack-accessories.component';
import { CoreProductsComponent } from './components/pages/core-products/core-products.component';
import { ProductMigrationsComponent } from './components/pages/product-migrations/product-migrations.component';
import { PromoCodesComponent } from './components/pages/promo-codes/promo-codes.component';
import { ImprintColorsComponent } from './components/pages/imprint-colors/imprint-colors.component';
import { ImprintMethodsComponent } from './components/pages/imprint-methods/imprint-methods.component';
import { ImprintLocationsComponent } from './components/pages/imprint-locations/imprint-locations.component';
import { ImprintChargesComponent } from './components/pages/imprint-charges/imprint-charges.component';
import { StandardImprintsComponent } from './components/pages/standard-imprints/standard-imprints.component';
import { POArchivesComponent } from './components/pages/po-archives/po-archives.component';
import { CountrySalesComponent } from './components/pages/country-sales/country-sales.component';
import { ActiveStoresComponent } from './components/pages/active-stores/active-stores.component';
import { DefaultBlurbsComponent } from './components/pages/default-blurbs/default-blurbs.component';
import { SupportTeamComponent } from './components/pages/support-team/support-team.component';
import { DiagonosticsComponent } from './components/pages/diagonostics/diagonostics.component';
import { AdminToolsComponent } from './components/pages/admin-tools/admin-tools.component';
import { AdminStructureComponent } from './components/pages/admin-structure/admin-structure.component';
import { PermissionGroupsComponent } from './components/pages/permissions-groups/permissions-groups.component';
import { UploadImagesComponent } from './components/pages/upload-images/upload-images.component';
import { SimulatorComponent } from './components/pages/simulator/simulator.component';

export const systemRoutes: Route[] = [

    {
        path: '',
        component: SystemComponent,
        resolve: {
            // stores: StoresListsResolver,
            // suppliers: SuppliersListsResolver
        },
        children: [
            {
                path: '',
                redirectTo: 'colors',
                pathMatch: 'full'
            },
            {
                path: 'colors',
                component: ColorsComponent,
                data: {
                    title: 'Product Colors',
                    url: 'colors'
                }
            },
            {
                path: 'sizes',
                component: SizesComponent,
                data: {
                    title: 'Product Sizes',
                    url: 'sizes'
                }
            },
            {
                path: 'pack-accessories',
                component: PackAndAccessoriesComponent,
                data: {
                    title: 'Pack/Accessories',
                    url: 'pack-accessories'
                }
            },
            {
                path: 'core-products',
                loadChildren: () => import('app/modules/admin/apps/system/components/pages/core-products/core-products.module').then(m => m.CoreProductsModule),
                data: {
                    title: 'Core Products',
                    url: 'core-products'
                }
            },
            {
                path: 'product-migration',
                component: ProductMigrationsComponent,
                data: {
                    title: 'Product Migration',
                    url: 'product-migration'
                }
            },
            {
                path: 'promo-codes',
                component: PromoCodesComponent,
                data: {
                    title: 'Promo Codes',
                    url: 'promo-codes'
                }
            },
            {
                path: 'imprint-colors',
                component: ImprintColorsComponent,
                data: {
                    title: 'Imprint Colors',
                    url: 'imprint-colors'
                }
            },
            {
                path: 'imprint-methods',
                component: ImprintMethodsComponent,
                data: {
                    title: 'Imprint Methods',
                    url: 'imprint-methods'
                }
            },
            {
                path: 'imprint-locations',
                component: ImprintLocationsComponent,
                data: {
                    title: 'Imprint Locations',
                    url: 'imprint-locations'
                }
            },
            {
                path: 'imprint-charges',
                component: ImprintChargesComponent,
                data: {
                    title: 'Imprint Charges',
                    url: 'imprint-charges'
                }
            },
            {
                path: 'standard-imprints',
                component: StandardImprintsComponent,
                data: {
                    title: 'Standard Imprints',
                    url: 'standard-imprints'
                }
            },
            {
                path: 'po-archives',
                component: POArchivesComponent,
                data: {
                    title: 'P.O. Archives',
                    url: 'po-archives'
                }
            },
            {
                path: 'sales-tax',
                component: CountrySalesComponent,
                data: {
                    title: 'OH County Sales Tax',
                    url: 'sales-tax'
                }
            },
            {
                path: 'active-stores',
                component: ActiveStoresComponent,
                data: {
                    title: 'Active Stores',
                    url: 'active-stores'
                }
            },
            {
                path: 'default-blurbs',
                component: DefaultBlurbsComponent,
                data: {
                    title: 'Default Blurbs',
                    url: 'default-blurbs'
                }
            },
            {
                path: 'support-team',
                component: SupportTeamComponent,
                data: {
                    title: 'Default Support Team',
                    url: 'support-team'
                }
            },
            {
                path: 'diagnostics',
                component: DiagonosticsComponent,
                data: {
                    title: 'Diagnostics',
                    url: 'diagnostics'
                }
            },
            {
                path: 'admin-tools',
                component: AdminToolsComponent,
                data: {
                    title: 'Admin Tools',
                    url: 'admin-tools'
                }
            },
            {
                path: 'admin-structure',
                component: AdminStructureComponent,
                data: {
                    title: 'Admin Structure',
                    url: 'admin-structure'
                }
            },
            {
                path: 'permission-groups',
                component: PermissionGroupsComponent,
                data: {
                    title: 'Permission Groups',
                    url: 'permission-groups'
                }
            },
            {
                path: 'upload-images',
                component: UploadImagesComponent,
                data: {
                    title: 'Upload Images',
                    url: 'upload-images'
                }
            },
            {
                path: 'simulator',
                component: SimulatorComponent,
                data: {
                    title: 'Simulator',
                    url: 'simulator'
                }
            }
        ]
    }

];
