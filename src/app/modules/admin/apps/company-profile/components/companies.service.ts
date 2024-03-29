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
import moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class CompaniesService {
    public startDate: any;
    public endDate: any;
    public reportType: any;
    public WeekDate = new Date();
    public monthlyMonth = 1;
    public monthlyYear = new Date().getFullYear();
    public quarterMonth = 1;
    public quarterYear = new Date().getFullYear();
    public yearlyYear = new Date().getFullYear();
    public ngRangeStart = new Date();
    public ngRangeEnd = new Date();
    public ngPlan = 'weekly';

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
    private _imprintMethods: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _imprintLocations: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _imprintDigitizer: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _distributionCodes: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _states: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _stores: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _promoCodes: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);

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
    setFiltersReport() {
        if (this.ngPlan == 'weekly') {
            this.startDate = moment(this.WeekDate).startOf('week').format('MM/DD/yyyy');
            this.endDate = moment(this.WeekDate).endOf('week').format('MM/DD/yyyy');
            this.reportType = 'Weekly Sales';
        } else if (this.ngPlan == 'monthly') {
            let d = new Date(this.monthlyYear, this.monthlyMonth - 1, 1);
            this.startDate = moment(d).startOf('month').format('MM/DD/yyyy');
            this.endDate = moment(d).endOf('month').format('MM/DD/yyyy');
            this.reportType = 'Monthly Sales';
        } else if (this.ngPlan == 'quarterly') {
            let s;
            let e;
            if (this.quarterMonth == 1) {
                s = new Date(this.quarterYear, 0, 1);
                e = new Date(this.quarterYear, 2, 1);
            } else if (this.quarterMonth == 2) {
                s = new Date(this.quarterYear, 3, 1);
                e = new Date(this.quarterYear, 5, 1);
            } else if (this.quarterMonth == 3) {
                s = new Date(this.quarterYear, 6, 1);
                e = new Date(this.quarterYear, 8, 1);
            } else if (this.quarterMonth == 4) {
                s = new Date(this.quarterYear, 9, 1);
                e = new Date(this.quarterYear, 11, 1);
            }
            this.startDate = moment(s).startOf('month').format('MM/DD/yyyy');
            this.endDate = moment(e).endOf('month').format('MM/DD/yyyy');
            this.reportType = 'Quarterly Sales';
        } else if (this.ngPlan == 'yearly') {
            let d = new Date(this.yearlyYear, 0, 1);
            this.startDate = moment(d).startOf('year').format('MM/DD/yyyy');
            this.endDate = moment(d).endOf('year').format('MM/DD/yyyy');
        } else if (this.ngPlan == 'range') {
            this.startDate = moment(this.ngRangeStart).format('MM/DD/yyyy');
            this.endDate = moment(this.ngRangeEnd).format('MM/DD/yyyy');
            this.reportType = 'Range Sales';
        }
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for vendors
     */
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
    get Stores$(): Observable<any[]> {
        return this._stores.asObservable();
    };
    get PromoCodes$(): Observable<any[]> {
        return this._promoCodes.asObservable();
    };



    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // ----------------------------------------------------------------------------
    getChargeValue(value) {
        return this._httpClient.get(environment.products, {
            params: {
                charge: true,
                charge_value: value,
                size: 100
            }
        })
    };
    getCompaniesData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.companies, {
            params: params
        });
    };

    // Common put Call
    UpdateCompaniesData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.companies, payload, { headers });
    };

    getMultiColorValue(two, three, four, five): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                multi_color: true,
                two_color_q: two,
                three_color_q: three,
                four_color_q: four,
                five_color_q: five
            }
        });
    };
    getCollectionIds(companyId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                decoration: true,
                collection: true,
                decorator_id: companyId
            }
        });
    };
    getChargeValuesData(text) {
        return this._httpClient.get(environment.products, {
            params: {
                charge: true,
                price_inclusion: true,
                charge_id: text,
                size: 1000
            }
        })
    };
    getAllImprintLocations(keyword): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                paginated_location: true,
                keyword: keyword
            }
        });
    };
    // getAllImprintLocations Observable
    getAllImprintLocationsObs(keyword): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                paginated_location: true,
                keyword: keyword
                // location: true
            }
        }).pipe(
            tap((response: any) => {
                this._imprintLocations.next(response);
            })
        );
    };

    getAllImprintMethods(k): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                keyword: k,
                paginated_method: true
            }
        });
    };
    // getAllImprintMethods Observable
    getAllImprintMethodsObs(k): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                keyword: k,
                paginated_method: true
                // method: true
            }
        }).pipe(
            tap((response: any) => {
                this._imprintMethods.next(response);
            })
        );
    };

    getAllDigitizers(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.system, {
            params: {
                imprint: true,
                digitizer: true
            }
        }).pipe(
            tap((response: any) => {
                this._imprintDigitizer.next(response);
            })
        );
    };

    // Common get Calls
    getSystemsData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.system, {
            params: params
        });
    };
    // Common Post Call
    AddSystemData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.system, payload, { headers });
    };
    // Common put Call
    UpdateSystemData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.system, payload, { headers });
    };
    getIPAddress() {
        return this._httpClient.get("https://www.ipconfig.in/ip/");
    }

    // Get calls
    getAPIData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.companies, {
            params: params
        });
    };
    getVendorsData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.vendors, {
            params: params
        });
    };
    // Post Calls
    postCompaniesData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.companies, payload, { headers });
    };
    // Put Calls
    putCompaniesData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.companies, payload, { headers });
    };
    // All Vendors Suppliers
    getAllvendorsSuppliers(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.vendors, {
            params: {
                supplier: true,
                bln_active: 1,
                size: 20
            }
        }).pipe(
            tap((response: any) => {
                this._suppliers.next(response);
            })
        );
    };
    // Vendors data by id
    getVendorsSupplierById(id): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.vendors, {
            params: {
                company_id: id,
                single_supplier: true
            }
        }).pipe(
            tap((response: any) => {
                this._single_suppliers.next(response);
            })
        );
    };
    // GEt States
    getStates(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.vendors, {
            params: {
                states: true,
                size: 100
            }
        }).pipe(
            tap((response: any) => {
                this._states.next(response);
            })
        );
    };
    getStores(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.vendors, {
            params: {
                all_stores: true,
                bln_active: 1,
                size: 20
            }
        }).pipe(
            tap((response: any) => {
                this._stores.next(response);
            })
        );
    };
    getPromoCodes(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.vendors, {
            params: {
                promocodes: true
            }
        }).pipe(
            tap((response: any) => {
                this._promoCodes.next(response);
            })
        );
    };
    // Royalty Stores
    getRoyaltyStores(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.vendors, {
            params: params
        });
    };
}
