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