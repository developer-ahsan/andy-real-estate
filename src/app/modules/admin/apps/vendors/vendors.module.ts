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
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
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
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { QuillModule } from 'ngx-quill';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FuseAlertModule } from '@fuse/components/alert';
import { MatDialogModule } from '@angular/material/dialog';
import { vendorsRoutes } from './vendors.routing';
import { VendorsComponent } from './components/vendors.component';
import { VendorImprintColorsComponent } from './components/pages/vendor-imprint-colors/imprint-colors.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SystemImprintRunComponent } from './components/pages/imprint-run/imprint-run.component';
import { ImprintChargesComponent } from './components/pages/imprint-charges/imprint-charges.component';
import { StandardImprintsComponent } from './components/pages/standard-imprints/standard-imprints.component';
import { AddEditImprintsComponent } from './components/pages/standard-imprints/imprints/imprints.component';
import { VendorsListComponent } from './components/list-components/vendors-list/list.component';
import { VendorsDisabledListComponent } from './components/list-components/vendors-disabled-list/vendors-disabled-list.component';
import { NewVendorsComponent } from './components/list-components/vendors-new/new-vendors.component';
import { VendorsEmailComponent } from './components/list-components/vendors-email/vendors-email.component';
import { VendorsDetailsComponent } from './components/details/details-vendors.component';
import { VendorTopOrderComponent } from './components/pages/top-order-products/top-order-products.component';
import { VendorSettingsComponent } from './components/pages/vendor-settings/vendor-settings.component';
import { VendorProductsComponent } from './components/pages/vendor-products/vendor-products.component';
import { VendorCoreProductsComponent } from './components/pages/vendor-core-products/vendor-core-products.component';
import { VendorProductsSummaryComponent } from './components/pages/vendor-products-summary/vendor-products-summary.component';
import { VendorsDownloadComponent } from './components/list-components/vendors-download/vendors-download.component';
import { VendorsInfoComponent } from './components/pages/vendors-info/vendors-info.component';
import { VendorProductsStoreComponent } from './components/pages/vendor-product-store/vendor-product-store.component';
import { VendorFOBLocationComponent } from './components/pages/vendor-fob-locations/vendor-fob-locations.component';
import { VendorBlanketComponent } from './components/pages/vendor-blanket-location/vendor-blanket-location.component';
import { VendorSizingChartComponent } from './components/pages/vendor-sizing-chart/vendor-sizing-chart.component';
import { VendorVideosComponent } from './components/pages/vendor-videos/vendor-videos.component';
import { VendorCoopComponent } from './components/pages/vendor-coop/vendor-coop.component';
import { VendorBlanketCoopComponent } from './components/pages/vendor-blanket-coop/vendor-blanket-coop.component';
import { VendorCommentsComponent } from './components/pages/vendor-comments/vendor-comments.component';
import { VendorOrdersComponent } from './components/pages/vendor-orders/vendor-orders.component';
import { VendorApplicationComponent } from './components/pages/vendor-application/vendor-application.component';
import { VendorBlanketColorsComponent } from './components/pages/vendor-blanket-imprint-colors/vendor-blanket-imprint-colors.component';
import { VendorRunChargesComponent } from './components/pages/vendor-run-charges/vendor-run-charges.component';
import { VendorSetupChargesComponent } from './components/pages/vendor-setup-charges/vendor-setup-charges.component';
import { VendorUsersComponent } from './components/pages/vendor-users/vendor-users.component';
import { VendorStatusComponent } from './components/pages/vendor-status/vendor-status.component';
import { VendorStatusGuard } from './vendor-status.guard';
import { VendorsProfileComponent } from './components/pages/vendor-profile/vendor-profile.component';
import { DesignerNotesComponent } from './components/pages/designer-notes/designer-notes.component';
import { OpenPurchaseOrdersComponent } from './components/pages/open-purchase-orders/open-purchase-orders.component';
import { VendorImprintProductComponent } from './components/pages/vendor-imprint-colors/product-imprints/product-imprint.component';

@NgModule({
    declarations: [
        VendorsComponent, VendorsListComponent, NewVendorsComponent, VendorsDisabledListComponent, VendorsDownloadComponent, VendorsEmailComponent, VendorsDetailsComponent, VendorsInfoComponent, SystemImprintRunComponent, ImprintChargesComponent, StandardImprintsComponent, AddEditImprintsComponent, VendorTopOrderComponent, VendorSettingsComponent, VendorProductsComponent, VendorCoreProductsComponent, VendorProductsSummaryComponent, VendorFOBLocationComponent,
        VendorProductsStoreComponent, VendorBlanketComponent, VendorSizingChartComponent, VendorVideosComponent, VendorCoopComponent, VendorBlanketCoopComponent, VendorCommentsComponent, VendorOrdersComponent, VendorApplicationComponent, VendorImprintColorsComponent, VendorBlanketColorsComponent, VendorRunChargesComponent, VendorSetupChargesComponent, VendorUsersComponent, VendorStatusComponent, VendorsProfileComponent, DesignerNotesComponent, OpenPurchaseOrdersComponent, VendorImprintProductComponent
    ],
    imports: [
        RouterModule.forChild(vendorsRoutes),
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
        AutocompleteLibModule,
        NgMultiSelectDropDownModule,
        FuseAlertModule,
        MatDialogModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    entryComponents: [],
    providers: [VendorStatusGuard]
})
export class VendorsModule {
}
