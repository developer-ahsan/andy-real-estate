import { Route } from '@angular/router';
import { SystemComponent } from './components/system.component';
import { StoresListsResolver } from './components/system.resolvers';

export const systemRoutes: Route[] = [

    {
        path: '',
        component: SystemComponent,
        resolve: {
            stores: StoresListsResolver
        }
    }

];
