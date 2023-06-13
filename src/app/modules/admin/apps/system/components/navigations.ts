export const navigations = [
    {
        title: 'Products',
        icon: 'mat_outline:edit_note',
        children: [
            {
                title: 'Product Colors',
                icon: 'mat_outline:color_lens',
                route: 'colors'
            },
            {
                title: 'Product Sizes',
                icon: 'heroicons_outline:academic-cap',
                route: 'sizes'
            },
            {
                title: 'Pack/Accessories',
                icon: 'feather:package',
                route: 'pack-accessories'
            },
            {
                title: 'Core Products',
                icon: 'mat_outline:production_quantity_limits',
                route: 'core-products'
            },
            {
                title: 'Product Migration',
                icon: 'heroicons_outline:duplicate',
                route: 'product-migration'
            },
            {
                title: 'Promo Codes',
                icon: 'mat_outline:code',
                route: 'promo-codes'
            }
        ]
    },
    {
        title: 'Imprints',
        icon: 'mat_outline:checklist',
        children: [
            {
                title: 'Imprint Colors',
                icon: 'mat_outline:color_lens',
                route: 'imprint-colors'
            },
            {
                title: 'Imprint Methods',
                icon: 'heroicons_outline:document-report',
                route: 'imprint-methods'
            },
            {
                title: 'Imprint Locations',
                icon: 'mat_outline:edit_location',
                route: 'imprint-locations'
            },
            {
                title: 'Imprint Charges',
                icon: 'mat_outline:attach_money',
                route: 'imprint-charges'
            },
            {
                title: 'Standard Imprints',
                icon: 'mat_outline:check',
                route: 'standard-imprints'
            }
        ]
    },
    {
        title: 'Orders',
        icon: 'heroicons_outline:cube',
        children: [
            {
                title: 'P.O. Archives',
                icon: 'heroicons_outline:archive',
                route: 'po-archives'
            },
            {
                title: 'OH County Sales Tax',
                icon: 'heroicons_outline:receipt-tax',
                route: 'sales-tax'
            }
        ]
    },
    {
        title: 'Stores',
        icon: 'mat_outline:store',
        children: [
            {
                title: 'Active Stores',
                icon: 'mat_outline:online_prediction',
                route: 'active-stores'
            },
            {
                title: 'Default Blurbs',
                icon: 'mat_outline:reviews',
                route: 'default-blurbs'
            },
            {
                title: 'Default Support Team',
                icon: 'mat_outline:group',
                route: 'support-team'
            }
        ]
    },
    {
        title: 'Settings',
        icon: 'mat_outline:settings',
        children: [
            {
                title: 'Diagnostics',
                icon: 'mat_outline:flag',
                route: 'diagnostics'
            },
            {
                title: 'Admin Tools',
                icon: 'mat_outline:admin_panel_settings',
                route: 'admin-tools'
            },
            {
                title: 'Admin Structure',
                icon: 'mat_outline:construction',
                route: 'admin-structure'
            },
            {
                title: 'Permission Groups',
                icon: 'mat_outline:group',
                route: 'permission-groups'
            },
            {
                title: 'Upload Images',
                icon: 'mat_outline:image',
                route: 'upload-images'
            }
        ]
    },
    {
        title: 'Simulator',
        icon: 'heroicons_outline:link',
        route: 'simulator',
        children: []
    }
];