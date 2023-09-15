import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { ProductCategoriesComponent } from './product-categories.component';
import { ProductMainCategoriesComponent } from './product-main-categories/product-main-categories.component';
import { ProductSubCategoriesComponent } from './product-sub-categories/product-sub-categories.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseAlertModule } from '@fuse/components/alert';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from 'ckeditor4-angular';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgxPaginationModule } from 'ngx-pagination';
import { QuillModule } from 'ngx-quill';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ProdCatsComponent } from './prod-cats.component';

const catRoutes: Route[] = [
  {
    path: '',
    component: ProdCatsComponent,
    children: [
      {
        path: '',
        redirectTo: 'categories',
        pathMatch: 'full'
      },
      {
        path: 'categories',
        component: ProductCategoriesComponent,
      },
      {
        path: 'parent-categories/:id',
        component: ProductMainCategoriesComponent,
      },
      {
        path: 'child-categories/:pid/:id',
        component: ProductSubCategoriesComponent,
      },
    ]
  },
]

@NgModule({
  declarations: [
    ProdCatsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(catRoutes),
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


export class ProductCategoriesModule { }
