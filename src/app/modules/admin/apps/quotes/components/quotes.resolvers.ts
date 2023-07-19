import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { QuotesService } from './quotes.service';

@Injectable({
    providedIn: 'root'
})
export class SuppliersListsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _vendorService: QuotesService) {
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
        return
        // this._vendorService.getAllvendorsSuppliers();
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
    constructor(private _vendorService: QuotesService) {
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
        return
        // this._vendorService.getVendorsSupplierById(Number(route.params.id));
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
    constructor(private _vendorService: QuotesService) {
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
        return
        // this._vendorService.getVendorsStates();
    }
}
// Quote By ID Details
@Injectable({
    providedIn: 'root'
})
export class QuoteDetailsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _qouteService: QuotesService) {
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
            main: true,
            order_id: route.params.id
        }
        return this._qouteService.getQuoteMainDetail(params);
    }
}


