import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable } from 'rxjs';
import { SmartArtService } from './smartart.service';

@Injectable({
    providedIn: 'root'
})
export class EmployeesListsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _SmartArtService: SmartArtService
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
        return this._SmartArtService.getAllEmployees();
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
    constructor(private _SmartArtService: SmartArtService, private _authService: AuthService) {
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
        return this._SmartArtService.checkFLPSLogin(params);
    }
}
@Injectable({
    providedIn: 'root'
})
export class SmartArtStoresResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _SmartArtService: SmartArtService, private _authService: AuthService) {
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
        return this._SmartArtService.getSmartArtStores();
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
    constructor(private _SmartArtService: SmartArtService) {
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
        return this._SmartArtService.getSmartArtUsers();
    }
}



