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
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SharedModule } from 'app/shared/shared.module';
import { OrdersComponent } from 'app/modules/admin/apps/orders/orders-components/orders.component';
import { OrdersListComponent } from 'app/modules/admin/apps/orders/orders-components/list/orders.component';
import { ordersRoutes } from 'app/modules/admin/apps/orders/orders.routing';
import { OrdersDetailsComponent } from 'app/modules/admin/apps/orders/orders-components/details/details.orders.component';
import { OrdersSummaryComponent } from 'app/modules/admin/apps/orders/orders-components/navigation/orders-summary/orders-summary.component';
import { OrdersEntitiesListComponent } from 'app/modules/admin/apps/orders/orders-components/navigation/orders-entities-list/orders-entities-list.component';
import { OrdersReportComponent } from 'app/modules/admin/apps/orders/orders-components/navigation/orders-report/orders-report.component';
import { OrdersInvoiceComponent } from 'app/modules/admin/apps/orders/orders-components/navigation/orders-invoice/orders-invoice.component';
import { OrdersPurchasesComponent } from 'app/modules/admin/apps/orders/orders-components/navigation/orders-purchases/orders-purchases.component';
import { OrdersShippingReportsComponent } from 'app/modules/admin/apps/orders/orders-components/navigation/orders-shipping-reports/orders-shipping-reports.component';
import { InvoicesComponent } from 'app/modules/admin/apps/orders/orders-components/navigation/invoices/invoices.component';
import { CostAnalysisComponent } from 'app/modules/admin/apps/orders/orders-components/navigation/cost-analysis/cost-analysis.component';
import { TimelineComponent } from 'app/modules/admin/apps/orders/orders-components/navigation/timeline/timeline.component';
import { IncidentReportsComponent } from 'app/modules/admin/apps/orders/orders-components/navigation/incident-reports/incident-reports.component';
import { FlpsComponent } from './orders-components/navigation/flps/flps.component';
import { OriginalOrderComponent } from './orders-components/navigation/original-order-report/original-order-report.component';
import { OrderCommentsComponent } from './orders-components/navigation/order-comments/order-comments.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatChipsModule } from '@angular/material/chips';
import { OrderFlagsComponent } from './orders-components/navigation/order-flags/order-flags.component';
import { OrderAdjustmentComponent } from './orders-components/navigation/order-adjustment/order-adjustment.component';
import { OrderPaymentComponent } from './orders-components/navigation/order-payments/order-payments.component';

@NgModule({
    declarations: [
        OrdersComponent,
        OrdersListComponent,
        OrdersDetailsComponent,
        OrdersSummaryComponent,
        OrdersEntitiesListComponent,
        OrdersReportComponent,
        OrdersInvoiceComponent,
        OrdersPurchasesComponent,
        OrdersShippingReportsComponent,
        InvoicesComponent,
        CostAnalysisComponent,
        TimelineComponent,
        IncidentReportsComponent,
        FlpsComponent,
        OriginalOrderComponent,
        OrderFlagsComponent,
        OrderCommentsComponent,
        OrderAdjustmentComponent,
        OrderPaymentComponent
    ],
    imports: [
        RouterModule.forChild(ordersRoutes),
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
        MatSidenavModule,
        MatProgressSpinnerModule,
        NgxSkeletonLoaderModule,
        MatButtonToggleModule,
        NgMultiSelectDropDownModule,
        MatChipsModule
    ]
})
export class OrdersModule {
}
