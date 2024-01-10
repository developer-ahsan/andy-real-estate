export interface restoreQuote {
    cartID: number;
    restore_quote: boolean;
};
export interface RemoveCartComment {
    commentID: number;
    remove_cart_comment: boolean;
};
export interface AddCartComment {
    fk_cartID: number;
    comment: string;
    fk_adminUserID: number;
    dateCreated: string;
    emails: string[];
    blnUrgent: boolean;
    storeName: string;
    add_cart_comment: boolean;
};
export interface updateCartInfo {
    cart_id: number;
    admin_user_id: number;
    store_id: number;
    billing_company_name: string;
    billing_first_name: string;
    billing_last_name: string;
    billing_address: string;
    billing_city: string;
    billing_state: string;
    billing_zip: string;
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
    shipping_phone: string;
    shipping_email: string;
    account_charge_code: string;
    alternate_proof_emails: string[];
    billing_location: string;
    shipping_location: string;
    ship_to_deliver_to: string;
    bill_to_deliver_to: string;
    modify_cart_contact_information: boolean;
};
export interface updateCartShipping {
    cart_id: number;
    in_hands_date: string;
    admin_user_id: Number
    shipping_carrier_name: string;
    shipping_service_name: string;
    shipping_customer_account_number: string;
    shipping_service_code: string;
    purchase_order_num: string;
    modify_cart_shipping_details: boolean;
};
export interface deleteCart {
    cartID: number;
    blnQuote: boolean;
    siteName: string;
    storeId: number;
    calledFrom: string;
    customerName: string;
    customerEmail: string;
    pk_userID: number;
    customerDayPhone: string;
    discountCode: string;
    discountAmount: number;
    cartLineSumAmount: number;
    shipping: number;
    delete_cart: boolean;
};
export interface updateCartArtworkStatus {
    cartLineID: number;
    imprintID: number;
    blnRespond: boolean;
    update_cartLine_artwork_status: boolean;
};
export interface AddCartArtworkComment {
    cartID: number;
    cartLineID: number;
    imprintID: number;
    productName: string;
    locationName: string;
    methodName: string;
    storeName: string;
    userName: string;
    userEmail: string;
    comment: string;
    add_cartLine_artwork_comment: boolean;
};