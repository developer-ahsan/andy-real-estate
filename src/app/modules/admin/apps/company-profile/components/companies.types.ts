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

// Logobank
export interface removeCompanyProfileLogoBank {
    companyProfileLogoBankID: number;
    delete_company_logo_bank: boolean;
};
export interface addCompanyProfileLogoBank {
    companyProfileID: number;
    name: string;
    description: string;
    colorList: string;
    imageExtension: string;
    add_company_logo_bank: boolean;
};

// Compny Locations
export interface addCompanyLocation {
    companyProfileID: number;
    locationName: string;
    add_company_location: boolean;
};
export interface updateCompanyLocation {
    companyProfileID: number;
    locationID: number;
    locationName: string;
    update_company_location: boolean;
};
export interface removeCompanyLocation {
    locationID: number;
    delete_company_location: boolean;
};

export interface addCompanyDepartment {
    locationID: number;
    departmentName: string;
    add_company_department: boolean;
};

export interface updateCompanyDepartment {
    locationID: number;
    departmentID: number;
    departmentName: string;
    update_company_department: boolean;
};

export interface removeCompanyDepartment {
    departmentID: number;
    delete_company_department: boolean;
};