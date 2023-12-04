export interface AddColor {
    colors: string[];
    add_color: boolean;
};
export interface UpdateColor {
    color_name: string;
    color_id: number;
    update_color: boolean;
};

export interface DeleteColor {
    color_id: number;
    delete_color: boolean;
};
// Sizes
export interface AddSize {
    size_name: string;
    list_order: number;
    add_size: boolean;
};

export interface UpdateSize {
    sizes: Sizes[];
    update_size: boolean;
};

export interface Sizes {
    size_name: string;
    list_order: number;
    size_id: number;
};


export interface DeleteSize {
    size_id: number[];
    delete_size: boolean;
};

// Pack/Accessories
export interface UpdatePackage {
    package_id: number;
    package_name: string;
    update_package: boolean;
};

export interface AddPackage {
    package_name: string;
    add_package: boolean;
};

export interface DeletePackage {
    package_id: number;
    delete_package: boolean;
};

// Imprint Colors
export interface AddImprintColor {
    color_name: string;
    rgb: string;
    add_imprint_color: boolean;
};

export interface UpdateImprintColor {
    color_name: string;
    rgb: string;
    color_id: number;
    update_imprint_color: boolean;
};

export interface DeleteImprintColor {
    imprint_color_id: number;
    delete_imprint_color: boolean;
};

// Imprint Methods
export interface AddImprintMethod {
    method_name: string;
    method_description: string;
    add_imprint_method: boolean;
};

export interface UpdateImprintMethod {
    method_name: string;
    description: string;
    method_id: number;
    update_imprint_method: boolean;
};

export interface UpdateLocation {
    location_name: string;
    location_id: number;
    update_imprint_location: boolean;
};

export interface add_setup_charge {
    dist_code: number;
    quantities: charge_obj[];
    add_charge_setup: boolean;
}
export interface charge_obj {
    process_quantity: number;
    product_quantity: number;
    charge: number;
}

export interface AddOhioTaxRate {
    zip: string;
    county: string;
    rate: number;
    add_ohio: boolean;
};

export interface UpdateOhioTaxRate {
    ohio_rates: OhioRates[];
    update_ohio: boolean;
};

interface OhioRates {
    county: string;
    zip: string;
    rate: number;
    county_id: number;
    is_delete: boolean;
};

export interface UpdateStoreStatus {
    stores: Store[];
    update_store_status: boolean;
};

interface Store {
    store_id: number;
    bln_active: boolean;
};

export interface AddBlurb {
    blurb: string;
    add_blurb: boolean;
};

export interface DeleteBlurb {
    blurb_id: number;
    delete_blurb: boolean;
};
// Support Team
export interface AddDefaultSupportTeam {
    role_name: string;
    name: string;
    description: string;
    email: string;
    phone: string;
    role_type: string;
    add_default_support_team: boolean;
};

export interface UpdateDefaultSupportTeam {
    role_name: string;
    name: string;
    description: string;
    email: string;
    phone: string;
    role_type: string;
    member_id: number;
    update_default_support_team: boolean;
};

export interface DeleteTeamMember {
    member_id: number;
    delete_team_member: boolean;
};

export interface AddMemberFeature {
    member_id: number;
    feature: string;
    add_member_feature: boolean;
};

export interface DeleteMemberFeature {
    feature_id: number;
    member_id: number;
    delete_member_feature: boolean;
};

export interface UpdateMemberFeature {
    feature: string;
    feature_id: number;
    member_id: number;
    update_member_feature: boolean;
};

export interface AddPromoCode {
    promocode: string;
    amount: number;
    threshold: number;
    description: string;
    blnActive: boolean;
    expDate: string;
    blnShipping: boolean;
    blnRemoveShippingCost: boolean;
    blnRemoveShippingPrice: boolean;
    blnRemoveCost: boolean;
    blnRemovePrice: boolean;
    blnPercent: boolean;
    add_promo_code: boolean;
};

export interface DeletePromoCode {
    promocode: string;
    delete_promo_code: boolean;
};
export interface UpdatePromoCode {
    amount: number;
    threshold: number;
    description: string;
    blnActive: boolean;
    expDate: string;
    blnShipping: boolean;
    blnRemoveShippingCost: boolean;
    blnRemoveShippingPrice: boolean;
    blnRemoveCost: boolean;
    blnRemovePrice: boolean;
    blnPercent: boolean;
    promocode: string;
    update_promo_code: boolean;
};

// Run Charge
export interface UpdateCharge {
    charge_id: number;
    charges: ChargeValue[];
    update_imprint_charges: boolean;
};

interface ChargeValue {
    product_quantity: number;
    process_quantity: number;
    value: number;
};
export interface AddStandardImprintGroup {
    name: string;
    add_standard_imprint_group: boolean;
};
export interface DeleteStandardImprintGroup {
    standardImprintGroupID: number;
    delete_standard_imprint_group: boolean;
};

export interface UpdateStandardImprintGroup {
    standardImprintGroupID: number;
    name: string;
    update_standard_imprint_group: boolean;
};

export interface AddStandardImprint {
    fk_standardImprintGroupID: number;
    name: string;
    fk_decoratorID: number;
    fk_methodID: number;
    method_name: string;
    fk_locationID: number;
    location_name: string;
    fk_setupChargeID: number;
    fk_runChargeID: number;
    blnIncludable: boolean;
    area: string;
    blnUserColorSelection: boolean;
    maxColors: number;
    fk_multiColorMinQID: number;
    fk_collectionID: number;
    blnColorProcess: boolean;
    blnStitchProcess: boolean;
    blnSingleProcess: boolean;
    minProductQty: number;
    imprintComments: string;
    fk_digitizerID: number;
    displayOrder: number;
    blnSingleton: boolean;
    add_standard_imprint: boolean;
};
export interface UpdateStandardImprint {
    standardImprintGroupID: number;
    name: string;
    fk_decoratorID: number;
    fk_methodID: number;
    method_name: string;
    fk_locationID: number;
    location_name: string;
    fk_setupChargeID: number;
    fk_runChargeID: number;
    blnIncludable: boolean;
    area: string;
    blnUserColorSelection: boolean;
    maxColors: number;
    fk_multiColorMinQID: number;
    fk_collectionID: number;
    blnColorProcess: boolean;
    blnStitchProcess: boolean;
    blnSingleProcess: boolean;
    minProductQty: number;
    imprintComments: string;
    fk_digitizerID: number;
    displayOrder: number;
    blnSingleton: boolean;
    pk_standardImprintID: number;
    update_standard_imprint: boolean;
};
export interface DeleteStandardImprint {
    pk_standardImprintID: number;
    delete_standard_imprint: boolean;
};
// Admin tools
export interface ClearStoreRapidbuild {
    store_id: number;
    clear_rapidbuild: boolean;
};
export interface RemoveUser {
    user_id: number;
    remove_user: boolean;
};
export interface RemoveOrder {
    order_id: number;
    remove_order: boolean;
};
export interface MergeUsers {
    masterUserID: number;
    slaveUserID: number;
    merge_users: boolean;
};
export interface ClearUserCarts {
    user_id: number;
    date: string;
    clear_user_cart: boolean;
};
// Admin Structure

export interface AddNewNode {
    name: string;
    parent_id: number;
    add_node: boolean;
};

export interface UpdateNode {
    name: string;
    section_id: number;
    parent_id: number;
    update_node: boolean;
};

export interface DeleteNode {
    section_id: number;
    delete_node: boolean;
};



// Vendors
export interface AddCompany {
    companyName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    fax: string;
    ASI: string;
    PPAI: string;
    artworkEmail: string;
    ordersEmail: string;
    websiteURL: string;
    outsideRep: string;
    insideRep: string;
    outsideRepPhone: string;
    outsideRepEmail: string;
    insideRepPhone: string;
    insideRepEmail: string;
    samplesContactEmail: string;
    companyType: number[];
    customerAccountNumber: string;
    create_company: boolean;
};
export interface UpdateCompany {
    company_id: number;
    companyName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    fax: string;
    ASI: string;
    PPAI: string;
    artworkEmail: string;
    ordersEmail: string;
    websiteURL: string;
    outsideRep: string;
    insideRep: string;
    outsideRepPhone: string;
    outsideRepEmail: string;
    insideRepPhone: string;
    insideRepEmail: string;
    samplesContactEmail: string;
    additionalOrderEmails: string;
    vendorRelation: number;
    screenprintEmail: string;
    embroideryEmail: string;
    coopPricing: string;
    netSetup: string;
    ltm: string;
    freeRandomSamples: string;
    specSamples: string;
    production: string;
    notes: string;
    customerAccountNumber: string;
    shippingComment: string;
    update_company: boolean;
    imprintDetails : string
};
export interface UpdateWebsiteLoginInfo {
    company_id: number;
    user_name: string;
    password: string;
    update_website_login: boolean;
};

export interface updateCompanySettings {
    company_id: number;
    blnFreeShipping: boolean;
    update_company_settings: boolean;
};

export interface AddFOBLocation {
    location_name: string;
    supplier_id: number;
    address: string;
    city: string;
    state: string;
    zip: string;
    add_fob_location: boolean;
};

export interface RemoveFOBLocation {
    location_id: number;
    remove_fob_location: boolean;
};

export interface ApplyBlanketFOBlocation {
    supplier_id: number;
    location_id: number;
    supplier_name: string;
    apply_fob_location: boolean;
};
// Sizing chart
export interface AddSizeChart {
    company_id: number;
    name: string;
    description: string;
    extension: string;
    add_size: boolean;
};
export interface UpdateSizeChart {
    company_id: number;
    name: string;
    description: string;
    extension: string;
    chart_id: number;
    update_size: boolean;
};
export interface RemoveSizeChart {
    chart_id: number;
    remove_size_chart: boolean;
};
export interface vendorComment {
    admin_comment: string;
    company_id: number;
    emails: string[];
    add_comment: boolean;
};
export interface AddCoops {
    company_id: number;
    coopName: string;
    coopExpDay: string;
    pricing: string;
    ltm: string;
    setups: string;
    productionTime: string;
    add_coop: boolean;
};
export interface UpdateCoops {
    coOp_id: number;
    coopName: string;
    coopExpDay: string;
    pricing: string;
    ltm: string;
    setups: string;
    productionTime: string;
    update_coop: boolean;
};
export interface DeleteCoops {
    coOp_id: number;
    remove_coops: boolean;
};
export interface applyCompanyWideCoop {
    coopID: number;
    companyID: number;
    companyName: string;
    apply_blanket_Coop: boolean;
};
export interface updateAdminUser {
    userID: number;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    blnActive: boolean;
    blnManager: boolean;
    blnMasterAccount: boolean;
    update_vendor_user: boolean;
};

export interface DeleteAdminUser {
    user_id: number;
    delete_vendor_admin: boolean;
};

export interface AddAdminUser {
    firstName: string;
    lastName: string;
    userName: string;
    password: string;
    email: string;
    registerIP: string;
    supplier_id: number;
    blnMasterAccount: boolean;
    blnManager: boolean;
    create_vendor_user: boolean;
};
export interface ApplyBlanketRun {
    charge_id: number;
    supplier_id: number;
    apply_blanket_run: boolean;
};
export interface ApplyBlanketSetup {
    charge_id: number;
    supplier_id: number;
    apply_blanket_setup: boolean;
};
export interface ApplyBlanketCollection { collection_id: number; supplier_id: number; apply_blanket_collection: boolean; };

export interface UpdateAccountingProfile {
    APContactName: string;
    APEmail: string;
    remitEmailAddress: string;
    additionalEmail: string;
    netTerms: string;
    creditLimit: string;
    paymentMethod: string;
    fk_companyID: string;
    update_vendor_profile: boolean;
};

export interface updateVendorStatus {
    companyID: number;
    blnActiveVendor: boolean;
    disabledReason: string;
    update_vendor_status: boolean;
};