import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { OrdersBrand, OrdersCategory, OrdersList, OrdersPagination, OrdersProduct, OrdersTag, OrdersVendor } from 'app/modules/admin/apps/orders/orders-components/orders.types';

@Injectable({
    providedIn: 'root'
})
export class StoresListResolver implements Resolve<any>
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._orderService.getAllStores();
    }
}
// Order Details
@Injectable({
    providedIn: 'root'
})

export class OrderDetailsResolver implements Resolve<any>
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        let params = {
            main: true,
            order_id: route.params.id
        }
        return this._orderService.getOrderMainDetail(params);
    }
}
// Order Line
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
        let params = {
            list: true,
            size: 20,
            page: 1,
            search_order_id: 0,
            store_id: 0,
            range_start: '',
            range_end: '',
            order_type: 0
        }
        return this._orderService.getOrders(params);
    }
}
