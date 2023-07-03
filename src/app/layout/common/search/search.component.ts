import { Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations/public-api';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Router } from '@angular/router';
import { VendorsService } from 'app/modules/admin/apps/vendors/components/vendors.service';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { SearchService } from 'app/modules/admin/apps/search-modules/search.service';
import { CustomersService } from 'app/modules/admin/apps/customers/customers-components/orders.service';

@Component({
    selector: 'search',
    templateUrl: './search.component.html',
    encapsulation: ViewEncapsulation.None,
    exportAs: 'fuseSearch',
    animations: fuseAnimations
})
export class SearchComponent implements OnChanges, OnInit, OnDestroy {
    @Input() appearance: 'basic' | 'bar' = 'basic';
    @Input() debounce: number = 300;
    @Input() minLength: number = 2;
    @Output() search: EventEmitter<any> = new EventEmitter<any>();

    opened: boolean = false;
    results: any[];
    searchControl: FormControl = new FormControl();

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _elementRef: ElementRef,
        private _httpClient: HttpClient,
        private _renderer2: Renderer2,
        private _searchService: SearchService,
        private _productService: InventoryService,
        private _customerService: CustomersService,
        private _orderService: OrdersService,
        private _storeService: FileManagerService,
        private _vendorService: VendorsService,
        private router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Host binding for component classes
     */
    @HostBinding('class') get classList(): any {
        return {
            'search-appearance-bar': this.appearance === 'bar',
            'search-appearance-basic': this.appearance === 'basic',
            'search-opened': this.opened
        };
    }

    /**
     * Setter for bar search input
     *
     * @param value
     */
    @ViewChild('barSearchInput')
    set barSearchInput(value: ElementRef) {
        // If the value exists, it means that the search input
        // is now in the DOM and we can focus on the input..
        if (value) {
            // Give Angular time to complete the change detection cycle
            setTimeout(() => {

                // Focus to the input element
                value.nativeElement.focus();
            });
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On changes
     *
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        // Appearance
        if ('appearance' in changes) {
            // To prevent any issues, close the
            // search after changing the appearance
            this.close();
        }
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to the search field value changes
        this.searchControl.valueChanges
            .pipe(
                debounceTime(this.debounce),
                takeUntil(this._unsubscribeAll),
                map((value) => {

                    // Set the search results to null if there is no value or
                    // the length of the value is smaller than the minLength
                    // so the autocomplete panel can be closed
                    if (!value || value.length < this.minLength) {
                        this.results = null;
                    }

                    // Continue
                    return value;
                }),
                // Filter out undefined/null/false statements and also
                // filter out the values that are smaller than minLength
                filter(value => value && value.length >= this.minLength)
            )
            .subscribe((value) => {
                this._httpClient.post('api/common/search', { query: value })
                    .subscribe((response: any) => {

                        // Store the results
                        this.results = response.results;

                        // Execute the event
                        this.search.next(this.results);
                    });
            });
    }
    searchProduct(event) {
        const val = event.target.value;
        // if (val != '') {
        //     this._searchService.productKeyword = val;
        //     // this._productService.productSearchFilter.term = val;
        //     // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        //     //     this.router.navigate(['/apps/ecommerce/inventory'])
        //     // });
        //     // this.router.navigateByUrl('/apps/ecommerce/inventory', { skipLocationChange: true });
        this.router.navigateByUrl('/apps/search/products/' + val);
        // }
        this.close();
    }
    searchStore(event) {
        const val = event.target.value;
        if (val != '') {
            this._storeService._storeSearchKeyword = val;
            // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            //     this.router.navigate(['/apps/ecommerce/inventory'])
            // });
            this.router.navigateByUrl('/apps/stores');
        }
        this.close();
    }
    searchVendor(event) {
        const val = event.target.value;
        if (val != '') {
            this._vendorService.vendorsSearchKeyword = val;
            this.router.navigateByUrl('/apps/vendors');
        }
        this.close();
    }
    searchCustomer(event) {
        const val = event.target.value;
        if (val != '') {
            this._searchService.customerKeyword = val;
            // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            //     this.router.navigate(['/apps/ecommerce/inventory'])
            // });
            this.router.navigateByUrl('/apps/search/customers/' + val);
        }
        this.close();
    }
    searchOrder(event) {
        const val = event.target.value;
        if (val != '') {
            // this._orderService._searchKeyword = val;
            this._searchService.orderKeyword.next(val);
            // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            //     this.router.navigate(['/apps/ecommerce/inventory'])
            // });
            // this.router.navigateByUrl('/apps/orders');
            this.router.navigateByUrl('/apps/search/orders');
        }
        this.close();
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

    /**
     * On keydown of the search input
     *
     * @param event
     */
    onKeydown(event: KeyboardEvent): void {
        // Listen for escape to close the search
        // if the appearance is 'bar'
        if (this.appearance === 'bar') {
            // Escape
            if (event.code === 'Escape') {
                // Close the search
                this.close();
            }
        }
    }

    /**
     * Open the search
     * Used in 'bar'
     */
    open(): void {
        // Return if it's already opened
        if (this.opened) {
            return;
        }

        // Open the search
        this.opened = true;
    }

    /**
     * Close the search
     * * Used in 'bar'
     */
    close(): void {
        // Return if it's already closed
        if (!this.opened) {
            return;
        }

        // Clear the search input
        this.searchControl.setValue('');

        // Close the search
        this.opened = false;
    }
}
