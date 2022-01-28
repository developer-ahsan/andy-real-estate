import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { InventoryBrand, InventoryCategory, InventoryPagination, InventoryTag, InventoryVendor, ProductsList } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    // Private
    private _brands: BehaviorSubject<InventoryBrand[] | null> = new BehaviorSubject(null);
    private _categories: BehaviorSubject<InventoryCategory[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<InventoryPagination | null> = new BehaviorSubject(null);
    private _product: BehaviorSubject<ProductsList | null> = new BehaviorSubject(null);
    private _products: BehaviorSubject<ProductsList[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<InventoryTag[] | null> = new BehaviorSubject(null);
    private _vendors: BehaviorSubject<InventoryVendor[] | null> = new BehaviorSubject(null);
    public navigationLabels = [
        {
            id: 1,
            title: 'Store Versions',
            icon: 'mat_outline:sd_storage'
        },
        {
            id: 2,
            title: 'Name & Description',
            icon: 'mat_outline:details',
        },
        {
            id: 3,
            title: 'Physics & Shipping',
            icon: 'mat_outline:local_shipping',
        },
        {
            id: 4,
            title: 'Net Cost',
            icon: 'mat_outline:price_change'
        },
        {
            id: 5,
            title: 'Imprints',
            icon: 'mat_outline:settings',
        },
        {
            id: 6,
            title: 'Colors',
            icon: 'mat_outline:color_lens',
        },
        {
            id: 7,
            title: 'Features',
            icon: 'mat_outline:checklist'
        },
        {
            id: 8,
            title: 'Default Images',
            icon: 'mat_outline:image',
        },
        {
            id: 9,
            title: 'Pack & Accessories',
            icon: 'mat_outline:checklist',
        }
    ]

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for brands
     */
    get brands$(): Observable<InventoryBrand[]> {
        return this._brands.asObservable();
    }

    /**
     * Getter for categories
     */
    get categories$(): Observable<InventoryCategory[]> {
        return this._categories.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<InventoryPagination> {
        return this._pagination.asObservable();
    }

    /**
     * Getter for product
     */
    get product$(): Observable<ProductsList> {
        return this._product.asObservable();
    }

    /**
     * Getter for products
     */
    get products$(): Observable<ProductsList[]> {
        return this._products.asObservable();
    }

    /**
     * Getter for tags
     */
    get tags$(): Observable<InventoryTag[]> {
        return this._tags.asObservable();
    }

    /**
     * Getter for vendors
     */
    get vendors$(): Observable<InventoryVendor[]> {
        return this._vendors.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    getProductsList(size, pageNumber, keyword?: string): Observable<ProductsList[]> {
        const search = keyword ? keyword : '';
        return this._httpClient.get<ProductsList[]>(`${environment.products}?list=true&size=${size}&page=${pageNumber}&keyword=${search}`).pipe(
            tap((products) => {
                this._products.next(products);
            })
        );
    }

    getProductByProductId(productId): Observable<ProductsList[]> {
        return this._httpClient.get<ProductsList[]>(environment.products, {
            params: {
                list: true,
                product_id: productId
            }
        });
    }

    getProductDescription(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                description: true,
                product_id: productId
            }
        });
    }

    /**
     * Get products
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
    getProducts(page: number = 0, size: number = 10, sort: string = 'name', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: InventoryPagination; products: ProductsList[] }> {
        return this._httpClient.get<{ pagination: InventoryPagination; products: ProductsList[] }>('api/apps/ecommerce/inventory/products', {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search
            }
        }).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._products.next(response.products);
            })
        );
    }

}
