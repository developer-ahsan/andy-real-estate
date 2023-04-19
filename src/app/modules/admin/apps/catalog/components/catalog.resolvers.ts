import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable } from 'rxjs';
import { CatalogService } from './catalog.service';

@Injectable({
    providedIn: 'root'
})
export class ColorsResolver implements Resolve<any>
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
        return this._CatalogService.getAdminColors();
    }
}
@Injectable({
    providedIn: 'root'
})
export class AdminSuppliersResolver implements Resolve<any>
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
        return this._CatalogService.getAdminSuppliers();
    }
}


@Injectable({
    providedIn: 'root'
})
export class SizesResolver implements Resolve<any>
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
        return this._CatalogService.getAdminSizes();
    }
}

@Injectable({
    providedIn: 'root'
})
export class ImprintsResolver implements Resolve<any>
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
        return this._CatalogService.getAdminDecorators();
    }
}
