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