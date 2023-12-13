import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { retry, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    public _allStates: BehaviorSubject<any> = new BehaviorSubject(null);


    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        private _snackBar: MatSnackBar,
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

    get userStates$(): Observable<any> {
        return this._allStates.asObservable();
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

    storeStateSupplierData(): Observable<any> {
        sessionStorage.removeItem('storeStateSupplierData');
        let params = {
            stores_suppliers_states: true
        }
        return this._httpClient.get(environment.dashboard, { params: params }).pipe(
            retry(3),
            tap((response: any) => {
                sessionStorage.setItem('storeStateSupplierData', JSON.stringify(response));
                this._allStates.next(response);
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
    // Common get Calls
    getDashboardData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.dashboard, {
            params: params
        }).pipe(retry(3));
    };
    // Post Dashboard Calls
    postDashboardData(payload) {
        return this._httpClient.post(environment.dashboard,
            payload);
    };
    // Common Update Call
    updateDashboardData(payload) {
        return this._httpClient.put(
            environment.dashboard, payload);
    };
    getStatusValue(statusValues: any) {
        let statusColor = '';
        let statusValue = '';
        let status = statusValues?.split('|');
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
    // Get Files
    getFiles(payload) {
        // let payload = {
        //     files_fetch: true,
        //     path: path
        //   };
        return this._httpClient.post(environment.products,
            payload);
    };
    // Upload Multiple Files
    uploadMultipleMediaFiles(files) {
        // files =>
        // image_file: string;
        // image_path: string;
        let payload = {
            files: files,
            upload_multiple_files: true
        }
        return this._httpClient.post(
            environment.products, payload);
    };

    // Common File Check It exist or not
    getCallForFileCheckData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.smartart, {
            params: params
        }).pipe(retry(3));
    };
    // encoded Data
    getEncodedData(data: any): HttpParams {
        let params = new HttpParams();

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                params = params.append(key, data[key]);
            }
        }

        return params;
    }

    // checkImageExist
    checkImageExist(url) {
        return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.src = url;

            if (img.complete) {
                resolve();
            } else {
                img.onload = () => {
                    resolve();
                };
                img.onerror = () => {
                    reject();
                };
            }
        });
    }
    validateInput(event: any): void {
        const inputValue = event.target.value;
        if (inputValue == '-') {
            event.target.value = 0;
        }
        if (inputValue < 0) {
            // Reset the input value to 0 or show an error message
            event.target.value = 0;
        }
        // You can add more logic if needed
    }
    convertToSlug = title => {
        return title
            .toLowerCase()
            .replace(/[^\w ]+/g, "")
            .replace(/ +/g, "-");
    };
    replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
                obj[key] = obj[key]?.replace(/'/g, "''");
            }
        }
        return obj;
    }
    replaceNullSpaces(obj: { [key: string]: any }): any {
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
                obj[key] = obj[key]?.replace(/(^|\s)(\s|$)/g, '');
            }
        }
        return obj;
    }
    getSessionUserDetails() {
        const user = JSON.parse(localStorage.getItem('userDetails'));
        return user;
    }
    isValidEmail(email: string): boolean {
        // Regular expression for a basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailRegex.test(email);
    }
    // convertHoursToDays
    convertHoursToDays(hours) {
        if (hours >= 24) {
            // Convert hours to days
            const days = Math.floor(hours / 24);
            return `${days} days`;
        } else {
            // Show in hours if less than 1 day
            return `${Math.floor(hours)} hours`;
        }
    }
    showConfirmation(message: string, callback: (confirmed: boolean) => void) {
        const result = window.confirm(message);
        callback(result);
    }
}
