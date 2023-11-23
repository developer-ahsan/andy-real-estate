import { Route } from '@angular/router';
import { ImportExportHomeComponent } from './components/pages/home/home.component';
import { OrderExportComponent } from './components/pages/export/export.component';
import { ImportExportComponent } from './components/import-export.component';
import { OrderImportComponent } from './components/pages/import/import.component';
import { ExportDetailComponent } from './components/pages/export-details/export-details.component';
import { ImportExportStoresResolver } from './components/import-export.resolvers';

export const importExportRoutes: Route[] = [
    {
        path: '',
        component: ImportExportComponent,
        resolve: {
            // ImportExportStoresResolver
        },
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
            },
            {
                path: 'export-details',
                component: ExportDetailComponent,
                data: {
                    title: 'Export Details',
                    url: 'export-details'
                }
            }
        ]
    },

];
