import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { OrdersBrand, OrdersCategory, OrdersList, OrdersPagination, OrdersProduct, OrdersTag, OrdersVendor } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    // Private
    private _brands: BehaviorSubject<OrdersBrand[] | null> = new BehaviorSubject(null);
    private _categories: BehaviorSubject<OrdersCategory[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<OrdersPagination | null> = new BehaviorSubject(null);
    private _product: BehaviorSubject<OrdersProduct | null> = new BehaviorSubject(null);
    private _products: BehaviorSubject<OrdersProduct[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<OrdersTag[] | null> = new BehaviorSubject(null);
    private _vendors: BehaviorSubject<OrdersVendor[] | null> = new BehaviorSubject(null);
    private _orders: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    public navigationLabels = [
        {
            id: 1,
            title: 'Summary',
            icon: 'heroicons_outline:document-report'
        },
        {
            id: 2,
            title: 'Entities List',
            icon: 'mat_solid:view_list',
        },
        {
            id: 3,
            title: 'Reports',
            icon: 'heroicons_outline:document-report',
        },
        {
            id: 4,
            title: 'Invoice',
            icon: 'mat_outline:inventory'
        },
        {
            id: 5,
            title: 'Purchase Orders',
            icon: 'mat_outline:featured_play_list',
        },
        {
            id: 6,
            title: 'Shipping Report',
            icon: 'mat_outline:local_shipping',
        },
        {
            id: 7,
            title: 'Cost Analysis',
            icon: 'mat_outline:price_change'
        },
        {
            id: 8,
            title: 'Timeline',
            icon: 'mat_solid:timeline',
        },
        {
            id: 9,
            title: 'Incident Reports',
            icon: 'heroicons_outline:document-report',
        }
    ]

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for brands
     */
    get brands$(): Observable<OrdersBrand[]> {
        return this._brands.asObservable();
    }

    /**
     * Getter for categories
     */
    get categories$(): Observable<OrdersCategory[]> {
        return this._categories.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<OrdersPagination> {
        return this._pagination.asObservable();
    }

    /**
     * Getter for product
     */
    get product$(): Observable<OrdersProduct> {
        return this._product.asObservable();
    }

    /**
     * Getter for products
     */
    get products$(): Observable<OrdersProduct[]> {
        return this._products.asObservable();
    }

    /**
     * Getter for tags
     */
    get tags$(): Observable<OrdersTag[]> {
        return this._tags.asObservable();
    }

    /**
     * Getter for vendors
     */
    get vendors$(): Observable<OrdersVendor[]> {
        return this._vendors.asObservable();
    }

    /**
     * Getter for orders
     */
    get orders$(): Observable<OrdersList[]> {
        return this._orders.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getOrders(size, pageNumber, keyword?: string): Observable<OrdersList[]> {
        const search = keyword ? keyword : '';
        const url = `${environment.orders}?list=true&size=${size}&page=${pageNumber}&keyword=${search}`;
        return this._httpClient.get<OrdersList[]>(url).pipe(
            tap((orders) => {
                this._orders.next(orders);
            })
        );
    }

    getOrderDetails(id) {
        return this._httpClient.get(`${environment.orders}?list=true&order_id=${id}`)
    }

    getOrderTotals(id) {
        return this._httpClient.get(`${environment.orders}?order_total=true&order_id=${id}`)
    }

    getOrderParticipants(id) {
        return this._httpClient.get(environment.orders, {
            params: {
                group_order: true,
                participants: true,
                order_id: id
            }
        })
    }

    getOrderPurchases(id) {
        return this._httpClient.get(environment.orders, {
            params: {
                purchase_order: true,
                order_id: id
            }
        })
    }

    /**
     * Get brands
     */
    getBrands(): Observable<OrdersBrand[]> {
        return this._httpClient.get<OrdersBrand[]>('api/apps/ecommerce/inventory/brands').pipe(
            tap((brands) => {
                this._brands.next(brands);
            })
        );
    }

    /**
     * Get categories
     */
    getCategories(): Observable<OrdersCategory[]> {
        return this._httpClient.get<OrdersCategory[]>('api/apps/ecommerce/inventory/categories').pipe(
            tap((categories) => {
                this._categories.next(categories);
            })
        );
    }

    /**
     * Get products
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
    getProducts(page: number = 0, size: number = 10, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: OrdersPagination; products: OrdersProduct[] }> {
        return this._httpClient.get<{ pagination: OrdersPagination; products: OrdersProduct[] }>('api/apps/ecommerce/inventory/products', {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search
            }
        }).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._products.next(response.products);
            })
        );
    }

    /**
     * Get product by id
     */
    getProductById(id: string): Observable<OrdersProduct> {
        return this._products.pipe(
            take(1),
            map((products) => {

                // Find the product
                const product = products.find(item => item.id === id) || null;

                // Update the product
                this._product.next(product);

                // Return the product
                return product;
            }),
            switchMap((product) => {

                if (!product) {
                    return throwError('Could not found product with id of ' + id + '!');
                }

                return of(product);
            })
        );
    }

    /**
     * Create product
     */
    createProduct(): Observable<OrdersProduct> {
        return this.products$.pipe(
            take(1),
            switchMap(products => this._httpClient.post<OrdersProduct>('api/apps/ecommerce/inventory/product', {}).pipe(
                map((newProduct) => {

                    // Update the products with the new product
                    this._products.next([newProduct, ...products]);

                    // Return the new product
                    return newProduct;
                })
            ))
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
    updateProduct(id: string, product: OrdersProduct): Observable<OrdersProduct> {
        return this.products$.pipe(
            take(1),
            switchMap(products => this._httpClient.patch<OrdersProduct>('api/apps/ecommerce/inventory/product', {
                id,
                product
            }).pipe(
                map((updatedProduct) => {

                    // Find the index of the updated product
                    const index = products.findIndex(item => item.id === id);

                    // Update the product
                    products[index] = updatedProduct;

                    // Update the products
                    this._products.next(products);

                    // Return the updated product
                    return updatedProduct;
                }),
                switchMap(updatedProduct => this.product$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the product if it's selected
                        this._product.next(updatedProduct);

                        // Return the updated product
                        return updatedProduct;
                    })
                ))
            ))
        );
    }

    /**
     * Delete the product
     *
     * @param id
     */
    deleteProduct(id: string): Observable<boolean> {
        return this.products$.pipe(
            take(1),
            switchMap(products => this._httpClient.delete('api/apps/ecommerce/inventory/product', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted product
                    const index = products.findIndex(item => item.id === id);

                    // Delete the product
                    products.splice(index, 1);

                    // Update the products
                    this._products.next(products);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Get tags
     */
    getTags(): Observable<OrdersTag[]> {
        return this._httpClient.get<OrdersTag[]>('api/apps/ecommerce/inventory/tags').pipe(
            tap((tags) => {
                this._tags.next(tags);
            })
        );
    }

    /**
     * Create tag
     *
     * @param tag
     */
    createTag(tag: OrdersTag): Observable<OrdersTag> {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.post<OrdersTag>('api/apps/ecommerce/inventory/tag', { tag }).pipe(
                map((newTag) => {

                    // Update the tags with the new tag
                    this._tags.next([...tags, newTag]);

                    // Return new tag from observable
                    return newTag;
                })
            ))
        );
    }

    /**
     * Update the tag
     *
     * @param id
     * @param tag
     */
    updateTag(id: string, tag: OrdersTag): Observable<OrdersTag> {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.patch<OrdersTag>('api/apps/ecommerce/inventory/tag', {
                id,
                tag
            }).pipe(
                map((updatedTag) => {

                    // Find the index of the updated tag
                    const index = tags.findIndex(item => item.id === id);

                    // Update the tag
                    tags[index] = updatedTag;

                    // Update the tags
                    this._tags.next(tags);

                    // Return the updated tag
                    return updatedTag;
                })
            ))
        );
    }

    /**
     * Delete the tag
     *
     * @param id
     */
    deleteTag(id: string): Observable<boolean> {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.delete('api/apps/ecommerce/inventory/tag', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted tag
                    const index = tags.findIndex(item => item.id === id);

                    // Delete the tag
                    tags.splice(index, 1);

                    // Update the tags
                    this._tags.next(tags);

                    // Return the deleted status
                    return isDeleted;
                }),
                filter(isDeleted => isDeleted),
                switchMap(isDeleted => this.products$.pipe(
                    take(1),
                    map((products) => {

                        // Iterate through the contacts
                        products.forEach((product) => {

                            const tagIndex = product.tags.findIndex(tag => tag === id);

                            // If the contact has the tag, remove it
                            if (tagIndex > -1) {
                                product.tags.splice(tagIndex, 1);
                            }
                        });

                        // Return the deleted status
                        return isDeleted;
                    })
                ))
            ))
        );
    }

    /**
     * Get vendors
     */
    getVendors(): Observable<OrdersVendor[]> {
        return this._httpClient.get<OrdersVendor[]>('api/apps/ecommerce/inventory/vendors').pipe(
            tap((vendors) => {
                this._vendors.next(vendors);
            })
        );
    }

    /**
     * Update the avatar of the given contact
     *
     * @param id
     * @param avatar
     */
    /*uploadAvatar(id: string, avatar: File): Observable<Contact>
    {
        return this.contacts$.pipe(
            take(1),
            switchMap(contacts => this._httpClient.post<Contact>('api/apps/contacts/avatar', {
                id,
                avatar
            }, {
                headers: {
                    'Content-Type': avatar.type
                }
            }).pipe(
                map((updatedContact) => {

                    // Find the index of the updated contact
                    const index = contacts.findIndex(item => item.id === id);

                    // Update the contact
                    contacts[index] = updatedContact;

                    // Update the contacts
                    this._contacts.next(contacts);

                    // Return the updated contact
                    return updatedContact;
                }),
                switchMap(updatedContact => this.contact$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the contact if it's selected
                        this._contact.next(updatedContact);

                        // Return the updated contact
                        return updatedContact;
                    })
                ))
            ))
        );
    }*/
}
