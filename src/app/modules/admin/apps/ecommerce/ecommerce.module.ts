import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { SharedModule } from 'app/shared/shared.module';
import { InventoryComponent } from 'app/modules/admin/apps/ecommerce/inventory/inventory.component';
import { InventoryListComponent } from 'app/modules/admin/apps/ecommerce/inventory/list/inventory.component';
import { ecommerceRoutes } from 'app/modules/admin/apps/ecommerce/ecommerce.routing';
import { CustomersComponent } from 'app/modules/admin/apps/ecommerce/customers/customers.component';
import { CustomersListComponent } from 'app/modules/admin/apps/ecommerce/customers/list/customers.component';
import { CustomersTabComponent } from 'app/modules/admin/apps/ecommerce/customers/tabs/customers.component';
import { UserAddressComponent } from './customers/tabs/user-address/user-address.component';
import { UserMetricsComponent } from './customers/tabs/user-metrics/user-metrics.component';
import { CreditTermsComponent } from './customers/tabs/credit-terms/credit-terms.component';
import { CreditApplicationsComponent } from './customers/tabs/credit-applications/credit-applications.component';
import { UserCommentsComponent } from './customers/tabs/user-comments/user-comments.component';
import { UserLocationsComponent } from './customers/tabs/user-locations/user-locations.component';
import { ApprovalContactsComponent } from './customers/tabs/approval-contacts/approval-contacts.component';
import { RemindersComponent } from './customers/tabs/reminders/reminders.component';
import { OrdersHistoryComponent } from './customers/tabs/orders-history/orders-history.component';
import { FulfillmentOrdersComponent } from './customers/tabs/fulfillment-orders/fulfillment-orders.component';
import { SendRegisterEmailsComponent } from './customers/tabs/send-register-emails/send-register-emails.component';
import { StoreUsageComponent } from './customers/tabs/store-usage/store-usage.component';
import { CashbackComponent } from './customers/tabs/cashback/cashback.component';
import { LogoBankComponent } from './customers/tabs/logo-bank/logo-bank.component';
import { GroupOrdersComponent } from './customers/tabs/group-orders/group-orders.component';
import { QuotesComponent } from './customers/tabs/quotes/quotes.component';
import { SavedCartsComponent } from './customers/tabs/saved-carts/saved-carts.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ProductDetailsComponent } from 'app/modules/admin/apps/ecommerce/inventory/details/product-details.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ProductsDescriptionComponent } from './inventory/navigation/products-description/products-description.component';
import { ProductsPhysicsComponent } from './inventory/navigation/products-physics/products-physics.component';
import { NetCostComponent } from './inventory/navigation/net-cost/net-cost.component';
import { ProductsStatusComponent } from './inventory/navigation/products-status/products-status.component';
import { ColorComponent } from './inventory/navigation/color/color.component';
import { FeatureComponent } from './inventory/navigation/feature/feature.component';
import { DefaultMarginsComponent } from './inventory/navigation/default-margins/default-margins.component';
import { PackageComponent } from './inventory/navigation/package/package.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { DefaultImageComponent } from './inventory/navigation/default-image/default-image.component';
import { VideoComponent } from './inventory/navigation/video/video.component';
import { ArtworkComponent } from './inventory/navigation/artwork/artwork.component';
import { ReviewsComponent } from './inventory/navigation/reviews/reviews.component';
import { DietaryInfoComponent } from './inventory/navigation/dietary-info/dietary-info.component';
import { LicensingTermComponent } from './inventory/navigation/licensing-term/licensing-term.component';
import { WarehouseComponent } from './inventory/navigation/warehouse/warehouse.component';
import { CoreProductsComponent } from './inventory/navigation/core-products/core-products.component';
import { UpdateHistoryComponent } from './inventory/navigation/update-history/update-history.component';
import { OrderHistoryComponent } from './inventory/navigation/order-history/order-history.component';
import { InternalNotesComponent } from './inventory/navigation/internal-notes/internal-notes.component';
import { DuplicateComponent } from './inventory/navigation/duplicate/duplicate.component';
import { ImprintComponent } from './inventory/navigation/imprint/imprint.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { SwatchesComponent } from './inventory/navigation/swatches/swatches.component';
import { UserInfoComponent } from './customers/tabs/user-info/user-info.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SizesComponent } from './inventory/navigation/sizes/sizes.component';
import { QuillModule } from 'ngx-quill'

@NgModule({
    declarations: [
        InventoryComponent,
        InventoryListComponent,
        ProductDetailsComponent,
        CustomersComponent,
        CustomersListComponent,
        CustomersTabComponent,
        UserAddressComponent,
        UserMetricsComponent,
        CreditTermsComponent,
        CreditApplicationsComponent,
        UserCommentsComponent,
        UserLocationsComponent,
        ApprovalContactsComponent,
        RemindersComponent,
        OrdersHistoryComponent,
        FulfillmentOrdersComponent,
        SendRegisterEmailsComponent,
        StoreUsageComponent,
        CashbackComponent,
        LogoBankComponent,
        GroupOrdersComponent,
        QuotesComponent,
        SavedCartsComponent,
        ProductDetailsComponent,
        ProductsDescriptionComponent,
        ProductsPhysicsComponent,
        NetCostComponent,
        ProductsStatusComponent,
        ColorComponent,
        FeatureComponent,
        DefaultMarginsComponent,
        PackageComponent,
        DefaultImageComponent,
        VideoComponent,
        ArtworkComponent,
        ReviewsComponent,
        DietaryInfoComponent,
        LicensingTermComponent,
        WarehouseComponent,
        CoreProductsComponent,
        UpdateHistoryComponent,
        OrderHistoryComponent,
        InternalNotesComponent,
        DuplicateComponent,
        ImprintComponent,
        SwatchesComponent,
        UserInfoComponent,
        SizesComponent
    ],
    imports: [
        RouterModule.forChild(ecommerceRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTableModule,
        MatTooltipModule,
        SharedModule,
        MatTabsModule,
        MatCardModule,
        MatGridListModule,
        MatDividerModule,
        MatRadioModule,
        MatListModule,
        NgxSkeletonLoaderModule,
        MatStepperModule,
        MatProgressSpinnerModule,
        MatSidenavModule,
        NgxDropzoneModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatExpansionModule,
        NgxSliderModule,
        MatSnackBarModule,
        MatButtonToggleModule,
        QuillModule.forRoot(),
    ]
})
export class ECommerceModule {
}
