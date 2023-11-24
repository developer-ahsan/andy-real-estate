import { Route } from '@angular/router';
import { CompanyProfileComponent } from './components/pages/company-profile/company-profile.component';
import { CompaniesDetailsComponent } from './components/companies.component';
import { StatesResolver, StoresResolver } from './components/companies.resolvers';
import { CompanyProfileFormComponent } from './components/pages/company-profile-form/company-profile-form.component';
import { CompanyProfileLocationComponent } from './components/pages/locations/locations.component';
import { ProfileLogoBankComponent } from './components/pages/logo-bank/logo-bank.component';
export const companyRoutes: Route[] = [

    {
        path: '',
        component: CompaniesDetailsComponent,
        resolve: {
            states: StatesResolver,
            // stores: StoresResolver,
        },
        children: [
            {
                path: '',
                component: CompanyProfileComponent,
                data: {
                    title: 'Comapny Profile',
                    url: 'company'
                }
            },
            {
                path: 'company-profile',
                component: CompanyProfileFormComponent,
                data: {
                    title: 'Comapny Profile Form',
                    url: 'company-profile'
                }
            },
            {
                path: 'company-location',
                component: CompanyProfileLocationComponent,
                data: {
                    title: 'Comapny Profile Form',
                    url: 'company-profile'
                }
            },
            {
                path: 'company-logo',
                component: ProfileLogoBankComponent,
                data: {
                    title: 'Comapny Profile Form',
                    url: 'company-profile'
                }
            }
        ]
    }

];
