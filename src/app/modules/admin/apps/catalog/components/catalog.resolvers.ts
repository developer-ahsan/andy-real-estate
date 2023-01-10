import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable } from 'rxjs';
import { CatalogService } from './catalog.service';

@Injectable({
    providedIn: 'root'
})
export class EmployeesListsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _UsersService: CatalogService
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
        return this._UsersService.getAllEmployees();
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
    constructor(private _CatalogService: CatalogService, private _authService: AuthService) {
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
        return this._CatalogService.checkFLPSLogin(params);
    }
}
@Injectable({
    providedIn: 'root'
})
export class AdminStoresResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _CatalogService: CatalogService, private _authService: AuthService) {
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
        return this._CatalogService.getAdminStores();
    }
}
@Injectable({
    providedIn: 'root'
})
export class AdminCompaniesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _CatalogService: CatalogService) {
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
        return this._CatalogService.getAdminCompanies();
    }
}



