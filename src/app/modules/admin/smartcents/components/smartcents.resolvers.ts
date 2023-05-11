import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SmartCentsService } from './smartcents.service';

@Injectable({
    providedIn: 'root'
})
export class SmartCentStoresResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _SmartCentsService: SmartCentsService
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
        let param = {
            stores_list: true
        }
        return this._SmartCentsService.getSmartCentsStores(param);
    }
}



