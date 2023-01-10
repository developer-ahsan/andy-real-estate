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
                title: 'Top Order Products',
                icon: 'mat_outline:bar_chart',
                route: 'top-order-products'
            },
            {
                title: 'Vendor Settings',
                icon: 'mat_outline:settings',
                route: 'vendor-settings'
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
            {
                title: 'Export Product List',
                icon: 'mat_outline:import_export',
            },
            {
                title: 'Products/Store',
                icon: 'mat_outline:store'
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
            },
            {
                title: 'Blanket F.O.B',
                icon: 'mat_outline:location_on',
            },
            {
                title: 'Sizing charts',
                icon: 'mat_outline:format_size',
            },
            {
                title: 'Product Videos',
                icon: 'mat_outline:ondemand_video',
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
            },
            {
                title: 'Blanket Coop',
                icon: 'heroicons_outline:receipt-tax',
            },
            {
                title: 'Vendor Comments',
                icon: 'mat_outline:comment',
            },
            {
                title: 'Vendor Orders',
                icon: 'mat_outline:reorder',
            },
            {
                title: 'Supplier Application',
                icon: 'mat_outline:settings_applications',
            }
        ]
    },
    {
        title: 'Imprints',
        icon: 'mat_outline:store',
        children: [
            {
                title: 'Imprint Colors',
                icon: 'mat_outline:color_lens',
            },
            {
                title: 'Blanket Collections',
                icon: 'heroicons_outline:collection',
            },
            {
                title: 'Blanket Run Charges',
                icon: 'mat_outline:money',
            },
            {
                title: 'Blanket Setup Charges',
                icon: 'heroicons_outline:currency-dollar',
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
            },
            {
                title: 'Vendor Website',
                icon: 'mat_outline:web',
            }
        ]
    },
    {
        title: 'Vendor Status',
        icon: 'mat_outline:online_prediction',
        children: []
    }
];