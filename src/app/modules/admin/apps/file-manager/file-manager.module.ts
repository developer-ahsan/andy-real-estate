import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { fileManagerRoutes } from 'app/modules/admin/apps/file-manager/file-manager.routing';
import { FileManagerComponent } from 'app/modules/admin/apps/file-manager/file-manager.component';
import { FileManagerDetailsComponent } from 'app/modules/admin/apps/file-manager/details/details.component';
import { FileManagerListComponent } from 'app/modules/admin/apps/file-manager/list/list.component';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { QuillModule } from 'ngx-quill';

@NgModule({
    declarations: [
        FileManagerComponent,
        FileManagerDetailsComponent,
        FileManagerListComponent
    ],
    imports: [
        RouterModule.forChild(fileManagerRoutes),
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        MatTooltipModule,
        MatSelectModule,
        MatProgressBarModule,
        MatInputModule,
        QuillModule.forRoot(),
        SharedModule
    ]
})
export class FileManagerModule {
}
