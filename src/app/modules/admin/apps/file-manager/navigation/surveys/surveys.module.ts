import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SharedModule } from "app/shared/shared.module";
import { storeRoutes } from "app/modules/admin/apps/file-manager/stores.routing";
import { MatSelectModule } from "@angular/material/select";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatInputModule } from "@angular/material/input";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { QuillModule } from "ngx-quill";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { NgApexchartsModule } from "ng-apexcharts";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatRadioModule } from "@angular/material/radio";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { FuseAlertModule } from "@fuse/components/alert";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { MatTabsModule } from "@angular/material/tabs";
import { MatNativeDateModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSortModule } from "@angular/material/sort";
import { MatChipsModule } from "@angular/material/chips";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatStepperModule } from '@angular/material/stepper';
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { NgxDropzoneModule } from "ngx-dropzone";
import { MatBadgeModule } from '@angular/material/badge';
import { NgxPaginationModule } from "ngx-pagination";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { CKEditorModule } from 'ckeditor4-angular';
import { SurveysMainComponent } from "./survey-main.component";
import { SurveysComponent } from "./surveys.component";
import { EditSurveysComponent } from "./edit-survey/edit-survey.component";
import { SurveysAnalyticsComponent } from "./Analytics/analytics.component";
const surveysRoute: Route[] = [
    {
        path: '',
        component: SurveysMainComponent,
        resolve: {
        },
        children: [
            {
                path: '',
                redirectTo: 'list',
                pathMatch: 'full'
            },
            {
                path: 'list',
                component: SurveysComponent,
                data: {
                    title: 'Surveys',
                    url: 'surveys'
                }
            },
            {
                path: 'edit/:id',
                component: EditSurveysComponent,
                data: {
                    title: 'Edit Survey',
                    url: 'surveys'
                }
            },
            {
                path: 'analytics/:id',
                component: SurveysAnalyticsComponent,
                data: {
                    title: 'Survey Analytics',
                    url: 'surveys'
                }
            },
        ]
    },

]
@NgModule({
    declarations: [
        SurveysMainComponent,
        SurveysComponent,
        EditSurveysComponent,
        SurveysAnalyticsComponent
    ],
    imports: [
        RouterModule.forChild(surveysRoute),
        MatTableModule,
        MatButtonModule,
        MatRadioModule,
        MatIconModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatIconModule,
        MatPaginatorModule,
        MatSelectModule,
        MatProgressBarModule,
        MatDialogModule,
        NgxSkeletonLoaderModule,
        MatInputModule,
        MatCheckboxModule,
        NgApexchartsModule,
        MatButtonToggleModule,
        MatSnackBarModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatExpansionModule,
        QuillModule.forRoot(),
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        FuseAlertModule,
        NgMultiSelectDropDownModule,
        MatTabsModule,
        MatSortModule,
        MatStepperModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatSlideToggleModule,
        NgxDropzoneModule,
        MatBadgeModule,
        NgxPaginationModule,
        ScrollingModule,
        CKEditorModule
    ]
})
export class SurveysModule { }
