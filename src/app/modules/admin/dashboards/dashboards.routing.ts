import { Route } from '@angular/router';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { DashboardOverviewComponent } from './components/overview/overview.component';
import { ProjectComponent } from './components/project/project.component';
import { AnalyticsResolver, ProjectResolver } from './dashboard.resolvers';
import { DashboardDetailsComponent } from './details/dashboard-details.component';
export const dashboardRoutes: Route[] = [

    {
        path: '',
        component: DashboardDetailsComponent,
        children: [
            {
                path: '',
                redirectTo: 'analytics',
                pathMatch: 'full'
            },
            {
                path: 'analytics',
                component: AnalyticsComponent,
                resolve: {
                    suplier: AnalyticsResolver,
                    data: ProjectResolver
                }
            },
            {
                path: 'overview',
                component: DashboardOverviewComponent,
                resolve: {
                    suplier: AnalyticsResolver
                }
            },
            {
                path: 'reports',
                component: ProjectComponent,
                resolve: {
                    suplier: ProjectResolver
                }
            }
        ]
    },

];
