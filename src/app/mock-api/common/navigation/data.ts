/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'apps',
        title: 'Admin',
        type: 'group',
        subtitle: 'Unique dashboard designs',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'dashboards.analytics',
                title: 'Dashboard',
                icon: 'heroicons_outline:chart-pie',
                type: 'basic',
                link: '/dashboards/analytics',
            },
            {
                id: 'products',
                title: 'Products',
                icon: 'heroicons_outline:archive',
                type: 'basic',
                link: '/apps/ecommerce/inventory',
            },
            {
                id: 'promostandards',
                title: 'Promostandards',
                icon: 'heroicons_outline:document-report',
                type: 'basic',
                link: '/apps/promostandards',
            },
            {
                id: 'stores',
                title: 'Stores',
                icon: 'mat_outline:storefront',
                type: 'basic',
                link: '/apps/stores',
            },
            {
                id: 'orders',
                title: 'Orders',
                icon: 'heroicons_outline:document-report',
                type: 'basic',
                link: '/apps/orders'
            },
            {
                id: 'vendors',
                title: 'Vendors',
                icon: 'heroicons_outline:briefcase',
                type: 'basic',
                link: '/apps/vendors',
            },
            {
                id: 'customers',
                title: 'Customers',
                icon: 'heroicons_outline:user-group',
                type: 'basic',
                link: '/apps/ecommerce/customers',
            },
            {
                id: 'reports',
                title: 'Reports',
                icon: 'heroicons_outline:presentation-chart-line',
                type: 'collapsable',
                children: [
                    {
                        id: 'apps.reports.store-sales',
                        title: 'Store Sales',
                        type: 'basic',
                        icon: 'heroicons_outline:shopping-bag',
                    },
                    {
                        id: 'apps.reports.store-sales',
                        title: 'Supplier Sales',
                        type: 'basic',
                        icon: 'heroicons_outline:office-building',
                    },
                    {
                        id: 'apps.reports.store-sales',
                        title: 'Employee Sales',
                        type: 'basic',
                        icon: 'heroicons_outline:user-circle',
                    },
                    {
                        id: 'apps.reports.store-sales',
                        title: 'Location Sales',
                        type: 'basic',
                        icon: 'heroicons_outline:location-marker',
                    },
                    {
                        id: 'apps.reports.store-sales',
                        title: 'Top Customers',
                        type: 'basic',
                        icon: 'heroicons_outline:sparkles',
                    },
                    {
                        id: 'apps.reports.store-sales',
                        title: 'Best Sellers',
                        type: 'basic',
                        icon: 'heroicons_outline:star',
                    },
                ]
            },
            {
                id: 'flps',
                title: 'FLPS',
                icon: 'heroicons_outline:gift',
                type: 'basic',
                link: '/apps/flps',
            },
            {
                id: 'royalties',
                title: 'Royalties',
                icon: 'heroicons_outline:currency-dollar',
                type: 'basic',
                link: '/apps/royalties',
            },
            {
                id: 'catalog',
                title: 'Catalog',
                icon: 'heroicons_outline:book-open',
                type: 'basic',
                link: '/apps/catalog',
            },
            {
                id: 'system',
                title: 'System',
                icon: 'heroicons_outline:cog',
                type: 'basic',
                link: '/apps/system',
            },
            {
                id: 'users',
                title: 'Users',
                icon: 'heroicons_outline:lock-open',
                type: 'basic',
                link: '/apps/users',
            },
        ]
    },
    {
        id: 'smartart',
        title: 'Smartart',
        type: 'group',
        subtitle: 'Smartart Dashboards',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'smartart.orders',
                title: 'Order Dashboard',
                icon: 'heroicons_outline:library',
                type: 'basic',
                link: '/smartart/orders-dashboard',
            },
            {
                id: 'smartart.quotes',
                title: 'Quote Dashboard',
                icon: 'mat_outline:format_quote',
                type: 'basic',
                link: '/smartart/quotes-dashboard',
            },
            {
                id: 'smartart.order',
                title: 'Order Scheduler',
                icon: 'heroicons_outline:clock',
                type: 'basic',
                link: '/smartart/order-scheduler',
            },
            {
                id: 'smartart.scheduler',
                title: 'Quote Scheduler',
                icon: 'mat_outline:more_time',
                type: 'basic',
                link: '/smartart/quote-scheduler',
            }
        ]
    }
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboards',
        title: 'Dashboards',
        type: 'aside',
        icon: 'heroicons_outline:home',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'apps',
        title: 'Apps',
        type: 'aside',
        icon: 'heroicons_outline:qrcode',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'pages',
        title: 'Pages',
        type: 'aside',
        icon: 'heroicons_outline:document-duplicate',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'user-interface',
        title: 'UI',
        type: 'aside',
        icon: 'heroicons_outline:collection',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'navigation-features',
        title: 'Navigation',
        type: 'aside',
        icon: 'heroicons_outline:menu',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'apps',
        title: 'APPS',
        type: 'group',
        children: [
            {
                id: 'apps.dashboards.analytics',
                title: 'Analytics',
                type: 'basic',
                icon: 'heroicons_outline:chart-pie',
                link: '/dashboards/analytics'
            },
            {
                id: 'apps.dashboards.project',
                title: 'Project',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-check',
                link: '/dashboards/project'
            },
            {
                id: 'apps.academy',
                title: 'Academy',
                type: 'basic',
                icon: 'heroicons_outline:academic-cap',
                link: '/apps/academy'
            },
            {
                id: 'apps.calendar',
                title: 'Calendar',
                type: 'basic',
                icon: 'heroicons_outline:calendar',
                link: '/apps/calendar'
            },
            {
                id: 'apps.chat',
                title: 'Chat',
                type: 'basic',
                icon: 'heroicons_outline:chat-alt',
                link: '/apps/chat'
            },
            {
                id: 'apps.contacts',
                title: 'Contacts',
                type: 'basic',
                icon: 'heroicons_outline:user-group',
                link: '/apps/contacts'
            },
            {
                id: 'apps.stores',
                title: 'Stores',
                type: 'basic',
                icon: 'mat_outline:storefront',
                link: '/apps/stores',
            },
            {
                id: 'apps.orders',
                title: 'Orders',
                type: 'basic',
                icon: 'heroicons_outline:document-report',
                link: '/apps/orders'
            },
            {
                id: 'apps.ecommerce',
                title: 'ECommerce',
                type: 'collapsable',
                icon: 'heroicons_outline:shopping-cart',
                children: [
                    {
                        id: 'apps.ecommerce.inventory',
                        title: 'Inventory',
                        type: 'basic',
                        link: '/apps/ecommerce/inventory'
                    },
                    {
                        id: 'apps.customers',
                        title: 'Customers',
                        type: 'basic',
                        icon: 'heroicons_outline:user-group',
                        link: '/apps/ecommerce/customers'
                    },
                    {
                        id: 'customer',
                        icon: 'heroicons_outline:user-group',
                        type: 'basic',
                        link: '/apps/ecommerce/customer',
                    },
                ]
            },
            {
                id: 'apps.file-manager',
                title: 'File manager',
                type: 'basic',
                icon: 'heroicons_outline:shopping-cart',
                link: '/apps/file-manager'
            },
            {
                id: 'apps.help-center',
                title: 'Help center',
                type: 'collapsable',
                icon: 'heroicons_outline:support',
                link: '/apps/help-center',
                children: [
                    {
                        id: 'apps.help-center.home',
                        title: 'Home',
                        type: 'basic',
                        link: '/apps/help-center',
                        exactMatch: true
                    },
                    {
                        id: 'apps.help-center.faqs',
                        title: 'FAQs',
                        type: 'basic',
                        link: '/apps/help-center/faqs'
                    },
                    {
                        id: 'apps.help-center.guides',
                        title: 'Guides',
                        type: 'basic',
                        link: '/apps/help-center/guides'
                    },
                    {
                        id: 'apps.help-center.support',
                        title: 'Support',
                        type: 'basic',
                        link: '/apps/help-center/support'
                    }
                ]
            },
            {
                id: 'apps.mailbox',
                title: 'Mailbox',
                type: 'basic',
                icon: 'heroicons_outline:mail',
                link: '/apps/mailbox',
                badge: {
                    title: '27',
                    classes: 'px-2 bg-black bg-opacity-25 text-white rounded-full'
                }
            },
            {
                id: 'apps.notes',
                title: 'Notes',
                type: 'basic',
                icon: 'heroicons_outline:pencil-alt',
                link: '/apps/notes'
            },
            {
                id: 'apps.tasks',
                title: 'Tasks',
                type: 'basic',
                icon: 'heroicons_outline:check-circle',
                link: '/apps/tasks'
            }
        ]
    },
    {
        id: 'others',
        title: 'OTHERS',
        type: 'group'
    },
    {
        id: 'pages',
        title: 'Pages',
        type: 'aside',
        icon: 'heroicons_outline:document-duplicate',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'user-interface',
        title: 'User Interface',
        type: 'aside',
        icon: 'heroicons_outline:collection',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'navigation-features',
        title: 'Navigation Features',
        type: 'aside',
        icon: 'heroicons_outline:menu',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboards',
        title: 'Dashboards',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'apps',
        title: 'Apps',
        type: 'group',
        icon: 'heroicons_outline:qrcode',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'pages',
        title: 'Pages',
        type: 'group',
        icon: 'heroicons_outline:document-duplicate',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'user-interface',
        title: 'UI',
        type: 'group',
        icon: 'heroicons_outline:collection',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id: 'navigation-features',
        title: 'Misc',
        type: 'group',
        icon: 'heroicons_outline:menu',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    }
];
