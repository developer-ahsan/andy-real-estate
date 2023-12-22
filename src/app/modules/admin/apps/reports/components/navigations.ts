export const navigations = [
    {
        title: 'Sales Report',
        icon: 'mat_outline:info',
        children: [
            {
                title: 'Store Sales',
                icon: 'mat_outline:info',
                route: 'storeSales'
            },
            {
                title: 'Supplier Sales',
                icon: 'mat_outline:bar_chart',
                route: 'supplierSales'
            },
            {
                title: 'Employee Sales',
                icon: 'mat_outline:settings',
                route: 'employeeSales'
            },
            {
                title: 'Location Sales',
                icon: 'mat_outline:format_size',
                route: 'locationSales'
            }
        ]
    },
    {
        title: 'Customer Reports',
        icon: 'heroicons_outline:cube',
        children: [
            {
                title: 'Top Customers',
                icon: 'mat_outline:production_quantity_limits',
                route: 'topCustomers'
            },
            {
                title: 'Customer Purchases',
                icon: 'mat_outline:store',
                route: 'customerPurchases'
            },
            {
                title: 'Account Code Purchases',
                icon: 'heroicons_outline:document-report',
                route: 'selectAccountCode'
            },
            {
                title: 'Item Report',
                icon: 'mat_outline:system_update_alt',
                route: 'selectItemReport'
            },
            {
                title: 'Royalties',
                icon: 'mat_outline:edit_location_alt',
                route: 'selectRoyalties'
            },
            {
                title: 'Royality Summary',
                icon: 'mat_outline:location_on',
                route: 'royaltySummary'
            },
            {
                title: 'Best Sellers',
                icon: 'mat_outline:ondemand_video',
                route: 'bestSeller'
            }
        ]
    },
    {
        title: 'Other Reports',
        icon: 'heroicons_outline:cube',
        children: [
            {
                title: 'Samples',
                icon: 'mat_outline:format_size',
                route: 'selectSamplesSales'
            },
            {
                title: 'Standard Margins',
                icon: 'heroicons_outline:archive',
                route: 'standardMargins'
            },
            {
                title: 'Incident Report',
                icon: 'heroicons_outline:receipt-tax',
                route: 'incidentReport'
            },
            {
                title: 'Vendor Relations',
                icon: 'mat_outline:comment',
                route: 'vendorRelations'
            },
            {
                title: 'Inventory Summary',
                icon: 'mat_outline:reorder',
                route: 'inventorySummary'
            },
            {
                title: 'Support Report',
                icon: 'mat_outline:settings_applications',
                route: 'supportReport'
            },
            {
                title: 'Graphics Support',
                icon: 'heroicons_outline:currency-dollar',
                route: 'graphicsSupportReport'
            },
            {
                title: 'Quote Graphics',
                icon: 'mat_outline:money',
                route: 'quoteGraphicsSupportReport'
            },
        ]
    }
];