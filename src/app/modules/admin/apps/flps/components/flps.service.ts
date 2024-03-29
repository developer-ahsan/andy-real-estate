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
    private _flpsStores: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _reportUsers: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);

    public flpsPermissions = {
        addFLPSStoreUser: false,
        applyBlanketCustomerPercentage: false,
        bulkCustomerUpdate: false,
        flpsReport: false,
        flpsReport2: false,
        login: false,
        logout: false,
        newFLPSUser: false,
        options: false,
        options2: false,
        removeFLPSStoreUser: false,
        removeFLPSUser: false,
        removeFLPSUserConfirm: false,
        selectFLPSUser: false,
        selectFLPSstore: false,
        updateFLPSStoreUser: false,
        updateFLPSUser: false,
        updateReport: false,
        updateStoreManagementTypes: false,
        viewBlanketCustomerPercentage: false,
        viewDisabledFLPSUsers: false,
        viewFLPSUser: false,
        viewFLPSUserCustomers: false,
        viewFLPSUserOrders: false,
        viewFLPSlogin: false,
        viewFLPSstore: false,
        viewMyStores: false,
        viewNewFLPSUser: false,
        viewStoreManagementTypes: false
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
    // Stores
    get flpsStores$(): Observable<any[]> {
        return this._flpsStores.asObservable();
    };


    // Check FLP Login
    checkFLPSLogin(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.flps, {
            params: params
        }).pipe(
            tap((response: any) => {
                if (response["success"]) {
                    sessionStorage.setItem('flpsAccessToken', 'userLoggedIn');
                    localStorage.setItem('flpsData', JSON.stringify(response["data"][0]));
                    sessionStorage.setItem('FullName', response["data"][0].firstName + ' ' + response["data"][0].lastName);
                    sessionStorage.setItem('flpsLoginAdmin', response["data"][0].blnAdmin);
                    sessionStorage.setItem('flpsUserID', response["data"][0].pk_userID);
                    sessionStorage.setItem('flpsUserEmail', response["data"][0].email);
                }
            })
        );
    };
    // Common get Calls
    getFlpsData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.flps, {
            params: params
        }).pipe(retry(3));
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
                admin_users: true
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
                // view_store_all_admins: true,
                flps_users_list: true
            }
        }).pipe(
            tap((response: any) => {
                this._reportUsers.next(response);
            })
        );
    };
    // FLPS Stores
    getFLPSStores(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.flps, {
            params: {
                view_stores: true,
                bln_active: 1,
                size: 65
            }
        }).pipe(
            tap((response: any) => {
                this._flpsStores.next(response);
            })
        );
    };
}
