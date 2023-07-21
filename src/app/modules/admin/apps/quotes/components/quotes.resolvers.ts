import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { QuotesService } from './quotes.service';

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
            single_cart: true,
            cart_id: route.params.id
        }
        return this._qouteService.getQuoteMainDetail(params);
    }
}

// Quote By ID Details
@Injectable({
    providedIn: 'root'
})
export class QuoteCommentResolver implements Resolve<any>
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
            cart_comments: true,
            cart_id: route.params.id
        }
        return this._qouteService.getQuoteComments(params);
    }
}


