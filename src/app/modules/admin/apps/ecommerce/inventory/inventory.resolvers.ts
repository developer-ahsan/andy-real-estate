import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { InventoryPagination, ProductsList } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';

@Injectable({
    providedIn: 'root'
})
export class ProductsListsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _inventoryService: InventoryService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProductsList[]> {
        return this._inventoryService.getProductsList(1);
    }
}

@Injectable({
    providedIn: 'root'
})
export class StoresListResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _inventoryService: InventoryService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProductsList[]> {
        return this._inventoryService.getAllStores();
    }
}

@Injectable({
    providedIn: 'root'
})
export class SuppliersListResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _inventoryService: InventoryService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProductsList[]> {
        return this._inventoryService.getAllSuppliers();
    }
}

@Injectable({
    providedIn: 'root'
})
export class ProductDescriptionResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _inventoryService: InventoryService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProductsList[]> {
        const id = route.params['id'];
        return this._inventoryService.getProductByProductId(id);
    }
}

@Injectable({
    providedIn: 'root'
})
export class SystemDistributorCodes implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _inventoryService: InventoryService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProductsList[]> {
        return this._inventoryService.getSystemDistributorCodes();
    }
}




