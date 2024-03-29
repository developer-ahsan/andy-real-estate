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

export interface addAccessory {
    cartID: number;
    loggedInUserID: number;
    cartLineID: number;
    cartline_fkProductID: number;
    orderQuantity: number;
    packagingID: number;
    packagingName: string;
    productName: string;
    quantityPerPackage: number;
    setup: number;
    run: number;
    blnOverrideShippingNewAccessory: boolean;
    isFulfillmentCart: boolean;
    warehouse_delivery_option: number;
    cartLineGroundCost: number;
    cartLineGroundPrice: number;
    storeID: number;
    add_modify_quote_accessory: boolean;
};


export interface updateAccessories {
    cartID: number;
    storeID: number;
    cartLineID: number;
    blnGroupRun: number;
    productName: string;
    loggedInUserID: number;
    accessories: UpdateAccessory[];
    deleteAccessories: DeleteAccessory[];
    blnOverrideShippingNewAccessory: boolean;
    orderQuantity: number;
    isFulfillmentCart: boolean;
    warehouse_delivery_option: number;
    cartLineGroundCost: number;
    cartLineGroundPrice: number;
    update_modify_quote_accessory: boolean;
};

interface UpdateAccessory {
    packagingName: string;
    quantityPerPackage: number;
    runPrice: number;
    runCost: number;
    setupPrice: number;
    setupCost: number;
    packagingID: number;
};

interface DeleteAccessory {
    packagingID: number;
    packagingName: string;
};


export interface updateImprints {
    cartID: number;
    cartLineID: number;
    blnGroupRun: number;
    productName: string;
    loggedInUserID: number;
    storeID: number;
    imprints: UpdateImprint[];
    update_modify_quote_imprint: boolean;
};

interface UpdateImprint {
    imprintID: number;
    processQuantity: number;
    locationName: string;
    decorationName: string;
    colorNameList: string;
    pmsColors: string;
    cartLineImprintRunCost: number;
    cartLineImprintRunPrice: number;
    cartLineImprintSetupCost: number;
    cartLineImprintSetupPrice: number;
    blnOverride: boolean;
    customerArtworkComment: string;
    decoratorID: number;
    runCost: number;
    runPrice: number;
    setupCost: number;
    setupPrice: number;
    blnOverrideRunSetup: boolean;
};

export interface deleteImprints {
    cartID: number;
    cartLineID: number;
    storeID: number;
    blnGroupRun: number;
    productName: string;
    loggedInUserID: number;
    imprintID: number;
    locationName: string;
    decorationName: string;
    delete_modify_quote_imprint: boolean;
};
export interface AddImprints {
    cartID: number;
    storeID: number;
    cartLineID: number;
    blnGroupRun: number;
    productName: string;
    loggedInUserID: number;
    imprintID: number;
    locationID: number;
    locationName: string;
    decoratorID: number;
    decorationName: string;
    processQuantity: number;
    imprintColorName: string;
    runCost: number;
    runPrice: number;
    setupCost: number;
    setupPrice: number;
    add_modify_quote_imprint: boolean;
};
export interface UpdateCartShipping {
    shippingGroundPrice: number;
    shippingGroundCost: number;
    cartLineGroundCost: number;
    cartLineGroundPrice: number;
    cartLine_id: number;
    cartID: number;
    admin_user_id: number;
    blnOverrideShippingShipping: boolean;
    orderQuantity: number;
    isFulfillmentCart: boolean;
    warehouse_delivery_option: number;
    update_cart_shipping: boolean;
};

export interface RemoveCartProduct {
    blnGroupRun: boolean;
    groupRunCartLineID: number;
    cartLine_id: number;
    cart_id: number;
    loggedInUserID: number;
    delete_cart_product: boolean;
};
export interface RemoveCartProduct {
    blnGroupRun: boolean;
    groupRunCartLineID: number;
    cartLine_id: number;
    cart_id: number;
    loggedInUserID: number;
    delete_cart_product: boolean;
};
export interface updateGroupRun {
    blnGroupRun: boolean;
    quantity: number;
    cartLineID: number;
    update_group_run: boolean;
};

export interface addNewProduct {
    newProductSizeID: number;
    newProductColorID: number;
    blnTaxable: boolean;
    blnSample: boolean;
    blnRoyalty: boolean;
    blnOverRide: boolean;
    cartID: number;
    cartLineID: number;
    quantity: number;
    storeID: number;
    productID: number;
    productNumber: string;
    productName: string;
    loggedInUserID: number;
    add_new_product: boolean;
};

export interface addGroupRunProduct {
    blnTaxable: boolean;
    blnRoyalty: boolean;
    blnSample: boolean;
    blnOverRide: boolean;
    cartID: number;
    cartLineID: number;
    quantity: number;
    storeID: number;
    productID: number;
    productNumber: string;
    productName: string;
    loggedInUserID: number;
    add_group_run_product: boolean;
};

export interface addProductOption {
    cart_id: number;
    cartline_id: number;
    store_id: number;
    color_id: number;
    color_name: string;
    size_id: number;
    size_name: string;
    product_id: number;
    product_name: string;
    isApparel: boolean;
    groupRunCartLineID: number;
    blnGroupRun: boolean;
    quantity: number;
    admin_user_id: number;
    blnOverrideShippingNewOption: boolean;
    orderQuantity: number;
    isFulfillmentCart: boolean;
    warehouse_delivery_option: number;
    cartLineGroundCost: number;
    cartLineGroundPrice: number;
    add_cart_product_option: boolean;
};

export interface updateProductOption {
    cart_line_options: cart_line_option[];
    remove_option_ids: cart_line_option[];
    cartLineID: number;
    cartID: number;
    blnGroupRun: boolean;
    groupRunCartLineID: boolean;
    bln_unit_cost_override: boolean;
    blnOverrideShippingNewOption: boolean;
    orderQuantity: number;
    isFulfillmentCart: boolean;
    warehouse_delivery_option: number;
    cartLineGroundCost: number;
    cartLineGroundPrice: number;
    storeID: number;
    update_cart_product_option: boolean;
};
export interface UpdateCartRoyalties {
    royalty_price: number;
    cartLine_id: number;
    cartID: number;
    admin_user_id: number;
    update_cart_royalty: boolean;
};

export interface cart_line_option {
    product_id: number;
    color_id: number;
    color_name: string;
    quantity: number;
    size_id: number;
    size_name: string;
    cart_line_option_run_cost: number;
    cart_line_option_run_price: number;
    cart_line_option_setup_cost: number;
    cart_line_option_setup_price: number;
    option_id: number;
    product_name: string;
};