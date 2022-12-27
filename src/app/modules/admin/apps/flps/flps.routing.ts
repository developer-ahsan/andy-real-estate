import { Route } from '@angular/router';
import { FLPSComponent } from './components/flps.component';
import { EmployeesListsResolver, FlpsLoginResolver, FlpsStoresResolver } from './components/flps.resolvers';

export const flpsRoutes: Route[] = [

    {
        path: '',
        component: FLPSComponent,
        resolve: {
            employees: EmployeesListsResolver,
            flpsLogin: FlpsLoginResolver,
            stores: FlpsStoresResolver
        }
    }

];
