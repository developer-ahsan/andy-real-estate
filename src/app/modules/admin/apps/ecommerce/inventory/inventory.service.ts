import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, retry, switchMap, tap } from 'rxjs/operators';
import { AddCore, AddDuplicateImprint, AddFeature, AddPackage, addRapidBuildStoreProduct, AddStoreProduct, add_setup_charge, CaseDimensionObj, CaseQuantityObj, Comment, CreateProduct, DeleteComment, displayOrderObj, duplicateObj, featureUpdateObj, FlatRateShippingObj, Imprint, InventoryBrand, InventoryCategory, InventoryPagination, InventoryTag, InventoryVendor, Licensing, MultiImprint, NetCostUpdate, overlapUpdateObj, PhysicsObj, physicsUpdateObject, PostColor, priceInclusionObj, Product, ProductColor, ProductFeature, ProductLicensing_Term, ProductNetCost, ProductsList, updateAllowRun, UpdateArtwork, updateColorObj, updateImprintObj, UpdateMargin, updatePackageObj, UpdateProductDescription, updateProductSize, UpdateProductStatus, updatePromostandardObj, updateSize, videoObj, Warehouse } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { environment } from 'environments/environment';
import { productDescription } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { AuthService } from 'app/core/auth/auth.service';
import { navigations } from 'app/modules/admin/apps/ecommerce/inventory/navigations';

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    // Imprints
    public setup = null;
    public run = null;

    public selectedIndex = null;
    public productSearchFilter = {
        product_id: null,
        term: null,
        supplier: null,
        store: null
    };
    public standardImprints: any;
    // Private
    private _brands: BehaviorSubject<InventoryBrand[] | null> = new BehaviorSubject(null);
    private _categories: BehaviorSubject<InventoryCategory[] | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<InventoryPagination | null> = new BehaviorSubject(null);
    private _product: BehaviorSubject<ProductsList | null> = new BehaviorSubject(null);
    private _distributionCodes: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _products: BehaviorSubject<ProductsList[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<InventoryTag[] | null> = new BehaviorSubject(null);
    private _vendors: BehaviorSubject<InventoryVendor[] | null> = new BehaviorSubject(null);
    private _suppliers: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _productLicensingTerms: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _stores: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _imprintMethods: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _imprintLocations: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    public navigationLabels = navigations;
    opts = [];

    public duplicateCheck: boolean = false;
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
    };

    /**
     * Getter for categories
     */
    get categories$(): Observable<InventoryCategory[]> {
        return this._categories.asObservable();
    };

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<InventoryPagination> {
        return this._pagination.asObservable();
    };

    /**
     * Getter for product
     */
    get product$(): Observable<any> {
        return this._product.asObservable();
    }
    // Distribution Codes
    get distributionCodes$(): Observable<any> {
        return this._distributionCodes.asObservable();
    }
    /**
     * Getter for products
     */
    get products$(): Observable<ProductsList[]> {
        return this._products.asObservable();
    };

    /**
     * Getter for tags
     */
    get tags$(): Observable<InventoryTag[]> {
        return this._tags.asObservable();
    };

    /**
     * Getter for vendors
     */
    get vendors$(): Observable<InventoryVendor[]> {
        return this._vendors.asObservable();
    };

    // get Suppliers$(): Observable<any[]> {
    //     return this._suppliers.asObservable();
    // };

    // get stores$(): Observable<any[]> {
    //     return this._stores.asObservable();
    // };

    get productLicensingTerms$(): Observable<any[]> {
        return this._productLicensingTerms.asObservable();
    };

    get imprintMethods$(): Observable<any[]> {
        return this._imprintMethods.asObservable();
    };
    get imprintLocations$(): Observable<any[]> {
        return this._imprintLocations.asObservable();
    };

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    getProductsList(page): Observable<ProductsList[]> {
        return this._httpClient.get<ProductsList[]>(environment.products, {
            params: {
                list: true,
                page: page,
                size: 20
            }
        }).pipe(
            tap((products) => {
                this._products.next(products);
            })
        );
    };

    getProductsListing(page): Observable<ProductsList[]> {
        return this._httpClient.get<ProductsList[]>(environment.products, {
            params: {
                list: true,
                page: page,
                size: 20
            }
        })
    };

    getProductsByPagination(page: number): Observable<ProductsList[]> {
        return this._httpClient.get<ProductsList[]>(environment.products, {
            params: {
                list: true,
                size: 20,
                page: page
            }
        });
    };

    getProductsForExporting(size): Observable<ProductsList[]> {
        return this._httpClient.get<ProductsList[]>(environment.products, {
            params: {
                export: true
            }
        });
    };

    getProductByProductId(productId): Observable<ProductsList[]> {
        return this._httpClient.get<ProductsList[]>(environment.products, {
            params: {
                list: true,
                is_details: true,
                product_id: productId
            }
        }).pipe(
            tap((response: any) => {
                this._product.next(response);
            })
        )
    };

    checkIfProductExist(productNumber, productName, supplierId): Observable<ProductsList[]> {
        return this._httpClient.get<ProductsList[]>(environment.products, {
            params: {
                check: true,
                product_number: productNumber,
                product_name: productName,
                supplier_id: supplierId
            }
        });
    };

    searchProductKeywords(keyword): Observable<ProductsList[]> {
        return this._httpClient.get<ProductsList[]>(environment.products, {
            params: {
                list: true,
                keyword: keyword.replace("'", "''")
            }
        });
    };

    getProductDescription(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                description_product: true,
                product_id: productId
            }
        })
    };

    getCaseQuantities(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                case_quantity: true,
                physics: true,
                product_id: productId
            }
        });
    };

    getPhysicsAndDimension(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                physics: true,
                case_dimension: true,
                product_id: productId
            }
        });
    };

    getFobLocation(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                physics: true,
                fob_location: true,
                product_id: productId
            }
        });
    };

    getColors(productId, page): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                color: true,
                product_id: productId,
                page: page,
                size: 20
            }
        });
    };

    getAllColors(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                color: true,
                size: 1000
            }
        });
    };

    getSearchedColors(value: string): Observable<any[]> {
        var listOfColors = this._httpClient.get(environment.products, {
            params: {
                colors: true,
                color_name: value,
                size: 20
            }
        }).pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(
                (data: any) => {
                    return (
                        data.length != 0 ? data as any[] : [{ "Result": "No Record Found" } as any]
                    );
                }
            ));
        return listOfColors;
    };

    getColorsAndSize(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                color_size: true,
                product_id: productId
            }
        });
    };

    getFeatures(productId, page): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                feature: true,
                product_id: productId,
                size: 20,
                page: page
            }
        });
    };

    getFeaturesSupplierAndType(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                feature: true,
                type: true
            }
        });
    };

    getAllPackages(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                packaging: true,
                product_id: productId,
                size: 20
            }
        });
    };

    getPackageByKeyword(keyword: string): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                packaging: true,
                keyword: keyword,
                size: 20
            }
        });
    };

    getPackageByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                packaging: true,
                product_id: productId
            }
        });
    };

    getNetCost(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                net_cost: true,
                cost: true,
                product_id: productId
            }
        });
    };

    getDiscountCodes(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                net_cost: true,
                discount_code: true,
                product_id: productId
            }
        });
    };

    getCoOp(companyId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.stores, {
            params: {
                coop_program: true,
                bln_active: 1,
                company_id: companyId
            }
        });
    };

    /**
    * Get history by product id
    */
    getHistoryProductId(productId: string, pageNo) {
        return this._httpClient.get(environment.products, {
            params: {
                update_history_v2: true,
                product_id: productId,
                size: 20,
                page: pageNo
            }
        })
    }

    // Made stores observable
    getAllStores(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                stores_list: true,
                size: 2000
            }
        }).pipe(
            tap((response: any) => {
                this._stores.next(response);
            })
        );
    };
    getAllActiveStores(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: params
        }).pipe(
            tap((response: any) => {
                this._stores.next(response);
            })
        );
    };
    getProductsBySupplierId(supplierId: string): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                list: true,
                size: 20,
                supplier_id: supplierId
            }
        });
    };

    getProductsByStoreId(storeId: string): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                list: true,
                size: 20,
                store_id: storeId
            }
        });
    };

    // Made suppliers observable
    getAllSuppliers(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                supplier: true,
                bln_active: 1,
                size: 2000
            }
        }).pipe(
            tap((response: any) => {
                this._suppliers.next(response);
            })
        );
    };

    getSystemDistributorCodes(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                product_level_distributor: true
            }
        }).pipe(
            tap((codes) => {
                codes["data"].push({
                    distrDiscount: -1,
                    distrDiscountCode: "COST"
                });
                this._distributionCodes.next(codes);
            })
        );
    }

    getMarginsByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                margin: true,
                product_id: productId
            }
        });
    };

    getVideoByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                video: true,
                product_id: productId
            }
        });
    };

    getVideos(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                video: true
            }
        });
    };

    getArtworkTemplateByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                artwork_template: true,
                product_id: productId
            }
        });
    };

    getReviewByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                review: true,
                product_id: productId
            }
        });
    };

    getReviewStore(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                review: true,
                store: true,
                product_id: productId
            }
        });
    };

    getReviewByStoreAndProductId(productId, storeId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                review: true,
                store_id: storeId,
                product_id: productId
            }
        });
    };

    getWarehouseByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                warehouse: true,
                product_id: productId
            }
        });
    };

    getWarehousesShippinOptions(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                warehouse_delivery: true
            }
        });
    };

    getCoresByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                core: true,
                products: true,
                product_id: productId
            }
        });
    };

    getAvailableCoresProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                main_core: true,
                product_id: productId
            }
        });
    };

    getCategoriesByCoreId(coreId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                core: true,
                categories: true,
                core_id: coreId
            }
        });
    };

    getSubCategoriesByCoreId(subCategoryId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                core: true,
                sub_categories: true,
                core_category_id: subCategoryId
            }
        });
    };

    getImprints(productId, page?: number): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                product_id: productId,
                size: 100,
                page: page
            }
        });
    };

    getAllImprints(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                product_id: productId,
                size: 200
            }
        });
    };

    getOverlapData(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                over_lap: true,
                product_id: productId,
                size: 1000
            }
        });
    };

    getAllImprintLocations(keyword): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                paginated_location: true,
                keyword: keyword,
                size: 100
            }
        });
    };
    // getAllImprintLocations Observable
    getAllImprintLocationsObs(keyword): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                paginated_location: true,
                keyword: keyword
            }
        }).pipe(
            tap((response: any) => {
                this._imprintLocations.next(response);
            })
        );
    };

    getAllImprintMethods(keyword): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                paginated_method: true,
                keyword: keyword,
                size: 100
            }
        });
    };
    // getAllImprintMethods Observable
    getAllImprintMethodsObs(keyword): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                paginated_method: true,
                keyword: keyword
            }
        }).pipe(
            tap((response: any) => {
                this._imprintMethods.next(response);
            })
        );
    };

    getTestPricing(productId, imprintId, processQuantity): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                test_pricing: true,
                product_id: productId,
                imprint_id: imprintId,
                process_quantity: processQuantity
            }
        });
    };

    getAllDigitizers(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                digitizer: true,
                size: 50
            }
        });
    };

    getMultiColorValue(two, three, four, five): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                multi_color: true,
                two_color_q: two,
                three_color_q: three,
                four_color_q: four,
                five_color_q: five
            }
        });
    };

    getCollectionIds(companyId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                decoration: true,
                collection: true,
                decorator_id: companyId,
            }
        });
    };

    getPriceInclusionImprints(setupChargeId, runChargeId, productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                price_inclusion: true,
                setup_charge_id: setupChargeId,
                run_charge_id: runChargeId,
                product_id: productId
            }
        });
    };

    getStandardImprints(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                standard_group: true,
                size: 1000
            }
        });
    };

    getSubStandardImprints(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                imprint: true,
                standard_imprint: true,
                size: 1000
            }
        });
    };

    getOrderHistoryByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                order_history: true,
                product_id: productId
            }
        });
    };

    getUpdateHistoryByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                update_history: true,
                product_id: productId
            }
        });
    };

    getCommentByProductId(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                comment: true,
                product_id: productId
            }
        });
    };

    getCommentators(page) {
        return this._httpClient.get(environment.customerList, {
            params: {
                commentor: true,
                page: page,
                size: 20
            }
        })
    };

    getLicensingCompanyByProductId(productId) {
        return this._httpClient.get(environment.products, {
            params: {
                licensing_company: true,
                product_id: productId
            }
        })
    };

    getLicensingCompany() {
        return this._httpClient.get(environment.products, {
            params: {
                licensing_company: true
            }
        })
    };

    getLicensingSubCategory(termId, productId) {
        return this._httpClient.get(environment.products, {
            params: {
                licensing_term: true,
                sub_category: true,
                licensing_term_id: termId,
                product_id: productId,
                size: 100
            }
        })
    };

    getProductCoops(supplier_id) {
        return this._httpClient.get(environment.products, {
            params: {
                company: true,
                product_coop: true,
                supplier_id: supplier_id,
                size: 500
            }
        })
    }

    getSpecificProductCoops(productId) {
        return this._httpClient.get(environment.products, {
            params: {
                product_coop: true,
                product_id: productId,
                size: 5000
            }
        })
    }



    getChargeValue(value) {
        return this._httpClient.get(environment.products, {
            params: {
                charge: true,
                charge_value: value,
                size: 100
            }
        })
    };

    getChargeValuesData(text) {
        return this._httpClient.get(environment.products, {
            params: {
                charge: true,
                price_inclusion: true,
                charge_id: text,
                size: 1000
            }
        })
    };

    addProductGetLicensingSubCategory(termId) {
        return this._httpClient.get(environment.products, {
            params: {
                licensing_term: true,
                sub_category: true,
                licensing_term_id: termId,
                size: 100
            }
        })
    };

    getLicensingTerms(productId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                licensing_term: true,
                product_id: productId,
                size: 500
            }
        }).pipe(
            tap((response: any) => {
                this._productLicensingTerms.next(response);
            })
        );
    };

    getPromoStandardProductDetails(productNumber, supplierId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                promo_standards_2: true,
                product_number: productNumber,
                supplier_id: supplierId
            }
        });
    };

    getPromoStandardProductPricingDetails(productNumber, supplierId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                promo_standards_pricing: true,
                product_number: productNumber,
                supplier_id: supplierId
            }
        });
    };

    getPromoStandardInventory(productNumber, supplierId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                promo_standards_inventory: true,
                product_number: productNumber,
                supplier_id: supplierId
            }
        });
    };

    addProductGetLicensingTerms(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                licensing_term: true,
                size: 500
            }
        });
    };

    getSizes(productId, keyword, page): Observable<any[]> {
        let params;
        if (keyword != '') {
            params = {
                product_id: productId,
                sizes: true,
                keyword: keyword,
                size: 50,
                page: page
            }
        } else {
            params = {
                product_id: productId,
                sizes: true,
                size: 50,
                page: page
            }
        }
        return this._httpClient.get<any[]>(environment.products, {
            params: params
        }).pipe(retry(3));
    };

    getSizesWithoutID(productId, keyword, page): Observable<any[]> {
        let params;
        if (keyword != '') {
            params = {
                // product_id: productId,
                sizes: true,
                keyword: keyword,
                size: 40,
                page: page
            }
        } else {
            params = {
                // product_id: productId,
                sizes: true,
                size: 40,
                page: page
            }
        }
        return this._httpClient.get<any[]>(environment.products, {
            params: params
        }).pipe(retry(3));
    };

    getCharts(productId, page, fk_supplierID): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: {
                company_id: fk_supplierID,
                product_id: productId,
                chart: true,
                size: 20,
                page: page
            }
        });
    };

    // DELETE CALLS
    deleteComment(payload: DeleteComment) {
        return this._httpClient.post(environment.products, payload);
    };

    deleteArtwork(payload) {

        return this._httpClient.put(environment.products, payload);

    };
    // POST CALLS

    // ADD Imprint
    addImprintObj(payload: updateImprintObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };

    // ADD CORE
    addCore(payload: AddCore) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };

    // ADD DEFAULT IMAGE
    addDefaultImage(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };

    // ADD ARTWORK TEMPLATE
    addArtworkTemplate(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };

    // ADD ARTWORK TEMPLATE INTO DB
    addArtworkTemplateToDb(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };

    // ADD DIETARY MEDIA
    addDietaryMedia(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };

    // ADD SWATCH IMAGE
    addSwatchImage(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };

    // ADD DEFAULT COLOR IMAGE
    addColorMedia(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };
    addImprintMedia(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };

    // Add Product
    addProduct(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };

    /**
   * Add feature
   */
    addFeature(payload: AddFeature) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    }

    /**
  * Post package
  */
    addPackage(payload: AddPackage) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };

    /**
     * Post duplicate
     */
    addDuplicate(payload: duplicateObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    }

    /**
   * Create Colors
   */
    addColors(payload: PostColor) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };

    // Add imprints standard
    addStandardImprints(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };


    /**
     * post comment
    **/
    updateComment(payload: Comment) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    }

    // PUT CALLS

    // Delete Imprints
    deleteImprints(product_id: string) {
        const payload = {
            product_id: product_id,
            delete_imprint: true
        };
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    }

    /**
     * update wareHouse
    **/
    updateWarehouse(payload: Warehouse) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    }

    // Update Imprint
    updateImprintObj(payload: updateImprintObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };

    // Update Imprint
    updatePromoStandard(payload: updatePromostandardObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };

    // Update Imprint
    updateRunInGroup(payload: updateAllowRun) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };

    /**
   * UPDATE price inclusion
   */
    updatePriceInclusion(payload: priceInclusionObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    }

    /**
   * UPDATE package
   */
    updatePackage(payload: updatePackageObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    }

    /**
   * UPDATE overlaping
   */
    updateImprintOverlapping(payload: overlapUpdateObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    }

    /**
   * UPDATE net cost
   */
    updateNetCost(payload: NetCostUpdate) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    }

    /**
  * UPDATE margins
  */
    updateMargins(payload: UpdateMargin) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    }

    /**
   * UPDATE description
   */
    updatePhysicsAndDescription(payload: productDescription) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    }

    /**
   * UPDATE cash-back
   */
    updateFlatRateShipping(payload: FlatRateShippingObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    }

    /**
   * UPDATE physics
   */
    updatePhysics(payload: physicsUpdateObject) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    }

    /**
   * UPDATE case dimension
   */
    updateCaseDimensions(payload: CaseDimensionObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    }

    /**
   * UPDATE case quantity
   */
    updateCaseQuantity(payload: CaseQuantityObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    }

    /**
   * UPDATE Video
   */
    updateVideo(payload: videoObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };

    /**
   * UPDATE licensing terms
   */
    updateLicensingTerms(payload: Licensing) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };

    /**
   * UPDATE Sizes
   */
    updateSizes(payload: updateSize) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };

    /**
   * UPDATE Colors
   */
    updateColors(payload: updateColorObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };

    /**
   * UPDATE Colors
   */
    updateDisplayOrder(payload: displayOrderObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };

    /**
   * UPDATE Features
   */
    updateFeatures(payload: featureUpdateObj) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };

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
    };
    // Available colors supplier specified
    getProductsData(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.products, {
            params: params
        }).pipe(retry(3));
    };
    updateProductsData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };
    // Create Product Details
    createProductDetail(payload: Product) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };
    updateProductLicensingTerm(payload: any) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };
    UpdateProductDescription(payload: UpdateProductDescription) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };
    UpdateProductFeature(payload: ProductFeature) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };
    UpdateProductColors(payload: ProductColor) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };
    UpdateProductNetCost(payload: ProductNetCost) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };
    UpdateProductImprint(payload: Imprint) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };
    UpdateMultiProductImprint(payload: MultiImprint) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };
    UpdateProductSizes(payload: updateProductSize) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };
    // Add New Setup Charge
    AddSetupCharge(payload: add_setup_charge) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };

    UpdateArtwork(payload: UpdateArtwork) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };

    UpdateProductStatus(payload: UpdateProductStatus) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };
    addDuplicateImprint(payload: AddDuplicateImprint) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };
    AddStoreProduct(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.products, payload, { headers });
    };
    AddRapidBuildImages(payload: addRapidBuildStoreProduct) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };
    putProductsData(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(environment.products, payload, { headers }).pipe(retry(3));
    }
}
