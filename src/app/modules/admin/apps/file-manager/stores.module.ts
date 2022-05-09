import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { storeRoutes } from 'app/modules/admin/apps/file-manager/stores.routing';
import { FileManagerComponent } from 'app/modules/admin/apps/file-manager/file-manager.component';
import { StoresDetailsComponent } from 'app/modules/admin/apps/file-manager/details/details.component';
import { StoresListComponent } from 'app/modules/admin/apps/file-manager/list/list.component';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { QuillModule } from 'ngx-quill';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { DashboardComponent } from './navigation/dashboard/dashboard.component';
import { StoreProductsComponent } from './navigation/store-products/store-products.component';
import { ProductCategoriesComponent } from './navigation/product-categories/product-categories.component';
import { ProductsSuppliersComponent } from './navigation/products-suppliers/products-suppliers.component';
import { OfflineProductsComponent } from './navigation/offline-products/offline-products.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatRadioModule} from '@angular/material/radio';
import { StoreVideosComponent } from './navigation/store-videos/store-videos.component';
import { RapidbuildComponent } from './navigation/rapidbuild/rapidbuild.component';
import { RapidbuildActionsComponent } from './navigation/rapidbuild-actions/rapidbuild-actions.component';
import { StoreSettingsComponent } from './navigation/store-settings/store-settings.component';
import { GroupOrderSettingsComponent } from './navigation/group-order-settings/group-order-settings.component';
import { CampaignsComponent } from './navigation/campaigns/campaigns.component';

@NgModule({
    declarations: [
        FileManagerComponent,
        StoresDetailsComponent,
        StoresListComponent,
        DashboardComponent,
        StoreProductsComponent,
        ProductCategoriesComponent,
        ProductsSuppliersComponent,
        OfflineProductsComponent,
        StoreVideosComponent,
        RapidbuildComponent,
        RapidbuildActionsComponent,
        StoreSettingsComponent,
        GroupOrderSettingsComponent,
        CampaignsComponent
    ],
    imports: [
        RouterModule.forChild(storeRoutes),
        MatTableModule,
        MatButtonModule,
        MatRadioModule,
        MatIconModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatSelectModule,
        MatProgressBarModule,
        NgxSkeletonLoaderModule,
        MatInputModule,
        NgApexchartsModule,
        QuillModule.forRoot(),
        SharedModule
    ]
})
export class StoresModule {
}
