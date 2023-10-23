import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations/public-api';
import { Router } from '@angular/router';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { FuseNavigationService } from '@fuse/components/navigation';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ChangeDetectionStrategy } from '@angular/compiler/src/compiler_facade_interface';

@Component({
    selector: 'search',
    templateUrl: './search.component.html',
    encapsulation: ViewEncapsulation.None,
    exportAs: 'fuseSearch',
    animations: fuseAnimations,
    styleUrls: ['./search.scss']
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
    allStores: any = [];
    suppliers: any = [];
    ngStore: any;
    ngVendor: any;


    vendorSearchTerm: string = '';
    filteredVendors: any;
    /**
     * Constructor
     */
    constructor(
        private _fuseNavigationService: FuseNavigationService,
        private router: Router,
        private _commonService: DashboardsService,
        private _changeDetect: ChangeDetectorRef
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
            this.close();
        }
    }

    /**
     * On init
     */
    ngOnInit(): void {
        this.getAllStores();
        this.getAllVendors();
    }
    getAllStores() {
        this._commonService.storesData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            res["data"].forEach(element => {
                if (element.blnActive) {
                    this.allStores.push(element);
                }
            });
        })
    }
    getAllVendors() {
        this._commonService.suppliersData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.suppliers = res["data"];
            this.filteredVendors = res["data"];
        })
    }
    searchProduct(event) {
        const val = event.target.value;
        this.router.navigateByUrl('/apps/search/products/' + val);
        event.target.value = '';
    }
    searchQuote(event) {
        const val = event.target.value;
        this.router.navigateByUrl('/apps/search/quotes/' + val);
        event.target.value = '';
    }
    searchStore(event) {
        this.router.navigateByUrl(`/apps/stores/${event.value}`);
        setTimeout(() => {
            this.ngStore = null;
        }, 2000);
    }
    searchVendor(event) {
        this.router.navigateByUrl('/apps/vendors/' + event.value);
        setTimeout(() => {
            this.ngVendor = null;
        }, 2000);
    }
    searchCustomer(event) {
        const val = event.target.value;
        if (val != '') {
            this.router.navigateByUrl('/apps/search/customers/' + val);
        }
        event.target.value = '';
    }
    searchOrder(event) {
        const val = event.target.value;
        if (val != '') {
            this.router.navigateByUrl('/apps/search/orders/' + val);
        }
        event.target.value = '';
    }
    filterVendors() {
        if (Object.prototype.toString.call(this.vendorSearchTerm) === '[object String]') {
            this.filteredVendors = this.suppliers.filter(vendor =>
                vendor.companyName && this.vendorSearchTerm &&
                vendor.companyName.toLowerCase().includes(this.vendorSearchTerm.toString().toLowerCase())
            );
        }
        if (this.vendorSearchTerm == '') {
            this.filteredVendors = this.suppliers;
        }
        this._changeDetect.markForCheck();
    }

    // Implement a method to handle the selection of a vendor
    selectVendor(event: MatAutocompleteSelectedEvent) {
        const selectedVendorId = event.option.value.pk_companyID;
        this.router.navigateByUrl('/apps/vendors/' + selectedVendorId);
        setTimeout(() => {
            this.vendorSearchTerm = null;
            this._changeDetect.markForCheck();
        }, 2000);
        this._changeDetect.markForCheck();
        // Handle the selected vendor as needed
    }
    displayFn(value: any): string {
        return value?.companyName;
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
    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent(name);

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }
}
