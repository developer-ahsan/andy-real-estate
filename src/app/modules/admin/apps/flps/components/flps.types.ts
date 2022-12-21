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