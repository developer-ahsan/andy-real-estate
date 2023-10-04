import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver, StoresResolver, SuppliersResolver, UserRoleResolver } from 'app/app.resolvers';
import { StatesResolver } from './modules/admin/apps/vendors/components/vendors.resolvers';

// @formatter:off
/* eslint-disable max-len */
export const appRoutes: Route[] = [

    // Redirect empty path to '/dashboards/project'
    { path: '', pathMatch: 'full', redirectTo: 'dashboards/employee' },

    // Redirect signed in user to the '/dashboards/project'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'dashboards/employee' },

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
            suppliers: SuppliersResolver,
            stores: StoresResolver,
        },
        children: [
            { path: 'dashboards', loadChildren: () => import('app/modules/admin/dashboards/dashboards.module').then(m => m.DashboardsModule) },

            // Apps
            {
                path: 'apps', children: [
                    { path: 'search', loadChildren: () => import('app/modules/admin/apps/search-modules/search-module.module').then(m => m.SearchModule) },
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
                    { path: 'orders', loadChildren: () => import('app/modules/admin/apps/orders/orders.module').then(m => m.OrdersModule) },
                    { path: 'quotes', loadChildren: () => import('app/modules/admin/apps/quotes/quotes.module').then(m => m.QuotesModule) },
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
                    // Profile
                    { path: 'profile', loadChildren: () => import('app/modules/admin/pages/profile/profile.module').then(m => m.ProfileModule) },

                    // Settings
                    { path: 'settings', loadChildren: () => import('app/modules/admin/pages/settings/settings.module').then(m => m.SettingsModule) },
                ]
            },
            // 404 & Catch all
            { path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.module').then(m => m.Error404Module) },
            { path: '**', redirectTo: '404-not-found' }
        ]
    }
];
