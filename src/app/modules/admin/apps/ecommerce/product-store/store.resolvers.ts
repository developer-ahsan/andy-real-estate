import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { InventoryPagination, ProductsList } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { ProductStoreService } from './store.service';

@Injectable({
    providedIn: 'root'
})
export class ProductsListsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _productStoreService: ProductStoreService) {
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
        return this._productStoreService.getProductsList(1);
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
    constructor(private _productStoreService: InventoryService) {
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
        return this._productStoreService.getAllStores();
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
    constructor(private _productStoreService: InventoryService) {
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
        return this._productStoreService.getAllSuppliers();
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
    constructor(private _productStoreService: InventoryService) {
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
        return this._productStoreService.getProductDescription(id);
    }
}

