import { Route } from '@angular/router';
import { TasksResolver, TasksTagsResolver, TasksTaskResolver } from 'app/modules/admin/apps/promostandards/promostandards.resolvers';
import { PromostandardsComponent } from 'app/modules/admin/apps/promostandards/promostandards.component';
import { PromostandardsListComponent } from 'app/modules/admin/apps/promostandards/list/list.component';
import { PromostandardsDetailsComponent } from 'app/modules/admin/apps/promostandards/details/details.component';

export const tasksRoutes: Route[] = [
    {
        path: '',
        component: PromostandardsComponent,
        resolve: {
            tags: TasksTagsResolver
        },
        children: [
            {
                path: '',
                component: PromostandardsListComponent,
                resolve: {
                    tasks: TasksResolver
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
