import { Route } from '@angular/router';
import { FLPSComponent } from './components/flps.component';
import { StoresListsResolver, SuppliersListsResolver } from './components/flps.resolvers';

export const flpsRoutes: Route[] = [

    {
        path: '',
        component: FLPSComponent,
        resolve: {
            stores: StoresListsResolver,
            suppliers: SuppliersListsResolver
        }
    }

];
