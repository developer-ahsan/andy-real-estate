import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { CustomersBrand, CustomersCategory, CustomersPagination, CustomersProduct, CustomersTag, CustomersVendor } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';

@Component({
    selector: 'customers',
    templateUrl: './customer.tabs.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class CustomersTabComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    customers$: Observable<CustomersProduct[]>;

    brands: CustomersBrand[];
    categories: CustomersCategory[];
    filteredTags: CustomersTag[];
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    otherComponentLoading: boolean = false;
    pagination: CustomersPagination;
    customersCount: number = 0;
    customerTableColumns: string[] = ['_id', 'first_name', 'last_name', 'customer_email', 'customer_store', 'customer_company', 'details'];
    searchInputControl: FormControl = new FormControl();
    selectedCustomer: CustomersProduct | null = null;
    selectedCustomerForm: FormGroup;
    selectedCustomerId: string = "";
    selectedTab = "User Info";
    breakpoint: number;
    not_available = "N/A";
    customerAddress: [];
    updateUserLoader = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    selectedIndex: string = "User Info";
    // Sidebar stuff
    routes = [];
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _customerService: CustomersService,
        private _router: Router,
        private route: ActivatedRoute,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this.breakpoint = (window.innerWidth <= 620) ? 1 : (window.innerWidth <= 820) ? 2 : (window.innerWidth <= 1300) ? 3 : 4;
        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {

                // Set the drawerMode and drawerOpened if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // get customerId from params
        this.route.queryParamMap
            .subscribe((parameters) => {
                const obj = { ...parameters.keys, ...parameters };
                const { customerId } = obj["params"];
                this.selectedCustomerId = customerId;
            }
            );

        this.routes = this._customerService.navigationLabels;

        // Create the selected product form
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
            zipCode: [''],
            city: [''],
            blnActive: [''],
            website: [''],
            department: ['']
        });

        // Get the products
        this.customers$ = this._customerService.customers$;
        this._customerService.customers$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((products: CustomersProduct[]) => {

                // Update the counts
                this.customersCount = products.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._customerService.getCustomers(0, 10, 'name', 'asc', query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();

        this.toggleDetails(this.selectedCustomerId);
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void { }

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

    // Resizing screen 
    onResize(event) {
        this.breakpoint = (event.target.innerWidth <= 620) ? 1 : (event.target.innerWidth <= 820) ? 2 : (window.innerWidth <= 1300) ? 3 : 4;
    }

    toggleDrawer() {
        this.drawerOpened = !this.drawerOpened;
    };

    clicked(index) {
        const { title } = index;
        this.isLoading = true;
        this.selectedIndex = title;
    }

    /**
     * Toggle customer details
     *
     * @param customerId
     */
    toggleDetails(customerId: string): void {
        // If the customer is already selected...
        if (this.selectedCustomer && this.selectedCustomer.pk_userID === customerId) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the customer by id
        this._customerService.getSingleCustomerDetails(customerId)
            .subscribe((customer) => {

                // Set the selected customer
                this.selectedCustomer = customer;

                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Fill the form
                this.selectedCustomerForm.patchValue(customer);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedCustomer = null;
    };

    /**
     * Add tag to the product
     *
     * @param tag
     */
    addTagToProduct(tag: CustomersTag): void {
        // Add the tag
        [].unshift(tag.id);

        // Update the selected product form
        this.selectedCustomerForm.get('tags').patchValue([]);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    };

    /**
     * Create product
     */
    createCustomer(): void {
        // Create the product
        this._customerService.createCustomer().subscribe((newCustomer) => {

            // Go to new product
            this.selectedCustomer = newCustomer;

            // Fill the form
            this.selectedCustomerForm.patchValue(newCustomer);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

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

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    backToCustomersScreen(): void {
        this.isLoading = true;
        this._router.navigate(['/apps/ecommerce/customers']);
    }
}
