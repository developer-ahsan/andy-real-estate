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

export interface addComment {
    order_id: number;
    comment: string;
    emails: string[];
    add_comment: true;
};
export interface addComments {
    order_id: number;
    comment: string;
    emails: string[];
    store_id: number;
    store_userId: number;
    store_name: string;
    company_name: string;
    internalComments: string;
    add_comment: true;
};

// Incident Report
export interface CreateIncidentReport {
    store_id: number;
    order_id: number;
    store_user_id: number;
    priority1: string;
    priority2: string;
    priority3: string;
    priority4: string;
    rerunCost: string;
    explanation: string;
    corrected: string;
    how: string;
    recommend: string;
    source_supplier: number;
    admin_user_id: number;
    source_employee: number;
    incident_sources: number[];
    create_incident_report: boolean;
};
export interface DeleteIncidentReport {
    incident_report_id: number;
    remove_incident_report: boolean;
};
export interface UpdateIncidentReport {
    store_user_id: number;
    date: string;
    priority1: string;
    priority2: string;
    priority3: string;
    priority4: string;
    rerunCost: string;
    explanation: string;
    corrected: string;
    how: string;
    recommend: string;
    source_supplier: number;
    admin_user_id: number;
    source_employee: number;
    dateModified: string;
    incident_sources: number[];
    incident_report_id: number;
    update_incident_report: boolean;
};
// Order Adjustments
export interface AddAdjustment {
    order_id: number;
    cost: number;
    price: number;
    description: string;
    add_adjustment: boolean;
};
export interface DeleteAdjustment {
    adjustment_id: number;
    order_id: number;
    delete_adjustment: boolean;
};
// Art Approval Settings
export interface UpdateArtApprovalSettings {
    blnAdditionalApprovalOverride: boolean;
    order_id: number;
    update_art_approval: boolean;
};
// Procurement
export interface UpdateProcurementData {
    order_id: number;
    unit: string;
    division: string;
    organization: string;
    location: string;
    fundType: string;
    businessLine: string;
    account: string;
    activity: string;
    expenditureType: string;
    project: string;
    task: string;
    projectOrganization: string;
    RUInitiative: string;
    activity2: string;
    businessLine2: string;
    location2: string;
    RUInitiative2: string;
    contractNumber: string;
    update_procurement_data: boolean;
};
export interface OrderProcess { bln_cancelled: boolean; order_lines: string; bln_Eprocurement: boolean; get_order_process: boolean; };
export interface StripePayment { stripe_price: number; stripe_token: string; stripe_transaction: true; order_id: number };



// Modify Orders
export interface contactInfoObj {
    order_id: number;
    store_id: number;
    billing_company_name: string;
    billing_first_name: string;
    billing_last_name: string;
    billing_address: string;
    billing_city: string;
    billing_state: string;
    billing_zip: string;
    billing_country: string;
    billing_phone: string;
    billing_email: string;
    shipping_company_name: string;
    shipping_first_name: string;
    shipping_last_name: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_zip: string;
    shipping_zip_ext: string;
    shipping_country: string;
    shipping_phone: string;
    shipping_email: string;
    account_charge_code: string;
    proof_email: string;
    alternate_proof_emails: string[];
    billing_location: string;
    shipping_location: string;
    ship_to_deliver_to: string;
    bill_to_deliver_to: string;
    modify_contact_info: boolean;
};
export interface shippingDetailsObj {
    order_id: number;
    in_hands_date: string;
    payment_date: string;
    shipping_carrier_name: string;
    shipping_service_name: string;
    shipping_customer_account_number: string;
    shipping_service_code: string;
    purchase_order_num: string;
    invoice_due_date: string;
    cost_center_code: string;
    modify_shipping_details: boolean;
};
export interface paymentInfoObj {
    payment_method_id: number;
    payment_method_name: string;
    gateway_trx_id: string;
    discount_code: string;
    discount_amount: number;
    sales_tax_rate: number;
    tax_exemption_comment: string;
    instructions: string;
    is_taxable: boolean;
    credit_term_id: number;
    order_id: number;
    modify_payment_info: boolean;
};

export interface UpdateOrderFlag {
    blnFulfillmentCancel: boolean;
    cancelledReason: string;
    blnFinalized: boolean;
    blnIgnore: boolean;
    blnReorderIgnore: boolean;
    blnReviewIgnore: boolean;
    blnRoyaltyIgnore: boolean;
    blnIgnoreSales: boolean;
    isblnFulfillmentCancelChanged: boolean;
    isblnFinalizedChanged: boolean;
    isblnIgnoreChanged: boolean;
    isblnReorderIgnoreChanged: boolean;
    isblnReviewIgnoreChanged: boolean;
    isblnRoyaltyIgnoreChanged: boolean;
    isblnIgnoreSalesChanged: boolean;
    order_id: number;
    store_id: number;
    storeName: string;
    orderTotal: number;
    paymentDate: string;
    orderLines: OrderLine[];
    update_order_flag: boolean;
};
interface OrderLine {
    fk_productID: number;
    blnWarehouse: boolean;
    quantity: number;
};
export interface updateLogoBank {
    name: string;
    description: string;
    vectorFileExtension: string;
    colorList: string;
    logoBankID: number;
    update_logo_bank: boolean;
};

export interface deleteLogoBank {
    logoBankID: number;
    delete_logo_bank: boolean;
};
export interface addLogoBank {
    user_id: number;
    name: string;
    description: string;
    vectorFileExtension: string;
    store_id: number;
    colorList: string;
    add_logo_bank: boolean;
};