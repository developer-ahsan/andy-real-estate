import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

        this._customerService.customer$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.selectedCustomer = response;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
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
