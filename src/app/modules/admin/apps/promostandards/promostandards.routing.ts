import { Route } from '@angular/router';
import { PromostandardsResolver, TasksResolver, TasksTagsResolver, TasksTaskResolver } from 'app/modules/admin/apps/promostandards/promostandards.resolvers';
import { PromostandardsComponent } from 'app/modules/admin/apps/promostandards/promostandards.component';
import { PromostandardsListComponent } from 'app/modules/admin/apps/promostandards/list/list.component';
import { PromostandardsDetailsComponent } from 'app/modules/admin/apps/promostandards/details/details.component';

export const tasksRoutes: Route[] = [
    {
        path: '',
        component: PromostandardsComponent,
        resolve: {
        },
        children: [
            {
                path: '',
                component: PromostandardsListComponent,
                resolve: {
                    promostandards: PromostandardsResolver
                },
                children: [
                    {
                        path: ':id',
                        component: PromostandardsDetailsComponent,
                        resolve: {
                            task: TasksTaskResolver
                        }
                    }
                ]
            }
        ]
    }
];
