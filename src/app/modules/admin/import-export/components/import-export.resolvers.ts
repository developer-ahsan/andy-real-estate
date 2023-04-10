import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable } from 'rxjs';
import { ImportExportService } from './import-export.service';

@Injectable({
    providedIn: 'root'
})
export class EmployeesListsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _ImportExportService: ImportExportService
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._ImportExportService.getAllEmployees();
    }
}
@Injectable({
    providedIn: 'root'
})
export class FlpsLoginResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _ImportExportService: ImportExportService, private _authService: AuthService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        let user = this._authService.parseJwt(this._authService.accessToken);
        let params = {
            login_check: true,
            email: user.email
        }
        return this._ImportExportService.checkFLPSLogin(params);
    }
}
@Injectable({
    providedIn: 'root'
})
export class ImportExportStoresResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _ImportExportService: ImportExportService, private _authService: AuthService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._ImportExportService.getAllStores();
    }
}
@Injectable({
    providedIn: 'root'
})
export class SmartArtUsersResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _ImportExportService: ImportExportService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._ImportExportService.getSmartArtUsers();
    }
}



