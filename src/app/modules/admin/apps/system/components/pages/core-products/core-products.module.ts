import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreProductsComponent } from './core-products.component';
import { Route, RouterModule } from '@angular/router';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
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
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { SharedModule } from 'app/shared/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { QuillModule } from 'ngx-quill';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CategoriesDetailsComponent } from './categories-details/categories-details.component';
import { CoreRoutingProductsComponent } from './core-routing.component';
import { CategoriesProductsComponent } from './categories-details/categories-products/categories-products.component';
import { CoreProductsSuppliersComponent } from './products-suppliers/products-suppliers.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { SubCategoriesProductsComponent } from './categories-details/subcategories-products/subcategories-products.component';


const coreRoutes: Route[] = [
  {
    path: '',
    component: CoreRoutingProductsComponent,
    children: [
      // {
      //   path: '',
      //   redirectTo: 'categories',
      //   pathMatch: 'full'
      // },
      {
        path: '',
        component: CoreProductsComponent
      },
      {
        path: 'categories/:id',
        component: CategoriesDetailsComponent
      },
      {
        path: 'summary/:id',
        component: CoreProductsSuppliersComponent
      },
    ]
  }
]
@NgModule({
  declarations: [CoreProductsComponent, CategoriesDetailsComponent, CoreRoutingProductsComponent, CategoriesProductsComponent, CoreProductsSuppliersComponent, SubCategoriesProductsComponent],
  imports: [RouterModule.forChild(coreRoutes), CommonModule,
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
    NgxPaginationModule,
    MatNativeDateModule],
  exports: [RouterModule]
})

export class CoreProductsModule { }
