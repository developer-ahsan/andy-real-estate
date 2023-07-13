import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SharedModule } from 'app/shared/shared.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { FuseAlertModule } from '@fuse/components/alert';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FuseCardModule } from '@fuse/components/card';
import { NgxStripeModule } from 'ngx-stripe';
import { ApprovalContactsComponent } from './customers-components/navigation/approval-contacts/approval-contacts.component';
import { CashbackComponent } from './customers-components/navigation/cashback/cashback.component';
import { CreditApplicationsComponent } from './customers-components/navigation/credit-applications/credit-applications.component';
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
import { UserInfoComponent } from './customers-components/navigation/user-info/user-info.component';
import { UserLocationsComponent } from './customers-components/navigation/user-locations/user-locations.component';
import { UserMetricsComponent } from './customers-components/navigation/user-metrics/user-metrics.component';
import { CustomersListComponent } from './customers-components/customers.component';
import { customersRoutes } from './customers.routing';
import { CustomerDetailsComponent } from './customers-components/details/details.customers.component';

@NgModule({
    declarations: [
        CustomersListComponent,
        CustomerDetailsComponent,
        ApprovalContactsComponent,
        CashbackComponent,
        CreditApplicationsComponent,
        CreditTermsComponent,
        FulfillmentOrdersComponent,
        GroupOrdersComponent,
        LogoBankComponent,
        OrdersHistoryComponent,
        QuotesComponent,
        RemindersComponent,
        SavedCartsComponent,
        SendRegisterEmailsComponent,
        StoreUsageComponent,
        UserAddressComponent,
        UserCommentsComponent,
        UserInfoComponent,
        UserLocationsComponent,
        UserMetricsComponent
    ],
    imports: [
        RouterModule.forChild(customersRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTableModule,
        MatTooltipModule,
        SharedModule,
        MatTabsModule,
        MatCardModule,
        MatGridListModule,
        MatDividerModule,
        MatRadioModule,
        MatListModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        NgxSkeletonLoaderModule,
        MatButtonToggleModule,
        NgMultiSelectDropDownModule,
        MatChipsModule,
        MatExpansionModule,
        FuseAlertModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatAutocompleteModule,
        MatSnackBarModule,
        FuseCardModule,
        NgxStripeModule,
    ],
})
export class CustomersModule {
}
