import { Route } from '@angular/router';
import { FileManagerComponent } from 'app/modules/admin/apps/file-manager/store-manager.component';
import { StoresListComponent } from 'app/modules/admin/apps/file-manager/list/list.component';
import { StoresDetailsComponent } from 'app/modules/admin/apps/file-manager/details/details.component';
import { FileManagerItemsResolver, StoreDetailsByID, SupplierResolver } from 'app/modules/admin/apps/file-manager/store-manager.resolvers';

export const storeRoutes: Route[] = [
    {
        path: '',
        component: FileManagerComponent,
        children: [
            {
                path: '',
                component: StoresListComponent,
                resolve: {
                    items: FileManagerItemsResolver,
                    suppliers: SupplierResolver
                },
            },
            {
                path: ':id',
                pathMatch: 'full',
                component: StoresDetailsComponent,
                resolve: {
                    items: FileManagerItemsResolver,
                    suppliers: SupplierResolver,
                    storeByID: StoreDetailsByID
                }
            }
        ]
    }
];
