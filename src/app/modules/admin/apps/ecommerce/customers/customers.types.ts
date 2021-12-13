export interface CustomersProduct
{
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
    firstname: string;
    lastname: string;
    email: string;
    store: string;
    company: string;
}

export interface CustomersPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface CustomersCategory
{
    id: string;
    parentId: string;
    name: string;
    slug: string;
}

export interface CustomersBrand
{
    id: string;
    name: string;
    slug: string;
}

export interface CustomersTag
{
    id?: string;
    title?: string;
}

export interface CustomersVendor
{
    id: string;
    name: string;
    slug: string;
}
