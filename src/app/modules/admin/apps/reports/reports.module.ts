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
import { vendorsRoutes } from './reports.routing';
import { ReportsComponent } from './components/reports.component';
import { GraphicsSupportReportComponent } from './components/pages/graphics-support-report/graphics-support-report.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReportsDetailsComponent } from './components/details/details-reports.component';
import { ReportsSupplierSalesComponent } from './components/pages/supplier-sales/supplier-sales.component';
import { ReportsEmployeeSalesComponent } from './components/pages/employee-sales/employee-salescomponent';
import { ReportsLocationSalesComponent } from './components/pages/location-sales/location-sales.component';
import { ReportTopCustomerComponent } from './components/pages/report-top-customer/report-top-customer.component';
import { ReportCustomerPurchaseComponent } from './components/pages/customer-purchases/customer-purchases.component';
import { ReportsStoreSalesComponent } from './components/pages/store-sales/store-sales.component';
import { ReportAccountCodeComponent } from './components/pages/account-code/account-code.component';
import { ReportItemsComponent } from './components/pages/item-report/item-report.component';
import { RoyalitiesReportComponent } from './components/pages/royalities-reports/royalities-reports.component';
import { RoyalitySummaryReportComponent } from './components/pages/royality-summary-report/royality-summary-report.component';
import { ReportBestSellerComponent } from './components/pages/report-best-seller/report-best-seller.component';
import { ReportSampleSaleComponent } from './components/pages/sample-sale-report/sample-sale-report.component';
import { ReportStandardMarginComponent } from './components/pages/standard-margin-report/standard-margin-report.component';
import { ReportIncidentComponent } from './components/pages/report-incident/report-incident.component';
import { ReportInventorySummaryComponent } from './components/pages/inventory-summary-report/inventory-summary-report.component';
import { QuoteGraphicsReportComponent } from './components/pages/quote-graphics-report/quote-graphics-report.component';
import { ReportFiltersComponent } from './components/common/report-filters/report-filters.component';
import { ReportVendorRelationsComponent } from './components/pages/vendor-relations/vendor-relations.component';
import { ReportSupportComponent } from './components/pages/support-report/support-report.component';

@NgModule({
    declarations: [
        ReportFiltersComponent, ReportsComponent, ReportsDetailsComponent, ReportsStoreSalesComponent, ReportsSupplierSalesComponent, ReportsEmployeeSalesComponent, ReportsLocationSalesComponent, ReportTopCustomerComponent, ReportCustomerPurchaseComponent, ReportItemsComponent,
        ReportAccountCodeComponent, RoyalitiesReportComponent, RoyalitySummaryReportComponent, ReportBestSellerComponent, ReportSampleSaleComponent, ReportStandardMarginComponent, ReportIncidentComponent, ReportVendorRelationsComponent, ReportInventorySummaryComponent, GraphicsSupportReportComponent, QuoteGraphicsReportComponent, ReportSupportComponent
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
    entryComponents: []
})
export class ReportsModule {
}
