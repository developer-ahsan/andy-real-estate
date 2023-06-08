import { Route } from '@angular/router';
import { CompanyProfileComponent } from './components/pages/company-profile/company-profile.component';
import { CompaniesDetailsComponent } from './components/companies.component';
import { StatesResolver, StoresResolver } from './components/companies.resolvers';
export const companyRoutes: Route[] = [

    {
        path: '',
        component: CompaniesDetailsComponent,
        resolve: {
            states: StatesResolver,
            stores: StoresResolver,
        },
        children: [
            {
                path: '',
                component: CompanyProfileComponent,
                data: {
                    title: 'Comapny Profile',
                    url: 'company'
                }
            }
        ]
    }

];
