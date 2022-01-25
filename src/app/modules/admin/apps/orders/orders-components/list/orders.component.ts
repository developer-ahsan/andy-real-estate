import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { OrdersBrand, OrdersCategory, OrdersList, OrdersPagination, OrdersProduct, OrdersTag, OrdersVendor } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { Router } from '@angular/router';

@Component({
    selector: 'orders-list',
    templateUrl: './orders.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class OrdersListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    products$: Observable<OrdersProduct[]>;

    orders: OrdersList[];
    ordersLength: number;
    brands: OrdersBrand[];
    categories: OrdersCategory[];
    filteredTags: OrdersTag[];
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    pagination: OrdersPagination;
    ordersCount: number = 0;
    ordersTableColumns: string[] = ['sku', 'name', 'price', 'stock', 'active'];
    searchInputControl: FormControl = new FormControl();
    selectedProduct: OrdersProduct | null = null;
    selectedOrder: OrdersList | null = null;
    selectedProductForm: FormGroup;
    tags: OrdersTag[];
    tagsEditMode: boolean = false;
    vendors: OrdersVendor[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    pageSize: number;
    pageNo: number;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _orderService: OrdersService,
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

        this.pageSize = 10;
        this.pageNo = 0;

        // Create the selected order form
        this.selectedProductForm = this._formBuilder.group({
            id: [''],
            category: [''],
            name: ['', [Validators.required]],
            description: [''],
            tags: [[]],
            sku: [''],
            barcode: [''],
            brand: [''],
            vendor: [''],
            stock: [''],
            reserved: [''],
            cost: [''],
            basePrice: [''],
            taxPercent: [''],
            price: [''],
            weight: [''],
            thumbnail: [''],
            images: [[]],
            currentImageIndex: [0], // Image index that is currently being viewed
            active: [false],
            firstName: [''],
            pk_orderID: [''],
            total: [''],
            companyName: [''],
            storeName: [''],
            orderDate: ['']
        });

        // Get the brands
        this._orderService.orders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orders: OrdersList[]) => {
                this.orders = orders["data"];
                this.ordersLength = orders["totalRecords"];

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
                    return this._orderService.getProducts(0, 10, 'name', 'asc', query);
                }),
                map(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // If the user changes the sort order...
        this._sort.sortChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                // Reset back to the first page
                this._paginator.pageIndex = 0;

                // Close the details
                this.closeDetails();
            });

        // Get products if sort or page changes
        merge(this._sort.sortChange, this._paginator.page).pipe(
            switchMap(() => {
                this.closeDetails();
                this.isLoading = true;
                return this._orderService.getProducts(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
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

    getOrders(size, pageNo) {
        this._orderService.getOrders(size, pageNo)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orders) => {
                this.orders = orders["data"];

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    };

    /**
     * Toggle order details
     *
     * @param productId
     */
    toggleDetails(productId: string): void {
        // If the product is already selected...
        if (this.selectedProduct && this.selectedProduct.id === productId) {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the product by id
        this._orderService.getProductById(productId)
            .subscribe((product) => {

                // Set the selected product
                this.selectedProduct = product;

                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Fill the form
                this.selectedProductForm.patchValue(product);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Toggle product details
     *
     * @param orderId
     */
    toggleOrderDetails(orderId: number): void {

        //  If the order is already selected...
        if (this.selectedOrder && this.selectedOrder.pk_orderID === orderId) {
            this.selectedOrder = null;
            return;
        }
        this.selectedOrder = this.orders[this.orders.findIndex(x => x.pk_orderID === orderId)];
        this._changeDetectorRef.markForCheck();
        this.selectedProductForm.patchValue(this.selectedOrder);
        this._changeDetectorRef.markForCheck();
    }

    pageEvents(event: any) {
        const { pageSize, pageIndex } = event;

        if (pageSize !== this.pageSize) {
            if (this.pageNo === 0) {
                this.pageNo = 1;
            }
            this.getOrders(pageSize, this.pageNo);
            return;
        }

        if (pageIndex > this.pageNo) {
            if (this.pageNo === 0) {
                this.pageNo = 2;
            } else {
                this.pageNo++;
            }
        } else {
            this.pageNo--;
        };

        this.getOrders(this.pageSize, this.pageNo);
    }

    /**
     * Close the details
     */
    closeDetails(): void {
        this.selectedProduct = null;
    }

    /**
     * Cycle through images of selected product
     */
    cycleImages(forward: boolean = true): void {
        // Get the image count and current image index
        const count = this.selectedProductForm.get('images').value.length;
        const currentIndex = this.selectedProductForm.get('currentImageIndex').value;

        // Calculate the next and previous index
        const nextIndex = currentIndex + 1 === count ? 0 : currentIndex + 1;
        const prevIndex = currentIndex - 1 < 0 ? count - 1 : currentIndex - 1;

        // If cycling forward...
        if (forward) {
            this.selectedProductForm.get('currentImageIndex').setValue(nextIndex);
        }
        // If cycling backwards...
        else {
            this.selectedProductForm.get('currentImageIndex').setValue(prevIndex);
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
        const isTagApplied = this.selectedProduct.tags.find(id => id === tag.id);

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
        this._orderService.createTag(tag)
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
    updateTagTitle(tag: OrdersTag, event): void {
        // Update the title on the tag
        tag.title = event.target.value;

        // Update the tag on the server
        this._orderService.updateTag(tag.id, tag)
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
    deleteTag(tag: OrdersTag): void {
        // Delete the tag from the server
        this._orderService.deleteTag(tag.id).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add tag to the product
     *
     * @param tag
     */
    addTagToProduct(tag: OrdersTag): void {
        // Add the tag
        this.selectedProduct.tags.unshift(tag.id);

        // Update the selected product form
        this.selectedProductForm.get('tags').patchValue(this.selectedProduct.tags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove tag from the product
     *
     * @param tag
     */
    removeTagFromProduct(tag: OrdersTag): void {
        // Remove the tag
        this.selectedProduct.tags.splice(this.selectedProduct.tags.findIndex(item => item === tag.id), 1);

        // Update the selected product form
        this.selectedProductForm.get('tags').patchValue(this.selectedProduct.tags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle product tag
     *
     * @param tag
     * @param change
     */
    toggleProductTag(tag: OrdersTag, change: MatCheckboxChange): void {
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
    createProduct(): void {
        // Create the product
        this._orderService.createProduct().subscribe((newProduct) => {

            // Go to new product
            this.selectedProduct = newProduct;

            // Fill the form
            this.selectedProductForm.patchValue(newProduct);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Update the selected product using the form mock-api
     */
    updateSelectedProduct(): void {
        // Get the product object
        const product = this.selectedProductForm.getRawValue();

        // Remove the currentImageIndex field
        delete product.currentImageIndex;

        // Update the product on the server
        this._orderService.updateProduct(product.id, product).subscribe(() => {

            // Show a success message
            this.showFlashMessage('success');
        });
    }

    /**
     * Delete the selected product using the form mock-api
     */
    deleteSelectedProduct(): void {
        // Get the product object
        const product = this.selectedProductForm.getRawValue();

        // Delete the product on the server
        this._orderService.deleteProduct(product.id).subscribe(() => {

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

    orderDetails(id) {
        this.isLoading = true;
        this._router.navigate([`/apps/orders/${id}`]);
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
}
