import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, map, retry, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { productDescription } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { AuthService } from 'app/core/auth/auth.service';
import { navigations } from 'app/modules/admin/apps/ecommerce/product-store/navigations';
import { UpdatePricing, UpdateShipping, UpdateStoreLevelCoop } from './store.types';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class StoreProductService {
    private _storeProduct: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _storeDetail: BehaviorSubject<any | null> = new BehaviorSubject(null);



    public navigationLabels = navigations;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService,
        private _snackBar: MatSnackBar
    ) {
    }

    /**
     * Getter for product
     */
    get product$(): Observable<any[]> {
        return this._storeProduct.asObservable();
    };
    get store$(): Observable<any[]> {
        return this._storeDetail.asObservable();
    };


    snackBar(msg) {
        this._snackBar.open(msg, '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
        });
    }
    // Store Products Get Calls
    getStoreDetail(id): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.stores, {
            params: {
                list: true,
                store_id: id
            }
        }).pipe(
            tap((store) => {
                this._storeDetail.next(store);
            })
        );
    };
    getStoreProductsDetail(id): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeProducts, {
            params: {
                detail: true,
                store_product_id: id
            }
        }).pipe(
            tap((products) => {
                this._storeProduct.next(products);
            })
        );
    };

    getStoreProducts(params) {
        return this._httpClient.get(environment.storeProducts, { params: params })
            .pipe(retry(3));
    };
    updateShipping(payload: UpdateShipping) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };
    UpdateStoreLevelCoop(payload: UpdateStoreLevelCoop) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };
    UpdatePricing(payload: UpdatePricing) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };
}
