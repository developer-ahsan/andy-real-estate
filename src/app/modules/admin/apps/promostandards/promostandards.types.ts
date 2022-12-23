export interface Tag {
    id?: string;
    title?: string;
}

export interface Task {
    id: string;
    type: 'task' | 'section';
    title: string;
    notes: string;
    completed: boolean;
    dueDate: string | null;
    priority: 0 | 1 | 2;
    tags: string[];
    order: number;
}

export interface Promostandard {
    companyName: string;
    pk_promostandards_credential_ID: string;
    fk_supplierID: string;
    url: string;
    username: string;
    password: string;
    version: string;
    type: string;
    bln_active: string;
    TotalRequests: number;
}
export interface DeletePromostandard {
    id: string;
    delete_promostandard: true;
};