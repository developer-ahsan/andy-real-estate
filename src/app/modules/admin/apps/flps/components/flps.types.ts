export interface newFLPSUser {
    userName: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    blnAdmin: boolean;
    defaultCommission: number;
    admin_user_id: number;
    new_flps_user: boolean;
};
export interface updateFLPSUser {
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    blnAdmin: boolean;
    blnActive: boolean;
    defaultCommission: number;
    email: string;
    admin_user_id: number;
    user_id: number;
    update_flps_user: boolean;
};
export interface removeFLPSUser {
    user_id: number;
    remove_flps_user: boolean;
};
export interface applyBlanketCustomerPercentage {
    user_id: number;
    percentage: number;
    apply_blanket_percentage: boolean;
};

export interface updateStoreManagementTypes {
    stores: Stores[];
    update_store_management: boolean;
};

interface Stores {
    store_id: number;
    management_type: string;
};
export interface UpdateFlpsUser {
    blnPrimary: boolean;
    commission: number;
    store_id: number;
    flps_user_id: number;
    update_flps_user: boolean;
};
export interface DeleteFlpsUser {
    store_id: number;
    flps_user_id: number;
    remove_flps_store_user: boolean;
};
export interface AddFLPSStoreUser {
    store_id: number;
    store_name: string;
    flps_user_id: number;
    bln_send_email: boolean;
    add_flps_store_user: boolean;
};
export interface FlpsLogin {
    payload: any;
    flps_login_v2: boolean;
};