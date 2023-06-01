export interface Items {
    folders: Item[];
    files: Item[];
};

export interface Item {
    id?: string;
    name?: string;
    createdBy?: string;
    createdAt?: string;
    modifiedAt?: string;
    size?: string;
    type?: string;
    contents?: string | null;
    description?: string | null;
};

export interface StoreList {
    pk_storeID: number;
    storeName: string;
    storeUrl?: string;
};

export interface StoreSettings {
    store_id: number;
    store_name: string;
    store_code: string;
    store_url: string;
    store_description: string;
    store_handling: number;
    site_max_id: number;
    site_max_queue_id: number;
    google_analytics_id: string;
    tagline: string;
    champion_name: string;
    bln_eprocurement: boolean;
    bln_electronic_invoice: boolean;
    browser_title: string;
    meta_description: string;
    meta_keyword: string;
    bln_shipping: string;
    protocol: string;
    business_name: string;
    report_color: string;
    fk_credit_term_id: string;
    registration_text: string;
    bln_require_reference: boolean;
    bln_tax_exempt: boolean;
    bln_cost_center_codes: boolean;
    bln_show_cost_center_codes: boolean;
    bln_welcome_email: boolean;
    google_tag: string;
    bing_tag: string;
    bln_require_cost_center_code: boolean;
    bln_require_location: boolean;
    bln_product_numbers: boolean;
    bln_pdf_invoice: boolean;
    bln_logo_bank: boolean;
    bln_decline_program_notification: boolean;
    bln_checkout_referral: boolean;
    bln_expanded_product_search: boolean;
    bln_review_emails: boolean;
    bln_reorder_promo_code: boolean;
    bln_reorder_emails: boolean;
    bln_welcome_email_promo_code: boolean;
    bln_quote_help: boolean;
    bln_exit_survey: boolean;
    bln_require_account_code: boolean;
    bln_top_review_email: boolean;
    bln_smart_art_quotes: boolean;
    bln_customer_logo_bank: boolean;
    bln_master_account_show_all_orders: boolean;
    bln_sales_report: boolean;
    bln_cash_back: boolean;
    cashback_percent: number;
    product_builder_text: string;
    bln_allow_registration: boolean;
    bln_pdf_shipping_notification: boolean;
    bln_registered_user_cashback_default: boolean;
    bln_chat: boolean;
    store_setting: boolean;
};

export interface GroupBuy {
    bln_choose_existing_customers: boolean;
    bln_groud_order_active: boolean;
    store_id: number;
    group_buy: boolean;
};

export interface ShippingNotification {
    store_id: number;
    bln_notification: boolean;
    shipping_notification: boolean;
};

export interface AddSurvey {
    store_id: number;
    name: string;
    survey: boolean
};

export interface CreateStoreSettings {
    fk_storeID: number;
    blnOffer: boolean;
    offerText: string;
    offerTextBox: string;
    offerFooter: string;
    typeKitID: string;
    registrationText: string;
    blnCostCenterCodes: boolean;
    blnShowCostCenterCodes: boolean;
    blnWelcomeEmail: boolean;
    googleTag: string;
    bingTag: string;
    blnRequireCostCenterCode: boolean;
    blnRequireLocation: boolean;
    blnProductNumbers: boolean;
    blnPDFInvoice: boolean;
    blnLogoBank: boolean;
    blnDecliningProgramNotifications: boolean;
    blnCheckoutReferral: boolean;
    campaignTitle: string;
    blnExpandedProductSearch: boolean;
    blnQuoteHelp: boolean;
    blnExitSurvey: boolean;
    blnRequireAccountCode: boolean;
    blnSmartArtQuotes: boolean;
    blnCustomerLogoBank: boolean;
    blnSalesReport: boolean;
    blnPDFShippingNotifications: boolean;
    blnEProcurement: boolean;
    add_new_store_settings: boolean;
};
export interface CreateStore {
    storeName: string;
    storeCode: string;
    storeURL: string;
    margin1: number;
    margin2: number;
    margin3: number;
    margin4: number;
    margin5: number;
    margin6: number;
    storeHandling: number;
    siteMaxSiteID: number;
    siteMaxQueueID: number;
    googleAnalyticsID: string;
    tagLine: string;
    championName: string;
    secretKey: string;
    blnEProcurement: boolean;
    blnElectronicInvoicing: boolean;
    browserTitle: string;
    metaDesc: string;
    metaKeywords: string;
    blnShipping: boolean;
    launchDate: string;
    protocol: string;
    businessName: string;
    reportColor: string;
    add_new_store: boolean;
};
export interface AddCampaign {
    fk_storeID: number;
    objective: string;
    strategy: string;
    results: string;
    store_product_list_id: number[];
    title: string;
    shortDesc: string;
    blnFeature: boolean;
    blnActive: boolean;
    videoURL: string;
    permalink: string;
    add_new_campaign: boolean;
};
export interface email_preview {
    campaign_id: number;
    title: string;

    objective: string;

    strategy: string;
    store_id: number;
    template_id: string;
    store_name: string;
    subject: string;
    message: string;
    header: string;
    emails: string[];
    get_emails_template: boolean;
}
// Presentaions
export interface editSocialMedia {
    facebook_url: string;
    twitter_url: string;
    linkedin_url: string;
    instagram_url: string;
    store_id: number;
}
// Feature Images
export interface AddStaticFeatureImage {
    fk_storeID: number;
    blnNewWindow: boolean;
    imageURL: string;
    add_static_mobile_image: boolean;
};

export interface EditStaticFeatureImage {
    pk_mobileFeatureImageID: number;
    blnNewWindow: boolean;
    imageURL: string;
    update_static_mobile_image: boolean;
};

export interface DeleteMobileImage {
    pk_mobileFeatureImageID: number;
    delete_mobile_image: boolean;
};
export interface AddFeatureImage {
    store_id: number;
    buttonURL: string;
    displayOrder: number;
    blnNewWindow: boolean;
    headerCopy: string;
    buttonCopy: string;
    align: number;
    headerCopyColor: string;
    buttonBackgroundColor: string;
    buttonColor: string;
    arrowColor: string;
    imageURL: string;
    add_presentation_feature_image: boolean;
};
export interface UpdateFeatureImage {
    pk_featureImageID: number;
    buttonURL: string;
    displayOrder: number;
    blnNewWindow: boolean;
    headerCopy: string;
    buttonCopy: string;
    align: number;
    headerCopyColor: string;
    buttonBackgroundColor: string;
    buttonColor: string;
    arrowColor: string;
    imageURL: string;
    blnActive: boolean;
    update_presentation_feature_image: boolean;
};
export interface DeleteFeatureImage {
    pk_featureImageID: number;
    delete_presentation_feature_image: boolean;
};

// Support Team
export interface AddAvailableMember {
    fk_storeID: number;
    fk_defaultMemberID: number;
    roleName: string;
    email: string;
    add_available_member: boolean;
};

export interface EditAvailableMember {
    pk_memberID: number;
    roleName: string;
    email: string;
    blnProgramManager: boolean;
    displayOrder: number;
    update_available_member: boolean;
};

export interface DeleteAvailableMember {
    pk_memberID: number;
    delete_available_member: boolean;
};

// Payment Methods
export interface UpdatePaymentMethod {
    store_id: number;
    payment_methods: PaymentObj[];
    update_payment_method: boolean;
};

export interface PaymentObj {
    title: string;
    description: string;
    blnActive: boolean;
    blnPrimary: boolean;
    displayOrder: number;
    fk_paymentMethodID: number;
};

// ADD:
export interface AddArtwork {
    store_id: number;
    name: string;
    description: string;
    display_order: number;
    add_artwork_presentation: boolean;
};

//    EDIT DISPLAY ORDER:
export interface UpdateArtworkDisplayOrder {
    artworks: Artworks[];
    update_artwork_order: boolean;
};

export interface Artworks {
    displayOrder: number;
    pk_artworkTagID: number;
};

// Artwork update
export interface UpdateArtwork {
    name: string;
    description: string;
    extension: string;
    displayOrder: number;
    pk_artworkTagID: number;
    update_artwork_tag: boolean;
};
// Delete artwork
export interface DeleteArtwork {
    pk_artworkTagID: number;
    delete_artwork_tag: boolean;
};
// Product Builder
export interface UpdateProductBuilder {
    store_id: number;
    blnAllowImprintColorSelection: boolean;
    update_product_builder: boolean;
};
// Quick Guides
export interface RemoveQuickGuide {
    pk_quickGuideID: number;
    remove_quick_guide: boolean;
};
export interface AddQuickGuide {
    fk_storeID: number;
    name: string;
    add_quick_guide: boolean;
};
export interface UpdateHeaderImage {
    store_id: number;
    blnImage: boolean;
    link: string;
    update_header_image: boolean;
};
export interface deleteCampaign {
    campaign_id: number;
    delete_campaign_list: boolean;
};
export interface updateCampaign {
    objective: string;
    strategy: string;
    results: string;
    title: string;
    shortDesc: string;
    blnActive: boolean;
    permalink: string;
    blnFeature: boolean;
    videoURL: string;
    pk_campaignID: number;
    store_product_ids: number[];
    update_campaign_list: boolean;
};

export interface UpdateCategory {
    category_id: number;
    categoryName: string;
    categoryDesc: string;
    categoryMiniDesc: string;
    browserTitle: string;
    metaDesc: string;
    permalink: string;
    blnScroller: boolean;
    store_id: number;
    update_category: boolean;
};
export interface RemoveCategory {
    category_id: number;
    delete_category: boolean;
};
export interface AddCategoryKeyword {
    category_id: number;
    keyword: string;
    add_category_keyword: boolean;
};
export interface RemoveCategoryKeyword {
    keyword_id: number;
    delete_category_keyword: boolean;
};
// Feature Images
export interface createCategoryFeatureImage {
    category_id: number;
    buttonURL: string;
    displayOrder: number;
    blnNewWindow: boolean;
    headerCopy: string;
    buttonCopy: string;
    align: number;
    headerCopyColor: string;
    buttonBackgroundColor: string;
    buttonColor: string;
    arrowColor: string;
    add_category_feature_image: boolean;
};
export interface updateCategoryImage {
    store_product_category_image_id: number;
    category_id: number;
    update_category_image: boolean;
};

export interface addToRecommended {
    categoryID: number;
    list: RecommendedProducts[];
    add_category_recommended_products: boolean;
};

interface RecommendedProducts {
    store_productID: number;
};

export interface updateRecommededProducts {
    deleteRecommendationProducts: DeleteRecommendation[];
    updateRecommendationProducts: UpdateRecommendation[];
    category_id: number;
    update_category_recommendations: boolean;
};
interface DeleteRecommendation {
    store_product_id: number;
};
interface UpdateRecommendation {
    store_product_id: number;
    featured: boolean;
    mostPopular: boolean;
    primaryRecomm: boolean;
    recomm: boolean;
};
export interface RemoveCategoryFeatureImage {
    feature_image_id: number;
    delete_category_feature: boolean;
};
export interface updateCategoryFeatureImage {
    buttonURL: string;
    displayOrder: number;
    blnNewWindow: boolean;
    headerCopy: string;
    buttonCopy: string;
    align: number;
    headerCopyColor: string;
    buttonBackgroundColor: string;
    buttonColor: string;
    arrowColor: string;
    image_url: string;
    feature_image_id: number;
    update_category_feature_image: boolean;
};

// Subcategories
export interface UpdateSubCategory {
    category_id: number;
    subCategoryID: number;
    subCategoryName: string;
    subCategoryDesc: string;
    browserTitle: string;
    metaDesc: string;
    permalink: string;
    update_subCategory: boolean;
};

export interface DeleteSubCategory {
    subCategoryID: number;
    remove_subCategory: boolean;
};

export interface updateSubCategoriesDisplayOrder {
    subCategories: SubCategories[];
    update_subCategory_list_order: boolean;
};

interface SubCategories {
    subCategoryID: number;
    list_order: number;
};

export interface updateSubCategoriesStatus {
    subCategories: SubCategory[];
    category_id: number;
    update_subCategory_status: boolean;
};

interface SubCategory {
    bln_active: boolean;
    subCategory_id: number;
};

export interface AddSubCategoryKeyword {
    sub_category_id: number;
    keyword: string;
    add_subcategory_keyword: boolean;
};

export interface RemoveSubCategoryKeyword {
    keyword_id: number;
    delete_subcategory_keyword: boolean;
};

export interface createSubCategoryFeatureImage {
    subCategory_id: number;
    buttonURL: string;
    displayOrder: number;
    blnNewWindow: boolean;
    headerCopy: string;
    buttonCopy: string;
    align: number;
    headerCopyColor: string;
    buttonBackgroundColor: string;
    buttonColor: string;
    arrowColor: string;
    add_subCategory_feature_image: boolean;
};
export interface RemoveSubCategoryFeatureImage {
    subCategory_feature_image_id: number;
    delete_category_feature: boolean;
};
export interface updateSubCategoryFeatureImage {
    buttonURL: string;
    displayOrder: number;
    blnNewWindow: boolean;
    headerCopy: string;
    buttonCopy: string;
    align: number;
    headerCopyColor: string;
    buttonBackgroundColor: string;
    buttonColor: string;
    arrowColor: string;
    image_url: string;
    subCategory_feature_image_id: number;
    update_subCategory_feature_image: boolean;
};

export interface updateSubCatProductDisplayOrder {
    storeProducts: StoreProducts[];
    subCategory_id: number;
    update_display_order: boolean;
};

interface StoreProducts {
    store_produt_id: number;
    list_order: number;
};

export interface removeSubCategoryProducts {
    store_product_ids: number[];
    subCategory_id: number;
    category_id: number;
    remove_subCategory_products: boolean;
};

export interface addSubCategoryProducts {
    store_product_ids: number[];
    subCategory_id: number;
    add_subCategory_products: boolean;
};

export interface LogoBankNotesUpdate {
    notes: string;
    fk_storeID: number;
    update_logo_bank_notes: boolean;
};

export interface addStoreLogoBank {
    store_id: number;
    name: string;
    description: string;
    displayOrder: number;
    bank_type: number; // [1,2,3]
    file_extension: string;
    color_list: string;
    add_store_logoBank: boolean;
};
export interface RemoveStoreLogoBank {
    logo_bank_id: number;
    delete_store_logoBank: boolean;
};
export interface updateStoreLogoBank {
    name: string;
    description: string;
    color_list: string;
    logo_bank_id: number;
    update_store_logoBank: boolean;
};

export interface sendgrid_simple_email {
    email_list: string[];
    subject: string;
    store_name: string;
    is_html: boolean;
    message: string;
    images: attachment[];
    simple_email: boolean;
}
export interface attachment {
    image: string;
    image_title: string;
    template_id: string;
    image_extension: string;
}