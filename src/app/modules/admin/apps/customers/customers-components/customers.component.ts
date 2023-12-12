import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { CustomersBrand, CustomersCategory, CustomersPagination, CustomersProduct, CustomersTag, CustomersVendor } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { Router } from '@angular/router';
import { CustomersService } from './orders.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'customers',
  templateUrl: './customers.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations
})
export class CustomersListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;

  customers$: Observable<CustomersProduct[]>;
  flashMessage: 'success' | 'error' | null = null;
  isLoading: boolean = false;
  pagination: CustomersPagination;
  customersCount: number;
  customerTableColumns: string[] = ['_id', 'first_name', 'last_name', 'customer_email', 'customer_store', 'customer_company', 'date_registered', 'rem', 'mrp', 'dropdown'];
  selectedCustomer: CustomersProduct | null = null;
  selectedCustomerForm: FormGroup;
  not_available = "N/A";
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  ngSublocationName = '';
  updateAttributeVal = '';
  updateAttributeId: any;
  selectedCategory = null;

  pageSize: number;
  pageNo: number = 1;;
  keywordSearch: string = '';
  allStores: any = [];
  ngKeyword = '';
  ngSelectedStore = 0;
  ngSelectedStatus = -1;
  ngSelectedReminder = -1;
  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _customerService: CustomersService,
    private _router: Router,
    private _commonService: DashboardsService

  ) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.pageSize = this._customerService.pageSize;
    this.pageNo = this._customerService.pageNumber;

    // Create the selected customer form
    this.selectedCustomerForm = this._formBuilder.group({
      id: [''],
      firstName: [''],
      lastName: [''],
      email: [''],
      companyName: [''],
      storeName: [''],
      title: [''],
      date: [''],
      ipaddress: [''],
      fax: [''],
      dayPhone: [''],
      blnActive: [''],
      website: [''],
      department: ['']
    });
    // 
    this.customers$ = this._customerService.customers$;
    this._customerService.customers$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((customers: CustomersProduct[]) => {
        this.customers$ = customers["data"];
        this.customersCount = customers["totalRecords"];
        this._customerService._searchKeyword = '';
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    this.getStoresList();
  };

  getStoresList() {
    this.allStores = [];
    this._commonService.storesData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.allStores = [
          { pk_storeID: 0, storeName: 'All Stores' },
          ...res["data"].filter(element => element.blnActive)
        ];
      });
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  getCustomersList() {
    this._customerService.getCustomersList(this.keywordSearch)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((customers) => {
        this.customers$ = customers["data"];

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  pageEvents(event: any) {
    const { pageIndex, previousPageIndex } = event;
    this.isLoading = true;
    if (pageIndex > previousPageIndex) {
      this.pageNo++;
    } else {
      this.pageNo--;
    };
    this.getCustomersLists();
  };
  getCustomersLists() {
    let params = {
      page: this.pageNo,
      list: true,
      size: 20,
      keyword: this.ngKeyword,
      store_id: this.ngSelectedStore,
      user_status: this.ngSelectedStatus,
      bln_reminder: this.ngSelectedReminder,
      sort_by: 'storeName',
      sort_order: 'ASC'
    }
    this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.customers$ = res["data"];
      this.customersCount = res["totalRecords"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  searchKeyword(): void {
    this.pageNo = 1;
    this.isLoading = true;
    // this.keywordSearch = event.target.value ? event.target.value : '';
    this.getCustomersLists();
  };

  /**
   * Toggle customer details
   *
   * @param customerId
   */
  toggleDetails(customerId: string): void {
  };

  /**
   * Show flash message
   */
  showFlashMessage(type: 'success' | 'error'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3000);
  }


  closeDetails(): void {
    this.selectedCategory = null;
  }

  openedAccordion(data): void {
    this.ngSublocationName = '';
    const { pk_userID } = data;
    if (this.selectedCategory && this.selectedCategory.pk_userID === pk_userID) {
      this.closeDetails();
      return;
    };
    this.selectedCategory = data;
  }

  navigateToLocation(customer) {
    this.isLoading = true;
    const { pk_userID } = customer;
    let route = `/apps/customers/${pk_userID}/locations`;
    this._router.navigate([route]);
  }

  navigateToReminder(customer) {
    this.isLoading = true;
    const { pk_userID } = customer;
    let route = `/apps/customers/${pk_userID}/reminders`;
    this._router.navigate([route]);
  }

  salesVolume(product): string {
    let data = product.qrySalesVolume.split(',,')
    return `$${data[0]}, ${data[1]} sales.`;
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  getFirstCompanyName(data): string {
    if (Array.isArray(data)) {
      return data[0];
    } else {
      return data;
    }
  }

  getReminder(data) {
    if (!data) {
      return 'No reminders/alerts'
    }
    else {
      const parts = data.split("::");
      return `${parts[0]} on ${parts[1]}`
    }
  }

  editCustomer(customer) {
    this.isLoading = true;
    const { pk_userID } = customer;
    let route = `/apps/customers/${pk_userID}`;
    this._router.navigate([route]);
  }
}
