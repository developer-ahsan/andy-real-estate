import { Route } from '@angular/router';
import { ReportsSupplierSalesComponent } from './components/pages/supplier-sales/supplier-sales.component';
import { ReportInventorySummaryComponent } from './components/pages/inventory-summary-report/inventory-summary-report.component';
import { ReportStandardMarginComponent } from './components/pages/standard-margin-report/standard-margin-report.component';
import { QuoteGraphicsReportComponent } from './components/pages/quote-graphics-report/quote-graphics-report.component';
import { RoyalitiesReportComponent } from './components/pages/royalities-reports/royalities-reports.component';
import { ReportIncidentComponent } from './components/pages/report-incident/report-incident.component';
import { ReportSampleSaleComponent } from './components/pages/sample-sale-report/sample-sale-report.component';
import { ReportTopCustomerComponent } from './components/pages/report-top-customer/report-top-customer.component';
import { ReportItemsComponent } from './components/pages/item-report/item-report.component';
import { GraphicsSupportReportComponent } from './components/pages/graphics-support-report/graphics-support-report.component';
import { ReportAccountCodeComponent } from './components/pages/account-code/account-code.component';
import { ReportCustomerPurchaseComponent } from './components/pages/customer-purchases/customer-purchases.component';
import { ReportsLocationSalesComponent } from './components/pages/location-sales/location-sales.component';
import { ReportsEmployeeSalesComponent } from './components/pages/employee-sales/employee-salescomponent';
import { RoyalitySummaryReportComponent } from './components/pages/royality-summary-report/royality-summary-report.component';
import { ReportBestSellerComponent } from './components/pages/report-best-seller/report-best-seller.component';
import { ReportsStoreSalesComponent } from './components/pages/store-sales/store-sales.component';
import { ReportsComponent } from './components/reports.component';
import { ReportVendorRelationsComponent } from './components/pages/vendor-relations/vendor-relations.component';
import { ReportSupportComponent } from './components/pages/support-report/support-report.component';
import { ReportsDetailsComponent } from './components/details/details-reports.component';
import { PromoCodesResolver, StatesResolver, StoresResolver } from './components/reports.resolvers';
export const vendorsRoutes: Route[] = [

    {
        path: '',
        component: ReportsDetailsComponent,
        resolve: {
            states: StatesResolver,
            // stores: StoresResolver,
            codes: PromoCodesResolver
        },
        children: [
            {
                path: '',
                redirectTo: 'storeSales',
                pathMatch: 'full'
            },
            {
                path: 'storeSales',
                component: ReportsStoreSalesComponent,
                data: {
                    title: 'Store Sales',
                    url: 'storeSales'
                }
            },
            {
                path: 'supplierSales',
                component: ReportsSupplierSalesComponent,
                data: {
                    title: 'Supplier Sales',
                    url: 'supplierSales'
                }
            },
            {
                path: 'employeeSales',
                component: ReportsEmployeeSalesComponent,
                data: {
                    title: 'Employee Sales',
                    url: 'employeeSales'
                }
            },
            {
                path: 'locationSales',
                component: ReportsLocationSalesComponent,
                data: {
                    title: 'Location Sales',
                    url: 'locationSales'
                }
            },
            {
                path: 'topCustomers',
                component: ReportTopCustomerComponent,
                data: {
                    title: 'Top Customers',
                    url: 'topCustomers'
                }
            },
            {
                path: 'customerPurchases',
                component: ReportCustomerPurchaseComponent,
                data: {
                    title: 'Customer Purchases',
                    url: 'customerPurchases'
                }
            },
            {
                path: 'selectAccountCode',
                component: ReportAccountCodeComponent,
                data: {
                    title: 'Account Code Report',
                    url: 'selectAccountCode'
                }
            },
            {
                path: 'selectItemReport',
                component: ReportItemsComponent,
                data: {
                    title: 'Item Report',
                    url: 'selectItemReport'
                }
            },
            {
                path: 'selectRoyalties',
                component: RoyalitiesReportComponent,
                data: {
                    title: 'Royalties Report',
                    url: 'selectRoyalties'
                }
            },
            {
                path: 'royaltySummary',
                component: RoyalitySummaryReportComponent,
                data: {
                    title: 'Royality Summary',
                    url: 'royaltySummary'
                }
            },
            {
                path: 'bestSeller',
                component: ReportBestSellerComponent,
                data: {
                    title: 'Best Seller',
                    url: 'bestSeller'
                }
            },
            {
                path: 'selectSamplesSales',
                component: ReportSampleSaleComponent,
                data: {
                    title: 'Samples',
                    url: 'selectSamplesSales'
                }
            },
            {
                path: 'standardMargins',
                component: ReportStandardMarginComponent,
                data: {
                    title: 'Standard Margins',
                    url: 'standardMargins'
                }
            },
            {
                path: 'incidentReport',
                component: ReportIncidentComponent,
                data: {
                    title: 'Incident Report',
                    url: 'incidentReport'
                }
            },
            {
                path: 'vendorRelations',
                component: ReportVendorRelationsComponent,
                data: {
                    title: 'Vendor Relations',
                    url: 'vendorRelations'
                }
            },
            {
                path: 'inventorySummary',
                component: ReportInventorySummaryComponent,
                data: {
                    title: 'Inventory Summary',
                    url: 'inventorySummary'
                }
            },
            {
                path: 'supportReport',
                component: ReportSupportComponent,
                data: {
                    title: 'Support Report',
                    url: 'supportReport'
                }
            },
            {
                path: 'graphicsSupportReport',
                component: GraphicsSupportReportComponent,
                data: {
                    title: 'Graphics Support',
                    url: 'graphicsSupportReport'
                }
            },
            {
                path: 'quoteGraphicsSupportReport',
                component: QuoteGraphicsReportComponent,
                data: {
                    title: 'Quote Graphics',
                    url: 'quoteGraphicsSupportReport'
                }
            }
        ]
    }

];
