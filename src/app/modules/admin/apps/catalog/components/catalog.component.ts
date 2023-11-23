import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { UserService } from 'app/core/user/user.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatDrawer } from '@angular/material/sidenav';
import Swal from 'sweetalert2'
import { CatalogService } from './catalog.service';
import { FormControl } from '@angular/forms';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { K } from '@angular/cdk/keycodes';
@Component({
  selector: 'catalog',
  templateUrl: './catalog.component.html',
  styles: [".ngx-pagination .current {background: #2c3344 !important}"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogComponent {
  @ViewChild('drawer', { static: true }) sidenav: MatDrawer;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  // Sidebar stuff
  @ViewChild('topScrollAnchor') topScroll: ElementRef;
  @ViewChild('drawer') drawer: MatDrawer;
  drawerMode: 'over' | 'side' = 'over';

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['image', 'id', 'name', 'company', 'desc', 'action'];
  total = 0;
  temptotal = 0;
  itemsPerPage = 25;
  page = 1;
  isPageLoading: boolean = false;

  sortBy = 1;

  // fiters
  catalogFilter = {
    perPage: 25,
    sort_by: '',
    keyword: '',
    sort_order: '',
    company_search: '',
    color_search: '',
    method_search: '',
    bln_active: '',
    vendor_relation: 0
  }
  isFilterLoader: boolean = false;

  // Vendors Searchable
  filteredOptions: string[] = [];
  allSuppliers = [];
  searchSupplierCtrl = new FormControl();
  selectedSupplier: any;
  // Colors Searchable
  allColors = [];
  searchColorCtrl = new FormControl();
  selectedColor: any = [];
  isSearchingColor = false;
  selectedColors: any = [];
  searchTerm: any = '';
  dropdownSettings: any;
  singleSelectDropdownSettings: any;
  // Sizes Searchable
  allSizes = [];
  searchSizeCtrl = new FormControl();
  selectedSize: any = [];
  isSearchingSize = false;
  // Methods Searchable
  allMethods = [];
  searchMethodCtrl = new FormControl();
  selectedMethod: any = [];
  isSearchingMethod = false;

  // Vendor Searchable
  SelectedVendor: any = [];
  selectedVendorRelation: any;
  selectedColorString: any;
  selectedDecorationString: any;
  selectedSizeString: any


  filterIds: any = {}
  minQuantity: any = 0;
  minPrice: any = 0;
  maxPrice: any = 0;
  keyWord: any = ''

  filterPayload: any = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: '',
    sortOrder: '',
    blnActive: 1,
    keyword: '',
    companySearch: '',
    methodSearch: '',
    colorSearch: '',
    sizeSearch: '',
    minPrice: 0,
    maxPrice: 0,
    minQuantity: 0,
    vendorRelation: 0,
    catalog_filter_products: true
  };

  vendorRelations: any = [
    'Any Relation',
    'Normal',
    'Preffered',
    'Partner',
    'Preffered & Partner',
  ]



  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _catalogService: CatalogService,
    private _commonService: DashboardsService,
    private _router: Router,
    private route: ActivatedRoute,
    private _authService: AuthService,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
  ) {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
    };
    this.singleSelectDropdownSettings = {
      singleSelection: true,
      idField: 'pk_companyID',
      textField: 'companyName',
      allowSearchFilter: true,
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  toggleDrawer() {
    this.sidenav.toggle();
  }
  getSuppliers() {
    this.allSuppliers = [];
    this._commonService.suppliersData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((supplier) => {
        this.allSuppliers.push({ pk_companyID: 0, companyName: 'All' });
        this.allSuppliers = this.allSuppliers.concat(supplier["data"]);
        this.searchSupplierCtrl.setValue(this.allSuppliers[0].companyName);
        this.selectedSupplier = this.allSuppliers[0];
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._changeDetectorRef.markForCheck();
      });
    this.searchSupplierCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterSupplier(value))
    ).subscribe((filteredValues) => {
      this.filteredOptions = filteredValues;
    });
  }
  displayFn(value: any): string {
    return value;
  }
  private _filterSupplier(value: any): any[] {
    if (value) {
      const filterValue = value.toLowerCase();
      return this.allSuppliers.filter((option) =>
        option.companyName.toLowerCase().includes(filterValue)
      );
    }
  }
  getSizes() {
    this._catalogService.Sizes$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allSizes = res["data"];
    });
    let paramsSizes;
    this.searchSizeCtrl.valueChanges.pipe(
      filter((res: any) => {
        paramsSizes = {
          apparel_sizes: true,
          keyword: res,
          size: 30
        }
        return res !== null && res.length >= 1
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allSizes = [];
        this.isSearchingSize = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._catalogService.getCatalogData(paramsSizes)
        .pipe(
          finalize(() => {
            this.isSearchingSize = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allSizes = data['data'];
    });
  }
  getColors() {
    this._catalogService.Colors$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allColors = res["data"];
    });
    let paramsColor;
    this.searchColorCtrl.valueChanges.pipe(
      filter((res: any) => {
        paramsColor = {
          colors: true,
          keyword: res,
          size: 30
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allColors = [];
        this.isSearchingColor = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._catalogService.getCatalogData(paramsColor)
        .pipe(
          finalize(() => {
            this.isSearchingColor = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allColors = data['data'];
    });
  }
  getImprints() {
    this._catalogService.Imprints$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allMethods = res["data"];
    });
    let paramsMethod;
    this.searchMethodCtrl.valueChanges.pipe(
      filter((res: any) => {
        paramsMethod = {
          imprint_methods: true,
          keyword: res,
          size: 30
        }
        return res !== null && res.length >= 1
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allMethods = [];
        this.isSearchingMethod = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._catalogService.getCatalogData(paramsMethod)
        .pipe(
          finalize(() => {
            this.isSearchingMethod = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allMethods = data['data'];
    });
  }
  ngOnInit(): void {
    this.getSuppliers();
    // this.getColors();
    this.getSizes();
    this.getImprints();
    this.getColorsDecorationSizes();
  }
  getColorsDecorationSizes() {
    let params = {
      colors_decoration_sizes: true
    }
    this._catalogService.getCatalogData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        this.allColors = [];
        this.allSizes = [];
        this.allMethods = [];
        const { qryTopColors, qryTopImprintMethods, qryTopOrderedSizes } = res;
        // Process colors
        this.processData(qryTopColors[0].qryTopColors, this.allColors);
        // Process imprint methods
        this.processData(qryTopImprintMethods[0].qryTopImprintMethods, this.allMethods);
        // Process sizes
        this.processData(qryTopOrderedSizes[0].qryTopOrderedSizes, this.allSizes);
      });
  }
  // Helper function to process data and populate arrays
  processData(dataString: string, targetArray: any[]): void {
    const dataArray = dataString.split(',,');
    dataArray.forEach(data => {
      const [name, id, count] = data.split('::');
      targetArray.push({ name, id, count });
    });
  }
  // Vendors
  onSelected(ev) {
    this.selectedSupplier = this.allSuppliers.find(vendor => vendor.companyName === ev.option.value);
    this.getCatalogs(1);
  }
  // Colors
  onSelectedColor(selectedItems: any | any[]) {
    // Ensure selectedItems is always an array
    const itemsArray = Array.isArray(selectedItems) ? selectedItems : [selectedItems];

    // Combine newly selected items with previously selected items
    this.selectedColors = [...this.selectedColors, ...itemsArray];

    // Remove duplicates (optional, depending on your use case)
    this.selectedColors = this.removeDuplicates(this.selectedColors, 'id');
  }

  // Helper function to remove duplicate items from an array based on a key
  removeDuplicates(array: any[], key: string) {
    return array.filter((item, index, self) =>
      index === self.findIndex(t => t[key] === item[key])
    );
  }
  displayWithColor(value: any) {
    return value?.colorName;
  }
  // Methods
  // onSelectedMethod(ev) {
  //   this.selectedMethod = ev.option.value;
  //   this.getCatalogs(1);
  // }

  onSelectedMethod(selectedItems: any | any[]) {
    // Ensure selectedItems is always an array
    const itemsArray = Array.isArray(selectedItems) ? selectedItems : [selectedItems];

    // Combine newly selected items with previously selected items
    this.selectedMethod = [...this.selectedMethod, ...itemsArray];

    // Remove duplicates (optional, depending on your use case)
    this.selectedMethod = this.removeDuplicates(this.selectedMethod, 'id');
  }

  displayWithMethod(value: any) {
    return value?.methodName;
  }
  // Sizes
  // onSelectedSize(ev) {
  //   this.selectedSize = ev.option.value;
  //   this.getCatalogs(1);
  // }

  onSelectedSize(selectedItems: any | any[]) {
    // Ensure selectedItems is always an array
    const itemsArray = Array.isArray(selectedItems) ? selectedItems : [selectedItems];

    // Combine newly selected items with previously selected items
    this.selectedSize = [...this.selectedSize, ...itemsArray];

    // Remove duplicates (optional, depending on your use case)
    this.selectedSize = this.removeDuplicates(this.selectedSize, 'id');
  }

  onSelectedVendor(selectedItems: any | any[]) {
    // Ensure selectedItems is always an array
    const itemsArray = Array.isArray(selectedItems) ? selectedItems : [selectedItems];

    // Combine newly selected items with previously selected items
    this.SelectedVendor = [...this.SelectedVendor, ...itemsArray];

    // Remove duplicates (optional, depending on your use case)
    this.SelectedVendor = this.removeDuplicates(this.SelectedVendor, 'id');
  }

  displayWithSize(value: any) {
    return value?.sizeName;
  }
  getNextCatalogData(event) {
    this.page = event;
    this.isPageLoading = true;
    this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    this.getCatalogs(this.page);
  };
  getCatalogs(page) {
    if (this.selectedSupplier) {
      this.catalogFilter.company_search = this.selectedSupplier.pk_companyID;
    } else {
      this.catalogFilter.company_search = '';
    }
    if (this.selectedColor) {
      this.catalogFilter.color_search = this.selectedColor.pk_colorID;
    } else {
      this.catalogFilter.color_search = '';
    }
    if (this.selectedMethod) {
      this.catalogFilter.method_search = this.selectedMethod.pk_methodID;
    } else {
      this.catalogFilter.method_search = '';
    }
    this.isFilterLoader = true;
    this.selectedColorString = this.selectedColor.map(item => item.name).join(',');
    this.selectedDecorationString = this.selectedMethod.map(item => item.name).join(',');
    this.selectedSizeString = this.selectedSize.map(item => item.name).join(',')
    this.filterPayload = {
      pageNumber: this.page || 1,
      pageSize: this.catalogFilter.perPage || 10,
      sortBy: this.catalogFilter.sort_by || `pk_productID`,
      sortOrder: this.catalogFilter.sort_order || "DESC",
      blnActive: this.catalogFilter.bln_active || 1,
      keyword: this.keyWord || '',
      companySearch: this.SelectedVendor.length > 0 ? this.SelectedVendor.map(item => item.pk_companyID)[0] : '',
      methodSearch: this.selectedMethod !== undefined ? this.selectedMethod.map(item => item.id).join(',') : '',
      colorSearch: this.selectedColor !== undefined ? this.selectedColor.map(item => item.id).join(',') : '',
      sizeSearch: this.selectedSize !== undefined ? this.selectedSize.map(item => item.id).join(',') : '',
      minPrice: this.minPrice || 0,
      maxPrice: this.maxPrice || 0,
      minQuantity: this.minQuantity || 0,
      vendorRelation: this.catalogFilter.vendor_relation || 0,
      catalog_filter_products: true
    }
    this._catalogService.getCatalogData(this.filterPayload).pipe(
      takeUntil(this._unsubscribeAll),
      distinctUntilChanged())
      .subscribe(res => {
        this.total = res["totalRecords"];
        this.dataSource = res["data"];
        this.isLoading = false;
        this.isFilterLoader = false;
        this.isPageLoading = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isFilterLoader = false;
        this.isLoading = false;
        this.isPageLoading = false;
        this._changeDetectorRef.markForCheck();
      });
  }
  onPageChange(ev) {
    this.catalogFilter.perPage = ev.value;
    this.itemsPerPage = ev.value;
    this.page = 1;
    // this.getCatalogs(1);
  }
  clearFilter(key: any,) {
    this.filterPayload = {
      // pageNumber: this.page || 1,
      // pageSize: this.catalogFilter.perPage || 10,
      // sortBy: this.catalogFilter.sort_by || `pk_productID`,
      // sortOrder: this.catalogFilter.sort_order || "DESC",
      // blnActive: this.catalogFilter.bln_active || 1,
      keyword: this.keyWord || '',
      companySearch: this.SelectedVendor.length > 0 ? this.SelectedVendor.map(item => item.pk_companyID)[0] : '',
      methodSearch: this.selectedMethod !== undefined ? this.selectedMethod.map(item => item.id).join(',') : '',
      colorSearch: this.selectedColor !== undefined ? this.selectedColor.map(item => item.id).join(',') : '',
      sizeSearch: this.selectedSize !== undefined ? this.selectedSize.map(item => item.id).join(',') : '',
      minPrice: this.minPrice || 0,
      maxPrice: this.maxPrice || 0,
      minQuantity: this.minQuantity || 0,
      vendorRelation: this.catalogFilter.vendor_relation || 0,
      // catalog_filter_products: true
    }
    if (key === 'keyword') {
      this.keyWord = ''
    } else if (key === 'companySearch') {
      this.SelectedVendor = [];
    } else if (key === 'methodSearch') {
      this.selectedMethod = [];
    } else if (key === 'colorSearch') {
      this.selectedColor = []
    } else if (key === 'sizeSearch') {
      this.selectedSize = [];
    } else if (key === 'minPrice') {
      this.minPrice = 0;
    } else if (key === 'maxPrice') {
      this.maxPrice = 0;
    } else if (key === 'minQuantity') {
      this.minQuantity = 0;
    } else if (key === 'vendorRelation') {
      this.catalogFilter.vendor_relation = 0;
    }

    this.getCatalogs(1);
  }
  searchByKeyword(ev) {
    this.catalogFilter.keyword = ev.target.value;
    this.page = 1;
    this.getCatalogs(1);
  }
  sortByFilter(ev) {
    let val = ev.value;
    if (val == 1) {
      this.catalogFilter.sort_order = '';
      this.catalogFilter.sort_by = '';
    } else if (val == 2) {
      this.catalogFilter.sort_by = 'priceAsc';
      this.catalogFilter.sort_order = 'ASC';
    } else if (val == 3) {
      this.catalogFilter.sort_by = 'priceDesc';
      this.catalogFilter.sort_order = 'DESC';
    } else if (val == 4) {
      this.catalogFilter.sort_by = 'nameAsc';
      this.catalogFilter.sort_order = 'ASC';
    } else if (val == 5) {
      this.catalogFilter.sort_by = 'nameDesc';
      this.catalogFilter.sort_order = 'DESC';
    }
    // this.page = 1;
    // this.getCatalogs(1);
  }
  vendorFilter(ev) {
    this.page = 1;
    this.selectedVendorRelation = this.vendorRelations[this.catalogFilter.vendor_relation];
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
