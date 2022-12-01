import { Route } from '@angular/router';
import { InventoryComponent } from 'app/modules/admin/apps/ecommerce/inventory/inventory.component';
import { InventoryListComponent } from 'app/modules/admin/apps/ecommerce/inventory/list/inventory.component';
import { LicensingTermResolver, ProductDescriptionResolver, ProductsListsResolver, StoresListResolver, SuppliersListResolver, SystemDistributorCodes } from 'app/modules/admin/apps/ecommerce/inventory/inventory.resolvers';
import { CustomersComponent } from 'app/modules/admin/apps/ecommerce/customers/customers.component';
import { CustomersListComponent } from 'app/modules/admin/apps/ecommerce/customers/list/customers.component';
import { CustomersBrandsResolver, CustomersCategoriesResolver, CustomersProductsResolver, CustomersTagsResolver, CustomersVendorsResolver } from 'app/modules/admin/apps/ecommerce/customers/customers.resolvers';
import { CustomersTabComponent } from 'app/modules/admin/apps/ecommerce/customers/tabs/customers.component';
import { ProductDetailsComponent } from 'app/modules/admin/apps/ecommerce/inventory/details/product-details.component';
import { SystemComponent } from './components/system.component';

export const systemRoutes: Route[] = [

    {
        path: '',
        component: SystemComponent
    }

];
