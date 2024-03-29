import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { SharedModule } from 'app/shared/shared.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { dashboardRoutes } from './dashboards.routing';
import { DashboardDetailsComponent } from './details/dashboard-details.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { DashboardOverviewComponent } from './components/overview/overview.component';
import { ProjectComponent } from './components/project/project.component';
import { MatTabsModule } from '@angular/material/tabs';
import { FuseAlertModule } from '@fuse/components/alert';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { OrderStatusComponent } from './components/analytics/order-status/order-status.component';
import { GeneratorsComponent } from './components/analytics/generators/generators.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DataTablesModule } from "angular-datatables";
import { DashboardHomeComponent } from './components/home/home-dashboard.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CKEditorModule } from 'ckeditor4-angular';
import { YourPerformanceComponent } from './components/analytics/your-performance/your-performance.component';

@NgModule({
    declarations: [
        DashboardDetailsComponent,
        DashboardHomeComponent,
        DashboardOverviewComponent,
        AnalyticsComponent,
        ProjectComponent,
        OrderStatusComponent,
        YourPerformanceComponent,
        GeneratorsComponent
    ],
    imports: [
        RouterModule.forChild(dashboardRoutes),
        MatButtonModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatProgressBarModule,
        MatSortModule,
        MatTableModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        NgApexchartsModule,
        MatTabsModule,
        MatPaginatorModule,
        SharedModule,
        FuseAlertModule,
        MatExpansionModule,
        NgxSkeletonLoaderModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,
        DataTablesModule,
        CKEditorModule
    ],
    entryComponents: [],
})
export class DashboardsModule {
}
