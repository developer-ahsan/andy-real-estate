import { Route } from '@angular/router';
import { VendorsDetailsComponent } from './components/details/details-vendors.component';
import { VendorsComponent } from './components/vendors.component';
import { StoresListsResolver, SuppliersListsResolver } from './components/vendors.resolvers';

export const vendorsRoutes: Route[] = [

    {
        path: '',
        component: VendorsComponent,
        resolve: {
            stores: StoresListsResolver,
            suppliers: SuppliersListsResolver
        }
    },
    {
        path: ':id',
        component: VendorsDetailsComponent
    }

];
