import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_FORMATS, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as moment from 'moment';
import { FuseAutogrowModule } from '@fuse/directives/autogrow';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { SearchComponents } from './search.component';
import { SearchProductssComponents } from './search-products/search-products.component';
import { searchRoutes } from './search-module.routing';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { SearchOrdersComponents } from './search-orders/search-orders.component';
import { SearchCustomersComponents } from './search-customers/search-customers.component';
import { SearchVendorsComponents } from './search-vendors/search-vendors.component';
import { SearchQuotesComponents } from './search-quotes/search-quotes.component';
import { CustomTooltipComponent } from './search-products/custom-tool-tip/custom-tool-tip.component';
import { MatDialogModule } from '@angular/material/dialog';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
    declarations: [
        SearchComponents,
        SearchProductssComponents,
        SearchOrdersComponents,
        SearchCustomersComponents,
        SearchVendorsComponents,
        SearchQuotesComponents,
        CustomTooltipComponent,
    ],
    imports: [
        RouterModule.forChild(searchRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatMomentDateModule,
        MatProgressBarModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatTableModule,
        MatTooltipModule,
        MatPaginatorModule,
        FuseAutogrowModule,
        FuseFindByKeyPipeModule,
        SharedModule,
        NgxSkeletonLoaderModule,
        MatProgressSpinnerModule,
        NgxPaginationModule,
        MatDialogModule,
        OverlayModule
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: moment.ISO_8601
                },
                display: {
                    dateInput: 'LL',
                    monthYearLabel: 'MMM YYYY',
                    dateA11yLabel: 'LL',
                    monthYearA11yLabel: 'MMMM YYYY'
                }
            }
        }
    ]
})
export class SearchModule {
}
