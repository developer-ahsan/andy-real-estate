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