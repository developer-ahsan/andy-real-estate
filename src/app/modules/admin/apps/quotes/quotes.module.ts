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
import { quotesRoutes } from './quotes.routing';
import { QuotesComponent } from './components/quotes.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { QuoteReportsComponent } from './components/pages/quote-report/quote-report.component';
import { QuoteOriginalComponent } from './components/pages/original-quote-report/original-quote-report.component';
import { QuotesDetailsComponent } from './components/details/details-quote.component';
import { QuoteSummaryComponent } from './components/pages/summary/summary.component';
import { QuoteArtworkDetailsComponent } from './components/pages/artwork-details/artwork-details.component';
import { QuoteComments } from './components/pages/comments/comments.component';
import { VendorStatusGuard } from './quotes-status.guard';
import { QuoteModifyComponent } from './components/pages/modify-quote/modify-quote.component';
import { QuoteContactInfoComponent } from './components/pages/modify-quote/quote-contact-info/quote-contact-info.component';
import { QuoteOrderDetailsComponent } from './components/pages/modify-quote/quote-details/quote-order-details.component';
import { QuoteProductsComponent } from './components/pages/modify-quote/quote-products/quote-products.component';

@NgModule({
    declarations: [
        QuotesComponent, QuotesDetailsComponent, QuoteSummaryComponent, QuoteReportsComponent, QuoteOriginalComponent, QuoteArtworkDetailsComponent, QuoteComments, QuoteModifyComponent, QuoteContactInfoComponent, QuoteOrderDetailsComponent, QuoteProductsComponent
    ],
    imports: [
        RouterModule.forChild(quotesRoutes),
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
export class QuotesModule {
}
