import { Route } from '@angular/router';
import { AdminCommentorsComponent } from './components/pages/admin-commentors/admin-commentors.component';
import { AdminUsersComponent } from './components/pages/admin-users/admin-users.component';
import { CompanyRolesComponent } from './components/pages/company-roles/company-roles.component';
import { OrderManageUsersComponent } from './components/pages/ordermanage-users/ordermanage-users.component';
import { RapidBuildUsersComponent } from './components/pages/rapidbuild-users/rapidbuild-users.component';
import { SmartArtUsersComponent } from './components/pages/smartart-users/smartart-users.component';
import { FLPSComponent } from './components/users.component';
import { EmployeesListsResolver, FlpsLoginResolver, AdminCompaniesResolver, AdminStoresResolver } from './components/users.resolvers';

export const usersRoutes: Route[] = [

    {
        path: '',
        component: FLPSComponent,
        resolve: {
            // employees: EmployeesListsResolver,
            // flpsLogin: FlpsLoginResolver,
            stores: AdminStoresResolver,
            companies: AdminCompaniesResolver
        },
        children: [
            {
                path: '',
                redirectTo: 'admin-users',
                pathMatch: 'full'
            },
            {
                path: 'admin-users',
                component: AdminUsersComponent
            },
            {
                path: 'admin-commentors',
                component: AdminCommentorsComponent
            },
            {
                path: 'order-users',
                component: OrderManageUsersComponent
            },
            {
                path: 'smartart-users',
                component: SmartArtUsersComponent
            },
            {
                path: 'rapidbuild-users',
                component: RapidBuildUsersComponent
            },
            {
                path: 'company-roles',
                component: CompanyRolesComponent
            },
        ]
    },

];
