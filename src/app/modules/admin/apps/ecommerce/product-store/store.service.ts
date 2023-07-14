import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, map, retry, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { productDescription } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { AuthService } from 'app/core/auth/auth.service';
import { navigations } from 'app/modules/admin/apps/ecommerce/product-store/navigations';
import { RemoveVideo, UpdateColor, UpdateExtrinsicCategory, UpdateImprint, UpdateImprintStatus, UpdatePermaLink, UpdatePricing, UpdateProductOptions, UpdateRoyalty, UpdateShipping, UpdateSpecialDescription, UpdateStoreLevelCoop, videoObj } from './store.types';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class StoreProductService {
    public _storeProduct: BehaviorSubject<any | null> = new BehaviorSubject(null);
    public _storeDetail: BehaviorSubject<any | null> = new BehaviorSubject(null);



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
    commonGetCalls(params) {
        return this._httpClient.get(environment.storeProducts, { params: params })
            .pipe(retry(3));
    }
    // 
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

    removeStoreProducts(params) {
        return this._httpClient.get(environment.products, { params: params })
            .pipe(retry(3));
    };
    getStoreProducts(params) {
        return this._httpClient.get(environment.storeProducts, { params: params })
            .pipe(retry(3));
    };
    updateShipping(payload: UpdateShipping) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.storeProducts, payload, { headers });
    };
    UpdateStoreLevelCoop(payload: UpdateStoreLevelCoop) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.storeProducts, payload, { headers });
    };
    UpdatePricing(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.storeProducts, payload, { headers });
    };
    UpdateExtrinsicCategory(payload: UpdateExtrinsicCategory) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.storeProducts, payload, { headers });
    };
    UpdateSpecialDescription(payload: UpdateSpecialDescription) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.storeProducts, payload, { headers });
    };
    UpdatePermaLink(payload: UpdatePermaLink) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.storeProducts, payload, { headers });
    };
    UpdateRoyalty(payload: UpdateRoyalty) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.storeProducts, payload, { headers });
    };
    UpdateVideo(payload: videoObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.storeProducts, payload, { headers });
    };
    RemoveVideo(payload: RemoveVideo) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.storeProducts, payload, { headers });
    };
    updateColors(payload: UpdateColor) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.storeProducts, payload, { headers });
    };
    UpdateImprintStatus(payload: UpdateImprintStatus) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.storeProducts, payload, { headers });
    };
    UpdateImprint(payload: UpdateImprint) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.storeProducts, payload, { headers });
    };
    UpdateProductOptions(payload: UpdateProductOptions) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.storeProducts, payload, { headers });
    };

    putStoresData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
    }
    postStoresData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
    }
    postStoresProductsData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(environment.storeProducts, payload, { headers }).pipe(retry(3));
    }
    putStoresProductData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(environment.storeProducts, payload, { headers }).pipe(retry(3));
    }
    addMedia(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };
    removeMedia(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };
}
