import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { retry, tap } from 'rxjs/operators';
import { addComment, CreateIncidentReport, OrdersList, OrdersProduct } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    public _searchKeyword = '';
    public _orderDetail: BehaviorSubject<OrdersProduct | null> = new BehaviorSubject(null);
    private _orders: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    private _order: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    private _orderStatus: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    private _order_products: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    private _orderLineProducts: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    private _stores: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    private _group_order_detail: BehaviorSubject<OrdersList[] | null> = new BehaviorSubject(null);
    public OrderCancelled: boolean = false;

    public navigationLabels = [
        {
            id: 1,
            title: 'Summary',
            icon: 'heroicons_outline:document-report',
            route: 'summary',
            children: []
        },
        {
            title: 'Report',
            icon: 'heroicons_outline:document-report',
            children: [
                {
                    title: 'Order Report',
                    icon: 'heroicons_outline:document-report',
                    route: 'order-report',
                },
                {
                    title: 'Order Original Report',
                    icon: 'heroicons_outline:document-report',
                    route: 'original-order-report',
                },
                {
                    id: 4,
                    title: 'Invoice',
                    route: 'invoice',
                    icon: 'mat_outline:inventory'
                },
                {
                    id: 5,
                    title: 'Purchase Orders',
                    route: 'purchase-order',
                    icon: 'mat_outline:featured_play_list',
                },
                {
                    id: 5,
                    title: 'Sent Purchase Orders',
                    route: 'sent-purchase-order',
                    icon: 'mat_outline:featured_play_list',
                },
                {
                    id: 6,
                    title: 'Shipping Report',
                    route: 'shipping-report',
                    icon: 'mat_outline:local_shipping',
                },
                {
                    id: 7,
                    title: 'Cost Analysis',
                    route: 'cost-analysis',
                    icon: 'mat_outline:price_change'
                },
                {
                    id: 2,
                    title: 'Entities List',
                    route: 'entities-list',
                    icon: 'mat_solid:view_list',
                },
                {
                    id: 8,
                    title: 'Timeline',
                    route: 'timeline',
                    icon: 'mat_solid:timeline',
                },
                {
                    id: 9,
                    title: 'Incident Reports',
                    route: 'incident-reports',
                    icon: 'heroicons_outline:document-report',
                },
                {
                    id: 11,
                    title: 'Survey',
                    route: 'survey',
                    icon: 'heroicons_outline:document',
                }
            ]
        },
        {
            id: 10,
            title: 'Information',
            icon: 'heroicons_outline:users',
            children: [
                {
                    id: 10,
                    title: 'Customer Info',
                    route: '',
                    icon: 'heroicons_outline:users',
                },
                {
                    id: 12,
                    title: 'Artwork Details',
                    route: 'artwork-details',
                    icon: 'heroicons_outline:document-text',
                },
                {
                    id: 13,
                    title: 'FLPS',
                    route: 'FLPS',
                    icon: 'heroicons_outline:document-report',
                }
            ]
        },
        {
            title: 'Emails',
            icon: 'mat_outline:email',
            children: [
                {
                    title: 'Send Reorder Email',
                    route: 'reorder-email',
                    icon: 'mat_outline:email',
                },
                {
                    title: 'Send Review Email',
                    route: 'review-email',
                    icon: 'mat_outline:reviews',
                },
                {
                    title: 'Payment Link Email',
                    route: 'payment-link-email',
                    icon: 'mat_outline:payments',
                }
            ]
        },
        {
            title: 'Settings',
            icon: 'mat_outline:settings',
            children: [
                {
                    title: 'Order Flags',
                    route: 'order-flags',
                    icon: 'mat_outline:flag',
                },
                {
                    title: 'Adjustments',
                    route: 'adjustments',
                    icon: 'mat_outline:adjust',
                },
                {
                    title: 'Modify Orders',
                    route: 'modify-orders',
                    icon: 'heroicons_outline:document-report',
                },
                {
                    title: 'Comments',
                    route: 'comments',
                    icon: 'mat_outline:comment',
                }
            ]
        },
        {
            title: 'Payments',
            icon: 'mat_outline:payment',
            children: [
                {
                    title: 'Enter Payments',
                    route: 'payments',
                    icon: 'mat_outline:payment',
                }
            ]
        }

    ]

    /**
     * Constructor
     */
    constructor(
        private _snackBar: MatSnackBar,
        private _httpClient: HttpClient,
        private _authService: AuthService) {
    }

    snackBar(msg) {
        this._snackBar.open(msg, '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
        });
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for orders
     */
    get orders$(): Observable<OrdersList[]> {
        return this._orders.asObservable();
    }
    get order$(): Observable<any> {
        return this._order.asObservable();
    }
    get orderDetail$(): Observable<any> {
        return this._orderDetail.asObservable();
    }
    get orderProducts$(): Observable<any> {
        return this._order_products.asObservable();
    }
    get orderLineProducts$(): Observable<any> {
        return this._orderLineProducts.asObservable();
    }
    get stores$(): Observable<any> {
        return this._stores.asObservable();
    }

    get orderStatus$(): Observable<any> {
        return this._orderStatus.asObservable();
    }
    // Group Order Detail
    get groupOrderDetail$(): Observable<any> {
        return this._group_order_detail.asObservable();
    }

    // Orders List
    getOrders(params): Observable<OrdersList[]> {
        const url = `${environment.orders}`;
        return this._httpClient.get<OrdersList[]>(url, { params: params }).pipe(
            tap((orders) => {
                this._orders.next(orders);
            })
        );
    }

    getOrderDetails(id): Observable<any> {
        return this._httpClient.get(`${environment.orders}?list=true&order_id=${id}`).pipe(
            tap((order) => {
                this._order.next(order);
            })
        )
    }
    getGroupOrderDetails(id): Observable<any> {
        return this._httpClient.get(`${environment.orders}?group_order=true&order_id=${id}`).pipe(
            tap((order) => {
                this._group_order_detail.next(order);
            }, retry(3))
        );
    }

    getAllStores(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.orders, {
            params: {
                stores_list: true,
                bln_active: 1,
                size: 1000
            }
        }).pipe(
            tap((response: any) => {
                this._stores.next(response);
            })
        );
    };
    // Order Products
    getOrderProducts(id): Observable<any> {
        return this._httpClient.get(`${environment.orders}?order_line=true&order_id=${id}`).pipe(
            tap((order) => {
                this._order_products.next(order);
            })
        )
    }
    // OrderLineProduts
    getOrderLineProducts(params): Observable<any> {
        return this._httpClient.get(environment.orders, { params: params }).pipe(
            tap((order) => {
                this._orderLineProducts.next(order);
            })
        )
    }
    // Order Participants
    getOrderParticipants(id) {
        return this._httpClient.get(environment.orders, {
            params: {
                group_order: true,
                participants: true,
                order_id: id
            }
        })
    }
    // Order Total
    getOrderTotals(id) {
        return this._httpClient.get(`${environment.orders}?order_total=true&order_id=${id}`)
    }
    // Order Detail
    getOrderMainDetail(params): Observable<any> {
        return this._httpClient.get<any>(environment.orders, { params: params }).pipe(
            tap((order) => {
                this._orderDetail.next(order);
            })
        );
    }
    // Order Purchases
    getOrderPurchases(id) {
        return this._httpClient.get(environment.orders, {
            params: {
                purchase_order: true,
                order_id: id
            }
        })
    }
    // Common Calls
    // @Get Calls
    getOrder(params): Observable<any> {
        return this._httpClient.get(`${environment.orders}`, { params: params }).pipe(retry(3));
    }


    getOrderCommonCall(params) {
        return this._httpClient.get(environment.orders, {
            params: params
        }).pipe(retry(3));
    }
    // Get Order Commentator Emails
    getCommentatorEmails(value) {
        let params = {
            keyword: value,
            get_commentators_emails: true
        }
        return this._httpClient.get(environment.orders, {
            params: params
        })
    }
    AddComment(payload: addComment) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.orders, payload, { headers });
    };
    // Post Calls
    orderPostCalls(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.orders, payload, { headers });
    };
    // Update Calls
    updateOrderCalls(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.orders, payload, { headers });
    };
    // Incident Report
    CreateIncidentReport(payload: CreateIncidentReport) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.post(
            environment.orders, payload, { headers });
    };
    // get All Files
    getFiles(payload) {
        return this._httpClient.post(environment.products,
            payload);
    };
    removeMedia(payload) {
        const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
        return this._httpClient.put(
            environment.products, payload, { headers });
    };
}
