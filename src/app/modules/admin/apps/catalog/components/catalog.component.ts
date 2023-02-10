import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { UserService } from 'app/core/user/user.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatDrawer } from '@angular/material/sidenav';
import Swal from 'sweetalert2'
import { CatalogService } from './catalog.service';
import { FormControl } from '@angular/forms';
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
  allSuppliers = [];
  searchSupplierCtrl = new FormControl();
  selectedSupplier: any;
  isSearchingSupplier = false;
  // Colors Searchable
  allColors = [];
  searchColorCtrl = new FormControl();
  selectedColor: any;
  isSearchingColor = false;
  // Sizes Searchable
  allSizes = [];
  searchSizeCtrl = new FormControl();
  selectedSize: any;
  isSearchingSize = false;
  // Methods Searchable
  allMethods = [];
  searchMethodCtrl = new FormControl();
  selectedMethod: any;
  isSearchingMethod = false;
  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _catalogService: CatalogService,
    private _router: Router,
    private route: ActivatedRoute,
    private _authService: AuthService,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
  ) {
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
  ngOnInit(): void {
    let params;
    this.searchSupplierCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          supplier: true,
          bln_active: 1,
          keyword: res
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allSuppliers = [];
        this.isSearchingSupplier = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._catalogService.getCatalogData(params)
        .pipe(
          finalize(() => {
            this.isSearchingSupplier = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allSuppliers = data['data'];
    });

    // Colors
    let paramsColor;
    this.searchColorCtrl.valueChanges.pipe(
      filter((res: any) => {
        paramsColor = {
          colors: true,
          keyword: res
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

    // Sizes
    let paramsSizes;
    this.searchSizeCtrl.valueChanges.pipe(
      filter((res: any) => {
        paramsSizes = {
          apparel_sizes: true,
          keyword: res
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
    // Methods
    let paramsMethod;
    this.searchMethodCtrl.valueChanges.pipe(
      filter((res: any) => {
        paramsMethod = {
          imprint_methods: true,
          keyword: res
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
    // this.isLoading = true;
    // this.getCatalogs(1);
  }
  // Vendors
  onSelected(ev) {
    this.selectedSupplier = ev.option.value;
    this.getCatalogs(1);
  }

  displayWith(value: any) {
    return value?.companyName;
  }
  // Colors
  onSelectedColor(ev) {
    this.selectedColor = ev.option.value;
    this.getCatalogs(1);
  }
  displayWithColor(value: any) {
    return value?.colorName;
  }
  // Methods
  onSelectedMethod(ev) {
    this.selectedMethod = ev.option.value;
    this.getCatalogs(1);
  }
  displayWithMethod(value: any) {
    return value?.methodName;
  }
  // Sizes
  onSelectedSize(ev) {
    this.selectedSize = ev.option.value;
    this.getCatalogs(1);
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
    let params = {
      catalog_products: true,
      page: page,
      sort_by: this.catalogFilter.sort_by,
      sort_order: this.catalogFilter.sort_order,
      keyword: this.catalogFilter.keyword,
      size: this.catalogFilter.perPage,
      company_search: this.catalogFilter.company_search,
      method_search: this.catalogFilter.method_search,
      color_search: this.catalogFilter.color_search,
      bln_active: this.catalogFilter.bln_active,
      vendor_relation: this.catalogFilter.vendor_relation
    }
    this._catalogService.getCatalogData(params).pipe(
      takeUntil(this._unsubscribeAll),
      distinctUntilChanged())
      .subscribe(res => {
        this.total = res["totalRecords"];
        res["data"].forEach((element, index) => {
          element.Cost = JSON.parse(element.Cost);
          element.Imprint = JSON.parse(element.Imprint);
        });
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
    this.getCatalogs(1);
  }
  clearFilter(type) {
    this.page = 1;
    if (type == 1) {
      this.selectedSupplier = null;
      this.page = 1;
      this.searchSupplierCtrl.setValue(null);
    } else if (type == 2) {
      this.selectedColor = null;
      this.searchColorCtrl.setValue(null);
    } else if (type == 3) {
      this.selectedSize = null;
      this.searchSizeCtrl.setValue(null);
    } else if (type == 4) {
      this.selectedMethod = null;
      this.searchMethodCtrl.setValue(null);
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
      this.catalogFilter.sort_by = 'minPrice';
      this.catalogFilter.sort_order = 'ASC';
    } else if (val == 3) {
      this.catalogFilter.sort_by = 'maxPrice';
      this.catalogFilter.sort_order = 'DESC';
    } else if (val == 4) {
      this.catalogFilter.sort_by = 'productName';
      this.catalogFilter.sort_order = 'ASC';
    } else if (val == 5) {
      this.catalogFilter.sort_by = 'productName';
      this.catalogFilter.sort_order = 'DESC';
    }
    this.page = 1;
    this.getCatalogs(1);
  }
  vendorFilter(ev) {
    this.page = 1;
    this.getCatalogs(1);
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
