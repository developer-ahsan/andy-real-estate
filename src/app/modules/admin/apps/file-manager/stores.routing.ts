import { Route } from '@angular/router';
import { FileManagerComponent } from 'app/modules/admin/apps/file-manager/store-manager.component';
import { StoresListComponent } from 'app/modules/admin/apps/file-manager/list/list.component';
import { StoresDetailsComponent } from 'app/modules/admin/apps/file-manager/details/details.component';
import { StoresListResolver, StoreDetailsByID, StoreSettingsByID, SupplierResolver } from 'app/modules/admin/apps/file-manager/store-manager.resolvers';

export const storeRoutes: Route[] = [
    {
        path: '',
        component: FileManagerComponent,
        resolve: {
            items: StoresListResolver,
            suppliers: SupplierResolver
        },
        children: [
            {
                path: '',
                component: StoresListComponent,
                resolve: {
                    // items: StoresListResolver,
                    // suppliers: SupplierResolver
                },
            },
            {
                path: ':id',
                pathMatch: 'full',
                component: StoresDetailsComponent,
                resolve: {
                    details: StoreDetailsByID,
                    settings: StoreSettingsByID
                }
            }
        ]
    }
];
