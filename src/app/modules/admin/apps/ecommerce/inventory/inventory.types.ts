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
    RowNumber: number;
    TotalRequests: number;
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