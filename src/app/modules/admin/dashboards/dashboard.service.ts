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
    // Common get call
    // Common get Calls
    getDashboardData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.dashboard, {
            params: params
        });
    };
}
