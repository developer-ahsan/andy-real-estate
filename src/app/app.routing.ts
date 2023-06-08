import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';
import { StatesResolver } from './modules/admin/apps/vendors/components/vendors.resolvers';

// @formatter:off
/* eslint-disable max-len */
export const appRoutes: Route[] = [

    // Redirect empty path to '/dashboards/project'
    { path: '', pathMatch: 'full', redirectTo: 'dashboards/analytics' },

    // Redirect signed in user to the '/dashboards/project'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'dashboards/analytics' },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule) },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule) },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule) },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule) },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule) }
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule) },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule) }
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule) },
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            { path: 'dashboards', loadChildren: () => import('app/modules/admin/dashboards/dashboards.module').then(m => m.DashboardsModule) },

            // Dashboards
            // {
            //     path: 'dashboards', children: [
            //         { path: 'overview', loadChildren: () => import('app/modules/admin/dashboards/project/project.module').then(m => m.ProjectModule) },
            //         { path: 'analytics', loadChildren: () => import('app/modules/admin/dashboards/analytics/analytics.module').then(m => m.AnalyticsModule) },
            //     ]
            // },
            // Apps
            {
                path: 'apps', children: [
                    { path: 'academy', loadChildren: () => import('app/modules/admin/apps/academy/academy.module').then(m => m.AcademyModule) },
                    { path: 'search', loadChildren: () => import('app/modules/admin/apps/search-modules/search-module.module').then(m => m.SearchModule) },
                    { path: 'calendar', loadChildren: () => import('app/modules/admin/apps/calendar/calendar.module').then(m => m.CalendarModule) },
                    { path: 'chat', loadChildren: () => import('app/modules/admin/apps/chat/chat.module').then(m => m.ChatModule) },
                    { path: 'contacts', loadChildren: () => import('app/modules/admin/apps/contacts/contacts.module').then(m => m.ContactsModule) },
                    { path: 'ecommerce', loadChildren: () => import('app/modules/admin/apps/ecommerce/ecommerce.module').then(m => m.ECommerceModule) },
                    { path: 'vendors', loadChildren: () => import('app/modules/admin/apps/vendors/vendors.module').then(m => m.VendorsModule), resolve: { states: StatesResolver } },
                    { path: 'system', loadChildren: () => import('app/modules/admin/apps/system/system.module').then(m => m.SystemModule) },
                    { path: 'flps', loadChildren: () => import('app/modules/admin/apps/flps/flps.module').then(m => m.FlpsModule) },
                    { path: 'users', loadChildren: () => import('app/modules/admin/apps/users/users.module').then(m => m.UsersModule) },
                    { path: 'catalog', loadChildren: () => import('app/modules/admin/apps/catalog/catalog.module').then(m => m.CatalogModule) },
                    { path: 'promostandards', loadChildren: () => import('app/modules/admin/apps/promostandards/promostandards.module').then(m => m.PromoStandardsModule) },
                    { path: 'stores', loadChildren: () => import('app/modules/admin/apps/file-manager/stores.module').then(m => m.StoresModule) },
                    { path: 'royalties', loadChildren: () => import('app/modules/admin/apps/royalities/royalities.module').then(m => m.RoyalitiesModule) },
                    { path: 'reports', loadChildren: () => import('app/modules/admin/apps/reports/reports.module').then(m => m.ReportsModule) },
                    { path: 'help-center', loadChildren: () => import('app/modules/admin/apps/help-center/help-center.module').then(m => m.HelpCenterModule) },
                    { path: 'mailbox', loadChildren: () => import('app/modules/admin/apps/mailbox/mailbox.module').then(m => m.MailboxModule) },
                    { path: 'notes', loadChildren: () => import('app/modules/admin/apps/notes/notes.module').then(m => m.NotesModule) },
                    { path: 'tasks', loadChildren: () => import('app/modules/admin/apps/tasks/tasks.module').then(m => m.TasksModule) },
                    // { path: 'customers', loadChildren: () => import('app/modules/admin/apps/ecommerce/ecommerce.module').then(m => m.ECommerceModule) },
                    { path: 'orders', loadChildren: () => import('app/modules/admin/apps/orders/orders.module').then(m => m.OrdersModule) },
                    { path: 'customers', loadChildren: () => import('app/modules/admin/apps/customers/customers.module').then(m => m.CustomersModule) },
                    { path: 'companies', loadChildren: () => import('app/modules/admin/apps/company-profile/company-profile.module').then(m => m.CompanyProfileModule) },
                ]
            },
            // smartart
            { path: 'smartart', loadChildren: () => import('app/modules/admin/smartart/smartart.module').then(m => m.SmartArtModule) },
            { path: 'rapidbuild', loadChildren: () => import('app/modules/admin/rapidBuild/rapid-build.module').then(m => m.RapidBuildModule) },
            { path: 'ordermanage', loadChildren: () => import('app/modules/admin/orderManage/order-manage.module').then(m => m.OrderManageModule) },
            { path: 'import-export', loadChildren: () => import('app/modules/admin/import-export/import-export.module').then(m => m.ImportExportModule) },
            { path: 'smartcents', loadChildren: () => import('app/modules/admin/smartcents/smartcents.module').then(m => m.SmartCentsModule) },

            // Pages
            {
                path: 'pages', children: [

                    // Authentication
                    { path: 'authentication', loadChildren: () => import('app/modules/admin/pages/authentication/authentication.module').then(m => m.AuthenticationModule) },

                    // Coming soon
                    { path: 'coming-soon', loadChildren: () => import('app/modules/admin/pages/coming-soon/coming-soon.module').then(m => m.ComingSoonModule) },

                    // Error
                    {
                        path: 'error', children: [
                            { path: '404', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.module').then(m => m.Error404Module) },
                            { path: '500', loadChildren: () => import('app/modules/admin/pages/error/error-500/error-500.module').then(m => m.Error500Module) }
                        ]
                    },

                    // Invoice
                    {
                        path: 'invoice', children: [
                            {
                                path: 'printable', children: [
                                    { path: 'compact', loadChildren: () => import('app/modules/admin/pages/invoice/printable/compact/compact.module').then(m => m.CompactModule) },
                                    { path: 'modern', loadChildren: () => import('app/modules/admin/pages/invoice/printable/modern/modern.module').then(m => m.ModernModule) }
                                ]
                            }
                        ]
                    },

                    // Maintenance
                    { path: 'maintenance', loadChildren: () => import('app/modules/admin/pages/maintenance/maintenance.module').then(m => m.MaintenanceModule) },

                    // Pricing
                    {
                        path: 'pricing', children: [
                            { path: 'modern', loadChildren: () => import('app/modules/admin/pages/pricing/modern/modern.module').then(m => m.PricingModernModule) },
                            { path: 'simple', loadChildren: () => import('app/modules/admin/pages/pricing/simple/simple.module').then(m => m.PricingSimpleModule) },
                            { path: 'single', loadChildren: () => import('app/modules/admin/pages/pricing/single/single.module').then(m => m.PricingSingleModule) },
                            { path: 'table', loadChildren: () => import('app/modules/admin/pages/pricing/table/table.module').then(m => m.PricingTableModule) }
                        ]
                    },

                    // Profile
                    { path: 'profile', loadChildren: () => import('app/modules/admin/pages/profile/profile.module').then(m => m.ProfileModule) },

                    // Settings
                    { path: 'settings', loadChildren: () => import('app/modules/admin/pages/settings/settings.module').then(m => m.SettingsModule) },
                ]
            },

            // User interface
            {
                path: 'ui', children: [

                    // Angular Material
                    { path: 'angular-material', loadChildren: () => import('app/modules/admin/ui/angular-material/angular-material.module').then(m => m.AngularMaterialModule) },

                    // TailwindCSS
                    { path: 'tailwindcss', loadChildren: () => import('app/modules/admin/ui/tailwindcss/tailwindcss.module').then(m => m.TailwindCSSModule) },

                    // Animations
                    { path: 'animations', loadChildren: () => import('app/modules/admin/ui/animations/animations.module').then(m => m.AnimationsModule) },

                    // Cards
                    { path: 'cards', loadChildren: () => import('app/modules/admin/ui/cards/cards.module').then(m => m.CardsModule) },

                    // Colors
                    { path: 'colors', loadChildren: () => import('app/modules/admin/ui/colors/colors.module').then(m => m.ColorsModule) },

                    // Datatable
                    { path: 'datatable', loadChildren: () => import('app/modules/admin/ui/datatable/datatable.module').then(m => m.DatatableModule) },

                    // Forms
                    {
                        path: 'forms', children: [
                            { path: 'fields', loadChildren: () => import('app/modules/admin/ui/forms/fields/fields.module').then(m => m.FormsFieldsModule) },
                            { path: 'layouts', loadChildren: () => import('app/modules/admin/ui/forms/layouts/layouts.module').then(m => m.FormsLayoutsModule) },
                            { path: 'wizards', loadChildren: () => import('app/modules/admin/ui/forms/wizards/wizards.module').then(m => m.FormsWizardsModule) }
                        ]
                    },

                    // Icons
                    { path: 'icons', loadChildren: () => import('app/modules/admin/ui/icons/icons.module').then(m => m.IconsModule) },

                    // Page layouts
                    { path: 'page-layouts', loadChildren: () => import('app/modules/admin/ui/page-layouts/page-layouts.module').then(m => m.PageLayoutsModule) },

                    // Typography
                    { path: 'typography', loadChildren: () => import('app/modules/admin/ui/typography/typography.module').then(m => m.TypographyModule) }
                ]
            },

            // Documentation
            {
                path: 'docs', children: [

                    // Changelog
                    { path: 'changelog', loadChildren: () => import('app/modules/admin/docs/changelog/changelog.module').then(m => m.ChangelogModule) },

                    // Guides
                    { path: 'guides', loadChildren: () => import('app/modules/admin/docs/guides/guides.module').then(m => m.GuidesModule) },

                    // Core features
                    { path: 'core-features', loadChildren: () => import('app/modules/admin/docs/core-features/core-features.module').then(m => m.CoreFeaturesModule) },

                    // Other components
                    { path: 'other-components', loadChildren: () => import('app/modules/admin/docs/other-components/other-components.module').then(m => m.OtherComponentsModule) },
                ]
            },

            // 404 & Catch all
            { path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.module').then(m => m.Error404Module) },
            { path: '**', redirectTo: '404-not-found' }
        ]
    }
];
