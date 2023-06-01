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
export class RapidBuildService {
    public routeData: any;
    public navigationLabels = navigations;

    private _smartArtUsers: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _employeeAdmins: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _rapidBuildStores: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _rapidBuildStatuses: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
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
    // Companies
    get smartArtUsers$(): Observable<any[]> {
        return this._smartArtUsers.asObservable();
    };
    // Stores
    get rapidBuildStores$(): Observable<any[]> {
        return this._rapidBuildStores.asObservable();
    };
    // Stauses
    get rapidBuildStatuses$(): Observable<any[]> {
        return this._rapidBuildStatuses.asObservable();
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

    // Common get Calls
    getSmartArtData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.rapid_build, {
            params: params
        }).pipe(retry(3));
    };
    getRapidBuildData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.rapid_build, {
            params: params
        }).pipe(retry(3));
    };
    // Common Post Call
    AddSmartArtData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.rapid_build, payload, { headers });
    };
    PostApiData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.rapid_build, payload, { headers });
    };
    // Common put Call
    UpdateAPIData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.rapid_build, payload, { headers });
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
    // Get getSmartArtUsers
    getSmartArtUsers(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.smartart, {
            params: {
                smart_art_users: true,
                size: 20
            }
        }).pipe(
            tap((response: any) => {
                this._smartArtUsers.next(response);
            })
        );
    };
    // Admin Stores
    getRapidBuildStores(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.rapid_build, {
            params: params
        }).pipe(
            tap((response: any) => {
                this._rapidBuildStores.next(response);
            })
        );
    };
    getRapidBuildStatus(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.rapid_build, {
            params: {
                rapidbuild_status: true
            }
        }).pipe(
            tap((response: any) => {
                this._rapidBuildStatuses.next(response);
            })
        );
    };
    checkFileExists(url: string): Promise<boolean> {
        return this._httpClient.head(url)
            .toPromise()
            .then(() => true)
            .catch(() => false);
    }
}
