// Look and feel update:
export interface colorHeaderUpdate {
    blnColorHeaders: boolean;
    fk_storeID: number;
    color_header_update: boolean;
};
// Site colors update:
export interface colorsUpdate {
    primaryHighlight: string;
    secondaryHighlight: string;
    mainNav: string;
    mainNavHover: string;
    mainNavLinkColor: string;
    mainNavLinkColorHover: string;
    catMenuLink: string;
    catMenuLinkHover: string;
    subCatMenuLink: string;
    subCatMenuLinkHover: string;
    link: string;
    linkHover: string;
    homeFeatureLink: string;
    homeFeatureLinkHover: string;
    fk_storeID: number;
    site_colors_update: boolean;
};
// Special offers update:
export interface UpdateSpecialOffer {
    blnOffer: boolean;
    offerText: string;
    offerTextBox: string;
    offerFooter: string;
    fk_storeID: number;
    update_special_offer: boolean;
};
// Typekit update:
export interface UpdateTypeKit {
    typeKitID: string;
    fk_storeID: number;
    update_typekit: boolean;
};
// NewsFeed CRUD
export interface AddNewsFeed {
    fk_storeID: number;
    title: string;
    date: string;
    news: string;
    add_news_feed: boolean;
};
export interface UpdateNewsFeed {
    fk_storeID: number;
    title: string;
    date: string;
    news: string;
    pk_newsFeedID: number;
    update_news_feed: boolean;
};
export interface DeleteNewsFeed {
    fk_storeID: number;
    pk_newsFeedID: number;
    delete_news_feed: boolean;
};
// Logo bank notes update
export interface LogoBankNotesUpdate {
    notes: string;
    fk_storeID: number;
    update_logo_bank_notes: boolean;
};
// Feature campaign
export interface UpdateFeatureCampaign {
    campaignIDsList: campaignIDs[];
    fk_storeID: number;
    update_presentation_feature_campaign: boolean;
};
export interface campaignIDs {
    pk_campaignID: number;
    isFeature: boolean;
}
// Presentation Scroller CRUD:
export interface AddScroller {
    fk_storeID: number;
    title: string;
    add_scroller: boolean;
};
export interface DeleteScroller {
    scroller_id: number;
    delete_scroller: boolean;
};
export interface UpdateScroller {
    title: string;
    blnActive: boolean;
    scroller_id: number;
    update_scroller: boolean;
};
// Current scroller items
// /api/stores?presentation_scroller_items=true&scroller_id=
// Images for current scroll items list url
// https://assets.consolidus.com/globalAssets/Products/HiRes/pk_storeProductID.jpg
// Default scroller
export interface UpdateDefaultScroller {
    scrollers: DefaultScrollers[];
    update_default_scroller: boolean;
};
export interface DefaultScrollers {
    blnActive: boolean;
    scroller_id: number;
};
// Scrollers order update call
export interface UpdateScrollerOrder {
    scrollers: ScrollersOrder[];
    update_scroller_order: boolean;
};
export interface ScrollersOrder {
    displayOrder: number;
    scroller_id: number;
};
// Testimonials call
// /api/stores?presentation_scroller_testimonials=true&store_id=
export interface AddTestimonial {
    fk_storeID: number;
    name: string;
    title: string;
    testimonial: string;
    displayOrder: number;
    add_testimonial: boolean;
};
export interface DeleteTestimonial {
    testimonial_ids: number[];
    store_id: number;
    delete_testimonials: boolean;
};
export interface UpdateTestimonials {
    testimonials: TestimonialsObj[];
    update_testimonials: boolean;
};
export interface TestimonialsObj {
    displayOrder: number;
    testimonial: string;
    name: string;
    title: string;
    pk_testimonialID: number;
};
// Testimonial Status
// status store setting m mil ra hoga "blnTestimonials"
export interface UpdateTestimonialStatus {
    fk_storeID: number;
    blnTestimonials: boolean;
    update_testimonial_status: boolean;
};
// Default dashboard emails
// /api/stores?presentation_default_emails=true&store_id=
export interface DefaultEmailUpdate {
    rescheduleFollowUp: string;
    sampleEmail: string;
    paymentNotification: string;
    followUpEmail: string;
    reorderEmail: string;
    surveyEmail: string;
    surveyEmailSubject: string;
    quoteEmailSubject: string;
    quoteEmail: string;
    fk_storeID: number;
    update_default_email: boolean;
};