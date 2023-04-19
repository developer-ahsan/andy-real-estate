import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, retry, switchMap, tap } from 'rxjs/operators';
import { AddCore, AddDuplicateImprint, AddFeature, AddPackage, AddStoreProduct, add_setup_charge, CaseDimensionObj, CaseQuantityObj, Comment, CreateProduct, DeleteComment, displayOrderObj, duplicateObj, featureUpdateObj, FlatRateShippingObj, Imprint, InventoryBrand, InventoryCategory, InventoryPagination, InventoryTag, InventoryVendor, Licensing, MultiImprint, NetCostUpdate, overlapUpdateObj, PhysicsObj, physicsUpdateObject, PostColor, priceInclusionObj, Product, ProductColor, ProductFeature, ProductLicensing_Term, ProductNetCost, ProductsList, updateAllowRun, UpdateArtwork, updateColorObj, updateImprintObj, UpdateMargin, updatePackageObj, UpdateProductDescription, updateProductSize, UpdateProductStatus, updatePromostandardObj, updateSize, videoObj, Warehouse } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { environment } from 'environments/environment';
import { productDescription } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { AuthService } from 'app/core/auth/auth.service';;
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class CatalogService {

    private _suppliers: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _employeeAdmins: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _colors: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _sizes: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _imprints: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _reportUsers: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
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

    // Reports
    get reportUsers$(): Observable<any[]> {
        return this._reportUsers.asObservable();
    };
    // Observables
    get employeeAdmins$(): Observable<any[]> {
        return this._employeeAdmins.asObservable();
    };
    // Suppliers
    get Suppliers$(): Observable<any[]> {
        return this._suppliers.asObservable();
    };
    // Colors
    get Colors$(): Observable<any[]> {
        return this._colors.asObservable();
    };
    // Colors
    get Sizes$(): Observable<any[]> {
        return this._sizes.asObservable();
    };
    // Imprints
    get Imprints$(): Observable<any[]> {
        return this._imprints.asObservable();
    };


    // Check FLP Login
    checkFLPSLogin(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.flps, {
            params: params
        }).pipe(
            tap((response: any) => {
                if (response["success"]) {
                    sessionStorage.setItem('flpsAccessToken', 'userLoggedIn');
                }
            })
        );
    };
    getStoresData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.admins, {
            params: params
        }).pipe(retry(3));
    };
    // Common get Calls
    getCatalogData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.catalog, {
            params: params
        }).pipe(retry(3));
    };
    // Common Post Call
    PostCatalogData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.catalog, payload, { headers });
    };
    // Common put Call
    PutCatalogData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.catalog, payload, { headers });
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
    // Generate Report Users
    getAllReportUsers(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.flps, {
            params: {
                view_store_all_admins: true,
                size: 10
            }
        }).pipe(
            tap((response: any) => {
                this._reportUsers.next(response);
            })
        );
    };
    // Get Suppliers
    getAdminSuppliers(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.catalog, {
            params: {
                supplier: true,
                size: 10,
                bln_active: 1
            }
        }).pipe(
            tap((response: any) => {
                this._suppliers.next(response);
            })
        );
    };
    // Admin colors
    getAdminColors(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.catalog, {
            params: {
                colors: true,
                size: 10
            }
        }).pipe(
            tap((response: any) => {
                this._colors.next(response);
            })
        );
    };
    // Admin Sizes
    getAdminSizes(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.catalog, {
            params: {
                apparel_sizes: true,
                size: 10
            }
        }).pipe(
            tap((response: any) => {
                this._sizes.next(response);
            })
        );
    };
    // Admin Decorators
    getAdminDecorators(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.catalog, {
            params: {
                imprint_methods: true,
                size: 10
            }
        }).pipe(
            tap((response: any) => {
                this._imprints.next(response);
            })
        );
    };
}
