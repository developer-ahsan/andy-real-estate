import { Route } from '@angular/router';
import { CanDeactivateGuard } from 'app/can-deactivate.guard';
import { RapidImageManagementComponent } from './components/pages/image-management/image-management.component';
import { ClearStoreRapidComponent } from './components/pages/clear-store/clear-store.component';
import { RapidNewRequestsComponent } from './components/pages/new-requests/new-requests.component';
import { RapidBuildDetailsComponent } from './components/pages/rapid-details/rapid-details.component';
import { RapidSummaryComponent } from './components/pages/summary/summary.component';
import { RapidBuildComponent } from './components/rapid-build.component';
import { RapidBuildStatusesResolver, RapidBuildStoresResolver } from './components/rapid-build.resolvers';

export const smartartRoutes: Route[] = [
    {
        path: '',
        component: RapidBuildComponent,
        resolve: {
            // RapidBuildStoresResolver, 
            RapidBuildStatusesResolver
        },
        children: [
            {
                path: '',
                redirectTo: 'image-management',
                pathMatch: 'full'
            },
            {
                path: 'image-management',
                // canDeactivate: [CanDeactivateGuard],
                component: RapidImageManagementComponent,
                data: {
                    title: 'Image Management',
                    url: 'image-management'
                }
            },
            {
                path: 'new-requests',
                component: RapidNewRequestsComponent,
                data: {
                    title: 'New Product Requests',
                    url: 'new-requests'
                }
            },
            {
                path: 'summary',
                component: RapidSummaryComponent,
                data: {
                    title: 'Summary',
                    url: 'summary'
                }
            },
            {
                path: 'clear-store',
                component: ClearStoreRapidComponent,
                data: {
                    title: 'Clear Store',
                    url: 'clear-store'
                }
            },
            {
                path: 'rapidBuild-details/:id/:store',
                component: RapidBuildDetailsComponent,
                data: {
                    title: 'Rapid Build Details',
                    url: 'rapidBuild-details'
                }
            },
        ]
    },

];
