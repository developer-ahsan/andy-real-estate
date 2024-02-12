import { Route } from '@angular/router';
import { CompanyProfileComponent } from './components/pages/company-profile/company-profile.component';
import { CompaniesDetailsComponent } from './components/companies.component';
import { StatesResolver, StoresResolver } from './components/companies.resolvers';
import { CompanyProfileFormComponent } from './components/pages/company-profile-form/company-profile-form.component';
import { CompanyProfileLocationComponent } from './components/pages/locations/locations.component';
import { ProfileLogoBankComponent } from './components/pages/logo-bank/logo-bank.component';
import { CompanyProfileLocationDepartmentsComponent } from './components/pages/location-deparments/location-deparments.component';
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
                path: 'company-profile-update/:companyId/:storeId',
                component: CompanyProfileFormComponent,
                data: {
                    title: 'Comapny Profile Form',
                    url: 'company-profile',
                    update: true
                }
            },
            {
                path: 'company-location/:companyId',
                component: CompanyProfileLocationComponent,
                data: {
                    title: 'Comapny Profile Form',
                    url: 'company-profile'
                }
            },
            {
                path: 'company-location-deparments/:companyId/:locationId',
                component: CompanyProfileLocationDepartmentsComponent,
                data: {
                    title: 'Comapny Profile Form',
                    url: 'company-profile'
                }
            },
            {
                path: 'company-logo/:companyId/:storeId',
                component: ProfileLogoBankComponent,
                data: {
                    title: 'Comapny Profile Form',
                    url: 'company-profile'
                }
            }
        ]
    }

];
