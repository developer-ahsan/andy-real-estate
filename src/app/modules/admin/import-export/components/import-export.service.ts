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
export class ImportExportService {
    public OrderIDSearch: any;
    public CustomerSearch: any;
    public SearchLoader: boolean = false;
    public routeData: any;
    public navigationLabels = navigations;

    private _smartArtUsers: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _employeeAdmins: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _importExportStores: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _reportUsers: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);

    public adminUserPermissions = {
        export: false,
        home: false,
        import: false,
        selectCategories: false,
        selectStore: false,
    }
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
    get importExportStores$(): Observable<any[]> {
        return this._importExportStores.asObservable();
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
    getAPIData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.import_export, {
            params: params
        }).pipe(retry(3));
    };
    // Common Post Call
    PostAPIData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.import_export, payload, { headers });
    };
    // Common put Call
    PutAPIData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.order_manage, payload, { headers });
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
    getAllStores(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.import_export, {
            params: {
                stores: true,
                bln_active: 1,
                size: 10
            }
        }).pipe(
            tap((response: any) => {
                this._importExportStores.next(response);
            })
        );
    };
    getStoresSearch(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.import_export, {
            params: params
        })
    };
    getIPAddress() {
        return this._httpClient.get("http://api.ipify.org/?format=json");
    }
}
