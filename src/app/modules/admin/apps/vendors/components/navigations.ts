export const navigations = [
    {
        title: 'Information',
        icon: 'mat_outline:info',
        children: [
            {
                title: 'Vendor Information',
                icon: 'mat_outline:info',
                route: 'information'
            },
            {
                title: 'Accounting Profile',
                icon: 'mat_outline:user',
                route: 'accounting-profile'
            },
            {
                title: 'Top Ordered Products',
                icon: 'mat_outline:bar_chart',
                route: 'top-order-products'
            },
            {
                title: 'Vendor Settings',
                icon: 'mat_outline:settings',
                route: 'vendor-settings'
            },
            {
                title: 'Designer Notes',
                icon: 'mat_outline:settings',
                route: 'designer-notes'
            }
        ]
    },
    {
        title: 'Products',
        icon: 'heroicons_outline:cube',
        children: [
            {
                title: 'Products',
                icon: 'mat_outline:production_quantity_limits',
                route: 'vendor-products'
            },
            // {
            //     title: 'Export Product List',
            //     icon: 'mat_outline:import_export',
            // },
            {
                title: 'Products/Store',
                icon: 'mat_outline:store',
                route: 'vendor-products-store'
            },
            {
                title: 'Core Products',
                icon: 'heroicons_outline:document-report',
                route: 'vendor-core-products'
            },
            {
                title: 'Products/Updates',
                icon: 'mat_outline:system_update_alt',
                route: 'vendor-products-summary'
            },
            {
                title: 'F.O.B Locations',
                icon: 'mat_outline:edit_location_alt',
                route: 'vendor-fob-locations'
            },
            {
                title: 'Blanket F.O.B',
                icon: 'mat_outline:location_on',
                route: 'vendor-blnaket-fob'
            },
            {
                title: 'Sizing Charts',
                icon: 'mat_outline:format_size',
                route: 'vendor-sizing-charts'
            },
            {
                title: 'Product Videos',
                icon: 'mat_outline:ondemand_video',
                route: 'vendor-videos'
            }
        ]
    },
    {
        title: 'Orders',
        icon: 'heroicons_outline:cube',
        children: [
            {
                title: 'Co-Ops',
                icon: 'heroicons_outline:archive',
                route: 'vendor-coops'
            },
            {
                title: 'Blanket Coop',
                icon: 'heroicons_outline:receipt-tax',
                route: 'vendor-blanket-coops'
            },
            {
                title: 'Vendor Comments',
                icon: 'mat_outline:comment',
                route: 'vendor-comments'
            },
            {
                title: 'Vendor Orders',
                icon: 'mat_outline:reorder',
                route: 'vendor-orders'
            },
            {
                title: 'Open POs',
                icon: 'mat_outline:reorder',
                route: 'purchase-orders'
            },
            {
                title: 'Supplier Application',
                icon: 'mat_outline:settings_applications',
                route: 'vendor-application'
            }
        ]
    },
    {
        title: 'Imprints',
        icon: 'mat_outline:store',
        children: [
            {
                title: 'Standard Imprints',
                icon: 'mat_outline:color_lens',
                route: 'vendor-standard-imprints'
            },
            {
                title: 'Imprint Colors',
                icon: 'mat_outline:color_lens',
                route: 'vendor-imprint-colors'
            },
            {
                title: 'Blanket Collections',
                icon: 'heroicons_outline:collection',
                route: 'vendor-blanket-collections'
            },
            {
                title: 'Blanket Run Charges',
                icon: 'mat_outline:money',
                route: 'vendor-run-charges'
            },
            {
                title: 'Blanket Setup Charges',
                icon: 'heroicons_outline:currency-dollar',
                route: 'vendor-setup-charges'
            }
        ]
    },
    {
        title: 'Vendors',
        icon: 'mat_outline:settings',
        children: [
            {
                title: 'Vendor Users',
                icon: 'heroicons_outline:user-group',
                route: 'vendor-users'
            },
            {
                title: 'Vendor Website',
                icon: 'mat_outline:web',
                route: 'vendor-website'
            }
        ]
    },
    {
        title: 'Vendor Status',
        icon: 'mat_outline:online_prediction',
        route: 'vendor-status',
        children: []
    }
];