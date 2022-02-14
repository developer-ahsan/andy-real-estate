import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { AddFeature, AddPackage, CaseDimensionObj, CaseQuantityObj, FlatRateShippingObj, InventoryBrand, InventoryCategory, InventoryPagination, InventoryTag, InventoryVendor, NetCostUpdate, PhysicsObj, ProductsList, UpdateMargin, videoObj } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { environment } from 'environments/environment';
import { productDescription } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { AuthService } from 'app/core/auth/auth.service';

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
            title: 'Colors',
            icon: 'mat_outline:color_lens',
        },
        {
            id: 6,
            title: 'Features',
            icon: 'mat_outline:checklist'
        },
        {
            id: 7,
            title: 'Default Margins',
            icon: 'mat_outline:settings',
        },
        {
            id: 8,
            title: 'Pack & Accessories',
            icon: 'mat_outline:checklist',
        },
        {
            id: 9,
            title: 'Default Images',
            icon: 'mat_outline:image',
        },
        {
            id: 10,
            title: 'Video',
            icon: 'mat_solid:video_settings',
        },
        {
            id: 11,
            title: 'Artwork Template',
            icon: 'heroicons_outline:template',
        },
        {
            id: 12,
            title: 'Product Reviews',
            icon: 'mat_outline:reviews',
        },
        {
            id: 13,
            title: 'Warehouse Options',
            icon: 'mat_outline:house_siding',
        },
        {
            id: 14,
            title: 'Core Products',
            icon: 'mat_outline:group_work',
        },
        {
            id: 15,
            title: 'Update History',
            icon: 'mat_outline:history',
        },
        {
            id: 16,
            title: 'Order History',
            icon: 'mat_outline:history',
        },
        {
            id: 17,
            title: 'Internal Notes',
            icon: 'mat_outline:notes',
        },
        {
            id: 18,
            title: 'Duplicate',
            icon: 'heroicons_outline:duplicate'
        },
        {
            id: 19,
            title: 'Imprints',
            icon: 'mat_outline:checklist',
        },
        // {
        //     id: 13,
        //     title: 'Dietary Information',
        //     icon: 'mat_outline:info',
        // },
        // {
        //     id: 14,
        //     title: 'Lisencing Term',
        //     icon: 'mat_outline:picture_in_picture',
        // },
    ]

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {
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

    getCaseQuantities(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                case_quantity: true,
                physics: true,
                product_id: productId
            }
        });
    }

    getPhysicsAndDimension(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                physics: true,
                case_dimension: true,
                product_id: productId
            }
        });
    }

    getColors(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                color: true,
                product_id: productId
            }
        });
    }

    getFeatures(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                feature: true,
                product_id: productId
            }
        });
    }

    getFeaturesSupplierAndType(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                feature: true,
                type: true
            }
        });
    }

    /**
   * Add feature
   */
    addFeature(payload: AddFeature) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            `${environment.products}`, payload, { headers });
    }

    getAllPackages(size?: number, pageNo?: number): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                packaging: true,
                page: pageNo === 0 ? 1 : pageNo,
                size: size
            }
        });
    }

    getPackageByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                packaging: true,
                product_id: productId
            }
        });
    }

    getNetCost(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                net_cost: true,
                cost: true,
                product_id: productId
            }
        });
    }

    getDiscountCodes(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                net_cost: true,
                discount_code: true,
                product_id: productId
            }
        });
    }

    /**
   * UPDATE net cost
   */
    updateNetCost(payload: NetCostUpdate) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            `${environment.products}`, payload, { headers });
    }

    /**
  * UPDATE margins
  */
    updateMargins(payload: UpdateMargin) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            `${environment.products}`, payload, { headers });
    }

    /**
  * Post package
  */
    addPackage(payload: AddPackage) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            `${environment.products}`, payload, { headers });
    }

    getAllStores(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.stores, {
            params: {
                list: true,
                size: 500
            }
        });
    }

    getMarginsByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                margin: true,
                product_id: productId
            }
        });
    }

    getVideoByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                video: true,
                product_id: productId
            }
        });
    }

    getVideos(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                video: true
            }
        });
    }

    getArtworkTemplateByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                artwork_template: true,
                product_id: productId
            }
        });
    }

    getReviewByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                review: true,
                product_id: productId
            }
        });
    }

    getWarehouseByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                warehouse: true,
                product_id: productId
            }
        });
    }

    getCoresByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                core: true,
                products: true,
                product_id: productId
            }
        });
    }

    getAvailableCoresProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                core: true,
                available_core: true,
                product_id: productId
            }
        });
    }

    getImprints(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                product_id: productId
            }
        });
    }

    getOrderHistoryByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                order_history: true,
                product_id: productId
            }
        });
    }

    getUpdateHistoryByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                update_history: true,
                product_id: productId
            }
        });
    }

    getCommentByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                comment: true,
                product_id: productId
            }
        });
    }

    getCommentators() {
        return this._httpClient.get(environment.customerList, {
            params: {
                commentor: true
            }
        })
    }

    /**
   * UPDATE description
   */
    updatePhysicsAndDescription(payload: productDescription) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            `${environment.products}`, payload, { headers });
    }

    /**
   * UPDATE cash-back
   */
    updateFlatRateShipping(payload: FlatRateShippingObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            `${environment.products}`, payload, { headers });
    }

    /**
   * UPDATE physics
   */
    updatePhysics(payload: PhysicsObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            `${environment.products}`, payload, { headers });
    }

    /**
   * UPDATE case dimension
   */
    updateCaseDimensions(payload: CaseDimensionObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            `${environment.products}`, payload, { headers });
    }

    /**
   * UPDATE case quantity
   */
    updateCaseQuantity(payload: CaseQuantityObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            `${environment.products}`, payload, { headers });
    }

    /**
   * UPDATE Video
   */
    updateVideo(payload: videoObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            `https://consolidus-staging.azurewebsites.net/api/products`, payload, { headers });
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
