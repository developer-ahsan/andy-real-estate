import { Route } from '@angular/router';
import { SystemComponent } from './components/system.component';
import { StoresListsResolver, SuppliersListsResolver } from './components/system.resolvers';

export const systemRoutes: Route[] = [

    {
        path: '',
        component: SystemComponent,
        resolve: {
            stores: StoresListsResolver,
            suppliers: SuppliersListsResolver
        }
    }

];
