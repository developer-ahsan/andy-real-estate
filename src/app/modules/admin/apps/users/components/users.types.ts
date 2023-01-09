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


// Admin Commentors
export interface AddAdminCommentator {
    email: string;
    add_commentator: boolean;
};

export interface UpdateAdminCommentator {
    list_order: number;
    email: string;
    commentator_id: number;
    update_commentator: boolean;
};

export interface RemoveCommentator {
    commentator_id: number;
    remove_commentator: boolean;
};

// Smart Art Users
export interface AddSmartArtUser {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    bln_master: boolean;
    add_smartuser: boolean;
};

export interface UpdateSmartUser {
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    blnActive: boolean;
    blnMaster: boolean;
    pk_userID: number;
    update_smartuser: boolean;
};

export interface RemoveSmartArtUser {
    user_id: number;
    remove_smartuser: boolean;
};
// Order Users
export interface updateOrderManageUser {
    pk_userID: number;
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    blnFulfillment: boolean;
    update_order_manage_user: boolean;
};

export interface RemoveUser {
    user_id: number;
    remove_order_user: boolean;
};

export interface newOrderManageUser {
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    blnFulfillment: boolean;
    create_order_manage_user: boolean;
};

// Rapid Build User
export interface RemoveRapidUser {
    user_id: number;
    remove_rapidbuild_user: boolean;
};
export interface updateRapidbuildUser {
    pk_userID: number;
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    blnMaster: boolean;
    blnFullColor: boolean;
    update_rapidbuild_user: boolean;
};
export interface newRapidbuildUser {
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    blnMaster: boolean;
    blnFullColor: boolean;
    create_rapidbuild_user: boolean;
};

// company roles
export interface AddRole {
    roleName: string;
    create_role: boolean;
};
export interface RemoveRole {
    role_id: number;
    remove_role: boolean;
};
export interface updateRole {
    role_id: number;
    role_name: string;
    update_role: boolean;
};
export interface AddRoleEmployee {
    role_id: string;
    admin_user_id: number;
    create_role_employee: boolean;
};

export interface RemoveEmployeeRole {
    role_id: number;
    admin_user_id: number;
    remove_employee_role: boolean;
};

export interface updateRapidBuildUserStores {
    rapidbuild_user_id: number;
    stores: number[];
    update_rapidbuild_user_stores: boolean;
};

export interface updateSmartArtUsers {
    user_id: number;
    stores: number[];
    update_smartart_user_stores: boolean;
};

// Add Admin User
export interface AddAdminUser {
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    ip_address: string;
    supplier_id: number;
    blnMasterAccount: boolean;
    blnSupplier: boolean;
    blnManager: boolean;
    add_admin_user: boolean;
};
export interface UpdateAdminUser {
    userName: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    blnActive: boolean;
    blnMaster: boolean;
    blnManager: boolean;
    user_id: number;
    update_admin_user: boolean;
};

// Update Stores Order
export interface updateOrderManageUserStores {
    user_id: number;
    stores: number[];
    update_ordermanage_user_stores: boolean;
};
