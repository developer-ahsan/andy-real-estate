import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { InitialData } from 'app/app.types';
import { environment } from 'environments/environment';
import { DashboardsService } from './modules/admin/dashboards/dashboard.service';
import { AuthService } from './core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class InitialDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Use this resolver to resolve initial mock-api for the application
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<InitialData> {
        // Fork join multiple API endpoint calls to wait all of them to finish
        return forkJoin([
            this._httpClient.get<any>('api/common/messages'),
            this._httpClient.get<any>('api/common/navigation'),
            this._httpClient.get<any>('api/common/notifications'),
            this._httpClient.get<any>('api/common/shortcuts'),
            this._httpClient.get<any>('api/common/user')
        ]).pipe(
            map(([messages, navigation, notifications, shortcuts, user]) => ({
                messages,
                navigation: {
                    compact: navigation.compact,
                    default: navigation.default,
                    futuristic: navigation.futuristic,
                    horizontal: navigation.horizontal
                },
                notifications,
                shortcuts,
                user
            })
            )
        );
    }
}

@Injectable({
    providedIn: 'root'
})
export class StoresResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _dashboardService: DashboardsService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const storedData = sessionStorage.getItem('storesdata');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            this._dashboardService._allStores.next(parsedData);
            return of(parsedData);
        } else {
            return this._dashboardService.getStoresData();
        }
    }
}
@Injectable({
    providedIn: 'root'
})
export class SuppliersResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _dashboardService: DashboardsService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const supplierssData = sessionStorage.getItem('suppliersdata');
        if (supplierssData) {
            const parsedData = JSON.parse(supplierssData);
            this._dashboardService._allSuppliers.next(parsedData);
            return of(parsedData);
        } else {
            return this._dashboardService.getSuppliersData();
        }
    }
}

// Get User Roles
@Injectable({
    providedIn: 'root'
})
export class UserRoleResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _dashboardService: DashboardsService,
        private _authService: AuthService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        let user = this._authService.parseJwt(this._authService.accessToken);
        return this._dashboardService.getUserRole(user.email);
    }

}


@Injectable({
    providedIn: 'root'
})
export class StoreStateSupplierResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _dashboardService: DashboardsService,
        private _authService: AuthService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const storeStateSupplierData = sessionStorage.getItem('storeStateSupplierData');
        if (storeStateSupplierData) {
            const parsedData = JSON.parse(storeStateSupplierData);
            this._dashboardService._allStates.next(parsedData);
            return of(parsedData);
        } else {
            return this._dashboardService.storeStateSupplierData();
        }
    }

}

