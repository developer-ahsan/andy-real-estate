import { Route } from '@angular/router';
import { FileManagerComponent } from 'app/modules/admin/apps/file-manager/store-manager.component';
import { StoresListComponent } from 'app/modules/admin/apps/file-manager/list/list.component';
import { StoresDetailsComponent } from 'app/modules/admin/apps/file-manager/details/details.component';
import { StoresListResolver, StoreDetailsByID, StoreSettingsByID, SupplierResolver } from 'app/modules/admin/apps/file-manager/store-manager.resolvers';
import { DashboardComponent } from './navigation/dashboard/dashboard.component';
import { ArtApprovalComponent } from './navigation/art-approval-settings/art-approval.component';
import { CampaignsComponent } from './navigation/campaigns/campaigns.component';
import { ConsolidatedBillComponent } from './navigation/consolidated-bill/consolidated-bill.component';
import { CostCenterCodeComponent } from './navigation/cost-center-code/cost-center-code.component';
import { CreditTermsComponent } from './navigation/credit-terms/credit-terms.component';
import { CustomerReviewsComponent } from './navigation/customer-reviews/customer-reviews.component';
import { EmailBlastComponent } from './navigation/email-blast/email-blast.component';
import { FullfilmentContactsComponent } from './navigation/fullfilment-contacts/fullfilment-contacts.component';
import { InventorySummaryComponent } from './navigation/inventory-summary/inventory-summary.component';
import { LocationsComponent } from './navigation/locations/locations.component';
import { MarginsComponent } from './navigation/margins/margins.component';
import { OptInUserDataComponent } from './navigation/opt-in-user-data/opt-in-user-data.component';
import { PresentationComponent } from './navigation/presentation/presentation.component';
import { ProductCategoriesComponent } from './navigation/product-categories/product-categories.component';
import { ProductsSuppliersComponent } from './navigation/products-suppliers/products-suppliers.component';
import { RapidbuildActionsComponent } from './navigation/rapidbuild-actions/rapidbuild-actions.component';
import { RapidbuildComponent } from './navigation/rapidbuild/rapidbuild.component';
import { RoyaltiesComponent } from './navigation/royalties/royalties.component';
import { SearchHistoryComponent } from './navigation/search-history/search-history.component';
import { StorePlanComponent } from './navigation/store-plan/store-plan.component';
import { StoreProductsComponent } from './navigation/store-products/store-products.component';
import { StoreSettingsComponent } from './navigation/store-settings/store-settings.component';
import { StoreSuppliersComponent } from './navigation/store-suppliers/store-suppliers.component';
import { StoreVideosComponent } from './navigation/store-videos/store-videos.component';
import { StudentOrgComponent } from './navigation/student-org/student-org.component';
import { SurveysComponent } from './navigation/surveys/surveys.component';
import { UserDataFileComponent } from './navigation/user-data-file/user-data-file.component';
import { OfflineProductsComponent } from './navigation/offline-products/offline-products.component';
import { FulfillOptionsComponent } from './navigation/fulfill-options/fulfill-options.component';
import { FulfillmentInvoicesComponent } from './navigation/fulfillment-invoices/fulfillment-invoices.component';
import { ResetTopTenComponent } from './navigation/reset-top-ten/reset-top-ten.component';
import { GroupOrderSettingsComponent } from './navigation/group-order-settings/group-order-settings.component';
import { ApparelDecoratorComponent } from './navigation/apparel-decorator/apparel-decorator.component';

export const storeRoutes: Route[] = [
    {
        path: '',
        component: StoresListComponent,
        resolve: {
            // items: StoresListResolver,
            // suppliers: SupplierResolver
        }
    },
    {
        path: ':id',
        component: StoresDetailsComponent,
        resolve: {
            details: StoreDetailsByID,
            settings: StoreSettingsByID
        },
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                component: DashboardComponent,
                data: {
                    title: 'Dashboard',
                    url: 'dashboard'
                }
            },
            {
                path: 'campaigns',
                component: CampaignsComponent,
                data: {
                    title: 'Campaigns',
                    url: 'campaigns'
                }
            },
            {
                path: 'email-blast',
                component: EmailBlastComponent,
                data: {
                    title: 'Email Blast',
                    url: 'email-blast'
                }
            },
            {
                path: 'surveys',
                component: SurveysComponent,
                data: {
                    title: 'Surveys',
                    url: 'surveys'
                }
            },
            {
                path: 'user-data-file',
                component: UserDataFileComponent,
                data: {
                    title: 'User Data File',
                    url: 'user-data-file'
                }
            },
            {
                path: 'optin-data-file',
                component: OptInUserDataComponent,
                data: {
                    title: 'Opt-In Data File',
                    url: 'optin-data-file'
                }
            },
            {
                path: 'store-products',
                component: StoreProductsComponent,
                data: {
                    title: 'Store Products',
                    url: 'store-products'
                }
            },
            {
                path: 'product-categories',
                loadChildren: () => import('./navigation/product-categories/product-categories.module').then(m => m.ProductCategoriesModule),
                // component: ProductCategoriesComponent,
                data: {
                    title: 'Product Categories',
                    url: 'product-categories'
                }
            },
            {
                path: 'product-suppliers',
                component: ProductsSuppliersComponent,
                data: {
                    title: 'Products/Supplier',
                    url: 'product-suppliers'
                }
            },
            {
                path: 'store-product-videos',
                component: StoreVideosComponent,
                data: {
                    title: 'Store Product Videos',
                    url: 'store-product-videos'
                }
            },
            {
                path: 'rapid-build',
                component: RapidbuildComponent,
                data: {
                    title: 'RapidBuild',
                    url: 'rapid-build'
                }
            },
            {
                path: 'rapidbuild-action',
                component: RapidbuildActionsComponent,
                data: {
                    title: 'RapidBuild Bulk Actions',
                    url: 'rapidbuild-action'
                }
            },
            {
                path: 'store-suppliers',
                component: StoreSuppliersComponent,
                data: {
                    title: 'Store Suppliers',
                    url: 'store-suppliers'
                }
            },
            {
                path: 'search-history',
                component: SearchHistoryComponent,
                data: {
                    title: 'Search History',
                    url: 'search-history'
                }
            },
            {
                path: 'customer-reviews',
                component: CustomerReviewsComponent,
                data: {
                    title: 'Customer Reviews',
                    url: 'customer-reviews'
                }
            },
            {
                path: 'inventory-summary',
                component: InventorySummaryComponent,
                data: {
                    title: 'Inventory Summary',
                    url: 'inventory-summary'
                }
            },
            {
                path: 'offline-products',
                component: OfflineProductsComponent,
                data: {
                    title: 'Offline Products',
                    url: 'offline-products'
                }
            },
            {
                path: 'store-settings',
                component: StoreSettingsComponent,
                data: {
                    title: 'Store Settings',
                    url: 'store-settings'
                }
            },
            {
                path: 'margins',
                component: MarginsComponent,
                data: {
                    title: 'Margins',
                    url: 'margins'
                }
            },
            {
                path: 'fulfillment-contacts',
                component: FullfilmentContactsComponent,
                data: {
                    title: 'Fulfillment Contacts',
                    url: 'fulfillment-contacts'
                }
            },
            {
                path: 'fulfillment-options',
                component: FulfillOptionsComponent,
                data: {
                    title: 'Fulfillment Options',
                    url: 'fulfillment-options'
                }
            },
            {
                path: 'fulfillment-invoices',
                component: FulfillmentInvoicesComponent,
                data: {
                    title: 'Fulfillment Invoices',
                    url: 'fulfillment-invoices'
                }
            },
            {
                path: 'royalties',
                component: RoyaltiesComponent,
                data: {
                    title: 'Royalties',
                    url: 'royalties'
                }
            },
            {
                path: 'art-approval-settings',
                component: ArtApprovalComponent,
                data: {
                    title: 'Art Approval Settings',
                    url: 'art-approval-settings'
                }
            },
            {
                path: 'consolidated-bill',
                component: ConsolidatedBillComponent,
                data: {
                    title: 'Consolidated Bill',
                    url: 'consolidated-bill'
                }
            },
            {
                path: 'presentation',
                component: PresentationComponent,
                data: {
                    title: 'Presentation',
                    url: 'presentation'
                }
            },
            {
                path: 'cost-center-codes',
                component: CostCenterCodeComponent,
                data: {
                    title: 'Cost Center Codes',
                    url: 'cost-center-codes'
                }
            },
            {
                path: 'locations',
                component: LocationsComponent,
                data: {
                    title: 'Locations',
                    url: 'locations'
                }
            },
            {
                path: 'blanket-credit-terms',
                component: CreditTermsComponent,
                data: {
                    title: 'Blanket Credit Terms',
                    url: 'blanket-credit-terms'
                }
            },
            {
                path: 'student-orgs',
                component: StudentOrgComponent,
                data: {
                    title: 'Student Orgs',
                    url: 'student-orgs'
                }
            },
            {
                path: 'store-plan',
                component: StorePlanComponent,
                data: {
                    title: 'Store Plan/Strategies',
                    url: 'store-plan'
                }
            },
            {
                path: 'reset-top-ten',
                component: ResetTopTenComponent,
                data: {
                    title: 'Reset Top Ten',
                    url: 'reset-top-ten'
                }
            },
            {
                path: 'group-order-settings',
                component: GroupOrderSettingsComponent,
                data: {
                    title: 'Group Order Settings',
                    url: 'group-order-settings'
                }
            },
            {
                path: 'store-apparel-decorator',
                component: ApparelDecoratorComponent,
                data: {
                    title: 'Store Apparel Decorator',
                    url: 'store-apparel-decorator'
                }
            },

        ]
    }
];
