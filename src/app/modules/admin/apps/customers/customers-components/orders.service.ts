import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { retry, tap } from 'rxjs/operators';
import { addComment, CreateIncidentReport, OrdersList, OrdersProduct } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { navigations } from './customers.navigator';
import { CustomersProduct } from './customers.types';

@Injectable({
    providedIn: 'root'
})
export class CustomersService {

    private _customer: BehaviorSubject<CustomersProduct | null> = new BehaviorSubject(null);
    private _customers: BehaviorSubject<CustomersProduct[] | null> = new BehaviorSubject(null);
    pageSize: number = 20;
    pageNumber: number = 1;

    public _searchKeyword = '';
    public _orderDetail: BehaviorSubject<OrdersProduct | null> = new BehaviorSubject(null);
    private _orders: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    private _order: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    private _orderStatus: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    private _order_products: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    private _orderLineProducts: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    private _stores: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    private _group_order_detail: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    public OrderCancelled: boolean = false;

    public navigationLabels = navigations;

    /**
     * Constructor
     */
    constructor(
        private _snackBar: MatSnackBar,
        private _httpClient: HttpClient,
        private _authService: AuthService) {
    }

    snackBar(msg) {
        this._snackBar.open(msg, '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
        });
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter 
     */
    get customer$(): Observable<CustomersProduct> {
        return this._customer.asObservable();
    }
    get customers$(): Observable<CustomersProduct[]> {
        return this._customers.asObservable();
    }
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

    // Common Calls
    getAllStores() {
        return this._httpClient.get(environment.stores, {
            params: {
                list: true
            }
        })
    }
    // @Get Calls
    GetApiData(params): Observable<any> {
        return this._httpClient.get(`${environment.customerList}`, { params: params }).pipe(retry(3));
    }

    PostApiData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.customerList, payload, { headers });
    };

    PutApiData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.orders, payload, { headers });
    };
    changePageNumber(status: 'increase' | 'decrease' | null = null): void {
        status === 'increase' ? this.pageNumber++ : this.pageNumber--;
    };
}
