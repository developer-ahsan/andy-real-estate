import { Route } from '@angular/router';
import { InventoryComponent } from 'app/modules/admin/apps/ecommerce/inventory/inventory.component';
import { InventoryListComponent } from 'app/modules/admin/apps/ecommerce/inventory/list/inventory.component';
import { LicensingTermResolver, ProductDescriptionResolver, ProductsListsResolver, StoresListResolver, SuppliersListResolver, SystemDistributorCodes } from 'app/modules/admin/apps/ecommerce/inventory/inventory.resolvers';
import { CustomersComponent } from 'app/modules/admin/apps/ecommerce/customers/customers.component';
import { CustomersListComponent } from 'app/modules/admin/apps/ecommerce/customers/list/customers.component';
import { GetCustomer, GetCustomersList } from 'app/modules/admin/apps/ecommerce/customers/customers.resolvers';
import { CustomersTabComponent } from 'app/modules/admin/apps/ecommerce/customers/tabs/customers.component';
import { ProductDetailsComponent } from 'app/modules/admin/apps/ecommerce/inventory/details/product-details.component';
import { ProductStoreComponent } from './product-store/store.component';
import { ProductsDescriptionComponent } from './inventory/navigation/products-description/products-description.component';
import { ProductSizesComponent } from './inventory/list/product-sizes/product-sizes.component';
import { ProductColorSizesComponent } from './inventory/navigation/sizes/color-sizes/color-sizes.component';
import { ProductImprintsComponent } from './inventory/list/product-imprints/product-imprints';
import { ProductsPhysicsComponent } from './inventory/navigation/products-physics/products-physics.component';
import { NetCostComponent } from './inventory/navigation/net-cost/net-cost.component';
import { PromostandardColorsComponent } from './inventory/navigation/promostandard-colors/promostandard-colors.component';
import { FeatureComponent } from './inventory/navigation/feature/feature.component';
import { PackageComponent } from './inventory/navigation/package/package.component';
import { DefaultImageComponent } from './inventory/navigation/default-image/default-image.component';
import { DefaultMarginsComponent } from './inventory/navigation/default-margins/default-margins.component';
import { VideoComponent } from './inventory/navigation/video/video.component';
import { SwatchesComponent } from './inventory/navigation/swatches/swatches.component';
import { ArtworkComponent } from './inventory/navigation/artwork/artwork.component';
import { ReviewsComponent } from './inventory/navigation/reviews/reviews.component';
import { DietaryInfoComponent } from './inventory/navigation/dietary-info/dietary-info.component';
import { LicensingTermComponent } from './inventory/navigation/licensing-term/licensing-term.component';
import { CoreProductsComponent } from './inventory/navigation/core-products/core-products.component';
import { DuplicateComponent } from './inventory/navigation/duplicate/duplicate.component';
import { InternalNotesComponent } from './inventory/navigation/internal-notes/internal-notes.component';
import { OrderHistoryComponent } from './inventory/navigation/order-history/order-history.component';
import { ProductsStatusComponent } from './inventory/navigation/products-status/products-status.component';
import { UpdateHistoryComponent } from './inventory/navigation/update-history/update-history.component';
import { WarehouseComponent } from './inventory/navigation/warehouse/warehouse.component';
import { ColorComponent } from './inventory/navigation/color/color.component';
import { ImprintComponent } from './inventory/navigation/imprint/imprint.component';
import { ProductStatusComponent } from './inventory/navigation/product-status/product-status.component';
import { SizesComponent } from './inventory/navigation/sizes/sizes.component';
import { StoreProductDetailsComponent } from './product-store/details/product-details.component';
import { StoreProductDescriptionResolver } from './product-store/store.resolvers';
import { PricingComponent } from './product-store/navigation/pricing/pricing.component';
import { ShippingComponent } from './product-store/navigation/shipping/shipping.component';
import { StoreLevelCoopComponent } from './product-store/navigation/store-level-coop/store-level-coop.component';
import { CategoriesComponent } from './product-store/navigation/categories/categories.component';
import { ExtrinsicComponent } from './product-store/navigation/extrinsic-categories/extrinsic-categories.component';
import { SpecialDescComponent } from './product-store/navigation/special-description/special-description.component';
import { PermalinkComponent } from './product-store/navigation/permalink/permalink.component';
import { RelatedProdcutsComponent } from './product-store/navigation/related-products/related-products.component';
import { ProductOptionsComponent } from './product-store/navigation/product-options/product-options.component';
import { RoyalitySettingsComponent } from './product-store/navigation/royality-settings/royality-settings.component';
import { StoreImagesComponent } from './product-store/navigation/images/images.component';
import { StoreProductVideosComponent } from './product-store/navigation/videos/videos.component';
import { StoreColorsComponent } from './product-store/navigation/colors/colors.component';
import { StoreImprintsComponent } from './product-store/navigation/imprints/imprints.component';
import { VirtualProofImagesComponent } from './product-store/navigation/virtual-proof-images/virtual-proof-images.component';
import { ProductReviewsComponent } from './product-store/navigation/product-reviews/product-reviews.component';
import { StoreUpdateHistoryComponent } from './product-store/navigation/update-history/update-history.component';
import { ProfitCalculatorComponent } from './product-store/navigation/profit-calculator/profit-calculator.component';
import { RemoveFromStoreComponent } from './product-store/navigation/remove-from-store/remove-from-store.component';
import { RemoveProductComponent } from './inventory/navigation/delete-product/delete-product.component';
import { StoreProductStatusComponent } from './product-store/navigation/store-product-status/store-product-status.component';
import { ProductQuoteComponent } from './inventory/navigation/product-quote/product-quote.component';

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
            // suppliers: SuppliersListResolver
        },
        children: [
            {
                path: '',
                component: InventoryListComponent,
                resolve: {
                    products: ProductsListsResolver,
                    // stores: StoresListResolver
                }
            },
            {
                path: ':id',
                component: ProductDetailsComponent,
                resolve: {
                    product: ProductDescriptionResolver,
                    // licensingTerms: LicensingTermResolver
                },
                children: [
                    {
                        path: '',
                        redirectTo: 'name-description',
                        pathMatch: 'full'
                    },
                    {
                        path: 'status',
                        component: ProductStatusComponent,
                        data: {
                            title: 'Product Status',
                            url: 'status'
                        }
                    },
                    {
                        path: 'name-description',
                        component: ProductsDescriptionComponent,
                        data: {
                            title: 'Name & Description',
                            url: 'name-description'
                        }
                    },
                    {
                        path: 'physics-shipping',
                        component: ProductsPhysicsComponent,
                        data: {
                            title: 'Physics & Shipping',
                            url: 'physics-shipping'
                        }
                    },
                    {
                        path: 'net-cost',
                        component: NetCostComponent,
                        data: {
                            title: 'Net Cost',
                            url: 'net-cost'
                        }
                    },
                    {
                        path: 'imprints',
                        component: ImprintComponent,
                        data: {
                            title: 'Imprints',
                            url: 'imprints'
                        }
                    },
                    {
                        path: 'colors',
                        component: ColorComponent,
                        data: {
                            title: 'Colors',
                            url: 'colors'
                        }
                    },
                    {
                        path: 'sizes',
                        component: SizesComponent,
                        data: {
                            title: 'Sizes',
                            url: 'sizes'
                        }
                    },
                    {
                        path: 'inventory',
                        component: PromostandardColorsComponent,
                        data: {
                            title: 'Inventory',
                            url: 'inventory'
                        }
                    },
                    {
                        path: 'features',
                        component: FeatureComponent,
                        data: {
                            title: 'Features',
                            url: 'features'
                        }
                    },
                    {
                        path: 'pack-accessories',
                        component: PackageComponent,
                        data: {
                            title: 'Pack & Accessories',
                            url: 'pack-accessories'
                        }
                    },
                    {
                        path: 'default-images',
                        component: DefaultImageComponent,
                        data: {
                            title: 'Default Images',
                            url: 'default-images'
                        }
                    },
                    {
                        path: 'default-margins',
                        component: DefaultMarginsComponent,
                        data: {
                            title: 'Default Margins',
                            url: 'default-margins'
                        }
                    },
                    {
                        path: 'video',
                        component: VideoComponent,
                        data: {
                            title: 'Video',
                            url: 'video'
                        }
                    },
                    {
                        path: 'swatches',
                        component: SwatchesComponent,
                        data: {
                            title: 'Swatches',
                            url: 'swatches'
                        }
                    },
                    {
                        path: 'art-template',
                        component: ArtworkComponent,
                        data: {
                            title: 'Artwork Template',
                            url: 'art-template'
                        }
                    },
                    {
                        path: 'product-reviews',
                        component: ReviewsComponent,
                        data: {
                            title: 'Product Reviews',
                            url: 'product-reviews'
                        }
                    },
                    {
                        path: 'dietary-information',
                        component: DietaryInfoComponent,
                        data: {
                            title: 'Dietary Information',
                            url: 'dietary-information'
                        }
                    },
                    {
                        path: 'licensing-terms',
                        component: LicensingTermComponent,
                        data: {
                            title: 'Licensing Terms',
                            url: 'licensing-terms'
                        }
                    },
                    {
                        path: 'warehouse-options',
                        component: WarehouseComponent,
                        data: {
                            title: 'Warehouse Options',
                            url: 'warehouse-options'
                        }
                    },
                    {
                        path: 'product-quote',
                        component: ProductQuoteComponent,
                        data: {
                            title: 'Product Quote',
                            url: 'product-quote'
                        }
                    },
                    {
                        path: 'store-versions',
                        component: ProductsStatusComponent,
                        data: {
                            title: 'Store Versions',
                            url: 'store-versions'
                        }
                    },
                    {
                        path: 'update-history',
                        component: UpdateHistoryComponent,
                        data: {
                            title: 'Update History',
                            url: 'update-history'
                        }
                    },
                    {
                        path: 'order-history',
                        component: OrderHistoryComponent,
                        data: {
                            title: 'Order History',
                            url: 'order-history'
                        }
                    },
                    {
                        path: 'internal-notes',
                        component: InternalNotesComponent,
                        data: {
                            title: 'Internal Notes',
                            url: 'internal-notes'
                        }
                    },
                    {
                        path: 'core-products',
                        component: CoreProductsComponent,
                        data: {
                            title: 'Core Products',
                            url: 'core-products'
                        }
                    },
                    {
                        path: 'duplicate',
                        component: DuplicateComponent,
                        data: {
                            title: 'Duplicate',
                            url: 'duplicate'
                        }
                    },
                    {
                        path: 'remove-product',
                        component: RemoveProductComponent,
                        data: {
                            title: 'Remove Product',
                            url: 'remove-product'
                        }
                    }
                ]
            },
            {
                path: 'storeProduct/:id',
                component: StoreProductDetailsComponent,
                resolve: {
                    product: StoreProductDescriptionResolver
                },
                children: [
                    {
                        path: '',
                        redirectTo: 'pricing',
                        pathMatch: 'full'
                    },
                    {
                        path: 'pricing',
                        component: PricingComponent,
                        data: {
                            title: 'Pricing',
                            url: 'pricing'
                        }
                    },
                    {
                        path: 'shipping',
                        component: ShippingComponent,
                        data: {
                            title: 'Shipping',
                            url: 'shipping'
                        }
                    },
                    {
                        path: 'store-level-coop',
                        component: StoreLevelCoopComponent,
                        data: {
                            title: 'Store-Level Coop',
                            url: 'store-level-coop'
                        }
                    },
                    {
                        path: 'categories',
                        component: CategoriesComponent,
                        data: {
                            title: 'Categories',
                            url: 'categories'
                        }
                    },
                    {
                        path: 'extrinsic-category',
                        component: ExtrinsicComponent,
                        data: {
                            title: 'Extrinsic Category',
                            url: 'extrinsic-category'
                        }
                    },
                    {
                        path: 'special-description',
                        component: SpecialDescComponent,
                        data: {
                            title: 'Special Description',
                            url: 'special-description'
                        }
                    },
                    {
                        path: 'permalink',
                        component: PermalinkComponent,
                        data: {
                            title: 'Permalink',
                            url: 'permalink'
                        }
                    },
                    {
                        path: 'related-products',
                        component: RelatedProdcutsComponent,
                        data: {
                            title: 'Related Products',
                            url: 'related-products'
                        }
                    },
                    {
                        path: 'product-options',
                        component: ProductOptionsComponent,
                        data: {
                            title: 'Product Options',
                            url: 'product-options'
                        }
                    },
                    {
                        path: 'royality-settings',
                        component: RoyalitySettingsComponent,
                        data: {
                            title: 'Royality Settings',
                            url: 'royality-settings'
                        }
                    },
                    {
                        path: 'images',
                        component: StoreImagesComponent,
                        data: {
                            title: 'Images',
                            url: 'images'
                        }
                    },
                    {
                        path: 'video',
                        component: StoreProductVideosComponent,
                        data: {
                            title: 'Video',
                            url: 'video'
                        }
                    },
                    {
                        path: 'colors',
                        component: StoreColorsComponent,
                        data: {
                            title: 'Colors',
                            url: 'colors'
                        }
                    },
                    {
                        path: 'imprints',
                        component: StoreImprintsComponent,
                        data: {
                            title: 'Imprints',
                            url: 'imprints'
                        }
                    },
                    {
                        path: 'virtual-proof-images',
                        component: VirtualProofImagesComponent,
                        data: {
                            title: 'Virtual Proof Images',
                            url: 'virtual-proof-images'
                        }
                    },
                    {
                        path: 'product-reviews',
                        component: ProductReviewsComponent,
                        data: {
                            title: 'Product Reviews',
                            url: 'product-reviews'
                        }
                    },
                    {
                        path: 'update-history',
                        component: StoreUpdateHistoryComponent,
                        data: {
                            title: 'Update History',
                            url: 'update-history'
                        }
                    },
                    {
                        path: 'master-product',
                        component: WarehouseComponent,
                        data: {
                            title: 'Master Product',
                            url: 'master-product'
                        }
                    },
                    {
                        path: 'store-versions',
                        component: ProductsStatusComponent,
                        data: {
                            title: 'Store Versions',
                            url: 'store-versions'
                        }
                    },
                    {
                        path: 'profit-calculator',
                        component: ProfitCalculatorComponent,
                        data: {
                            title: 'Profit Calculator',
                            url: 'profit-calculator'
                        }
                    },
                    {
                        path: 'remove-from-store',
                        component: RemoveFromStoreComponent,
                        data: {
                            title: 'Remove From Store',
                            url: 'remove-from-store'
                        }
                    },
                    {
                        path: 'store-product-status',
                        component: StoreProductStatusComponent,
                        data: {
                            title: 'Status',
                            url: 'store-product-status'
                        }
                    }
                ]
            },
        ]
    },
    // {
    //     path: 'customers',
    //     component: CustomersComponent,
    //     children: [
    //         {
    //             path: '',
    //             component: CustomersListComponent,
    //             resolve: {
    //                 customers: GetCustomersList
    //             }
    //         },
    //         {
    //             path: ':id',
    //             component: CustomersTabComponent,
    //             resolve: {
    //                 customer: GetCustomer
    //             }
    //         },
    //     ]
    // }
];
