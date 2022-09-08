import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { Item } from 'app/modules/admin/apps/file-manager/stores.types';

@Injectable({
    providedIn: 'root'
})
export class FileManagerItemsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _fileManagerService: FileManagerService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Item[]> {
        return this._fileManagerService.getAllStores();
    }
}

@Injectable({
    providedIn: 'root'
})
export class SupplierResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _fileManagerService: FileManagerService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Item[]> {
        return this._fileManagerService.getAllSuppliers();
    }
}
@Injectable({
    providedIn: 'root'
})
export class StoreDetailsByID implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _fileManagerService: FileManagerService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Item[]> {
        return this._fileManagerService.getStoreByStoreId(route.params.id);
    }
}