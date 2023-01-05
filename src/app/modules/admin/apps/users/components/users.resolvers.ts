import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable } from 'rxjs';
import { UsersService } from './users.service';

@Injectable({
    providedIn: 'root'
})
export class EmployeesListsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _UsersService: UsersService
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
    constructor(private _UsersService: UsersService, private _authService: AuthService) {
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
        return this._UsersService.checkFLPSLogin(params);
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
    constructor(private _UsersService: UsersService, private _authService: AuthService) {
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
        return this._UsersService.getAdminStores();
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
    constructor(private _UsersService: UsersService) {
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
        return this._UsersService.getAdminCompanies();
    }
}



