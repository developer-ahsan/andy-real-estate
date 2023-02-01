import { Route } from '@angular/router';
import { OrdersComponent } from 'app/modules/admin/apps/orders/orders-components/orders.component';
import { OrdersDetailsComponent } from 'app/modules/admin/apps/orders/orders-components/details/details.orders.component';
import { OrderDetailsResolver, OrderProductsLineResolver, OrdersListResolver, StoresListResolver } from 'app/modules/admin/apps/orders/orders-components/orders.resolvers';
import { OrdersSummaryComponent } from './orders-components/navigation/orders-summary/orders-summary.component';
import { OrdersReportComponent } from './orders-components/navigation/orders-report/orders-report.component';
import { OrdersEntitiesListComponent } from './orders-components/navigation/orders-entities-list/orders-entities-list.component';
import { CostAnalysisComponent } from './orders-components/navigation/cost-analysis/cost-analysis.component';
import { OrdersShippingReportsComponent } from './orders-components/navigation/orders-shipping-reports/orders-shipping-reports.component';
import { OrdersPurchasesComponent } from './orders-components/navigation/orders-purchases/orders-purchases.component';
import { InvoicesComponent } from './orders-components/navigation/invoices/invoices.component';
import { OriginalOrderComponent } from './orders-components/navigation/original-order-report/original-order-report.component';
import { TimelineComponent } from './orders-components/navigation/timeline/timeline.component';
import { IncidentReportsComponent } from './orders-components/navigation/incident-reports/incident-reports.component';
import { OrderSurveyComponent } from './orders-components/navigation/order-survey/order-survey.component';
import { OrderArtWorkComponent } from './orders-components/navigation/order-artwork/order-artwork.component';
import { FlpsComponent } from './orders-components/navigation/flps/flps.component';
import { OrderReorderEmailComponent } from './orders-components/navigation/order-reorder-emails/order-reorder-email.component';
import { OrderReviewEmailComponent } from './orders-components/navigation/order-review-email/order-review-email.component';
import { OrderPaymentEmailComponent } from './orders-components/navigation/order-payment-email/order-payment-email.component';
import { OrderFlagsComponent } from './orders-components/navigation/order-flags/order-flags.component';
import { OrderAdjustmentComponent } from './orders-components/navigation/order-adjustment/order-adjustment.component';
import { OrderModifyComponent } from './orders-components/navigation/order-modify/order-modify.component';
import { OrderCommentsComponent } from './orders-components/navigation/order-comments/order-comments.component';
import { OrderPaymentComponent } from './orders-components/navigation/order-payments/order-payments.component';
import { OrderApprovalSettingsComponent } from './orders-components/navigation/order-approval-settings/order-approval-settings.component';
import { OrderProccurementComponent } from './orders-components/navigation/order-procurement-data/order-procurement-data.component';
import { OrderReceiptEmailComponent } from './orders-components/navigation/order-receipt-email/order-receipt-email.component';
import { GroupOrdersDetailsComponent } from './orders-components/navigation/group-order-details/group-order-details.component';
import { GroupOrdersShippingComponent } from './orders-components/navigation/group-order-shipping/group-order-shipping.component';

export const ordersRoutes: Route[] = [
    {
        path: '',
        component: OrdersComponent,
        resolve: {
            orders: OrdersListResolver,
            stores: StoresListResolver
        }
    },
    {
        path: ':id',
        component: OrdersDetailsComponent,
        resolve: {
            products: OrderProductsLineResolver,
            orderDetail: OrderDetailsResolver
        },
        children: [
            {
                path: '',
                redirectTo: 'summary',
                pathMatch: 'full'
            },
            {
                path: 'summary',
                component: OrdersSummaryComponent,
                data: {
                    title: 'Summary',
                    url: 'summary'
                }
            },
            {
                path: 'order-report',
                component: OrdersReportComponent,
                data: {
                    title: 'Order Report',
                    url: 'order-report'
                }
            },
            {
                path: 'original-order-report',
                component: OriginalOrderComponent,
                data: {
                    title: 'Order Original Report',
                    url: 'original-order-report'
                }
            },
            {
                path: 'invoice',
                component: InvoicesComponent,
                data: {
                    title: 'Invoice',
                    url: 'invoice'
                }
            },
            {
                path: 'purchase-order',
                component: OrdersPurchasesComponent,
                data: {
                    title: 'Purchase Orders',
                    url: 'purchase-order'
                }
            },
            {
                path: 'shipping-report',
                component: OrdersShippingReportsComponent,
                data: {
                    title: 'Shipping Report',
                    url: 'shipping-report'
                }
            },
            {
                path: 'cost-analysis',
                component: CostAnalysisComponent,
                data: {
                    title: 'Cost Analysis',
                    url: 'cost-analysis'
                }
            },
            {
                path: 'entities-list',
                component: OrdersEntitiesListComponent,
                data: {
                    title: 'Entities List',
                    url: 'entities-list'
                }
            },
            {
                path: 'timeline',
                component: TimelineComponent,
                data: {
                    title: 'Timeline',
                    url: 'timeline'
                }
            },
            {
                path: 'incident-reports',
                component: IncidentReportsComponent,
                data: {
                    title: 'Incident Reports',
                    url: 'incident-reports'
                }
            },
            {
                path: 'survey',
                component: OrderSurveyComponent,
                data: {
                    title: 'Survey',
                    url: 'survey'
                }
            },
            {
                path: 'artwork-details',
                component: OrderArtWorkComponent,
                data: {
                    title: 'Artwork Details',
                    url: 'artwork-details'
                }
            },
            {
                path: 'FLPS',
                component: FlpsComponent,
                data: {
                    title: 'FLPS',
                    url: 'FLPS'
                }
            },
            {
                path: 'reorder-email',
                component: OrderReorderEmailComponent,
                data: {
                    title: 'Send Reorder Email',
                    url: 'reorder-email'
                }
            },
            {
                path: 'review-email',
                component: OrderReviewEmailComponent,
                data: {
                    title: 'Send Review Email',
                    url: 'review-email'
                }
            },
            {
                path: 'payment-link-email',
                component: OrderPaymentEmailComponent,
                data: {
                    title: 'Payment Link Email',
                    url: 'payment-link-email'
                }
            },
            {
                path: 'order-flags',
                component: OrderFlagsComponent,
                data: {
                    title: 'Order Flags',
                    url: 'order-flags'
                }
            },
            {
                path: 'adjustments',
                component: OrderAdjustmentComponent,
                data: {
                    title: 'Adjustments',
                    url: 'adjustments'
                }
            },
            {
                path: 'modify-orders',
                component: OrderModifyComponent,
                data: {
                    title: 'Modify Orders',
                    url: 'modify-orders'
                }
            },
            {
                path: 'comments',
                component: OrderCommentsComponent,
                data: {
                    title: 'Comments',
                    url: 'comments'
                }
            },
            {
                path: 'payments',
                component: OrderPaymentComponent,
                data: {
                    title: 'Enter Payments',
                    url: 'payments'
                }
            },
            {
                path: 'art-approval-settings',
                component: OrderApprovalSettingsComponent,
                data: {
                    title: 'Art Approval Settings',
                    url: 'art-approval-settings'
                }
            },
            {
                path: 'procurement-data',
                component: OrderProccurementComponent,
                data: {
                    title: 'Procurement Data',
                    url: 'procurement-data'
                }
            },
            {
                path: 'receipt-email',
                component: OrderReceiptEmailComponent,
                data: {
                    title: 'Send Receipt Email',
                    url: 'receipt-email'
                }
            },
            {
                path: 'group-order-details',
                component: GroupOrdersDetailsComponent,
                data: {
                    title: 'Group Order Details',
                    url: 'group-order-details'
                }
            },
            {
                path: 'group-order-shipping',
                component: GroupOrdersShippingComponent,
                data: {
                    title: 'Group Order Shipping',
                    url: 'group-order-shipping'
                }
            }
        ]
    }
];
