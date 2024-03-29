import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ReportsService } from './reports.service';

@Injectable({
    providedIn: 'root'
})
export class SuppliersListsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _reportService: ReportsService) {
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
        return this._reportService.getAllvendorsSuppliers();
    }
}
// get Supplier BYID
@Injectable({
    providedIn: 'root'
})
export class SuppliersByIdResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _reportService: ReportsService) {
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
        return this._reportService.getVendorsSupplierById(Number(route.params.id));
    }
}

// Get States
@Injectable({
    providedIn: 'root'
})
export class CurrentDateResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _reportService: ReportsService) {
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
        return this._reportService.getCurrentDate();
    }
}
// Get Stores
@Injectable({
    providedIn: 'root'
})
export class StoresResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _reportService: ReportsService) {
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
        return this._reportService.getStores();
    }
}
// Get PromoCodes
@Injectable({
    providedIn: 'root'
})
export class PromoCodesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _reportService: ReportsService) {
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
        return this._reportService.getPromoCodes();
    }
}


