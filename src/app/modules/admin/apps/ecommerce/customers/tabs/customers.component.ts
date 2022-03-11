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
    tags: CustomersTag[];
    tagsEditMode: boolean = false;
    vendors: CustomersVendor[];
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

        // Get the brands
        this._customerService.brands$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((brands: CustomersBrand[]) => {

                // Update the brands
                this.brands = brands;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the categories
        this._customerService.categories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: CustomersCategory[]) => {

                // Update the categories
                this.categories = categories;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagination
        this._customerService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: CustomersPagination) => {

                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
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

        // Get the tags
        this._customerService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: CustomersTag[]) => {

                // Update the tags
                this.tags = tags;
                this.filteredTags = tags;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the vendors
        this._customerService.vendors$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((vendors: CustomersVendor[]) => {

                // Update the vendors
                this.vendors = vendors;

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
    }

    /**
     * Cycle through images of selected product
     */
    cycleImages(forward: boolean = true): void {
        // Get the image count and current image index
        const count = this.selectedCustomerForm.get('images').value.length;
        const currentIndex = this.selectedCustomerForm.get('currentImageIndex').value;

        // Calculate the next and previous index
        const nextIndex = currentIndex + 1 === count ? 0 : currentIndex + 1;
        const prevIndex = currentIndex - 1 < 0 ? count - 1 : currentIndex - 1;

        // If cycling forward...
        if (forward) {
            this.selectedCustomerForm.get('currentImageIndex').setValue(nextIndex);
        }
        // If cycling backwards...
        else {
            this.selectedCustomerForm.get('currentImageIndex').setValue(prevIndex);
        }
    }

    /**
     * Toggle the tags edit mode
     */
    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
    }

    /**
     * Filter tags
     *
     * @param event
     */
    filterTags(event): void {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        this.filteredTags = this.tags.filter(tag => tag.title.toLowerCase().includes(value));
    }

    /**
     * Filter tags input key down event
     *
     * @param event
     */
    filterTagsInputKeyDown(event): void {
        // Return if the pressed key is not 'Enter'
        if (event.key !== 'Enter') {
            return;
        }

        // If there is no tag available...
        if (this.filteredTags.length === 0) {
            // Create the tag
            this.createTag(event.target.value);

            // Clear the input
            event.target.value = '';

            // Return
            return;
        }

        // If there is a tag...
        const tag = this.filteredTags[0];
        const isTagApplied = [].find(id => id === tag.id);

        // If the found tag is already applied to the contact...
        if (isTagApplied) {
            // Remove the tag from the contact
            this.removeTagFromProduct(tag);
        }
        else {
            // Otherwise add the tag to the contact
            this.addTagToProduct(tag);
        }
    }

    /**
     * Create a new tag
     *
     * @param title
     */
    createTag(title: string): void {
        const tag = {
            title
        };

        // Create tag on the server
        this._customerService.createTag(tag)
            .subscribe((response) => {

                // Add the tag to the product
                this.addTagToProduct(response);
            });
    }

    /**
     * Update the tag title
     *
     * @param tag
     * @param event
     */
    updateTagTitle(tag: CustomersTag, event): void {
        // Update the title on the tag
        tag.title = event.target.value;

        // Update the tag on the server
        this._customerService.updateTag(tag.id, tag)
            .pipe(debounceTime(300))
            .subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Delete the tag
     *
     * @param tag
     */
    deleteTag(tag: CustomersTag): void {
        // Delete the tag from the server
        this._customerService.deleteTag(tag.id).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

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
    }

    /**
     * Remove tag from the product
     *
     * @param tag
     */
    removeTagFromProduct(tag: CustomersTag): void {
        // Remove the tag
        [].splice([].findIndex(item => item === tag.id), 1);

        // Update the selected product form
        this.selectedCustomerForm.get('tags').patchValue([]);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle product tag
     *
     * @param tag
     * @param change
     */
    toggleProductTag(tag: CustomersTag, change: MatCheckboxChange): void {
        if (change.checked) {
            this.addTagToProduct(tag);
        }
        else {
            this.removeTagFromProduct(tag);
        }
    }

    /**
     * Should the create tag button be visible
     *
     * @param inputValue
     */
    shouldShowCreateTagButton(inputValue: string): boolean {
        return !!!(inputValue === '' || this.tags.findIndex(tag => tag.title.toLowerCase() === inputValue.toLowerCase()) > -1);
    }

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
     * Delete the selected product using the form mock-api
     */
    deleteSelectedCustomer(): void {
        // Get the product object
        const product = this.selectedCustomerForm.getRawValue();

        // Delete the product on the server
        this._customerService.deleteCustomer(product.id).subscribe(() => {

            // Close the details
            this.closeDetails();
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

    tabChanged(tabChangeEvent): void {
        this.selectedTab = tabChangeEvent.tab.textLabel;
        this.isLoading = this.selectedTab === "Logo Bank" ? false : true;
        this.otherComponentLoading = false;
    }

    backToCustomersScreen(): void {
        this.isLoading = true;
        this._router.navigate(['/apps/ecommerce/customers']);
    }
}
