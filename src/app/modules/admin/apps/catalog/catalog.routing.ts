import { Route } from '@angular/router';
import { CatalogComponent } from './components/catalog.component';
import { SizesResolver, ColorsResolver, AdminSuppliersResolver, ImprintsResolver } from './components/catalog.resolvers';

export const catalogRoutes: Route[] = [

    {
        path: '',
        component: CatalogComponent,
        resolve: [AdminSuppliersResolver, ColorsResolver, SizesResolver, ImprintsResolver]
    },

];
