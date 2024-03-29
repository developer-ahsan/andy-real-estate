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
import { systemRoutes } from './system.routing';
import { SystemComponent } from './components/system.component';
import { ColorsComponent } from './components/pages/colors/colors.component';
import { SizesComponent } from './components/pages/sizes/sizes.component';
import { PackAndAccessoriesComponent } from './components/pages/pack-accessories/pack-accessories.component';
import { ImprintColorsComponent } from './components/pages/imprint-colors/imprint-colors.component';
import { ImprintMethodsComponent } from './components/pages/imprint-methods/imprint-methods.component';
import { ImprintLocationsComponent } from './components/pages/imprint-locations/imprint-locations.component';
import { PromoCodesComponent } from './components/pages/promo-codes/promo-codes.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DefaultBlurbsComponent } from './components/pages/default-blurbs/default-blurbs.component';
import { CountrySalesComponent } from './components/pages/country-sales/country-sales.component';
import { ActiveStoresComponent } from './components/pages/active-stores/active-stores.component';
import { SupportTeamComponent } from './components/pages/support-team/support-team.component';
import { UploadImagesComponent } from './components/pages/upload-images/upload-images.component';
import { POArchivesComponent } from './components/pages/po-archives/po-archives.component';
import { ProductMigrationsComponent } from './components/pages/product-migrations/product-migrations.component';
import { CoreProductsComponent } from './components/pages/core-products/core-products.component';
import { SystemImprintRunComponent } from './components/pages/imprint-run/imprint-run.component';
import { ImprintChargesComponent } from './components/pages/imprint-charges/imprint-charges.component';
import { StandardImprintsComponent } from './components/pages/standard-imprints/standard-imprints.component';
import { AddEditImprintsComponent } from './components/pages/standard-imprints/imprints/imprints.component';
import { SimulatorComponent } from './components/pages/simulator/simulator.component';
import { AdminToolsComponent } from './components/pages/admin-tools/admin-tools.component';
import { DiagonosticsComponent } from './components/pages/diagonostics/diagonostics.component';
import { AdminStructureComponent } from './components/pages/admin-structure/admin-structure.component';
import { PermissionGroupsComponent } from './components/pages/permissions-groups/permissions-groups.component';
import { PurchaseOrdersAdjustmentsComponent } from './components/pages/purchase-orders/purchase-orders.component';

@NgModule({
    declarations: [
        SystemComponent, ColorsComponent, SizesComponent, PackAndAccessoriesComponent, ImprintColorsComponent, ImprintMethodsComponent, ImprintLocationsComponent, PromoCodesComponent, DefaultBlurbsComponent, CountrySalesComponent, ActiveStoresComponent, SupportTeamComponent, UploadImagesComponent, POArchivesComponent, ProductMigrationsComponent, SystemImprintRunComponent, ImprintChargesComponent, StandardImprintsComponent, AddEditImprintsComponent,
        SimulatorComponent, AdminToolsComponent, DiagonosticsComponent, AdminStructureComponent, PermissionGroupsComponent, PurchaseOrdersAdjustmentsComponent
    ],
    imports: [
        RouterModule.forChild(systemRoutes),
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
    entryComponents: [SystemImprintRunComponent]
})
export class SystemModule {
}
