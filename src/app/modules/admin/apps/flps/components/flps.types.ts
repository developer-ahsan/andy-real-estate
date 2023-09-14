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


export interface updateReport {
    flps_userID: number;
    flpsName: string;
    flpsUserEmail: string;
    blnSendEmail: boolean;
    rangeStart: string;
    rangeEnd: string;
    flpsOrders: FlpsOrders[];
    markPaidList: markPaidList[];
    reportSummary: reportSummary[];
    grandSalesTotal: number;
    grandNumSalesTotal: number;
    grandEstimatedProfitTotal: number;
    grandCommissionTotal: number;
    userTotalCommission: number; // totalCommission * Profit
    update_flps_report: boolean;
};

interface FlpsOrders {
    order_id: number;
    amountPaid: number;
};
interface reportSummary {
    storeName: string;
    sales: number;
    num_sales: number;
    profit: number;
    commission: number;
};
interface markPaidList {
    orderID: number;
    customer: string;
    sale: number;
    profit: number;
    commission: number;
    commissionPercent: number;
};

// export interface updateReport {
//     flps_userID: number;
//     flpsOrders: FlpsOrders[];
//     blnSendEmail: boolean;
//     update_flps_report: boolean;
// };

// interface FlpsOrders {
//     order_id: number;
//     commissionPaidDate: string;
//     amountPaid: number;
// };