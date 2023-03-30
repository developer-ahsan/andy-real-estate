import { Route } from '@angular/router';
import { ImportExportHomeComponent } from './components/pages/home/home.component';
import { OrderExportComponent } from './components/pages/export/export.component';
import { ImportExportComponent } from './components/import-export.component';
import { OrderImportComponent } from './components/pages/import/import.component';

export const importExportRoutes: Route[] = [
    {
        path: '',
        component: ImportExportComponent,
        // resolve: {
        //     SmartArtStoresResolver, SmartArtUsersResolver
        // },
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            },
            {
                path: 'home',
                component: ImportExportHomeComponent,
                data: {
                    title: 'Import Export',
                    url: 'home'
                }
            },
            {
                path: 'export',
                component: OrderExportComponent,
                data: {
                    title: 'Export',
                    url: 'export'
                }
            },
            {
                path: 'import',
                component: OrderImportComponent,
                data: {
                    title: 'Import',
                    url: 'import'
                }
            }
        ]
    },

];
