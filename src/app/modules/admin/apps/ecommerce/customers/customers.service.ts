import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { CustomersBrand, CustomersCategory, CustomersPagination, CustomersProduct, CustomersTag, CustomersVendor, UserCreditTerms, AddUserComment, AddUserLocation, ApprovalContact, AddReminder, UpdateCashback, CreateStore, UserUpdateObject } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class CustomersService {
    // Private
    private _brands: BehaviorSubject<CustomersBrand[] | null> = new BehaviorSubject(null);
    private _categories: BehaviorSubject<CustomersCategory[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<CustomersPagination | null> = new BehaviorSubject(null);
    private _customer: BehaviorSubject<CustomersProduct | null> = new BehaviorSubject(null);
    private _customers: BehaviorSubject<CustomersProduct[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<CustomersTag[] | null> = new BehaviorSubject(null);
    private _vendors: BehaviorSubject<CustomersVendor[] | null> = new BehaviorSubject(null);

    public navigationLabels = [
        {
            id: 1,
            title: 'User Info',
            icon: 'heroicons_outline:user-circle'
        },
        {
            id: 2,
            title: 'User Addresses',
            icon: 'mat_outline:location_city',
        },
        {
            id: 3,
            title: 'Metrics',
            icon: 'heroicons_solid:trending-up',
        },
        {
            id: 4,
            title: 'Credit Terms',
            icon: 'mat_outline:price_change'
        },
        {
            id: 5,
            title: 'Credit Applications',
            icon: 'mat_outline:settings_applications',
        },
        {
            id: 6,
            title: 'User Comments',
            icon: 'mat_outline:comment_bank',
        },
        {
            id: 7,
            title: 'Locations',
            icon: 'mat_outline:location_on'
        },
        {
            id: 8,
            title: 'Approval Contacts',
            icon: 'mat_outline:approval',
        },
        {
            id: 9,
            title: 'Reminders',
            icon: 'mat_outline:doorbell',
        },
        {
            id: 10,
            title: 'Order History',
            icon: 'mat_outline:history',
        },
        {
            id: 11,
            title: 'Fulfillment Orders',
            icon: 'mat_outline:reorder',
        },
        {
            id: 12,
            title: 'Saved Carts',
            icon: 'mat_outline:shopping_cart',
        },
        {
            id: 13,
            title: 'Quotes',
            icon: 'mat_outline:format_quote',
        },
        {
            id: 15,
            title: 'Group Orders',
            icon: 'mat_outline:groups',
        },
        {
            id: 16,
            title: 'Logo Bank',
            icon: 'mat_outline:book',
        },
        {
            id: 17,
            title: 'Cashback',
            icon: 'heroicons_outline:cash',
        },
        {
            id: 18,
            title: 'Store Usage',
            icon: 'mat_outline:store',
        },
        {
            id: 19,
            title: 'Send Registration Emails',
            icon: 'mat_outline:attach_email',
        }
    ]

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for brands
     */
    get brands$(): Observable<CustomersBrand[]> {
        return this._brands.asObservable();
    }

    /**
     * Getter for categories
     */
    get categories$(): Observable<CustomersCategory[]> {
        return this._categories.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<CustomersPagination> {
        return this._pagination.asObservable();
    }

    /**
     * Getter for product
     */
    get product$(): Observable<CustomersProduct> {
        return this._customer.asObservable();
    }

    /**
     * Getter for products
     */
    get customers$(): Observable<CustomersProduct[]> {
        return this._customers.asObservable();
    }

    /**
     * Getter for tags
     */
    get tags$(): Observable<CustomersTag[]> {
        return this._tags.asObservable();
    }

    /**
     * Getter for vendors
     */
    get vendors$(): Observable<CustomersVendor[]> {
        return this._vendors.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get brands
     */
    getBrands(): Observable<CustomersBrand[]> {
        return this._httpClient.get<CustomersBrand[]>('api/apps/ecommerce/customers/brands').pipe(
            tap((brands) => {
                this._brands.next(brands);
            })
        );
    }

    /**
     * Get categories
     */
    getCategories(): Observable<CustomersCategory[]> {
        return this._httpClient.get<CustomersCategory[]>('api/apps/ecommerce/customers/categories').pipe(
            tap((categories) => {
                this._categories.next(categories);
            })
        );
    }

    getCustomersList(size, pageNumber, keyword?: string): Observable<CustomersProduct[]> {
        const search = keyword ? keyword : '';
        return this._httpClient.get<CustomersProduct[]>(`${environment.customerList}?list=true&size=${size}&page=${pageNumber}&keyword=${search}`).pipe(
            tap((customers) => {
                this._customers.next(customers);
            })
        );
    }

    /**
    * Get customers
    */
    getCustomers(page: number = 0, size: number = 10, sort: string = 'firstName', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<CustomersProduct[]> {
        return this._httpClient.get<CustomersProduct[]>(environment.customerList, {
            params: {
                list: true
            }
        }).pipe(
            tap((response) => {
                let data = response["data"];
                if (search) {
                    data = this.search(search, data);
                }
                this._customers.next(data);
            })
        );
    }

    /**
     * Search customers
     */
    search(key, customers) {
        return customers.filter(function (customer) {
            if (
                customer.firstName?.toLowerCase().includes(key.toLowerCase()) ||
                customer.lastName?.toLowerCase().includes(key.toLowerCase()) ||
                customer.email?.toLowerCase().includes(key.toLowerCase()) ||
                customer.companyName?.toLowerCase().includes(key.toLowerCase()) ||
                customer.storeName?.toLowerCase().includes(key.toLowerCase()) ||
                customer.city?.toLowerCase().includes(key.toLowerCase()) ||
                customer.address1?.toLowerCase().includes(key.toLowerCase()) ||
                customer.pk_userID == key
            ) {
                return customer;
            }
        })
    }

    getSingleCustomerDetails(id: string): Observable<CustomersProduct> {
        return this._customers.pipe(
            take(1),
            map((customers) => {
                const customer = customers["data"].find(item => item.pk_userID == id) || null;
                return customer;
            }),
            switchMap((customer) => {

                if (!customer) {
                    return throwError('Could not found customer with id of ' + id + '!');
                }

                return of(customer);
            })
        );
    }

    /**
     * Get product by id
     */
    getCustomerById(id: string): Observable<CustomersProduct> {
        return this._customers.pipe(
            take(1),
            map((products) => {
                // Find the product
                const product = products.find(item => item.pk_userID == id) || null;

                // Update the product
                this._customer.next(product);
                // Return the product
                return product;
            }),
            switchMap((product) => {

                if (!product) {
                    return throwError('Could not found customer with id of ' + id + '!');
                }

                return of(product);
            })
        );
    }

    /**
     * Create customer
     */
    createCustomer(): Observable<CustomersProduct> {
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

    // PUT CALL CUSTOMER
    upgradeUser(payload: UserUpdateObject) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(environment.customerList, payload, { headers });
    }

    /**
     * Update customer
     *
     * @param id
     * @param product
     */
    updateCustomer(id: string, product: CustomersProduct): Observable<CustomersProduct> {
        return this.customers$.pipe(
            take(1),
            switchMap(products => this._httpClient.patch<CustomersProduct>('api/apps/ecommerce/customers/customer', {
                id,
                product
            }).pipe(
                map((updatedProduct) => {

                    // Find the index of the updated product
                    const index = products.findIndex(item => item.pk_userID === id);

                    // Update the product
                    products[index] = updatedProduct;

                    // Update the products
                    this._customers.next(products);

                    // Return the updated product
                    return updatedProduct;
                }),
                switchMap(updatedProduct => this.product$.pipe(
                    take(1),
                    filter(item => item && item.pk_userID === id),
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
    deleteCustomer(id: string): Observable<boolean> {
        return this.customers$.pipe(
            take(1),
            switchMap(products => this._httpClient.delete('api/apps/ecommerce/customers/customer', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted product
                    const index = products.findIndex(item => item.pk_userID === id);

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
    getTags(): Observable<CustomersTag[]> {
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
    createTag(tag: CustomersTag): Observable<CustomersTag> {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.post<CustomersTag>('api/apps/ecommerce/customers/tag', { tag }).pipe(
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
    updateTag(id: string, tag: CustomersTag): Observable<CustomersTag> {
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
    deleteTag(id: string): Observable<boolean> {
        return this.tags$.pipe(
            take(1),
            switchMap(tags => this._httpClient.delete('api/apps/ecommerce/customers/tag', { params: { id } }).pipe(
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

                            const tagIndex = [].findIndex(tag => tag === id);

                            // If the contact has the tag, remove it
                            if (tagIndex > -1) {
                                [].splice(tagIndex, 1);
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
    getVendors(): Observable<CustomersVendor[]> {
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

    /**
    * Get addresses of customers
    */
    getCustomerAddresses(id: string) {
        return this._httpClient.get(environment.customerList, {
            params: {
                address: true,
                user_id: id
            }
        })
    }

    /**
    * Get stores of customers
    */
    getCustomerStores(id: string) {
        return this._httpClient.get(environment.customerList, {
            params: {
                store_usage: true,
                user_id: id
            }
        })
    }

    /**
   * Get register of customers
   */
    getCustomerRegisterInfo(id: string) {
        return this._httpClient.get(environment.customerList, {
            params: {
                metrics: true,
                user_id: id
            }
        })
    }

    /**
    * Get comments of customers
    */
    getCustomerComments(id: string) {
        return this._httpClient.get(environment.customerList, {
            params: {
                user_comment: true,
                user_id: id
            }
        })
    }

    /**
   * Get Commentators of customers
   */
    getCommentators() {
        return this._httpClient.get(environment.customerList, {
            params: {
                commentor: true
            }
        })
    }

    /**
   * UPDATE comments of credit-terms
   */
    updateUserComments(payload: AddUserComment) {
        return this._httpClient.put(
            `${environment.customerList}?commentor=true`, payload);
    }

    /**
   * get credit-terms
   */
    getCreditTerms(id: string,) {
        return this._httpClient.get(environment.customerList, {
            params: {
                credit_terms: true,
                user_id: id
            }
        })
    }

    /**
   * UPDATE credit-terms
   */
    updateCreditTerm(payload: UserCreditTerms) {
        return this._httpClient.put(
            `${environment.customerList}?credit_term=true`, payload);
    }

    /**
    * get credit-applications
    */
    getCreditApplications(id: string,) {
        return this._httpClient.get(environment.customerList, {
            params: {
                credit_application: true,
                user_id: id
            }
        })
    }

    /**
   * get locations
   */
    getLocations(id: string,) {
        return this._httpClient.get(environment.customerList, {
            params: {
                location: true,
                user_id: id
            }
        })
    }

    /**
    * get available locations
    */
    getAvailableLocations(id: string) {
        return this._httpClient.get(environment.customerList, {
            params: {
                available_location: true,
                user_id: id
            }
        })
    }

    /**
   * get locations attributes
   */
    getLocationAttribute(store_id: string) {
        return this._httpClient.get(environment.customerList, {
            params: {
                location_attribute: true,
                store_id: store_id
            }
        })
    }

    /**
    * get locations for storeId
    */
    getStoresLocation(attr_id: string) {
        return this._httpClient.get(environment.customerList, {
            params: {
                location: true,
                attribute_id: attr_id
            }
        })
    }

    /**
    * add locations for user
    */
    addUserLocation(payload: AddUserLocation) {
        return this._httpClient.post(
            `${environment.customerList}?user_location=true`, payload
        );
    }

    /**
   * get stores
   */
    getStores(id: string, storeId) {
        return this._httpClient.get(environment.customerList, {
            params: {
                approval_contact: true,
                user_id: id,
                store_id: storeId
            }
        })
    }

    /**
   * get All stores
   */
    getAllStores() {
        return this._httpClient.get(environment.stores, {
            params: {
                list: true
            }
        })
    }

    /**
   * Get reminders of customers
   */
    getReminders(id: string) {
        return this._httpClient.get(environment.customerList, {
            params: {
                reminder: true,
                user_id: id
            }
        })
    }

    /**
  * Get carts of customers
  */
    getCarts(id: string) {
        return this._httpClient.get(environment.customerList, {
            params: {
                cart: true,
                user_id: id
            }
        })
    }

    /**
  * Get carts of customers
  */
    getQuotes(id: string) {
        return this._httpClient.get(environment.customerList, {
            params: {
                cart: true,
                user_id: id,
                bln_quote: 1
            }
        })
    }

    /**
  * Get orders history of customers
  */
    getOrderHistory(id: string) {
        return this._httpClient.get(environment.orders, {
            params: {
                list: true,
                user_id: id
            }
        })
    }

    /**
     * Get fulfillment orders of customers
     */
    getFulfillmentOrders(id: string) {
        return this._httpClient.get(environment.orders, {
            params: {
                list: true,
                user_id: id,
                order_type: 2
            }
        })
    }

    /**
     * Get group orders of customers
     */
    getGroupOrders(id: string) {
        return this._httpClient.get(environment.orders, {
            params: {
                list: true,
                user_id: id,
                group_order: true
            }
        })
    }

    /**
    * add approved request for user
    */
    addApprovalRequest(payload: ApprovalContact) {
        return this._httpClient.post(
            `${environment.customerList}`, payload
        );
    }

    /**
    * add approved request for user
    */
    addReminder(payload: AddReminder) {
        return this._httpClient.post(
            `${environment.customerList}`, payload
        );
    }

    /**
   * UPDATE cash-back
   */
    updateCashback(payload: UpdateCashback) {
        return this._httpClient.put(
            `${environment.customerList}`, payload);
    }

    /**
   * create store
   */
    createStore(payload: CreateStore) {
        return this._httpClient.post(
            `${environment.customerList}`, payload);
    }
}
