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
export interface HideUnhideOrder {
    orderline_id: number;
    imprint_id: number;
    blnHidden: boolean;
    hide_unhide_order: boolean;
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
export interface UpdateOrderInformation {
    inHandsDate: string;
    blnIgnoreAdditionalProofEmails: boolean;
    blnAdditionalApprovalOverride: boolean;
    event: string;
    blnBypassScheduler: boolean;
    orderId: number;
    orderLineID: number;
    update_order_info: boolean;
};
export interface UpdateOrderLineArtworkTags {
    orderLineID: number;
    artwork_ids: number[];
    update_orderline_artwork_tags: boolean;
};
export interface UpdateOrderLineClaim {
    orderLineID: number;
    blnClaim: boolean;
    fk_smartArtDesignerClaimID: number;
    update_orderline_claim: boolean;
};
export interface UpdateQuoteClaim {
    cartLineID: number;
    blnClaim: boolean;
    fk_smartArtDesignerClaimID: number;
    update_quote_claim: boolean;
};
export interface updateQuoteAttentionFlag {
    bln_attention: boolean;
    cartLine_id: number;
    imprint_id: number;
    update_quote_attention_flag: boolean;
};
// Pending
export interface updateQuoteBulkStatusUpdate {
    status_id: number;
    quotes: Quote[];
    update_quote_bulk_status: boolean;
};

interface Quote {
    imprint_id: number;
    cartLine_id: number;
};
export interface updateOrderBulkStatusUpdate {
    status_id: number;
    orders: Order[];
    update_order_bulk_status: boolean;
};
interface Order {
    imprint_id: number;
    ordeLine_id: number;
};

export interface updateOrderProofContact {
    artApproval_contact_id: number;
    orderline_id: number;
    imprint_id: number;
    update_order_proof_contact: boolean;
};

export interface sendOrderCustomerEmail {
    to_email: string[];
    from: string;
    subject: string;
    message: string;
    storeName: string;
    store_id: number;
    userID: number;
    storeURL: string;
    orderLineID: number;
    orderID: number;
    orderLineImprintID: number;
    productName: string;
    send_order_customer_email: boolean;
};
export interface updateQuoteProofContact {
    artApproval_contact_id: number;
    cartline_id: number;
    imprint_id: number;
    update_quote_proof_contact: boolean;
};

export interface SmartartImprintStatusUpdate {
    orderLineID: number;
    imprintID: number;
    userID: number;
    orderLineImprintID: number;
    orderID: number;
    statusID: number;
    blnGroupRun: boolean;
    update_smart_imprint_status: boolean;
};