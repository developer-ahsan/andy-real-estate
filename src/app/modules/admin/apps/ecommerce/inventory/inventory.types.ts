export interface InventoryProduct {
    id: string;
    category?: string;
    name: string;
    description?: string;
    tags?: string[];
    sku?: string | null;
    barcode?: string | null;
    brand?: string | null;
    vendor: string | null;
    stock: number;
    reserved: number;
    cost: number;
    basePrice: number;
    taxPercent: number;
    price: number;
    weight: number;
    thumbnail: string;
    images: string[];
    active: boolean;
}

export interface InventoryPagination {
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface InventoryCategory {
    id: string;
    parentId: string;
    name: string;
    slug: string;
}

export interface InventoryBrand {
    id: string;
    name: string;
    slug: string;
}

export interface InventoryTag {
    id?: string;
    title?: string;
}

export interface InventoryVendor {
    id: string;
    name: string;
    slug: string;
}

export interface ProductsList {
    pk_productID: number;
    productNumber: string;
    productName: string;
    RowNumber: number;
    TotalRequests: number;
}

export interface ProductsDetails {
    pk_productID: number;
    productNumber: string;
    productName: string;
    blnService: boolean;
    blnApparel: boolean;
    blnPromoStandard: boolean;
    fk_supplierID?: number;
    RowNumber: number;
    TotalRequests: number;
    pk_storeProductID: number;
}

export interface Colors {
    fk_productID: number;
    fk_colorID: number;
    setup: number;
    run: number;
    rgb: string;
    colorName: string;
    RowNumber: number;
    TotalRequests: number
}

export interface Features {
    fk_attributeID: number;
    attributeText: string;
    fk_attributeTypeID: number;
    listOrder: number;
    RowNumber: number;
    TotalRequests: number
}

export interface Package {
    fk_productID: number;
    fk_packagingProductID: number;
    fk_packagingID: number;
    setup: number;
    run: number;
    unitsPerPackage: number;
    blnDecoratorPO: boolean;
    packagingName: string;
    RowNumber: number;
    TotalRequests: number
}

export interface Reviews {
    pk_reviewID: number;
    fk_storeProductID: number;
    name: string;
    date: string;
    rating: number;
    comment: string;
    storeName: string;
    pk_storeID: number;
    RowNumber: number;
    TotalRequests: number
}


export interface AvailableCores {
    pk_coreID: number;
    coreName: string;
    RowNumber: string;
    TotalRequests: number;
}

export interface Categories {
    pk_categoryID: number;
    categoryName: string;
    RowNumber: number;
    TotalRequests: number
}

export interface SubCategories {
    pk_subCategoryID: number;
    fk_categoryID: number;
    subCategoryName: string;
    RowNumber: number;
    TotalRequests: number
}

export interface AddCore {
    product_id: number;
    sub_category_id: number;
    core: boolean;
}

export interface PhysicsObj {
    product_id: number;
    weight: number;
    weight_in_units: number;
    dimensions: string;
    over_pack_charge: number;
    physics: boolean;
}

export interface physicsUpdateObject {
    product_id: number;
    weight: number;
    weight_in_units: number;
    dimensions: string;
    over_pack_charge: number;
    bln_apparel: boolean;
    shipping: {
        prod_time_min: number;
        prod_time_max: number;
        units_in_shipping_package: number;
        bln_include_shipping: number;
        fob_location_list: number[];
    };
    physics: boolean;
}

export interface FlatRateShippingObj {
    product_id: number;
    flat_rate_shipping: number;
    flat_rate: boolean;
}

export interface CaseQuantityObj {
    product_id: number;
    case_quantities: number[];
    case_quantity: boolean;
}

export interface CaseDimensionObj {
    product_id: number;
    case_height: number;
    case_width: number;
    case_length: number;
    case_dimension: boolean;
}

export interface NetCostUpdate {
    product_id: number;
    quantity_list: number[];
    cost_list: number[];
    blank_cost_list: number[];
    cost_comment: string;
    live_cost_comment: string;
    coop_id: number;
    msrp: number;
    net_cost: boolean;
}

export interface videoObj {
    video: string;
    button: string;
    product_id: number;
    videos: boolean;
}

export interface AddFeature {
    attribute_type_id: number;
    attribute_text: string;
    supplier_id: number;
    product_id: number;
    order: number;
    feature: boolean;
}

export interface UpdateMargin {
    product_id: number;
    margins: number[];
    margin: boolean;
}

export interface AddPackage {
    package_name_list: string[];
    packaging: boolean;
}

export interface Warehouse {
    inventory: number;
    inventory_threshold: number;
    warehousing_cost: number;
    handling_cost: number;
    delivery_options: string;
    delivery_fees: number;
    delivery_note: string;
    max_quantity: number;
    ware_house_code: string;
    product_id: number;
    call_type: string;
    warehouse: boolean;
}

export interface Comment {
    comment_id?: number;
    product_id: number;
    comment: string;
    admin_user_id: number;
    name: string;
    emails: string[];
    call_type: string;
    internal_comment: boolean;
}

export interface DeleteComment {
    comment_id: number;
    call_type: string;
    internal_comment: boolean;
    emails: string[];
}

export interface Licensing {
    product_id: number;
    licensing_term_id: number;
    sub_category_id: number;
    call_type: string;
    licensing_term: boolean;
}

export interface CreateProduct {
    supplier_id: number;
    item_type: number;
    technologo_sku: string;
    bln_group_run: boolean;
    permalink: string;
    physics: physicsObj;
    flat_rate: flatRateShippingObj;
    case_dimension: caseDimensionsObj;
    case_quantities: caseQuantitiesObj;
    shipping: shippingObj;
    description: productDescriptions;
    net_cost: netCostObj;
    product: boolean;
}

export interface productDescriptions {
    name: string;
    product_number: string;
    product_desc: string;
    mini_desc: string;
    keywords: string;
    notes: string;
    supplier_link: string;
    meta_desc: string;
    sex: number;
    search_keywords: string;
    purchase_order_notes: string;
    last_update_by: string;
    last_update_date: string;
    update_history: string;
    product_id: number;
}

export interface physicsObj {
    product_id: number;
    weight: number;
    weight_in_units: number;
    dimensions: string;
    over_pack_charge: number;
    bln_apparel: boolean;
    shipping: shippingObj;
}

export interface shippingObj {
    prod_time_min: number;
    prod_time_max: number;
    units_in_shipping_package: number;
    bln_include_shipping: number;
    fob_locations: number[];
}

export interface flatRateShippingObj {
    product_id: number;
    flat_rate_shipping: number;
}

export interface caseDimensionsObj {
    product_id: number;
    case_height: number;
    case_width: number;
    case_length: number;
}

export interface caseQuantitiesObj {
    product_id: number;
    case_quantities: number[];
}

export interface netCostObj {
    product_id: number;
    quantity_list: number[];
    cost_list: number[];
    blank_cost_list: number[];
    cost_comment: string;
    live_cost_comment: string;
    coop_id: number;
    msrp: number;
}

export interface duplicateObj {
    product_id: number;
    product_number: number;
    product_name: string;
    duplicate_product: boolean;
}

export interface updateSize {
    product_id: number;
    product_size: productSizeObj[];
    size: boolean;
}

export interface productSizeObj {
    size_id: number;
    run: number;
    weight: number;
    unit_per_weight: number;
}

export interface featureUpdateObj {
    product_id: number;
    update_type: string;
    feature: updateFeaturev2Obj[];
    features: boolean;
}

export interface updateFeaturev2Obj {
    attribute_type_id: number;
    attribute_text: string;
    attribute_id: number;
    order: number;
}

export interface updatePackageObj {
    product_id: number;
    package: objArr[];
    packaging: boolean;
    call_type: string;
}


export interface objArr {
    packaging_id: number;
    setup: number;
    run: number;
    units_per_package: number;
    bln_decorator: number;
}

export interface updateColorObj {
    product_id: number;
    color_id: number[];
    the_run: string[];
    rgb: string[];
    color: boolean;
    call_type: string;
}

export interface createColorObj {
    color: boolean;
    color_name: string[];
    product_id: number;
    color_id: number[];
    the_run: string[];
    rgb: string[];
}
export interface PostColor {
    product_id: number;
    color: boolean;
    colors: Color[];
    custom_colors: CustomColors[];
};

export interface Color {
    color_id: number;
    the_run: string;
    rgb: string;
};
export interface ProductColor {
    create_product_color: boolean;
    colors: Colors[];
    custom_colors: CustomColors[];
    product_id: number;
};
export interface Colors {
    color_id: number;
    the_run: string;
    rgb: string;
}
export interface CustomColors {
    color_name: number;
    the_run: string;
    rgb: string;
};
export interface priceInclusionObj {
    product_id: number;
    imprint_list: imprintInclusionObj[];
    imprint_price_inclusion: boolean;
}

export interface imprintInclusionObj {
    imprint_id: number;
    bln_include: number;
}

export interface displayOrderObj {
    display_order: displayOrderUpdate[];
    imprint_display_order: boolean;
}

export interface displayOrderUpdate {
    display_order: number;
    imprint_id: number;
}


export interface updateImprintObj {
    product_id: number;
    decorator_id: number;
    method_id: number;
    method_name: string;
    location_id: number;
    location_name: string;
    digitizer_id: number;
    setup_charge_id: number;
    run_charge_id: number;
    bln_includable: number;
    area: string;
    bln_user_color_selection: number;
    max_colors: number;
    multi_color_min_id: number;
    collection_id: number;
    bln_process_mode: number;
    min_product_qty: number;
    imprint_comments: string;
    bln_active: number;
    bln_singleton: boolean;
    bln_color_selection: boolean;
    imprint_id: number;
    store_product_id_list: number[];
    imprint_image: File;
    display_order: number;
    imprint: boolean;
}

export interface overlapUpdateObj {
    product_id: number;
    pairs: overlapPair[];
    imprint_overlap: boolean;
}

export interface overlapPair {
    loc_1: number,
    loc_2: number
}

export interface updatePromostandardObj {
    product_id: number;
    bln_active: boolean;
    promo_standard: boolean;
}

export interface updateAllowRun {
    product_id: number;
    bln_group_run: boolean;
    imprint_group_run: boolean;
}



// Add Products Detail
export interface Product {
    description: productDescription;
    physics: physicsObj;
    item_type: number;
    supplier_id: number;
    flat_rate: flatRateShippingObj;
    case_dimension: caseDimensionsObj;
    case_quantities: caseQuantitiesObj;
    shipping: shippingObj;
    technologo_sku: string;
    bln_group_run: boolean;
    blnPromoStandard: boolean;
    pk_userID: number;
    create_product: boolean;
};
export interface caseDimensionsObj {
    product_id: number;
    case_height: number;
    case_width: number;
    case_length: number;
}
export interface caseQuantitiesObj {
    product_id: number;
    case_quantities: number[];
}
export interface physicsObj {
    product_id: number;
    weight: number;
    weight_in_units: number;
    dimensions: string;
    over_pack_charge: number;
    bln_apparel: boolean;
    shipping: shippingObj;
}
export interface shippingObj {
    prod_time_min: number;
    prod_time_max: number;
    units_in_shipping_package: number;
    bln_include_shipping: number;
    fob_locations: number[];
}
export interface flatRateShippingObj {
    product_id: number;
    flat_rate_shipping: number;
}
export interface productDescription {
    name: string;
    product_number: string;
    product_desc: string;
    mini_desc: string;
    keywords: string;
    notes: string;
    supplier_link: string;
    meta_desc: string;
    sex: number;
    search_keywords: string;
    purchase_order_notes: string;
    last_update_by: string;
    last_update_date: string;
    update_history: string;
    product_id: number;
    supplier_id: number;
    permalink: string;
}
// Colors
// export interface ProductColor {
//     create_product_color: boolean;
//     colors: ProductColors[];
//     product_id: number;
// };
// export interface ProductColors {
//     color_id: number;
//     the_run: string;
//     rgb: string;
// };
// Feature
export interface ProductFeature {
    create_product_feature: boolean;
    features: ProductFeatures[];
    product_id: number;
};
export interface ProductFeatures {
    attribute_type_id: number;
    attribute_text: string;
    supplier_id: number;
    order: number;
    user_full_name: string;
};
// Licensing terms
export interface ProductLicensing_Term {
    product_id: number;
    licensing_term_id: number;
    sub_category_id: number;
    licensing_term: boolean;
};

export interface UpdateProductDescription {
    name: string;
    product_number: string;
    product_desc: string;
    mini_desc: string;
    keywords: string;
    notes: string;
    supplier_link: string;
    meta_desc: string;
    sex: number;
    search_keywords: string;
    purchase_order_notes: string;
    last_update_by: string;
    last_update_date: string;
    update_history: string;
    product_id: number;
    supplier_id: number;
    permalink: string;
    flat_rate_shipping: number;
    prod_time_min: number;
    prod_time_max: number;
    units_in_shipping_package: number;
    bln_include_shipping: number;
    fob_locations: number[];
    dimensions: string;
    weight: number;
    weight_in_units: number;
    over_pack_charge: number;
    bln_apparel: boolean;
    update_new_product: boolean;
};

// Net Cost
export interface ProductNetCost {
    product_id: number;
    quantity_list: number[];
    cost_list: number[];
    blank_cost_list: number[];
    cost_comment: string;
    live_cost_comment: string;
    coop_id: number;
    msrp: number;
    create_product_cost: boolean;
};
export interface Imprint {
    product_id: number;
    decorator_id: number;
    method_id: number;
    location_id: number;
    setup_charge_id: number;
    run_charge_id: number;
    bln_includable: number;
    area: string;
    bln_user_color_selection: number;
    max_colors: number;
    multi_color_min_id: number;
    collection_id: number;
    bln_process_mode: number;
    min_product_qty: number;
    imprint_comments: string;
    digitizer_id: number;
    bln_active: number;
    bln_singleton: boolean;
    bln_color_selection: boolean;
    imprint_id: number;
    store_product_id_list: number[];
    imprint_image: File;
    display_order: number;
    create_product_imprint: boolean;
};

export interface updateProductSize {
    product_id: number;
    product_size: productsSizeObj[];
    create_product_size: boolean;
}

export interface productsSizeObj {
    size_id: number;
    run: number;
    weight: number;
    unit_per_weight: number;
}

export interface MultiImprint {
    product_id: number;
    imprints: ImprintObj[];
    create_product_imprint: boolean;
};
export interface ImprintObj {
    decorator_id: number;
    method_id: number;
    location_id: number;
    setup_charge_id: number;
    run_charge_id: number;
    bln_includable: number;
    area: string;
    bln_user_color_selection: number;
    max_colors: number;
    multi_color_min_id: number;
    collection_id: number;
    bln_process_mode: number;
    min_product_qty: number;
    imprint_comments: string;
    digitizer_id: number;
    bln_active: number;
    bln_singleton: boolean;
    bln_color_selection: boolean;
    imprint_id: number;
    store_product_id_list: number[];
    imprint_image: File;
    display_order: number;
    method_name: string;
    location_name: string;
};
export interface add_setup_charge {
    dist_code: number;
    quantities: charge_obj[];
    add_charge_setup: boolean;
}
export interface charge_obj {
    process_quantity: number;
    product_quantity: number;
    charge: number;
}
export interface UpdateArtwork {
    template_id: string;
    name: string;
    artwork_update: boolean;
};
export interface UpdateProductStatus {
    product_id: number;
    reason: string;
    is_active: boolean;
    update_product_status: boolean;
};
export interface AddDuplicateImprint {
    product_id: number;
    imprint_id: number;
    method_id: number;
    method_name: string;
    location_id: number;
    location_name: string;
    duplicate_imprint: boolean;
};
// export interface AddStoreProduct {
//     store_id: number[];
//     product_id: number;
//     blnAddToRapidBuild: boolean;
//     rapidBuildComments: string;
//     add_store_product: boolean;
// };
export interface AddStoreProduct {
    store_id: number[];
    product_id: number;
    blnAddToRapidBuild: boolean;
    rapidBuildComments: string;
    blnCopy: boolean;
    copyImageStoreProductID: number;
    add_store_product: boolean;
};

export interface addRapidBuildStoreProduct {
    store_product_ids: number[];
    addRapidBuildStoreProduct: boolean;
};
export interface addRapidBuildStoreProduct {
    store_product_ids: number[];
    addRapidBuildStoreProduct: boolean;
};
export interface UpdatePriceCorrection {
    product_id: number;
    color_sizes: ColorSize[];
    update_price_correction: boolean;
};
interface ColorSize {
    size_id: number;
    color_id: number;
    amount: number;
};
export interface UpdateChart {
    chart_id: number;
    product_id: number;
    update_chart: boolean;
};

export interface commentObj {
    comment_id: number;
    product_id: number;
    product_name: string;
    product_number: string;
    comment: string;
    admin_user_id: number;
    name: string;
    emails: string[];
    call_type: string;
    internal_comment: boolean;
}
export interface DeleteProductImprint {
    // imprintID: number[];
    productID: number;
    delete_product_imprint: boolean;
};

export interface DeleteProductSingleImprint {
    productID: number;
    imprintID: number;
    delete_product_single_imprint: boolean;
};

export interface copyStoreVersionImages {
    targetStoreProductIDs: number[];
    sourceStoreProduct: number;
    images: string[];
    copy_store_version_images: boolean;
};