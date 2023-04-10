export interface SmartArtLogin { payload: string; smartart_login: boolean; };
export interface RapidBuildLogin {
    payload: string;
    rapidbuild_login: boolean;
};
export interface clearStore {
    store_id: number;
    clear_store: boolean;
};
export interface removeRapidBuildEntry {
    rbid: number;
    spid: number;
    remove_rapidbuild_entry: boolean;
};
export interface bulkRemoveRapidBuildEntry {
    rbid: string;
    bulk_remove_rapidbuild_entry: boolean;
};
export interface updateStatus {
    rbid: number;
    imageStatusID: number;
    blnLeaveComment: boolean;
    blnAdmin: boolean;
    blnStatusUpdate: boolean;
    comments: string;
    statusName: string;
    rapidbuild_userId: number;
    rapidbuild_username: string;
    user_full_name: string;
    update_status: boolean;
};
export interface uploadProof {
    rbid: number;
    comments: string;
    upload_proof: boolean;
    blnAdmin: boolean;
    fk_imageStatusID: number;
    blnStatusUpdate: boolean;
    status_name: string;
    rapidbuild_userId: number;
    rapidbuild_username: string;
};
export interface updateProof {
    rbid: number;
    comments: string;
    blnAdmin: boolean;
    fk_imageStatusID: number;
    blnStatusUpdate: boolean;
    status_name: string;
    rapidbuild_userId: number;
    rapidbuild_username: string;
    update_proof: boolean;
};

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