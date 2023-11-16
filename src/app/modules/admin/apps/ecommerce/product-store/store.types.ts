export interface UpdateShipping {
    blnOverride: boolean;
    blnIncludeShipping: boolean;
    storeProductID: number;
    update_shipping: boolean;
};
export interface UpdateStoreLevelCoop {
    storeProductID: number;
    product_id: number;
    storeName: string;
    coOpId: number;
    update_store_coop: boolean;
};
// export interface UpdatePricing {
//     storeProductID: number;
//     product_id: number;
//     storeName: string;
//     list: Quantities[];
//     update_pricing: boolean;
// };
export interface Quantities {
    quantity: number;
    margin: number;
};
export interface UpdateExtrinsicCategory {
    extrinsicCategory: string;
    storeProductID: number;
    update_extrinsic_category: boolean;
};
export interface UpdateSpecialDescription {
    masterDescription: string;
    masterMiniDescription: string;
    specialDescription: string;
    specialMiniDescription: string;
    specialMetaDescription: string;
    productID: number;
    storeProductID: number;
    update_special_description: boolean;
};
export interface UpdatePermaLink {
    permalink: string;
    storeProductID: number;
    update_permalink: boolean;
};

export interface UpdateRoyalty {
    royaltySetting: number;
    storeName: string;
    store_product_id: number;
    product_id: number;
    update_royalty: boolean;
};

export interface videoObj {
    video: string;
    button: string;
    store_product_id: number;
    video_update: boolean;
};
export interface RemoveVideo {
    store_product_id: number;
    delete_store_product_video: boolean;
};
export interface UpdateColor {
    colorIDS: number[];
    storeProductID: number;
    update_color: boolean;
};
export interface UpdateImprintStatus {
    imprint_ids: number[];
    storeProductID: number;
    update_imprint_status: boolean;
};
export interface UpdateImprint {
    storeProductID: number;
    fk_decoratorID: number;
    fk_setupChargeID: number;
    fk_runChargeID: number;
    fk_collectionID: number;
    update_imprint: boolean;
};
export interface UpdateProductOptions {
    optionalGuidelines: string;
    productIDs: number[];
    product_id: number;
    storeName: string;
    storeProductID: number;
    update_product_options: boolean
};

export interface UpdateReview {
    name: string;
    date: string;
    rating: number;
    comment: string;
    response: string;
    blnActive: boolean;
    pk_reviewID: number;
    storeProductId: number;
    update_review: boolean;
};

export interface AddReview {
    storeProductId: number;
    name: string;
    date: string;
    rating: number;
    comment: string;
    add_review: boolean;
};

export interface DeleteReview {
    pk_reviewID: number;
    delete_review: boolean;
};

export interface AddSubCategory {
    category_id: number;
    subCategory_name: string;
    perma_link: string;
    add_subcategory: boolean;
};

export interface update_subcategories {
    store_product_id: number;
    subcategories: Subcategory[];
    update_subcategories: boolean;
};
interface Subcategory {
    subcategory_id: number;
    isChecked: boolean;
}
export interface DeleteVirtualProofImage { virtual_proof_id: number; remove_virtual_art: boolean; };
export interface AddVirtualProofImage { store_product_id: number; blnStore: boolean; add_virtual_art: boolean; };

export interface AddRelatedProduct {
    store_product_id: number;
    product_id: number;
    product_number: string;
    product_name: string;
    relation_type_id: string;
    storeName: string;
    add_related_product: boolean;
};
export interface removeStoreProduct {
    storeProductID: number;
    payload: any; // email, password, secretKey = 'remove_from_store'
    productID: number;
    storeName: string;
    remove_store_product: boolean;
};
export interface UpdateSpecialDescription {
    masterDescription: string;
    masterMiniDescription: string;
    specialDescription: string;
    specialMiniDescription: string;
    specialMetaDescription: string;
    storeProducts: storeProduct[];
    storeName: string;
    update_special_description: boolean;
};

interface storeProduct {
    productID: number;
    storeProductID: number;
}

export interface UpdatePricing {
    pricing_store_products: PricingStoreProducts[];
    product_id: number;
    update_pricing: boolean;
};
interface PricingStoreProducts {
    storeProductID: number;
    storeName: string;
    pricesMargins: PricesMargins[];
};
interface PricesMargins {
    quantity: number;
    standard_cost: number;
    target_price: number;
    margin: number;
    priceOverride: number;
    tccdPrice: number;
};

export interface StatusUpdate {
    bln_active: boolean;
    store_name: string;
    store_product_id: number;
    offlineReason: string;
    master_product_id: number;
    storeProductHiResImage: boolean;
    blnSendEmail: boolean;
    blnAddToRapidBuild: boolean;
    update_status: boolean;
};
export interface AddRapidBuildStoreProduct {
    storeProductID: number;
    comments: string;
    add_rapidBuild_storeProduct: boolean;
};