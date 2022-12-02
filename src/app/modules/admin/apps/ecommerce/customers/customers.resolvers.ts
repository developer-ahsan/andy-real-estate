import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { CustomersBrand, CustomersCategory, CustomersPagination, CustomersProduct, CustomersTag, CustomersVendor } from 'app/modules/admin/apps/ecommerce/customers/customers.types';

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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CustomersProduct> {
        return this._customerService.getCustomerById(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested product is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
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
        return this._customerService.getCustomersList();
    }
};
