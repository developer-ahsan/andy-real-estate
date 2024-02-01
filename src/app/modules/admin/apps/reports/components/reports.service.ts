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
export class ReportsService {
    public startDate: any;
    public endDate: any;
    public lastStartDate: any;
    public lastEndDate: any;
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
    private _currentDate: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _stores: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _promoCodes: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);

    opts = [];

    public duplicateCheck: boolean = false;

    public reporter = {
        home: false,
        royaltySummary: false,
        selectAccountCode: false,
        selectBestSellers: false,
        selectCustomerPurchases: false,
        selectEmployeeSales: false,
        selectEmployeeSales2: false,
        selectEmployeeSummary: false,
        selectGraphicsSupportReport: false,
        selectIncidentReport: false,
        selectItemReport: false,
        selectLocationSales: false,
        selectOrderProcessingSupportReport: false,
        selectQuoteGraphicsSupportReport: false,
        selectRoyalties: false,
        selectSamplesSales: false,
        selectStoreSales: false,
        selectStoreSales2: false,
        selectStoreSales3: false,
        selectSupplierSales: false,
        selectSupplierSales2: false,
        selectSupplierSales3: false,
        selectSupportReport: false,
        selectTopCustomerSales: false,
        selectVendorRelationsReport: false,
        viewAccountCode: false,
        viewBestSellers: false,
        viewCustomerPurchasesReport: false,
        viewEmployeeSalesReport: false,
        viewEmployeeSalesReport2: false,
        viewEmployeeSummary: false,
        viewGraphicsSupportReport: false,
        viewIncidentReport: false,
        viewInventorySummary: false,
        viewItemReport: false,
        viewLocationSalesReport: false,
        viewMarginReport: false,
        viewMarkups: false,
        viewOrderProcessingSupportReport: false,
        viewQuoteGraphicsSupportReport: false,
        viewRoyaltiesReport: false,
        viewSamplesReport: false,
        viewStoreSalesReport: false,
        viewStoreSalesReport2: false,
        viewStoreSalesReport3: false,
        viewSupplierSalesReport: false,
        viewSupplierSalesReport2: false,
        viewSupplierSalesReport3: false,
        viewSupportReport: false,
        viewTopCustomerReport: false,
        viewVendorRelationsReport: false
    };

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
        var currentDate = moment();
        const currentYear = moment().year();

        if (this.ngPlan == 'weekly') {
            this.startDate = moment(this.WeekDate).startOf('isoWeek').format('yyyy-MM-DD');
            this.endDate = moment(this.WeekDate).endOf('isoWeek').format('yyyy-MM-DD');
            this.lastStartDate = moment(this.WeekDate).startOf('isoWeek').subtract(1, 'year').format('yyyy-MM-DD');
            this.lastEndDate = moment(this.WeekDate).endOf('isoWeek').subtract(1, 'year').format('yyyy-MM-DD');
            this.reportType = 'Weekly Sales';
        } else if (this.ngPlan == 'monthly') {
            const currentMonth = moment().month() + 1;
            let d = new Date(this.monthlyYear, this.monthlyMonth - 1, 1);
            this.startDate = moment(d).startOf('month').format('yyyy-MM-DD');
            if (this.monthlyYear == currentYear) {
                if (currentMonth == this.monthlyMonth) {
                    this.endDate = moment(currentDate).format('YYYY-MM-DD');
                } else {
                    this.endDate = moment(d).endOf('month').format('YYYY-MM-DD');
                }
            } else {
                this.lastEndDate = moment(d).endOf('month').subtract(1, 'year').format('yyyy-MM-DD');
                this.endDate = moment(d).endOf('month').format('yyyy-MM-DD');
            }
            this.lastStartDate = moment(d).startOf('month').subtract(1, 'year').format('yyyy-MM-DD');
            this.lastEndDate = moment(this.endDate).subtract(1, 'year').format('yyyy-MM-DD');
            this.reportType = 'Monthly Sales';
        } else if (this.ngPlan == 'quarterly') {
            const currentQuarter = moment().quarter();
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
            this.startDate = moment(s).startOf('month').format('yyyy-MM-DD');
            if (this.quarterYear == currentYear) {
                if (this.quarterMonth == 4) {
                    this.endDate = moment(e).endOf('month').subtract(1, 'days').format('YYYY-MM-DD');
                } else {
                    this.endDate = moment(e).endOf('month').format('YYYY-MM-DD');
                }
            } else {
                if (this.quarterMonth == 4) {
                    this.endDate = moment(e).endOf('month').subtract(1, 'days').format('YYYY-MM-DD');
                } else {
                    this.endDate = moment(e).endOf('month').format('YYYY-MM-DD');
                }
            }
            this.reportType = 'Quarterly Sales';
            this.lastStartDate = moment(this.startDate).subtract(1, 'year').format('yyyy-MM-DD');
            this.lastEndDate = moment(this.endDate).subtract(1, 'year').format('yyyy-MM-DD');
        } else if (this.ngPlan == 'yearly') {
            let d = new Date(this.yearlyYear, 0, 1);
            this.startDate = moment(d).startOf('year').format('yyyy-MM-DD');
            if (this.yearlyYear == currentYear) {
                this.endDate = moment(currentDate).format('YYYY-MM-DD');
            } else {
                this.endDate = moment(d).endOf('year').format('yyyy-MM-DD');
            }
            this.lastStartDate = moment(d).startOf('year').subtract(1, 'year').format('yyyy-MM-DD');
            this.lastEndDate = moment(this.endDate).subtract(1, 'year').format('yyyy-MM-DD');
            this.reportType = 'Yearly Sales';

        } else if (this.ngPlan == 'range') {
            this.startDate = moment(this.ngRangeStart).format('yyyy-MM-DD');
            this.endDate = moment(this.ngRangeEnd).format('yyyy-MM-DD');
            this.lastStartDate = moment(this.ngRangeStart).subtract(1, 'year').format('yyyy-MM-DD');
            this.lastEndDate = moment(this.ngRangeEnd).subtract(1, 'year').format('yyyy-MM-DD');
            this.reportType = 'Range Sales';
        } else if (this.ngPlan == 'alltime') {
            this.startDate = '1980-01-01';
            this.endDate = '9999-12-31';
            this.lastStartDate = '1980-01-01';
            this.lastEndDate = '9999-12-31';
            this.reportType = 'All Time';
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
    get currentDate$(): Observable<any[]> {
        return this._currentDate.asObservable();
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
    getProductsData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: params
        });
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
        return this._httpClient.get("http://api.ipify.org/?format=json");
    }

    // Get calls
    getAPIData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.reports, {
            params: params
        }).pipe(retry(3));
    };
    getVendorsData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.vendors, {
            params: params
        });
    };
    // Post Calls
    postVendorsData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.vendors, payload, { headers });
    };
    // Put Calls
    putVendorsData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.vendors, payload, { headers });
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
    getCurrentDate(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.reports, {
            params: {
                current_date: true
            }
        }).pipe(
            tap((response: any) => {
                this._currentDate.next(response);
            })
        );
    };
    getStates(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.reports, {
            params: {
                current_date: true
            }
        }).pipe(
            tap((response: any) => {
                this._states.next(response);
            })
        );
    };
    getStores(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.reports, {
            params: {
                stores: true,
                size: 20
            }
        }).pipe(
            tap((response: any) => {
                this._stores.next(response);
            })
        );
    };
    getPromoCodes(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.reports, {
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
        return this._httpClient.get<any[]>(environment.reports, {
            params: params
        });
    };

    // Convert Value TO Status
    getStatusValue(statusValues: any) {
        const status = statusValues?.split('|').map(Number);
        let statusColor = '';
        let statusValue = '';
        let textColor = '';
        if (status) {
            switch (true) {
                case status.includes(1):
                case status.includes(2):
                case status.includes(3):
                case status.includes(4):
                    statusValue = 'Processing';
                    statusColor = 'text-red-500';
                    textColor = 'red';
                    break;
                case status.includes(5):
                    statusValue = 'Shipped';
                    statusColor = 'text-green-500';
                    textColor = 'green';
                    break;
                case status.includes(6):
                case status.includes(8):
                case status.includes(11):
                case status.includes(12):
                case status.includes(13):
                    statusValue = 'Delivered';
                    statusColor = 'text-green-500';
                    textColor = 'green';
                    break;
                case status.includes(7):
                    statusValue = 'P.O. Needed';
                    statusColor = 'text-purple-500';
                    textColor = 'purple';
                    break;
                // case status.includes(8):
                //     statusValue = 'Picked up';
                //     statusColor = 'text-green-500';
                //     break;
                case status.includes(10):
                    statusValue = 'Awaiting Group Order';
                    statusColor = 'text-orange-500';
                    textColor = 'orange';
                    break;
                default:
                    statusValue = 'N/A';
                    break;
            }
        } else {
            statusValue = 'N/A';
        }
        return {
            statusColor,
            statusValue,
            textColor
        };
    }

}
