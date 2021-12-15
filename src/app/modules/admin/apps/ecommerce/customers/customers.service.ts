import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { CustomersBrand, CustomersCategory, CustomersPagination, CustomersProduct, CustomersTag, CustomersVendor } from 'app/modules/admin/apps/ecommerce/customers/customers.types';

@Injectable({
    providedIn: 'root'
})
export class CustomersService
{
    // Private
    private _brands: BehaviorSubject<CustomersBrand[] | null> = new BehaviorSubject(null);
    private _categories: BehaviorSubject<CustomersCategory[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<CustomersPagination | null> = new BehaviorSubject(null);
    private _customer: BehaviorSubject<CustomersProduct | null> = new BehaviorSubject(null);
    private _customers: BehaviorSubject<CustomersProduct[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<CustomersTag[] | null> = new BehaviorSubject(null);
    private _vendors: BehaviorSubject<CustomersVendor[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for brands
     */
    get brands$(): Observable<CustomersBrand[]>
    {
        return this._brands.asObservable();
    }

    /**
     * Getter for categories
     */
    get categories$(): Observable<CustomersCategory[]>
    {
        return this._categories.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<CustomersPagination>
    {
        return this._pagination.asObservable();
    }

    /**
     * Getter for product
     */
    get product$(): Observable<CustomersProduct>
    {
        return this._customer.asObservable();
    }

    /**
     * Getter for products
     */
    get customers$(): Observable<CustomersProduct[]>
    {
        return this._customers.asObservable();
    }

    /**
     * Getter for tags
     */
    get tags$(): Observable<CustomersTag[]>
    {
        return this._tags.asObservable();
    }

    /**
     * Getter for vendors
     */
    get vendors$(): Observable<CustomersVendor[]>
    {
        return this._vendors.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get brands
     */
    getBrands(): Observable<CustomersBrand[]>
    {
        return this._httpClient.get<CustomersBrand[]>('api/apps/ecommerce/customers/brands').pipe(
            tap((brands) => {
                this._brands.next(brands);
            })
        );
    }

    /**
     * Get categories
     */
    getCategories(): Observable<CustomersCategory[]>
    {
        return this._httpClient.get<CustomersCategory[]>('api/apps/ecommerce/customers/categories').pipe(
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
     getCustomers(page: number = 0, size: number = 10, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: CustomersPagination; products: CustomersProduct[] }>
    {
        return this._httpClient.get<{ pagination: CustomersPagination; products: CustomersProduct[] }>('api/apps/ecommerce/customers/customers', {
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
                this._customers.next(response.products);
            })
        );
    }

    /**
     * Get product by id
     */
     getCustomerById(id: string): Observable<CustomersProduct>
    {
        return this._customers.pipe(
            take(1),
            map((products) => {

                // Find the product
                const product = products.find(item => item.id === id) || null;

                // Update the product
                this._customer.next(product);

                // Return the product
                return product;
            }),
            switchMap((product) => {

                if ( !product )
                {
                    return throwError('Could not found product with id of ' + id + '!');
                }

                return of(product);
            })
        );
    }

    /**
     * Create product
     */
     createCustomer(): Observable<CustomersProduct>
    {
        return this.customers$.pipe(
            take(1),
            switchMap(customers => this._httpClient.post<CustomersProduct>('api/apps/ecommerce/customers/customer', {}).pipe(
                map((newCustomer) => {

                    // Update the products with the new product
                    this._customers.next([newCustomer, ...customers]);

                    // Return the new product
                    return newCustomer;
                })
            ))
        );
    }

    /**
     * Update customer
     *
     * @param id
     * @param product
     */
    updateCustomer(id: string, product: CustomersProduct): Observable<CustomersProduct>
    {
        return this.customers$.pipe(
            take(1),
            switchMap(products => this._httpClient.patch<CustomersProduct>('api/apps/ecommerce/customers/customer', {
                id,
                product
            }).pipe(
                map((updatedProduct) => {

                    // Find the index of the updated product
                    const index = products.findIndex(item => item.id === id);

                    // Update the product
                    products[index] = updatedProduct;

                    // Update the products
                    this._customers.next(products);

                    // Return the updated product
                    return updatedProduct;
                }),
                switchMap(updatedProduct => this.product$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {

                        // Update the product if it's selected
                        this._customer.next(updatedProduct);

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
    deleteCustomer(id: string): Observable<boolean>
    {
        return this.customers$.pipe(
            take(1),
            switchMap(products => this._httpClient.delete('api/apps/ecommerce/customers/customer', {params: {id}}).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted product
                    const index = products.findIndex(item => item.id === id);

                    // Delete the product
                    products.splice(index, 1);

                    // Update the products
                    this._customers.next(products);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Get tags
     */
    getTags(): Observable<CustomersTag[]>
    {
        return this._httpClient.get<CustomersTag[]>('api/apps/ecommerce/customers/tags').pipe(
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
    createTag(tag: CustomersTag): Observable<CustomersTag>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.post<CustomersTag>('api/apps/ecommerce/customers/tag', {tag}).pipe(
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
    updateTag(id: string, tag: CustomersTag): Observable<CustomersTag>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.patch<CustomersTag>('api/apps/ecommerce/customers/tag', {
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
    deleteTag(id: string): Observable<boolean>
    {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.delete('api/apps/ecommerce/customers/tag', {params: {id}}).pipe(
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
                switchMap(isDeleted => this.customers$.pipe(
                    take(1),
                    map((products) => {

                        // Iterate through the contacts
                        products.forEach((product) => {

                            const tagIndex = product.tags.findIndex(tag => tag === id);

                            // If the contact has the tag, remove it
                            if ( tagIndex > -1 )
                            {
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
    getVendors(): Observable<CustomersVendor[]>
    {
        return this._httpClient.get<CustomersVendor[]>('api/apps/ecommerce/customers/vendors').pipe(
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
