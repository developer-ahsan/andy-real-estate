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
export interface UpdatePricing {
    storeProductID: number;
    product_id: number;
    storeName: string;
    list: Quantities[];
    update_pricing: boolean;
};
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