import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CustomersBrand, CustomersCategory, CustomersPagination, CustomersProduct, CustomersTag, CustomersVendor } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { CustomersService } from './orders.service';

@Injectable({
    providedIn: 'root'
})
export class GetCustomer implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _customerService: CustomersService,
        private _router: Router
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CustomersProduct[]> {
        return this._customerService.getCustomer(route.paramMap.get('id'));
    }
}

@Injectable({
    providedIn: 'root'
})
export class GetCustomersList implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _customerService: CustomersService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CustomersProduct[]> {
        return this._customerService.getCustomersList(this._customerService._searchKeyword);
    }
};
