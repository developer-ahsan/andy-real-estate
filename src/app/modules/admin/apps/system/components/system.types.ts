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