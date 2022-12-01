import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SystemService } from './system.service';

@Injectable({
    providedIn: 'root'
})
export class StoresListsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _systemService: SystemService) {
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
        return this._systemService.getAllStores();
    }
}




