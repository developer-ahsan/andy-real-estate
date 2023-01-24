import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { VendorsService } from './vendors.service';

@Injectable({
    providedIn: 'root'
})
export class SuppliersListsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _vendorService: VendorsService) {
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
        return this._vendorService.getAllvendorsSuppliers();
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
    constructor(private _vendorService: VendorsService) {
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
        return this._vendorService.getVendorsSupplierById(Number(route.params.id));
    }
}

// Get States
@Injectable({
    providedIn: 'root'
})
export class StatesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _vendorService: VendorsService) {
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
        return this._vendorService.getVendorsStates();
    }
}


