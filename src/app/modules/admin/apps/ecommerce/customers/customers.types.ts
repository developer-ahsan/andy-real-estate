export interface CustomersProduct
{
    companyName: string;
    dayPhone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
    storeName: string;
    storeID: string;
    firstName: string;
    lastName: string;
    email: string;
    pk_userID: string;
    date: string;
    blnActive: boolean;
    blnReminders: string;
    RowNumber: number;
    TotalRequests: number;
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
    customerId?: string;
    name?: string;
    notes?: string | null;
    alertOn?: string;
}

export interface CustomersVendor
{
    id: string;
    name: string;
    slug: string;
}
