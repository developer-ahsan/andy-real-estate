import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { FLPSService } from './flps.service';

@Injectable({
    providedIn: 'root'
})
export class EmployeesListsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _flpsService: FLPSService
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
        return this._flpsService.getAllEmployees();
    }
}
// @Injectable({
//     providedIn: 'root'
// })
// export class SuppliersListsResolver implements Resolve<any>
// {
//     /**
//      * Constructor
//      */
//     constructor(private _systemService: SystemService) {
//     }

//     // -----------------------------------------------------------------------------------------------------
//     // @ Public methods
//     // -----------------------------------------------------------------------------------------------------

//     /**
//      * Resolver
//      *
//      * @param route
//      * @param state
//      */
//     resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
//         return this._systemService.getAllSuppliers();
//     }
// }




