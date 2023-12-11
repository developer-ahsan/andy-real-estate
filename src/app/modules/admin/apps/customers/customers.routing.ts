import { Route } from '@angular/router';
import { OrderDetailsResolver, OrderProductsLineResolver, OrdersListResolver, StoresListResolver } from 'app/modules/admin/apps/orders/orders-components/orders.resolvers';
import { CustomersListComponent } from './customers-components/customers.component';
import { UserInfoComponent } from './customers-components/navigation/user-info/user-info.component';
import { ApprovalContactsComponent } from './customers-components/navigation/approval-contacts/approval-contacts.component';
import { CashbackComponent } from './customers-components/navigation/cashback/cashback.component';
import { CreditTermsComponent } from './customers-components/navigation/credit-terms/credit-terms.component';
import { FulfillmentOrdersComponent } from './customers-components/navigation/fulfillment-orders/fulfillment-orders.component';
import { GroupOrdersComponent } from './customers-components/navigation/group-orders/group-orders.component';
import { LogoBankComponent } from './customers-components/navigation/logo-bank/logo-bank.component';
import { OrdersHistoryComponent } from './customers-components/navigation/orders-history/orders-history.component';
import { QuotesComponent } from './customers-components/navigation/quotes/quotes.component';
import { RemindersComponent } from './customers-components/navigation/reminders/reminders.component';
import { SavedCartsComponent } from './customers-components/navigation/saved-carts/saved-carts.component';
import { SendRegisterEmailsComponent } from './customers-components/navigation/send-register-emails/send-register-emails.component';
import { StoreUsageComponent } from './customers-components/navigation/store-usage/store-usage.component';
import { UserAddressComponent } from './customers-components/navigation/user-address/user-address.component';
import { UserCommentsComponent } from './customers-components/navigation/user-comments/user-comments.component';
import { UserLocationsComponent } from './customers-components/navigation/user-locations/user-locations.component';
import { UserMetricsComponent } from './customers-components/navigation/user-metrics/user-metrics.component';
import { CustomerDetailsComponent } from './customers-components/details/details.customers.component';
import { GetCustomer, GetCustomersList } from './customers-components/customers.resolvers';
import { CustomerFlpsUsersComponent } from './customers-components/navigation/flps-users/flps-users.component';
import { SavedCartsDetailComponent } from './customers-components/navigation/saved-carts-detail/saved-carts-detail.component';

export const customersRoutes: Route[] = [
    {
        path: '',
        component: CustomersListComponent,
        resolve: {
            customers: GetCustomersList
        }
    },
    {
        path: ':id',
        component: CustomerDetailsComponent,
        resolve: {
            customer: GetCustomer
        },
        children: [
            {
                path: '',
                redirectTo: 'user-info',
                pathMatch: 'full'
            },
            {
                path: 'user-info',
                component: UserInfoComponent,
                data: {
                    title: 'User Info',
                    url: 'user-info'
                }
            },
            {
                path: 'addresses',
                component: UserAddressComponent,
                data: {
                    title: 'User Addresses',
                    url: 'addresses'
                }
            },
            {
                path: 'metrics',
                component: UserMetricsComponent,
                data: {
                    title: 'Metrics',
                    url: 'metrics'
                }
            },
            {
                path: 'credit-terms',
                component: CreditTermsComponent,
                data: {
                    title: 'Credit Terms',
                    url: 'credit-terms'
                }
            },
            {
                path: 'comments',
                component: UserCommentsComponent,
                data: {
                    title: 'User Comments',
                    url: 'comments'
                }
            },
            {
                path: 'locations',
                component: UserLocationsComponent,
                data: {
                    title: 'Locations',
                    url: 'locations'
                }
            },
            {
                path: 'approval-contacts',
                component: ApprovalContactsComponent,
                data: {
                    title: 'Approval Contacts',
                    url: 'approval-contacts'
                }
            },
            {
                path: 'reminders',
                component: RemindersComponent,
                data: {
                    title: 'Reminders',
                    url: 'reminders'
                }
            },
            {
                path: 'order-history',
                component: OrdersHistoryComponent,
                data: {
                    title: 'Order History',
                    url: 'order-history'
                }
            },
            {
                path: 'fulfillment-orders',
                component: FulfillmentOrdersComponent,
                data: {
                    title: 'Fulfillment Orders',
                    url: 'fulfillment-orders'
                }
            },
            {
                path: 'saved-carts',
                component: SavedCartsComponent,
                data: {
                    title: 'Saved Carts',
                    url: 'saved-carts'
                }
            },
            {
                path: 'saved-carts-detail/:cartId/:date/:name',
                component: SavedCartsDetailComponent,
                data: {
                    title: 'Saved Carts Detail',
                    url: 'saved-carts-detail'
                }
            },
            {
                path: 'quotes',
                component: QuotesComponent,
                data: {
                    title: 'Quotes',
                    url: 'quotes'
                }
            },
            {
                path: 'flps-users',
                component: CustomerFlpsUsersComponent,
                data: {
                    title: 'FLPS Users',
                    url: 'flps-users'
                }
            },
            {
                path: 'group-orders',
                component: GroupOrdersComponent,
                data: {
                    title: 'Group Orders',
                    url: 'group-orders'
                }
            },
            {
                path: 'logo-bank',
                component: LogoBankComponent,
                data: {
                    title: 'Logo Bank',
                    url: 'logo-bank'
                }
            },
            {
                path: 'cashback',
                component: CashbackComponent,
                data: {
                    title: 'Cashback',
                    url: 'cashback'
                }
            },
            {
                path: 'store-usage',
                component: StoreUsageComponent,
                data: {
                    title: 'Store Usage',
                    url: 'store-usage'
                }
            },
            {
                path: 'send-registration-emails',
                component: SendRegisterEmailsComponent,
                data: {
                    title: 'Send Registration Emails',
                    url: 'send-registration-emails'
                }
            }
        ]
    }
];
