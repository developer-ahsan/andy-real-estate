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

@NgModule({
    declarations: [
        FileManagerComponent,
        StoresDetailsComponent,
        StoresListComponent
    ],
    imports: [
        RouterModule.forChild(storeRoutes),
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatSelectModule,
        MatProgressBarModule,
        NgxSkeletonLoaderModule,
        MatInputModule,
        QuillModule.forRoot(),
        SharedModule
    ]
})
export class StoresModule {
}