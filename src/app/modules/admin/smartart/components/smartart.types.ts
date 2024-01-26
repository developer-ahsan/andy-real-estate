export interface SmartArtLogin { payload: string; smartart_login: boolean; };
export interface UpdateQuoteOptions {
    blnAdditionalProofContacts: boolean;
    blnIgnoreAdditionalArtEmails: boolean;
    eventName: string;
    inHandsDate: string;
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
    to_email: string[];
    from: string;
    subject: string;
    message: string;
    storeName: string;
    blnEProcurement: boolean;
    store_id: number;
    userID: number;
    storeURL: string;
    cartLineID: number;
    imprintNumList: number[];
    cartID: number;
    cartLineImprintID: number;
    productName: string;
    send_quote_customer_email: boolean;
};
// export interface sendAutoRequestOrder {
//     customer_email: string;
//     customer_name: string;
//     storeName: string;
//     store_id: number;
//     storeURL: string;
//     orderLineImprintID: number;
//     userID: number;
//     orderLineID: number;
//     productName: string;
//     orderID: number;
//     auto_order_art_request: boolean;
// };
export interface sendAutoRequestOrder {
    firstName: string;
    lastName: string;
    email: string;
    proofEmail: string;
    fk_artApprovalContactID: number;
    blnAdditionalArtApproval: boolean;
    blnEProcurement: boolean;
    storeName: string;
    store_id: number;
    storeURL: string;
    orderLineImprintID: number;
    userID: number;
    orderLineID: number;
    productNumber: string;
    productName: string;
    smartArtLoggedInUserName: string;
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
    orderID: number;
    productName: string;
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
    smartArtLoggedInUserName: string;
    update_quote_bulk_status: boolean;
};

interface Quote {
    imprint_id: number;
    status_id: number;
    blnRespond: boolean;
    cartLine_id: number;
    productNumber: string;
    productName: string;
    customerName: string;
    customerEmail: string;
    customerAdditionalEmails: string[];
    customerCompanyName: string;
    locationName: string;
    decorationName: string;
    blnGroupRun: boolean;
    proofComments: string;
    cartID: number;
    storeUserID: number;
    storeID: number;
    storeName: string;
    blnAdditionalArtApproval: boolean;
    blnAdditionalApprovalOverride: boolean;
};


export interface updateOrderBulkStatusUpdate {
    status_id: number;
    orders: Order[];
    smartArtLoggedInUserName: string;
    update_order_bulk_status: boolean;
};

interface Order {
    imprint_id: number;
    ordeLine_id: number;
    blnGroupRun: boolean;
    fk_groupOrderID: number;
    product_id: number;
    productNumber: string;
    productName: string;
    blnApproved: boolean; // Check pk_statusID in the orderline 1 if statusID of imprint is "5,6,7,9,11,16" else 0
    storeID: number;
    orderID: number;
    storeName: string;
    firstName: string;
    lastName: string;
    email: string;
    orderDate: string;
    inHandsDate: string;
    blnRespond: boolean;
    companyName: string;
    tblLocationName: string;
    methodName: string;
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
    blnEProcurement: boolean;
    store_id: number;
    userID: number;
    storeURL: string;
    orderLineID: number;
    orderID: number;
    orderLineImprintID: number;
    imprintNumList: number[];
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
    orderDate: string;
    inHandsDate: string;
    statusID: number;
    storeID: number;
    storeName: string;
    storeCode: string;
    protocol: string;
    storeURL: string;
    blnRespond: boolean;
    blnGroupRun: boolean;
    proofComments: string;
    blnApproved: boolean; // Check fk_statusID for all orderLineImprintID's in the orderline 1 if statusID of imprint is "5,6,7,9,11,16" else 0
    smartArtLoggedInUserName: string;
    blnAdditionalArtApproval: boolean;
    blnAdditionalApprovalOverride: boolean;
    storePrimaryHighlight: string;
    billingStudentOrgCode: string;
    imprintsCount: number;
    storeProductImage: string;
    blnIgnoreAdditionalArtEmails: boolean;
    blnProofSent: boolean;
    fk_artApprovalContactID: number;
    fk_storeUserApprovalContactID: number;
    update_smart_imprint_status: boolean;
};

export interface sendOrderProofUpdate {
    imprintLocationName: string;
    imprintMethodName: string;
    imprintID: number;
    storeName: string;
    orderID: number;
    storeID: number;
    productName: string;
    storeUserID: number;
    orderLineID: number;
    send_order_proof_update: boolean;
};
export interface UploadOrderArtProof {
    blnIncludeApproveByDate: boolean;
    thumbnailImage: string
    approveByDate: string;
    orderLineID: number;
    orderID: number;
    imprintID: number;
    emailRecipients: string;
    smartArtAdminEmail: string;
    storeID: number;
    storeName: string;
    storeURL: string;
    storeCode: string;
    protocol: string;
    productName: string;
    productNumber: string;
    storePrimaryHighlight: string;
    inHandsDate: string;
    blnGroupRun: boolean;
    storeProductID: number;
    orderLineQuantity: number;
    methodName: string;
    locationName: string;
    imprintColors: string;
    firstName: string;
    lastName: string;
    email: string;
    userID: number;
    approvingStoreUserID: number;
    companyName: string;
    blnIgnoreAdditionalArtEmails: boolean;
    blnProofSent: boolean;
    fk_artApprovalContactID: number;
    fk_storeUserApprovalContactID: number;
    groupOrderID: number;
    comment: string;
    blnRespond: boolean;
    loggedInUserID: number;
    upload_order_art_proof: boolean;
};
export interface UploadOrderFinalArt {
    decoratorEmail: string;
    clientFileExt: string; // file extension that is uploaded
    storeName: string;
    storeID: number;
    orderID: number;
    orderLineID: number;
    userID: number;
    orderLineImprintID: number;
    decorationName: string;
    locationName: string;
    productName: string;
    artworkComments: string;
    smartArtLoggedInName: string;
    smartArtAdminEmail: string;
    blnGroupRun: boolean;
    upload_order_final_art: boolean;
};
export interface updateOrderPurchaseOrderComment {
    purchaseOrderComment: string;
    orderLineID: number;
    imprintID: number;
    update_order_purchase_comment: boolean;
};
export interface uploadVirtualProof {
    storeProductID: number;
    blnStore: boolean;
    upload_virtual_proof: boolean;
};
export interface removeVirtualProof {
    virtualProofID: number;
    remove_virtual_proof: boolean;
};

export interface UploadOrderFinalArt {
    decoratorEmail: string;
    clientFileExt: string; // file extension that is uploaded
    storeName: string;
    storeID: number;
    orderID: number;
    orderLineID: number;
    userID: number;
    orderLineImprintID: number;
    decorationName: string;
    locationName: string;
    productName: string;
    artworkComments: string;
    smartArtLoggedInName: string;
    smartArtAdminEmail: string;
    blnGroupRun: boolean;
    upload_order_final_art: boolean;
};

export interface sendOrderCustomerFollowUpEmail {
    orderID: number;
    orderLineID: number;
    orderLineImprintID: number;
    artApprovalContactID: number;
    storeUserApprovalContactID: number;
    protocol: string;
    email_recipients: string[];
    smartArtAdminEmail: string;
    locationName: string;
    methodName: string;
    imprintColors: string;
    productNumber: string;
    productName: string;
    primaryHighlight: string;
    storeID: string;
    storeName: string;
    storeCode: string;
    storeProductID: number;
    quantity: number;
    storeProductImageURL: string;
    storeUserFirstName: string;
    storeUserLastName: string;
    storeUserEmail: string;
    storeUserID: number;
    storeUserCompanyName: string;
    blnStoreUserApprovalDone: boolean;
    send_order_customer_followUp_email: boolean;
};
export interface updateImprintTime {
    newTime: string;
    imprintID: number;
    orderLineID: number;
    update_order_imprint_time: boolean;
};
export interface updateQuoteImprintTime {
    newTime: string;
    imprintID: number;
    cartLineID: number;
    update_quote_imprint_time: boolean;
};

export interface AddSmartArtCartComment {
    cartID: number;
    comment: string;
    fk_adminUserID: number;
    add_smartart_cart_comment: boolean;
};
export interface updateImprintColors {
    colorNameList: string;
    pmsColors: string;
    fk_cartLineID: number;
    imprint_id: number;
    update_quote_imprint_colors: boolean;
};

export interface UploadQuoteArtProof {
    blnIncludeApproveByDate: boolean;
    approveByDate: string;
    cartID: number;
    pk_userID: number; //main login id
    emailRecipients: string; // comma separated
    cartLineID: number;
    approvingStoreUserID: number;
    fk_artApprovalContactID: number;
    fk_storeUserApprovalContactID: number;
    storeUserID: number;
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    storePrimaryHighlight: string;
    storeID: number;
    storeName: string;
    storeURL: string;
    storeCode: string;
    protocol: string;
    customerRutgersEmployeeType: string;
    customerRutgersStudentType: string;
    blnGroupRun: boolean;
    productImageURL: string;
    productName: string;
    productNumber: string;
    productID: number;
    cartLineQuantity: number;
    decorationName: string;
    locationName: string;
    colorNameList: string;
    proofComment: string;
    upload_quote_art_proof: boolean;
    imprintColors: string;
    imprintID: number;
    statusID: number;
    thumbnailImage: string;
    smartArtAdminEmail: string;
    inHandsDate: string;
    blnIgnoreAdditionalArtEmails: boolean;
    blnRespond: boolean;
    isFileExist: boolean;
};

export interface UpdateQuoteArtworkStatus {
    cartLineID: number;
    cartID: number;
    cartDate: string;
    imprintID: number;
    userID: number;
    inHandsDate: string;
    statusID: number;
    storeID: number;
    storeName: string;
    storeCode: string;
    protocol: string;
    storeURL: string;
    blnRespond: boolean;
    blnGroupRun: boolean;
    proofComments: string;
    blnApproved: boolean; // Check fk_statusID for all orderLineImprintID's in the orderline 1 if statusID of imprint is "5,6,7,9,11,16" else 0
    smartArtLoggedInUserName: string;
    blnAdditionalArtApproval: boolean;
    blnAdditionalApprovalOverride: boolean;
    storePrimaryHighlight: string;
    billingStudentOrgCode: string;
    imprintsCount: number;
    storeProductImage: string;
    blnIgnoreAdditionalArtEmails: boolean;
    blnProofSent: boolean;
    fk_artApprovalContactID: number;
    fk_storeUserApprovalContactID: number;
    storeUserID: number;
    isFileExist: boolean;
    proofComment: string;
    pk_userID: number;
    productNumber: string;
    productName: string;
    locationName: string;
    methodName: string;
    userCompanyName: string;
    firstName: string;
    lastName: string;
    email: string;
    productID: number;
    orderQuantity: number;
    colorNameList: string;
    blnIncludeApproveByDate: boolean;
    approveByDate: string;
    update_quote_artwork_status: boolean;
};