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
    storeID: number;
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

export interface ApprovalContact {
    store_user_id: number;
    list_order: number;
    first_name: string;
    last_name: string;
    email: string;
    bln_emails: boolean;
    bln_royalties: boolean;
    store_id: number;
    student_org_code: string;
    student_org_name: string;
    approval_contact: boolean;
}

export interface AddReminder {
    user_id: number;
    created_on: string;
    remind_on: string;
    admin_user_id: number;
    name: string;
    notes: string;
}

export interface UpdateCashback {
    cash_back: boolean;
    user_id: number;
    store_id: number;
    cash_back_status: boolean;
}

export interface CreateStore {
    user_id: number;
    store_id: number;
    store_usage: boolean;
}

export interface UserUpdateObject {
    user_role: string;
    email: string;
    user_name: string;
    password: string;
    first_name: string;
    last_name: string;
    bln_admin_user?: boolean;
    default_commission?: number;
    admin_user_id?: number;
    gender?: string;
    dob?: Date;
    display_picture?: string;
    user_type: string;
    user_id: number
}