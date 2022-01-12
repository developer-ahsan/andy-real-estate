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
import { MatRippleModule } from '@angular/material/core';
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
import { MatListModule } from '@angular/material/list';
import { SharedModule } from 'app/shared/shared.module';
import { OrdersComponent } from 'app/modules/admin/apps/orders/orders-components/orders.component';
import { OrdersListComponent } from 'app/modules/admin/apps/orders/orders-components/list/orders.component';
import { ordersRoutes } from 'app/modules/admin/apps/orders/orders.routing';
import { OrdersDetailsComponent } from 'app/modules/admin/apps/orders/orders-components/details/details.orders.component';
import { OrdersSummaryComponent } from './orders-components/navigation/orders-summary/orders-summary.component';
import { OrdersEntitiesListComponent } from './orders-components/navigation/orders-entities-list/orders-entities-list.component';

@NgModule({
    declarations: [
        OrdersComponent,
        OrdersListComponent,
        OrdersDetailsComponent,
        OrdersSummaryComponent,
        OrdersEntitiesListComponent
    ],
    imports     : [
        RouterModule.forChild(ordersRoutes),
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
        MatSidenavModule
    ]
})
export class OrdersModule
{
}
