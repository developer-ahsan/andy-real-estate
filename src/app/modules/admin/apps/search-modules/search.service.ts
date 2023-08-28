import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, retry, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SearchService {

    // Public
    productKeyword: any = '';
    customerKeyword: any = '';
    orderKeyword: any = new BehaviorSubject<string>('');
    public orderKeyword$ = this.orderKeyword.asObservable();

    // Private

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }


    getProductSearchData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: params
        }).pipe(retry(3));
    };
    // Customers
    getCustomersSearchData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.customerList, {
            params: params
        }).pipe(retry(3));
    };
    // Orders
    getOrdersSearchData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.orders, {
            params: params
        }).pipe(retry(3));
    };
    // Vendors
    getVendorsSearchData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.vendors, {
            params: params
        }).pipe(retry(3));
    };
    // Quotes
    getQuoteSearchData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.quotes, {
            params: params
        }).pipe(retry(3));
    };
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for contact
     */

}
