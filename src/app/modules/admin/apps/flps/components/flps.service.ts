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
export class FLPSService {
    public navigationLabels = navigations;

    private _employeeAdmins: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    /**
     * Constructor
     */
    constructor(
        private _snackBar: MatSnackBar,
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {
    }
    // Snack Bar
    snackBar(msg) {
        this._snackBar.open(msg, '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
        });
    }

    // Observables
    get employeeAdmins$(): Observable<any[]> {
        return this._employeeAdmins.asObservable();
    };



    // Common get Calls
    getFlpsData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.flps, {
            params: params
        });
    };
    // Common Post Call
    AddFlpsData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.flps, payload, { headers });
    };
    // Common put Call
    UpdateFlpsData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.flps, payload, { headers });
    };

    // Admin Employees
    getAllEmployees(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.flps, {
            params: {
                admin_users: true,
                size: 500
            }
        }).pipe(
            tap((response: any) => {
                this._employeeAdmins.next(response);
            })
        );
    };
}