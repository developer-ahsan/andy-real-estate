export interface addCompanyProfile {
    companyName: string;
    companyWebsite: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    APContactName: string;
    APEmail: string;
    remitEmail: string;
    additionalEmail: string;
    creditLimit: number;
    netTerms: string;
    paymentMethod: string;
    blnPORequired: boolean;
    dateCreated: string;
    storeID: number;
    blnSalesTaxExempt: boolean;
    phone: string;
    add_company_profile: boolean;
};
export interface updateCompanyProfile {
    companyProfileID: number;
    companyName: string;
    companyWebsite: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    APContactName: string;
    APEmail: string;
    remitEmail: string;
    additionalEmail: string;
    creditLimit: number;
    netTerms: string;
    paymentMethod: string;
    blnPORequired: boolean;
    dateCreated: string;
    storeID: number;
    blnSalesTaxExempt: boolean;
    phone: string;
    blnGovMVMTCoop: boolean;
    notes: string;
    update_company_profile: boolean;
};

export interface addAttachment {
    companyProfileID: number;
    extension: string;
    name: string;
    mimeType: string;
    add_company_attachment: boolean;
};

export interface removeAttachment {
    attachmentID: number;
    delete_company_attachment: boolean;
};