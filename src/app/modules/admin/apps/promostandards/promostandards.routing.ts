import { Route } from '@angular/router';
import { PromostandardsResolver, SuppliersResolver, TasksResolver, TasksTagsResolver, TasksTaskResolver } from 'app/modules/admin/apps/promostandards/promostandards.resolvers';
import { PromostandardsComponent } from 'app/modules/admin/apps/promostandards/promostandards.component';
import { PromostandardsListComponent } from 'app/modules/admin/apps/promostandards/list/list.component';

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
                    promostandards: PromostandardsResolver,
                    suppliers: SuppliersResolver
                },
                children: [
                ]
            }
        ]
    }
];
