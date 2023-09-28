import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { retry, tap } from 'rxjs/operators';
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
    public _userRole: BehaviorSubject<any> = new BehaviorSubject(null);

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
    get userRole$(): Observable<any> {
        return this._userRole.asObservable();
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
            retry(3),
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
            retry(3),
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
        }).pipe(retry(3));
    };
    getStatusValue(statusValues: any) {
        let statusColor = '';
        let statusValue = '';
        let status = statusValues.split('|');
        status.forEach(element => {
            let status = Number(element);
            if (status == 1 || status == 2 || status == 3 || status == 4) {
                statusValue = 'Processing';
                statusColor = 'text-red-500';
            } else if (status == 5) {
                statusValue = 'Shipped';
                statusColor = 'text-green-500';
            } else if (status == 6) {
                statusValue = 'Delivered';
                statusColor = 'text-green-500';
            } else if (status == 7) {
                statusValue = 'P.O. Needed';
                statusColor = 'text-purple-500';
            } else if (status == 8) {
                statusValue = 'Picked up';
                statusColor = 'text-green-500';
            } else if (status == 10) {
                statusValue = 'Awaiting Group Order';
                statusColor = 'text-orange-500';
            } else {
                statusValue = 'N/A';
            }
        });
        let result = {
            statusColor: statusColor,
            statusValue: statusValue
        }
        return result;
    }
    // GEt User Role
    getUserRole(email): Observable<any> {
        let params = {
            user_data: true,
            email: email
        }
        return this._httpClient.get(environment.dashboard, { params: params }).pipe(
            retry(3),
            tap((response: any) => {
                localStorage.setItem('roleID', response["data"][0].roleID);
                localStorage.setItem('blnManager', response["data"][0].blnManager);
                this._userRole.next(response);
            })
        );
    }
    // Remove Files Globally
    removeMediaFiles(payload) {
        return this._httpClient.put(
            environment.products, payload);
    };
}
