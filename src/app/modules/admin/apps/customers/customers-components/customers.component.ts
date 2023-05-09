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
    customerTableColumns: string[] = ['_id', 'first_name', 'last_name', 'customer_email', 'customer_store', 'customer_company', 'mrp'];
    selectedCustomer: CustomersProduct | null = null;
    selectedCustomerForm: FormGroup;
    not_available = "N/A";
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    pageSize: number;
    pageNo: number;
    keywordSearch: string = '';

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _customerService: CustomersService,
        private _router: Router
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
        // Get the customers



    };

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
        const { pageIndex } = event;
        this.isLoading = true;

        if (this._customerService.pageNumber > pageIndex) {
            this._customerService.changePageNumber('decrease');
        } else {
            this._customerService.changePageNumber('increase');
        };


        this._customerService.getCustomersList()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((customers) => {
                this.customers$ = customers["data"];
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    searchKeyword(event): void {
        this.isLoading = true;
        this.keywordSearch = event.target.value ? event.target.value : '';

        this._customerService.getCustomersList(this.keywordSearch)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((customers) => {
                this.customers$ = customers["data"];
                this.isLoading = false;
                this._customerService._searchKeyword = '';
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    /**
     * Toggle customer details
     *
     * @param customerId
     */
    toggleDetails(customerId: string): void {

        // Get the customer by id
        // this._customerService.getCustomerById(customerId)
        //     .subscribe((customer) => {

        //         // Set the selected customer
        //         this.selectedCustomer = customer;

        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();

        //         // Fill the form
        //         this.selectedCustomerForm.patchValue(customer);

        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
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

    editCustomer(customer) {
        this.isLoading = true;
        const { pk_userID } = customer;
        let route = `/apps/customers/${pk_userID}`;
        this._router.navigate([route]);
    }
}
