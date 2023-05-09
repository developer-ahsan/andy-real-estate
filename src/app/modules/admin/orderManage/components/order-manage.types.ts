export interface SmartArtLogin { payload: string; smartart_login: boolean; };
export interface UpdateQuoteOptions {
    blnAdditionalProofContacts: boolean;
    blnIgnoreAdditionalArtEmails: boolean;
    eventName: string;
    bypassScheduler: boolean;
    pk_cartLineID: number;
    pk_cartID: number;
    update_quote_options: boolean;
};
export interface updateReorderNumber {
    reorderNumber: string;
    cartLineID: number;
    imprintID: number;
    update_reorder_number: boolean;
};
export interface updateQuotePurchaseOrderComment {
    purchaseOrderComment: string;
    cartLineID: number;
    imprintID: number;
    update_quote_purchase_comment: boolean;
};
export interface UpdateArtworkTgas {
    cartline_id: number;
    artwork_ids: number[];
    update_artwork_tags: boolean;
};
export interface sendAutoRequest {
    customer_email: string;
    customer_name: string;
    storeName: string;
    store_id: number;
    storeURL: string;
    cartLineImprintID: number;
    userID: number;
    cartLineID: number;
    productName: string;
    cartID: number;
    auto_art_request: boolean;
};
export interface sendQuoteCustomerEmail {
    to_email: string;
    from: string;
    subject: string;
    message: string;
    storeName: string;
    store_id: number;
    userID: number;
    storeURL: string;
    cartLineID: number;
    cartID: number;
    cartLineImprintID: number;
    productName: string;
    send_customer_email: boolean;
};
export interface sendAutoRequestOrder {
    customer_email: string;
    customer_name: string;
    storeName: string;
    store_id: number;
    storeURL: string;
    orderLineImprintID: number;
    userID: number;
    orderLineID: number;
    productName: string;
    orderID: number;
    auto_order_art_request: boolean;
};

export interface updateReorderNumberOrder {
    reorderNumber: string;
    orderline_id: number;
    imprint_id: number;
    update_order_reorder_number: boolean;
};

export interface updateOrderLineImprintColors {
    imprintColors: string;
    orderline_id: number;
    imprint_id: number;
    update_order_imprint_colors: boolean;
};
export interface AddOrderComment {
    internalComments: string;
    order_id: number;
    add_order_comment: boolean;
};
export interface updateAttentionFlagOrder {
    bln_attention: boolean;
    orderline_id: number;
    imprint_id: number;
    update_order_attention_flag: boolean;
};
export interface HideUnhideQuote {
    cartline_id: number;
    imprint_id: number;
    blnHidden: boolean;
    hide_unhide_quote: boolean;
};
export interface HideUnhideCart {
    orderline_id: number;
    imprint_id: number;
    blnHidden: boolean;
    hide_unhide_cart: boolean;
};


export interface UpdateInHandsDate {
    inHandsDate: string;
    order_id: number;
    update_inHands_date: boolean;
};
export interface AddComment {
    comment: string;
    order_id: number;
    post_comment: boolean;
};
export interface UpdateTracking {
    orderLinePOID: number;
    orderLineID: number;
    orderID: number;
    blnGroupRun: boolean;
    blnGroupOrder: boolean;
    trackingNumber: string;
    shipDate: string;
    carrier: number;
    carrierName: string;
    blnSendShippingEmail: boolean;
    blnRevised: boolean;
    update_shipping_tracking: boolean;
};
export interface saveBillPay {
    orderLinePOID: number;
    billPayPaymentMethod: string;
    billPayReference: string;
    billPayPaymentDate: string;
    blnPaid: boolean;
    update_save_bill_pay: boolean;
};
export interface saveVendorBill {
    orderLinePOID: number;
    vendorInvoiceNumber: string;
    vendorInvoiceDate: string;
    vendorInvoiceNetTerms: string;
    blnInvoiced: boolean;
    update_save_vendor_bill: boolean;
};