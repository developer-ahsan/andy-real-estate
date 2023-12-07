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
    call_type:string,
    stores: number[]
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
    maxAmount: number
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
    maxAmount:number
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

export interface AddNewCore {
    core_name: string;
    blnCopy: boolean;
    categories: categories[];
    add_core: boolean;
};
interface categories {
    category_name: string;
    subCategory_names: string[];
};
export interface AddCoreCategory {
    core_id: number;
    category_name: string;
    add_core_category: boolean;
};
export interface AddSubCategory {
    categoryID: number;
    subCategoryName: string;
    add_subCategory: boolean;
};
export interface UpdateCoreCategory {
    category_name: string;
    core_id: number;
    category_id: number;
    is_delete: boolean;
    update_core_category: boolean;
};
export interface UpdateSubCategory {
    subCategory_name: string;
    subCategory_id: number;
    category_id: number;
    is_delete: boolean;
    update_subCategory: boolean;
};
export interface addSubCategoryProduct {
    subCategoryID: number;
    productIDs: number[];
    add_subCategory_product: boolean;
};
export interface DeleteCore {
    coreID: number;
    delete_core: boolean;
};
export interface UpdateProductDisplayOrder {
    subCategoryID: number;
    products: Products[];
    update_product_display_order: boolean;
};
interface Products {
    list_order: number;
    productID: number;
}
export interface DeleteImage {
    image_path: string;
    delete_image: boolean;
};