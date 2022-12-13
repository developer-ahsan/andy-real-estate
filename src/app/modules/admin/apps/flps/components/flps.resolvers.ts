import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

// @Injectable({
//     providedIn: 'root'
// })
// export class StoresListsResolver implements Resolve<any>
// {
//     /**
//      * Constructor
//      */
//     constructor() {
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
//         return this._systemService.getAllStores();
//     }
// }
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




