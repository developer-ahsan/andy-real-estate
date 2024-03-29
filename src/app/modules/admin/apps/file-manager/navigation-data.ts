export const navigations = [
    {
        id: 1,
        title: 'Dashboard',
        icon: 'mat_outline:dashboard',
        route: 'dashboard',
        children: []
    },
    {
        id: 4,
        title: 'Marketing',
        icon: 'mat_outline:campaign',
        children: [
            {
                id: 12,
                title: 'Campaigns',
                icon: 'mat_outline:campaign',
                route: 'campaigns'
            },

            {
                id: 14,
                title: 'Email Blast',
                icon: 'mat_outline:email',
                route: 'email-blast'
            },
            {
                id: 17,
                title: 'Surveys',
                icon: 'mat_outline:campaign',
                route: 'surveys'
            },
            {
                id: 22,
                title: 'User Data File',
                icon: 'mat_outline:data_saver_off',
                route: 'user-data-file'
            },
            {
                id: 23,
                title: 'Opt-In Data File',
                icon: 'mat_outline:data_saver_on',
                route: 'optin-data-file'
            },
        ]
    },
    {
        id: 3,
        title: 'Products',
        icon: 'mat_outline:store',
        children: [
            {
                id: 2,
                title: 'Store Products',
                icon: 'mat_outline:store_mall_directory',
                route: 'store-products'
            },
            {
                id: 3,
                title: 'Product Categories',
                icon: 'mat_outline:category',
                route: 'product-categories'
            },
            {
                id: 4,
                title: 'Products/Supplier',
                icon: 'mat_outline:supervised_user_circle',
                route: 'product-suppliers'
            },
            {
                id: 6,
                title: 'Store Product Videos',
                icon: 'mat_outline:ondemand_video',
                route: 'store-product-videos'
            },
            {
                id: 7,
                title: 'RapidBuild',
                icon: 'mat_outline:build_circle',
                route: 'rapid-build'
            },
            {
                id: 8,
                title: 'RapidBuild Bulk Actions',
                icon: 'mat_outline:pending_actions',
                route: 'rapidbuild-action'
            },
            {
                id: 19,
                title: 'Store Suppliers',
                icon: 'mat_outline:supervised_user_circle',
                route: 'store-suppliers'
            },
            // {
            //     id: 20,
            //     title: 'Product Clicks',
            //     icon: 'mat_outline:ads_click',
            //     route: 'product-clicks'
            // },
            {
                id: 21,
                title: 'Search History',
                icon: 'mat_outline:saved_search',
                route: 'search-history'
            },
            {
                id: 24,
                title: 'Customer Reviews',
                icon: 'mat_outline:reviews',
                route: 'customer-reviews'
            },
            {
                id: 32,
                title: 'Inventory Summary',
                icon: 'mat_outline:history',
                route: 'inventory-summary'
            },
            // {
            //     id: 50,
            //     title: 'Offline Products',
            //     icon: 'heroicons_outline:academic-cap',
            //     route: 'offline-products'
            // },
        ]
    },
    {
        id: 2,
        title: 'Settings',
        icon: 'mat_outline:settings',
        children: [
            {
                title: 'Store Settings',
                icon: 'mat_outline:settings',
                route: 'store-settings'
            },
            {
                title: 'Procurement Settings',
                icon: 'mat_outline:settings',
                route: 'procurement-settings'
            },
            {
                title: 'Reset Top Ten',
                icon: 'mat_outline:refresh',
                route: 'reset-top-ten'
            },
            {
                title: 'Margins',
                icon: 'mat_outline:margin',
                route: 'margins'
            },
            {
                title: 'Shipping Notifications',
                icon: 'mat_outline:notifications_active',
                route: 'shipping-notifications'
            },
            {
                title: 'Fulfillment Contacts',
                icon: 'mat_outline:contacts',
                route: 'fulfillment-contacts'
            },
            // {
            //     title: 'Fulfillment Invoices',
            //     icon: 'mat_outline:inventory',
            //     route: 'fulfillment-invoices'
            // },
            // {
            //     title: 'Fulfillment Options',
            //     icon: 'heroicons_outline:template',
            //     route: 'fulfillment-options'
            // },
            {
                title: 'Royalties',
                icon: 'mat_outline:reviews',
                route: 'royalties'
            },
            // {
            //     title: 'Referral Locations',
            //     icon: 'mat_outline:speaker_notes',
            //     route: 'referral-locations'
            // },
            {
                title: 'Art Approval Settings',
                icon: 'mat_outline:picture_in_picture',
                route: 'art-approval-settings'
            },
            {
                title: 'Consolidated Bill',
                icon: 'mat_outline:house_siding',
                route: 'consolidated-bill'
            },
            {
                title: 'Group Order Settings',
                icon: 'mat_outline:settings',
                route: 'group-order-settings'
            },
            {
                title: 'Store Apparel Decorator',
                icon: 'mat_outline:animation',
                route: 'store-apparel-decorator'
            },
            {
                id: 13,
                title: 'Presentation',
                icon: 'mat_outline:present_to_all',
                route: 'presentation'
            },
            {
                title: 'Cost Center Codes',
                icon: 'mat_outline:history',
                route: 'cost-center-codes'
            },
            {
                title: 'Locations',
                icon: 'mat_outline:speaker_notes',
                route: 'locations'
            },
            {
                title: 'Blanket Credit Terms',
                icon: 'mat_outline:group_work',
                route: 'blanket-credit-terms'
            },
            {
                title: 'Student orgs',
                icon: 'heroicons_outline:duplicate',
                route: 'student-orgs'
            },
            {
                title: 'Store Plan/Strategies',
                icon: 'heroicons_outline:duplicate',
                route: 'store-plan'
            }
        ]
    },







    // {
    //     id: 2,
    //     title: 'Store Products',
    //     icon: 'mat_outline:store_mall_directory',
    // },
    // {
    //     id: 3,
    //     title: 'Product Categories',
    //     icon: 'mat_outline:category',
    // },
    // {
    //     id: 4,
    //     title: 'Products/Supplier',
    //     icon: 'mat_outline:supervised_user_circle'
    // },
    // {
    //     id: 5,
    //     title: 'Offline Products',
    //     icon: 'heroicons_outline:academic-cap',
    // },
    // {
    //     id: 6,
    //     title: 'Store Product Videos',
    //     icon: 'mat_outline:ondemand_video',
    // },
    // {
    //     id: 7,
    //     title: 'RapidBuild',
    //     icon: 'mat_outline:build_circle',
    // },
    // {
    //     id: 8,
    //     title: 'RapidBuild Bulk Actions',
    //     icon: 'mat_outline:pending_actions'
    // },
    // {
    //     id: 9,
    //     title: 'Store Settings',
    //     icon: 'mat_outline:settings',
    // },
    // // {
    // //     id: 10,
    // //     title: 'Jaggaer Settings',
    // //     icon: 'mat_outline:settings',
    // // },
    // {
    //     id: 11,
    //     title: 'Group Order Settings',
    //     icon: 'mat_outline:settings',
    // },
    // {
    //     id: 111,
    //     title: 'Store Apparel Decorator',
    //     icon: 'mat_outline:animation',
    // },
    // {
    //     id: 12,
    //     title: 'Campaigns',
    //     icon: 'mat_outline:campaign',
    // },
    // {
    //     id: 13,
    //     title: 'Presentation',
    //     icon: 'mat_outline:present_to_all',
    // },
    // {
    //     id: 14,
    //     title: 'Email Blast',
    //     icon: 'mat_outline:email',
    // },
    // {
    //     id: 15,
    //     title: 'Shipping Notifications',
    //     icon: 'mat_outline:notifications_active',
    // },
    // {
    //     id: 16,
    //     title: 'Reset Top Ten',
    //     icon: 'mat_outline:refresh',
    // },
    // {
    //     id: 17,
    //     title: 'Surveys',
    //     icon: 'mat_outline:campaign',
    // },
    // {
    //     id: 18,
    //     title: 'Margins',
    //     icon: 'mat_outline:margin',
    // },
    // {
    //     id: 19,
    //     title: 'Store Suppliers',
    //     icon: 'mat_outline:supervised_user_circle',
    // },
    // // {
    // //     id: 20,
    // //     title: 'Product Clicks',
    // //     icon: 'mat_outline:ads_click',
    // // },
    // {
    //     id: 21,
    //     title: 'Search History',
    //     icon: 'mat_outline:saved_search',
    // },
    // {
    //     id: 22,
    //     title: 'User Data File',
    //     icon: 'mat_outline:data_saver_off',
    // },
    // {
    //     id: 23,
    //     title: 'Opt-In Data File',
    //     icon: 'mat_outline:data_saver_on'
    // },
    // {
    //     id: 24,
    //     title: 'Customer Reviews',
    //     icon: 'mat_outline:reviews',
    // },
    // {
    //     id: 25,
    //     title: 'Fulfillment Contacts',
    //     icon: 'mat_outline:contacts',
    // },
    // // {
    // //     id: 26,
    // //     title: 'Fulfillment Invoices',
    // //     icon: 'mat_outline:inventory',
    // // },
    // // {
    // //     id: 27,
    // //     title: 'Fulfillment Options',
    // //     icon: 'heroicons_outline:template',
    // // },
    // {
    //     id: 28,
    //     title: 'Royalities',
    //     icon: 'mat_outline:reviews',
    // },
    // // {
    // //     id: 29,
    // //     title: 'Referral Locations',
    // //     icon: 'mat_outline:info',
    // // },
    // {
    //     id: 30,
    //     title: 'Art Approval Settings',
    //     icon: 'mat_outline:picture_in_picture',
    // },
    // {
    //     id: 31,
    //     title: 'Consolidated Bill',
    //     icon: 'mat_outline:house_siding',
    // },
    // {
    //     id: 32,
    //     title: 'Inventory Summary',
    //     icon: 'mat_outline:history',
    // },
    // {
    //     id: 33,
    //     title: 'Cost Center Codes',
    //     icon: 'mat_outline:history',
    // },
    // {
    //     id: 34,
    //     title: 'Locations',
    //     icon: 'mat_outline:speaker_notes',
    // },
    // {
    //     id: 35,
    //     title: 'Blanket Credit Terms',
    //     icon: 'mat_outline:group_work',
    // },
    // {
    //     id: 36,
    //     title: 'Student orgs',
    //     icon: 'heroicons_outline:duplicate'
    // },
    // {
    //     id: 37,
    //     title: 'Store Plan/Strategies',
    //     icon: 'heroicons_outline:duplicate'
    // }

];