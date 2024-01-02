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
    orderLinePOID: number;
    update_inHands_date: boolean;
};
export interface AddComment {
    comment: string;
    order_id: number;
    orderManageLoggedInUserName: string;
    recipients: string[];
    store_name: string;
    company_name: string;
    post_comment: boolean;
};
export interface UpdateTracking {
    orderLinePOID: number;
    carrier: number;
    orderManageLoggedInName: string;
    trackingNumber: string;
    orderLineID: number;
    orderID: number;
    blnGroupRun: boolean;
    blnGroupOrder: boolean;
    shipDate: string;
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
export interface UpdateEstimatedShipping {
    orderLinePOID: number;
    orderLineID: number;
    orderManageLoggedInName: string;
    orderID: number;
    blnGroupRun: boolean;
    estimatedShippingDate: string;   // format: mm/dd/yy
    update_estimated_shipping: boolean;
};

export interface addAccessory {
    orderLinePOID: number;
    accessoryName: string;
    accessoryQuantity: number;
    accessoryUnitCost: number;
    accessorySetup: number;
    add_accessory: boolean;
};
export interface AddAdjustment {
    orderLinePOID: number;
    adjustmentTotalCost: number;
    adjustmentName: string;
    add_adjustment: boolean;
};
export interface Add_PO_Imprint {
    orderLinePOID: number;
    imprintName: string;
    imprintQuantity: number;
    imprintRun: number;
    imprintSetup: number;
    imprintNumColors: number;
    imprintColors: string;
    add_po_imprint: boolean;
};
export interface AddPOOption {
    orderLinePOID: number;
    optionName: string;
    optionQuantity: number;
    optionUnitCost: number;
    add_po_options: boolean;
};

export interface DeleteAdjustment {
    orderLinePOAdjustmentID: number;
    orderLinePOID: number;
    remove_adjustment: boolean;
};

export interface RemovePOOptions {
    orderLinePOOptionID: number;
    orderLinePOID: number;
    remove_po_options: boolean;
};

export interface RemoveAccessory {
    orderLinePOAccessoryID: number;
    orderLinePOID: number;
    remove_accessory: boolean;
};

export interface Remove_PO_Imprint {
    orderLinePOImprintID: number;
    orderLinePOID: number;
    remove_po_imprint: boolean;
};

export interface SendPurchaseOrder {
    orderLinePOID: number;
    fk_vendorID: number;
    purchaseOrderNumber: string;
    vendorShippingName: string;
    shippingDate: string;
    estimatedShippingDate: string;
    trackingNumber: string;
    total: number;
    blnArtNeedsResent: boolean;
    send_purchase_order: boolean
};



export interface removePurchaseOrderItem {
    orderID: number;
    orderLineID: number;
    remove_purchase_order_item: boolean;
};

export interface DeletePurchaseOrder {
    orderLinePOID: number;
    orderId: number;
    delete_purchase_order: boolean;
};


// Creat PO
export interface createPurchaseOrder {
    vendorPOID: number;
    companyName: string;
    vendorShippingAddress1: string;
    vendorShippingAddress2: string;
    vendorShippingCity: string;
    vendorShippingState: string;
    vendorShippingZip: string;
    vendorShippingPhone: string;
    vendorShippingEmail: string;
    shippingComment: string;
    shipToCompanyName: string;
    shipToCustomerName: string;
    shipToLocation: string;
    shipToPurchaseOrder: string;
    shipToAddress: string;
    shipToCity: string;
    shipToState: string;
    shipToZip: string;
    shipToCountry: string;
    shipToDeliverTo: string;
    productName: string;
    quantity: string;
    blnSupplier: boolean;
    blnDecorator: boolean;
    orderID: number;
    create_purchase_order: boolean;
};

export interface DuplicatePO {
    order_id: number;
    orderLinePOID: number;
    orderLinePO: OrderLinePO;
    orderLineOptions: orderLineOption[];
    orderLineImprints: orderLineImprint[];
    orderLineAccessories: orderLineAccessory[];
    orderLineAdjustments: orderLineAdjustments[];
    duplicate_purchase_order: boolean;
};

interface orderLineOption {
    productName: string;
    optionName: string;
    quantity: number;
    unitCost: number;
    total: number;
    fk_optionID: number;
};

interface orderLineImprint {
    imprintName: string;
    quantity: number;
    unitCost: number;
    total: number;
    colors: string;
    setup: number;
    totalImprintColors: number;
    blnStitchProcess: boolean;
    blnColorProcess: boolean;
    blnSingleProcess: boolean;
    processQuantity: number;
    fk_imprintID: number;
};

interface orderLineAccessory {
    accessoryName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    setupCost: number;
};

interface orderLineAdjustments {
    adjustmentName: string;
    unitCost: number;
};

interface OrderLinePO {
    fk_vendorID: number;
    vendorShippingName: string;
    vendorShippingAddress1: string;
    vendorShippingAddress2: string;
    vendorShippingCity: string;
    vendorShippingState: string;
    vendorShippingZip: string;
    vendorShippingPhone: string;
    vendorShippingEmail: string;
    shippingComment: string;
    shipToCompanyName: string;
    shipToCustomerName: string;
    shipToLocation: string;
    shipToPurchaseOrder: string;
    shipToAddress: string;
    shipToCity: string;
    shipToState: string;
    shipToZip: string;
    shipToCountry: string;
    imprintComment: string;
    POTotal: number;
    shipToDeliverTo: string;
    productName: string;
    quantity: string;
    purchaseOrderNumber: string;
    purchaseOrderComments: string;
    blnDuplicate: boolean;
};

// Save & Send PO
export interface SaveAndSendPurchaseOrder {
    orderLinePOID: number;
    purchaseOrderNumber: string;
    purchaseOrderComments: string;
    POTotal: number;
    vendorShippingName: string;
    vendorShippingEmail: string;
    shippingDate: string;
    estimatedShippingDate: string;
    trackingNumber: string;
    total: number;
    blnArtNeedsResent: boolean;
    blnGroupRun: boolean;
    productName: string;
    storeName: string;
    orderId: number;
    blnSample: boolean;
    orderLineID: number;
    fk_vendorID: number;
    customerAccountNumber: string;
    shipToPurchaseOrder: string;
    vendorShippingAddress1: string;
    vendorShippingAddress2: string;
    vendorShippingCity: string;
    quantity: number;
    orderManageLoggedInUserName: string;
    vendorShippingState: string;
    vendorShippingZip: string;
    vendorShippingPhone: string;
    shippingComment: string;
    POinHandsDate: string;
    shipToCompanyName: string;
    shipToCustomerName: string;
    shipToLocation: string;
    shipToAddress: string;
    shipToDeliverTo: string;
    shipToCity: string;
    shipToState: string;
    shipToZip: string;
    shipToCountry: string;
    stockFrom: string;
    blnDecorator: boolean;
    blnSupplier: boolean;
    poOptions: poOptions[];
    poImprints: poImprints[];
    poAccessories: poAccessories[];
    poAdjustments: poAdjustments[];
    save_send_purchase_order: boolean;
};

interface poOptions {
    optionName: string;
    quantity: number;
    unit: number;
    total: number;
};


interface poImprints {
    imprintName: string;
    quantity: number;
    unitCost: number;
    total: number;
    reorderNumber: string;
    setup: number;
    processQuantity: number;
    colors: string;
    imprintComment: string;
};


interface poAccessories {
    accessoryName: string;
    quantity: number;
    unitCost: number;
    total: number;
    setupCost: number;
};

interface poAdjustments {
    adjustmentName: string;
    unitCost: number;
};

export interface updatePurchaseOrderStatus {
    orderLinePOID: number;
    statusID: number;
    update_purchase_order_status: boolean;
};
// Bulk Update
export interface updateOrderManageBulkStatusUpdate {
    status_id: number;
    poOrders: poOrders[];
    backorderDate: string;
    orderManageLoggedInUserName: string;
    orderManageUserID: number;
    update_orderManage_bulk_status: boolean;
};

interface poOrders {
    orderLine_id: number;
    blnGroupRun: boolean;
    pk_orderLinePOID: number;
    product_id: number;
    productNumber: string;
    productName: string;
    orderID: number;
};



// SAVE PO
// export interface SavePurchaseOrder {
//     orderManageLoggedInUserName: string;
//     orderLinePOID: number;
//     orderLinePO: OrderLinePOSave;
//     orderLineOptions: orderLineOptionSave[];
//     orderLineImprints: orderLineImprintSave[];
//     orderLineAccessories: orderLineAccessorySave[];
//     orderLineAdjustments: orderLineAdjustmentsSave[];
//     blnArtNeedsResent: boolean;
//     save_purchase_order: boolean;
// };

// interface orderLineOptionSave {
//     optionName: string;
//     quantity: number;
//     unitCost: number;
//     productName: string;
//     total: number;
//     pk_orderLinePOOptionID: number;
// };

// interface orderLineImprintSave {
//     imprintName: string;
//     quantity: number;
//     unitCost: number;
//     total: number;
//     colors: string;
//     setup: number;
//     totalImprintColors: number;
//     imprintComment: string;
//     processQuantity: number;
//     reorderNumber: string;
//     pk_orderLinePOImprintID: number;
// };
// interface orderLineAccessorySave {
//     accessoryName: string;
//     quantity: number;
//     unitCost: number;
//     totalCost: number;
//     setupCost: number;
//     pk_orderLinePOAccessoryID: number;
// };
// interface orderLineAdjustmentsSave {
//     adjustmentName: string;
//     unitCost: number;
//     pk_orderLinePOAdjustmentID: number;
// };
// interface OrderLinePOSave {
//     fk_vendorID: number;
//     vendorShippingName: string;
//     vendorShippingAddress1: string;
//     vendorShippingAddress2: string;
//     vendorShippingCity: string;
//     vendorShippingState: string;
//     vendorShippingZip: string;
//     vendorShippingPhone: string;
//     vendorShippingEmail: string;
//     shippingComment: string;
//     shipToCompanyName: string;
//     shipToCustomerName: string;
//     shipToLocation: string;
//     shipToPurchaseOrder: string;
//     shipToAddress: string;
//     shipToCity: string;
//     shipToState: string;
//     shipToZip: string;
//     shipToCountry: string;
//     imprintComment: string;
//     POTotal: number;
//     shipToDeliverTo: string;
//     quantity: string;
//     purchaseOrderNumber: string;
//     productName: string;
//     purchaseOrderComments: string;
//     blnDuplicate: boolean;
//     POinHandsDate: string;
//     stockFrom: string;
//     imprintDetail: string;
//     coop: string;
//     shippingDate: string;
//     estimatedShippingDate: string;
//     trackingNumber: string;
//     total: number;
//     blnGroupRun: boolean;
//     orderId: number;
//     orderLineID: number;
//     storeName: string;
//     blnDecorator: boolean;
//     blnSupplier: boolean;
//     blnSample: boolean;
//     customerAccountNumber: string;
// };

export interface AddAttachment {
    orderLinePOID: number;
    extension: string;
    name: string;
    mimeType: string;
    add_attachment: boolean;
};





export interface SavePurchaseOrders {
    orderManageLoggedInUserName: string;
    orderLinePOID: number;
    orderLinePO: OrderLinePOs;
    orderLineOptions: orderLineOptions[];
    orderLineImprints: orderLineImprints[];
    orderLineAccessories: orderLineAccessorys[];
    orderLineAdjustments: orderLineAdjustments[];
    blnArtNeedsResent: boolean;
    blnSend: boolean;
    blnCashBack: boolean;
    qryStoreUserCashbackSettingsBlnCashBack: boolean;
    blnEProcurement: boolean;
    cashbackDiscount: number;
    fk_groupOrderID: number;
    orderLineIDs: number[];
    attachments: Attachments[];
    save_purchase_order: boolean;
};

interface Attachments {
    pk_purchaseOrderAttachmentID: number;
    extension: string;
    name: string;
    mimeType: string;
};

interface orderLineOptions {
    optionName: string;
    quantity: number;
    unitCost: number;
    productName: string;
    total: number;
    pk_orderLinePOOptionID: number;
};

interface orderLineImprints {
    imprintName: string;
    quantity: number;
    unitCost: number;
    total: number;
    colors: string;
    setup: number;
    totalImprintColors: number;
    imprintComment: string;
    processQuantity: number;
    reorderNumber: string;
    pk_orderLinePOImprintID: number;
};

interface orderLineAccessorys {
    accessoryName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    setupCost: number;
    pk_orderLinePOAccessoryID: number;
};

interface orderLineAdjustments {
    adjustmentName: string;
    unitCost: number;
    pk_orderLinePOAdjustmentID: number;
};

interface OrderLinePOs {
    fk_vendorID: number;
    vendorShippingName: string;
    vendorShippingAddress1: string;
    vendorShippingAddress2: string;
    vendorShippingCity: string;
    vendorShippingState: string;
    vendorShippingZip: string;
    vendorShippingPhone: string;
    vendorShippingEmail: string;
    shippingComment: string;
    shipToCompanyName: string;
    shipToCustomerName: string;
    shipToLocation: string;
    shipToPurchaseOrder: string;
    shipToAddress: string;
    shipToCity: string;
    shipToState: string;
    shipToZip: string;
    shipToCountry: string;
    POTotal: number;
    shipToDeliverTo: string;
    quantity: string;
    purchaseOrderNumber: string;
    purchaseOrderComments: string;
    blnDuplicate: boolean;
    POinHandsDate: string;
    stockFrom: string;
    imprintDetail: string;
    coop: string;
    shippingDate: string;
    estimatedShippingDate: string;
    trackingNumber: string;
    total: number;
    blnExported: boolean;
    blnGroupRun: boolean;
    isPOProofPath: boolean;
    orderID: number;
    fk_storeUserID: number;
    storeID: number;
    orderLineID: number;
    groupRunOrderLineID: number;
    storeName: string;
    productName: string;
    blnDecorator: boolean;
    blnSupplier: boolean;
    blnSample: boolean;
    customerAccountNumber: string;
};


// PDF LINK
export interface POPDFLink {
    orderLinePO: OrderLinePOPDF;
    orderLineOptions: orderLineOptionpdf[];
    orderLineImprints: orderLineImprintPDF[];
    orderLineAccessories: orderLineAccessoryPDF[];
    orderLineAdjustments: orderLineAdjustmentsPDF[];
    generate_POPDFLink: boolean;
};

interface orderLineOptionpdf {
    optionName: string;
    quantity: number;
    unitCost: number;
    productName: string;
    total: number;
    pk_orderLinePOOptionID: number;
};

interface orderLineImprintPDF {
    imprintName: string;
    quantity: number;
    unitCost: number;
    total: number;
    colors: string;
    setup: number;
    totalImprintColors: number;
    imprintComment: string;
    processQuantity: number;
    reorderNumber: string;
    pk_orderLinePOImprintID: number;
};

interface orderLineAccessoryPDF {
    accessoryName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    setupCost: number;
    pk_orderLinePOAccessoryID: number;
};

interface orderLineAdjustmentsPDF {
    adjustmentName: string;
    unitCost: number;
    pk_orderLinePOAdjustmentID: number;
};

interface OrderLinePOPDF {
    fk_vendorID: number;
    vendorShippingName: string;
    vendorShippingAddress1: string;
    vendorShippingAddress2: string;
    vendorShippingCity: string;
    vendorShippingState: string;
    vendorShippingZip: string;
    vendorShippingPhone: string;
    vendorShippingEmail: string;
    shippingComment: string;
    shipToCompanyName: string;
    shipToCustomerName: string;
    shipToLocation: string;
    shipToPurchaseOrder: string;
    shipToAddress: string;
    shipToCity: string;
    shipToState: string;
    shipToZip: string;
    shipToCountry: string;
    POTotal: number;
    shipToDeliverTo: string;
    quantity: string;
    purchaseOrderNumber: string;
    purchaseOrderComments: string;
    blnDuplicate: boolean;
    POinHandsDate: string;
    stockFrom: string;
    orderID: number;
    storeID: number;
    orderLineID: number;
    storeName: string;
    blnDecorator: boolean;
    blnSupplier: boolean;
    blnSample: boolean;
    customerAccountNumber: string;
};