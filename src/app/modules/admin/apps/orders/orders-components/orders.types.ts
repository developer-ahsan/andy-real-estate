export interface OrdersProduct {
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

export interface OrdersPagination {
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface OrdersCategory {
    id: string;
    parentId: string;
    name: string;
    slug: string;
}

export interface OrdersBrand {
    id: string;
    name: string;
    slug: string;
}

export interface OrdersTag {
    id?: string;
    title?: string;
}

export interface OrdersVendor {
    id: string;
    name: string;
    slug: string;
}

export interface OrdersList {
    pk_orderID?: number;
    orderDate?: string,
    fk_groupOrderID?: number | null,
    storeCode?: string,
    storeName?: string;
    businessName?: string;
    companyName?: string;
    blnIgnore?: boolean;
    blnReorderIgnore?: boolean;
    blnReviewIgnore?: boolean;
    blnCancelled?: boolean;
    billingZip?: string;
    paymentDate?: string;
    billingStudentOrgCode?: string | null;
    billingStudentOrgName?: string | null;
    locationName?: string | null;
    attributeName?: string | null;
    firstName?: string;
    lastName?: string;
    total?: number;
    royalties?: number;
    RowNumber?: string;
    TotalRequests?: number;
    inHandsDate?: string;
    currentTotal?: number;
    fk_storeUserID: number;
}

export interface SearchOrder {
    store_id: number;
    range_start: string;
    range_end: string;
    order_type: number;
    search_order_id: number;
    size: number;
}