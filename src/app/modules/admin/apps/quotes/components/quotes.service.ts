import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, retry, switchMap, tap } from 'rxjs/operators';
import { AddCore, AddDuplicateImprint, AddFeature, AddPackage, AddStoreProduct, add_setup_charge, CaseDimensionObj, CaseQuantityObj, Comment, CreateProduct, DeleteComment, displayOrderObj, duplicateObj, featureUpdateObj, FlatRateShippingObj, Imprint, InventoryBrand, InventoryCategory, InventoryPagination, InventoryTag, InventoryVendor, Licensing, MultiImprint, NetCostUpdate, overlapUpdateObj, PhysicsObj, physicsUpdateObject, PostColor, priceInclusionObj, Product, ProductColor, ProductFeature, ProductLicensing_Term, ProductNetCost, ProductsList, updateAllowRun, UpdateArtwork, updateColorObj, updateImprintObj, UpdateMargin, updatePackageObj, UpdateProductDescription, updateProductSize, UpdateProductStatus, updatePromostandardObj, updateSize, videoObj, Warehouse } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { environment } from 'environments/environment';
import { productDescription } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { AuthService } from 'app/core/auth/auth.service';
import { navigations } from './navigations';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class QuotesService {
    public vendorsSearchKeyword = '';
    public navigationLabels = navigations;

    // Imprints
    public setup = null;
    public run = null;

    public selectedIndex = null;
    public productSearchFilter = {
        product_id: null,
        term: null,
        supplier: null,
        store: null
    };
    public standardImprints: any;
    // Private
    private _vendors: BehaviorSubject<InventoryVendor[] | null> = new BehaviorSubject(null);
    private _suppliers: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _single_suppliers: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _states: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _imprintMethods: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _imprintLocations: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _imprintDigitizer: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _distributionCodes: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _quoteDetails: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _quoteComments: BehaviorSubject<any | null> = new BehaviorSubject(null);

    opts = [];

    public duplicateCheck: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private _snackBar: MatSnackBar,
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {
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
     * Getter for vendors
     */
    get qoutesDetails$(): Observable<InventoryVendor[]> {
        return this._quoteDetails.asObservable();
    };
    get qoutesComments$(): Observable<InventoryVendor[]> {
        return this._quoteComments.asObservable();
    };
    get vendors$(): Observable<InventoryVendor[]> {
        return this._vendors.asObservable();
    };

    get Suppliers$(): Observable<any[]> {
        return this._suppliers.asObservable();
    };
    get Single_Suppliers$(): Observable<any[]> {
        return this._single_suppliers.asObservable();
    };
    get States$(): Observable<any[]> {
        return this._states.asObservable();
    };

    get imprintMethods$(): Observable<any[]> {
        return this._imprintMethods.asObservable();
    };
    get imprintLocations$(): Observable<any[]> {
        return this._imprintLocations.asObservable();
    };
    get imprintDigitizer$(): Observable<any[]> {
        return this._imprintDigitizer.asObservable();
    };
    // Distribution Codes
    get distributionCodes$(): Observable<any> {
        return this._distributionCodes.asObservable();
    }

    // Common get Calls
    getQuoteData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.quotes, {
            params: params
        });
    };
    // Common Post Call
    AddQuoteData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.quotes, payload, { headers });
    };
    // Common put Call
    UpdateQuoteData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.quotes, payload, { headers });
    };
    // Quote Details
    getQuoteMainDetail(params): Observable<any> {
        return this._httpClient.get<any>(environment.quotes, { params: params }).pipe(
            tap((quote) => {
                this._quoteDetails.next(quote);
            })
        );
    }
    // Quote Commment
    getQuoteComments(params): Observable<any> {
        return this._httpClient.get<any>(environment.quotes, { params: params }).pipe(
            tap((quote) => {
                this._quoteComments.next(quote);
            })
        );
    }
    getFiles(payload) {
        return this._httpClient.post(environment.products,
            payload);
    };
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
