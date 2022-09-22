import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SharedModule } from "app/shared/shared.module";
import { storeRoutes } from "app/modules/admin/apps/file-manager/stores.routing";
import { FileManagerComponent } from "app/modules/admin/apps/file-manager/store-manager.component";
import { StoresDetailsComponent } from "app/modules/admin/apps/file-manager/details/details.component";
import { StoresListComponent } from "app/modules/admin/apps/file-manager/list/list.component";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatInputModule } from "@angular/material/input";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { QuillModule } from "ngx-quill";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { DashboardComponent } from "./navigation/dashboard/dashboard.component";
import { StoreProductsComponent } from "./navigation/store-products/store-products.component";
import { ProductCategoriesComponent } from "./navigation/product-categories/product-categories.component";
import { ProductsSuppliersComponent } from "./navigation/products-suppliers/products-suppliers.component";
import { OfflineProductsComponent } from "./navigation/offline-products/offline-products.component";
import { NgApexchartsModule } from "ng-apexcharts";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatRadioModule } from "@angular/material/radio";
import { StoreVideosComponent } from "./navigation/store-videos/store-videos.component";
import { RapidbuildComponent } from "./navigation/rapidbuild/rapidbuild.component";
import { RapidbuildActionsComponent } from "./navigation/rapidbuild-actions/rapidbuild-actions.component";
import { StoreSettingsComponent } from "./navigation/store-settings/store-settings.component";
import { GroupOrderSettingsComponent } from "./navigation/group-order-settings/group-order-settings.component";
import { CampaignsComponent } from "./navigation/campaigns/campaigns.component";
import { PresentationComponent } from "./navigation/presentation/presentation.component";
import { EmailBlastComponent } from "./navigation/email-blast/email-blast.component";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatExpansionModule } from "@angular/material/expansion";
import { ShippingNotificaitonComponent } from "./navigation/shipping-notificaiton/shipping-notificaiton.component";
import { ResetTopTenComponent } from "./navigation/reset-top-ten/reset-top-ten.component";
import { SurveysComponent } from "./navigation/surveys/surveys.component";
import { JaggaerSettingsComponent } from "./navigation/jaggaer-settings/jaggaer-settings.component";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { FuseAlertModule } from "@fuse/components/alert";
import { StoreSuppliersComponent } from "./navigation/store-suppliers/store-suppliers.component";
import { ProductClicksComponent } from "./navigation/product-clicks/product-clicks.component";
import { SearchHistoryComponent } from "./navigation/search-history/search-history.component";
import { UserDataFileComponent } from "./navigation/user-data-file/user-data-file.component";
import { OptInUserDataComponent } from "./navigation/opt-in-user-data/opt-in-user-data.component";
import { FulfillOptionsComponent } from "./navigation/fulfill-options/fulfill-options.component";
import { RoyaltiesComponent } from "./navigation/royalties/royalties.component";
import { ApparelDecoratorComponent } from "./navigation/apparel-decorator/apparel-decorator.component";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { CustomerReviewsComponent } from "./navigation/customer-reviews/customer-reviews.component";
import { MatTabsModule } from "@angular/material/tabs";
import { FulfillmentInvoicesComponent } from "./navigation/fulfillment-invoices/fulfillment-invoices.component";
import { ReferalLocationsComponent } from "./navigation/referal-locations/referal-locations.component";
import { FullfilmentContactsComponent } from "./navigation/fullfilment-contacts/fullfilment-contacts.component";
import { MarginsComponent } from "./navigation/margins/margins.component";
import { InventorySummaryComponent } from "./navigation/inventory-summary/inventory-summary.component";
import { CostCenterCodeComponent } from "./navigation/cost-center-code/cost-center-code.component";
import { LocationsComponent } from "./navigation/locations/locations.component";
import { CreditTermsComponent } from "./navigation/credit-terms/credit-terms.component";
import { StorePlanComponent } from "./navigation/store-plan/store-plan.component";
import { StudentOrgComponent } from "./navigation/student-org/student-org.component";
import { MatNativeDateModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSortModule } from "@angular/material/sort";
import { MatChipsModule } from "@angular/material/chips";
import { ArtApprovalComponent } from "./navigation/art-approval-settings/art-approval.component";
import { ConfirmationDialogComponent } from "./confirmation-dialog/confirmation-dialog.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { ConsolidatedBillComponent } from "./navigation/consolidated-bill/consolidated-bill.component";

@NgModule({
  declarations: [
    FileManagerComponent,
    StoresDetailsComponent,
    StoresListComponent,
    DashboardComponent,
    StoreProductsComponent,
    ProductCategoriesComponent,
    ProductsSuppliersComponent,
    OfflineProductsComponent,
    StoreVideosComponent,
    RapidbuildComponent,
    RapidbuildActionsComponent,
    StoreSettingsComponent,
    GroupOrderSettingsComponent,
    CampaignsComponent,
    PresentationComponent,
    EmailBlastComponent,
    ShippingNotificaitonComponent,
    ResetTopTenComponent,
    SurveysComponent,
    EmailBlastComponent,
    JaggaerSettingsComponent,
    StoreSuppliersComponent,
    ProductClicksComponent,
    SearchHistoryComponent,
    UserDataFileComponent,
    OptInUserDataComponent,
    FulfillOptionsComponent,
    RoyaltiesComponent,
    ApparelDecoratorComponent,
    CustomerReviewsComponent,
    FulfillmentInvoicesComponent,
    ReferalLocationsComponent,
    FullfilmentContactsComponent,
    MarginsComponent,
    InventorySummaryComponent,
    CostCenterCodeComponent,
    LocationsComponent,
    CreditTermsComponent,
    StorePlanComponent,
    StudentOrgComponent,
    ArtApprovalComponent,
    ConsolidatedBillComponent
  ],
  imports: [
    RouterModule.forChild(storeRoutes),
    MatTableModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    MatProgressBarModule,
    MatDialogModule,
    NgxSkeletonLoaderModule,
    MatInputModule,
    MatCheckboxModule,
    NgApexchartsModule,
    MatButtonToggleModule,
    MatSnackBarModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatExpansionModule,
    QuillModule.forRoot(),
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    FuseAlertModule,
    NgMultiSelectDropDownModule,
    MatTabsModule,
    MatSortModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  entryComponents: [ConfirmationDialogComponent],
})
export class StoresModule { }
