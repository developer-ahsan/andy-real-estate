export interface restoreQuote {
    cartID: number;
    restore_quote: boolean;
};
export interface RemoveCartComment {
    commentID: number;
    remove_cart_comment: boolean;
};
export interface AddCartComment {
    fk_cartID: number;
    comment: string;
    fk_adminUserID: number;
    dateCreated: string;
    emails: string[];
    blnUrgent: boolean;
    storeName: string;
    add_cart_comment: boolean;
};