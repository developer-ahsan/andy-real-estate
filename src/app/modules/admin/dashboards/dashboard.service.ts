import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DashboardsService {
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    private _dataProject: BehaviorSubject<any> = new BehaviorSubject(null);
    private _porfolioData: BehaviorSubject<any> = new BehaviorSubject(null);
    private _employeeData: BehaviorSubject<any> = new BehaviorSubject(null);
    private _ytdData: BehaviorSubject<any> = new BehaviorSubject(null);
    public _allStores: BehaviorSubject<any> = new BehaviorSubject(null);
    public _allSuppliers: BehaviorSubject<any> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any> {
        return this._data.asObservable();
    }
    get portfolioData$(): Observable<any> {
        return this._porfolioData.asObservable();
    }
    get employeeData$(): Observable<any> {
        return this._employeeData.asObservable();
    }
    get ytdData$(): Observable<any> {
        return this._ytdData.asObservable();
    }
    get storesData$(): Observable<any> {
        return this._allStores.asObservable();
    }
    get suppliersData$(): Observable<any> {
        return this._allSuppliers.asObservable();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getData(): Observable<any> {
        return this._httpClient.get('api/dashboards/analytics').pipe(
            tap((response: any) => {
                this._data.next(response);
            })
        );
    }

    get dataProject$(): Observable<any> {
        return this._dataProject.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getDataProject(): Observable<any> {
        return this._httpClient.get('api/dashboards/project').pipe(
            tap((response: any) => {
                this._dataProject.next(response);
            })
        );
    }
    getYTDData(): Observable<any> {
        let params = {
            ytd_mtd_wtd: true
        }
        return this._httpClient.get(environment.dashboard, { params: params }).pipe(
            tap((response: any) => {
                this._ytdData.next(response);
            })
        );
    }
    getPortfolio(): Observable<any> {
        let params = {
            performance_report: true,
            size: 20
        }
        return this._httpClient.get(environment.dashboard, { params: params }).pipe(
            tap((response: any) => {
                this._porfolioData.next(response);
            })
        );
    }
    getPeformanceEmployee(): Observable<any> {
        let params = {
            employees_list: true,
            size: 20
        }
        return this._httpClient.get(environment.dashboard, { params: params }).pipe(
            tap((response: any) => {
                this._employeeData.next(response);
            })
        );
    }
    getStoresData(): Observable<any> {
        sessionStorage.removeItem('storesdata');
        let params = {
            get_stores: true
        }
        return this._httpClient.get(environment.dashboard, { params: params }).pipe(
            tap((response: any) => {
                sessionStorage.setItem('storesdata', JSON.stringify(response));
                this._allStores.next(response);
            })
        );
    }
    getSuppliersData(): Observable<any> {
        sessionStorage.removeItem('suppliersdata');
        let params = {
            get_suppliers: true
        }
        return this._httpClient.get(environment.dashboard, { params: params }).pipe(
            tap((response: any) => {
                sessionStorage.setItem('suppliersdata', JSON.stringify(response));
                this._allSuppliers.next(response);
            })
        );
    }
    // Common get call
    // Common get Calls
    getDashboardData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.dashboard, {
            params: params
        });
    };
}
