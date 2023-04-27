import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { CustomersProduct, UserCreditTerms, AddUserComment, AddUserLocation, ApprovalContact, AddReminder, UpdateCashback, CreateStore, UserUpdateObject } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { navigations } from 'app/modules/admin/apps/ecommerce/customers/customers.navigator';

@Injectable({
    providedIn: 'root'
})
export class CustomersService {
    public _searchKeyword = '';
    // Private
    private _customer: BehaviorSubject<CustomersProduct | null> = new BehaviorSubject(null);
    private _customers: BehaviorSubject<CustomersProduct[] | null> = new BehaviorSubject(null);

    pageSize: number = 20;
    pageNumber: number = 1;

    public navigationLabels = navigations;

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
     * Getter for product
     */
    get customer$(): Observable<CustomersProduct> {
        return this._customer.asObservable();
    }

    /**
     * Getter for products
     */
    get customers$(): Observable<CustomersProduct[]> {
        return this._customers.asObservable();
    }

    changePageNumber(status: 'increase' | 'decrease' | null = null): void {
        status === 'increase' ? this.pageNumber++ : this.pageNumber--;
    };

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    // Getter for customers list
    getCustomersList(keyword?: string): Observable<CustomersProduct[]> {
        const search = keyword ? keyword : '';
        return this._httpClient.get<CustomersProduct[]>(environment.customerList, {
            params: {
                list: true,
                size: this.pageSize,
                page: this.pageNumber,
                keyword: search
            }
        }).pipe(
            tap((customers) => {
                this._customers.next(customers);
            })
        );
    };

    // Getter for customers per id
    getCustomer(id: string): Observable<CustomersProduct[]> {
        return this._httpClient.get<CustomersProduct[]>(environment.customerList, {
            params: {
                user: true,
                user_id: id
            }
        }).pipe(
            tap((res) => {
                this._customer.next(res["data"][0]);
            })
        );
    };

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
     * Get customer by id
     */

    getCustomerDetails(id) {
        let params = {
            user: true,
            user_id: id
        }
        return this._httpClient.get(environment.customerList, {
            params: params
        });
    };

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
                switchMap(updatedProduct => this.customer$.pipe(
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
    };

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
    getCommentators(param) {
        return this._httpClient.get(environment.customerList, {
            params: param
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
