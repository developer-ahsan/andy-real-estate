export interface CreateTicket {
    subject: string;
    userID: number;
    description: string;
    blnUrgent: boolean;
    create_ticket: boolean;
};