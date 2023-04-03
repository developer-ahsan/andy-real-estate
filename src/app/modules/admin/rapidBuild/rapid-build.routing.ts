import { Route } from '@angular/router';
import { CanDeactivateGuard } from 'app/can-deactivate.guard';
import { RapidImageManagementComponent } from './components/pages/image-management/image-management.component';
import { ClearStoreRapidComponent } from './components/pages/clear-store/clear-store.component';
import { OrderSchedulerComponent } from './components/pages/order-scheduler/order-scheduler.component';
import { RapidNewRequestsComponent } from './components/pages/new-requests/new-requests.component';
import { RapidBuildDetailsComponent } from './components/pages/rapid-details/rapid-details.component';
import { QuoteOrderEmailComponent } from './components/pages/quote-order-emails/quote-order-emails.component';
import { RapidSummaryComponent } from './components/pages/summary/summary.component';
import { RapidBuildComponent } from './components/rapid-build.component';
import { SmartArtStoresResolver, SmartArtUsersResolver } from './components/rapid-build.resolvers';

export const smartartRoutes: Route[] = [
    {
        path: '',
        component: RapidBuildComponent,
        // resolve: {
        //     SmartArtStoresResolver, SmartArtUsersResolver
        // },
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
                path: 'rapidBuild-details',
                component: RapidBuildDetailsComponent,
                data: {
                    title: 'Quote Details',
                    url: 'quote-details'
                }
            },
        ]
    },

];
