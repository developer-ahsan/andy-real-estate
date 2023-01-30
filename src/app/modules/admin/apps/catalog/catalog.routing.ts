import { Route } from '@angular/router';
import { CatalogComponent } from './components/catalog.component';
import { EmployeesListsResolver, FlpsLoginResolver, AdminCompaniesResolver, AdminStoresResolver } from './components/catalog.resolvers';

export const catalogRoutes: Route[] = [

    {
        path: '',
        component: CatalogComponent,
    },

];
