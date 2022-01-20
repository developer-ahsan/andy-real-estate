export interface CustomersProduct {
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

export interface CustomersPagination {
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface CustomersCategory {
    id: string;
    parentId: string;
    name: string;
    slug: string;
}

export interface CustomersBrand {
    id: string;
    name: string;
    slug: string;
}

export interface CustomersTag {
    id?: string;
    title?: string;
    customerId?: string;
    name?: string;
    notes?: string | null;
    alertOn?: string;
}

export interface CustomersVendor {
    id: string;
    name: string;
    slug: string;
}

// Updated interfaces for customers
export interface CreditTerm {
    RowNumber?: string;
    TotalRequests?: number;
    UserTermSelected: boolean;
    blnDefault: boolean;
    creditTermName: string;
    creditTermDesc: string;
    pk_creditTermID: number;
}

export interface UserCreditTerms {
    user_id: number;
    credit_term_id: number;
    credit_term: boolean;
}

export interface AddUserComment {
    admin_comment: string,
    user_id: number;
    emails: string[];
    user_comment: boolean;
}

export interface AddUserLocation {
    user_location: boolean;
    user_id: number;
    location_id: number;
}

export interface StoresList {
    store_id: number;
    storeUserID: number;
    RowNumber: number;
    TotalRequests: number;
    storeName: string;
}

export interface Reminders {
    pk_reminderID: number;
    fk_userID: number;
    createdOn: string;
    remindOn: string;
    fk_adminUserID: number;
    notes: string;
    name: string;
    blnActive: boolean;
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    dayPhone: string;
    RowNumber: number;
    TotalRequests: number;
}