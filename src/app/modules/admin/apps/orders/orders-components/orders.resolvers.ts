import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { OrdersBrand, OrdersCategory, OrdersList, OrdersPagination, OrdersProduct, OrdersTag, OrdersVendor } from 'app/modules/admin/apps/orders/orders-components/orders.types';

@Injectable({
    providedIn: 'root'
})
export class OrdersBrandsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _orderService: OrdersService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OrdersBrand[]> {
        return this._orderService.getBrands();
    }
}
@Injectable({
    providedIn: 'root'
})
export class OrderProductsLineResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _orderService: OrdersService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._orderService.getOrderProducts(route.params.id);
    }
}

@Injectable({
    providedIn: 'root'
})
export class OrdersCategoriesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _orderService: OrdersService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OrdersCategory[]> {
        return this._orderService.getCategories();
    }
}

@Injectable({
    providedIn: 'root'
})
export class OrdersProductResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _orderService: OrdersService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OrdersProduct> {
        return this._orderService.getProductById(route.paramMap.get('id'))
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
export class OrdersProductsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _orderService: OrdersService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: OrdersPagination; products: OrdersProduct[] }> {
        return this._orderService.getProducts();
    }
}

@Injectable({
    providedIn: 'root'
})
export class OrdersTagsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _orderService: OrdersService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OrdersTag[]> {
        return this._orderService.getTags();
    }
}

@Injectable({
    providedIn: 'root'
})
export class OrdersVendorsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _orderService: OrdersService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OrdersVendor[]> {
        return this._orderService.getVendors();
    }
}

@Injectable({
    providedIn: 'root'
})
export class OrdersListResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _orderService: OrdersService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OrdersList[]> {
        return this._orderService.getOrders(10, 1);
    }
}