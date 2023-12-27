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
export class OrderManageService {
    public OrderIDSearch: any;
    public CustomerSearch: any;
    public SearchLoader: boolean = false;
    public routeData: any;
    public navigationLabels = navigations;

    private _smartArtUsers: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _employeeAdmins: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _smartArtStores: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _orderManageStatus: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
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
    get orderManageStatus$(): Observable<any[]> {
        return this._orderManageStatus.asObservable();
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
    get adminStores$(): Observable<any[]> {
        return this._smartArtStores.asObservable();
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
        return this._httpClient.get<any[]>(environment.order_manage, {
            params: params
        }).pipe(retry(3));
    };
    // Common Post Call
    PostAPIData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.order_manage, payload, { headers });
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
    // Generate OrderManage Status
    getOrderManageStatus(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.order_manage, {
            params: {
                order_statuses: true
            }
        }).pipe(
            tap((response: any) => {
                this._orderManageStatus.next(response);
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
    getSmartArtStores(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.smartart, {
            params: {
                stores: true,
                bln_active: 1,
                size: 10
            }
        }).pipe(
            tap((response: any) => {
                this._smartArtStores.next(response);
            })
        );
    };
    getIPAddress() {
        return this._httpClient.get("http://api.ipify.org/?format=json");
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
    getMultipleFilesData(paths) {
        // 
        //     path: string;
        // ID?: number;
        let payload = {
            paths: paths,
            fetch_multiple_files: true
        }
        return this._httpClient.post<any[]>(environment.products, payload).pipe(retry(3));
    }
}
