import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable } from 'rxjs';
import { RapidBuildService } from './rapid-build.service';

@Injectable({
    providedIn: 'root'
})
export class EmployeesListsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _RapidBuildService: RapidBuildService
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
        return this._RapidBuildService.getAllEmployees();
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
    constructor(private _RapidBuildService: RapidBuildService, private _authService: AuthService) {
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
        return this._RapidBuildService.checkFLPSLogin(params);
    }
}
@Injectable({
    providedIn: 'root'
})
export class RapidBuildStoresResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _RapidBuildService: RapidBuildService, private _authService: AuthService) {
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
        let params = {
            stores: true
        }
        return this._RapidBuildService.getRapidBuildStores(params);
    }
}
@Injectable({
    providedIn: 'root'
})
export class RapidBuildStatusesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _RapidBuildService: RapidBuildService) {
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
        return this._RapidBuildService.getRapidBuildStatus();
    }
}



