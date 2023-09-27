import { Route } from '@angular/router';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { DashboardOverviewComponent } from './components/overview/overview.component';
import { ProjectComponent } from './components/project/project.component';
import { AnalyticsResolver, EmployeePerformanceResolver, PortfolioPerformanceResolver, ProjectResolver, YTDDataResolver } from './dashboard.resolvers';
import { DashboardDetailsComponent } from './details/dashboard-details.component';
import { RoleGuard } from './dashboard-role.guard';
import { DashboardHomeComponent } from './components/home/home-dashboard.component';
import { EmployeeRoleGuard } from './dashboard-employee-role.guard';
export const dashboardRoutes: Route[] = [

    {
        path: '',
        component: DashboardDetailsComponent,
        resolve: {
            YTDDataResolver
        },
        children: [
            {
                path: '',
                redirectTo: 'analytics',
                pathMatch: 'full'
            },
            {
                path: 'analytics',
                component: AnalyticsComponent,
                canActivate: [EmployeeRoleGuard],
                resolve: {
                    suplier: AnalyticsResolver,
                    data: ProjectResolver
                }
            },
            {
                path: 'home',
                component: DashboardHomeComponent
            },
            {
                path: 'overview',
                canActivate: [RoleGuard],
                component: DashboardOverviewComponent,
                resolve: {
                    suplier: AnalyticsResolver,
                    data: ProjectResolver,
                    portfolio: PortfolioPerformanceResolver
                }
            },
            {
                path: 'reports',
                canActivate: [RoleGuard],
                component: ProjectComponent,
                // canActivate: [RoleGuard],
                resolve: {
                    suplier: AnalyticsResolver,
                    data: ProjectResolver,
                    employee: EmployeePerformanceResolver
                }
            }
        ]
    },

];
