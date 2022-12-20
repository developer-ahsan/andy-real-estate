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
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { SharedModule } from 'app/shared/shared.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { QuillModule } from 'ngx-quill';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FuseAlertModule } from '@fuse/components/alert';
import { MatDialogModule } from '@angular/material/dialog';
import { flpsRoutes } from './flps.routing';
import { FLPSComponent } from './components/flps.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReportComponent } from './components/pages/report/report.component';
import { FLPSUserManagementComponent } from './components/pages/user-management/user-management.component';
import { FLPSStoreManagementComponent } from './components/pages/store-management/store-management.component';
import { SettingsAccountComponent } from './components/pages/account/account.component';
import { SettingsNotificationsComponent } from './components/pages/notifications/notifications.component';
import { SettingsSecurityComponent } from './components/pages/security/security.component';
import { SettingsTeamComponent } from './components/pages/team/team.component';
import { GenerateReportComponent } from './components/pages/generate-report/generate-report.component';

@NgModule({
    declarations: [
        FLPSComponent,
        ReportComponent,
        FLPSUserManagementComponent,
        FLPSStoreManagementComponent,
        SettingsAccountComponent,
        SettingsNotificationsComponent,
        GenerateReportComponent,
        SettingsSecurityComponent,
        SettingsTeamComponent
    ],
    imports: [
        RouterModule.forChild(flpsRoutes),
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
        NgxSkeletonLoaderModule,
        MatStepperModule,
        MatProgressSpinnerModule,
        MatSidenavModule,
        NgxDropzoneModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatExpansionModule,
        NgxSliderModule,
        MatSnackBarModule,
        MatButtonToggleModule,
        QuillModule.forRoot(),
        AutocompleteLibModule,
        NgMultiSelectDropDownModule,
        FuseAlertModule,
        MatDialogModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
})
export class FlpsModule {
}
