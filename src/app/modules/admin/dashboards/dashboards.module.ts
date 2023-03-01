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

@NgModule({
    declarations: [
        DashboardDetailsComponent,
        DashboardOverviewComponent,
        AnalyticsComponent,
        ProjectComponent
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
        NgApexchartsModule,
        MatTableModule,
        MatTabsModule,
        SharedModule
    ],
    entryComponents: [],
})
export class DashboardsModule {
}
