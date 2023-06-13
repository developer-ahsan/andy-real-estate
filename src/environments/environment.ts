
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  signInAuth:
    "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyDdIDmQFMIa3aXSnoudkf3At_zQ9faFs2k",
  mediaKey: "DE3339BDDF8B5D1A6BD3D965D7CCB4B6A7234672505A0023485852397777D05E",
  mediaAccessUrl: "https://admin.consolidus.com/ssadm/imageUpload.cfm",
  customerList: "https://consolidusapi.azure-api.net/users",
  customer: "https://consolidusapi.azure-api.net/user",
  orders: "https://consolidus.azurewebsites.net/api/orders",
  stores: "http://localhost:7100/api/stores",
  storeNewUrl: "http://localhost:7100/api/stores",
  storeNewUrlRapidBuild: "https://stores-staging.azurewebsites.net/api/rapid_build",
  products: "https://consolidusapi.azure-api.net/products",
  dashboard: "https://consolidus.azurewebsites.net/api/main_dashboard",
  royalties: "https://consolidusapi.azure-api.net/royalties",
  storeProducts: "http://localhost:7100/api/store_products",
  system: "https://consolidusapi.azure-api.net/system",
  flps: "https://consolidus.azurewebsites.net/api/flps",
  catalog: "https://consolidusapi.azure-api.net/catalog",
  admins: "https://consolidusapi.azure-api.net/consolidus/admin",
  smartart: "https://consolidusapi.azure-api.net/smartart",
  order_manage: "https://consolidus.azurewebsites.net/api/order_manage",
  smartcents: "https://consolidus.azurewebsites.net/api/smartcents",
  rapid_build: "https://consolidusapi.azure-api.net/rapidbuild",
  import_export: "https://consolidusapi.azure-api.net/import_export",
  vendors: "https://consolidus.azurewebsites.net/api/vendors",
  reports: "https://consolidus.azurewebsites.net/api/reports",
  campaignMedia: "https://assets.consolidus.com/globalAssets/Campaigns",
  productMedia: "https://assets.consolidus.com/globalAssets/Products",
  imprintMedia: "https://assets.consolidus.com/globalAssets/Imprints",
  rapidBuildMedia: "https://assets.consolidus.com/globalAssets/rapidBuild",
  storeMedia: "https://assets.consolidus.com/globalAssets/Stores",
  supportTeam:
    "https://assets.consolidus.com/globalAssets/System/Defaults/SupportTeam/",
  featureImage:
    "https://assets.consolidus.com/globalAssets/Stores/featureImage/",
  generalFilesPath: 'https://admin.consolidus.com/ssadm/getFiles.cfm?Key=DE3339BDDF8B5D1A6BD3D965D7CCB4B6A7234672505A0023485852397777D05E',
  firebaseConfig: {
    apiKey: "AIzaSyDdIDmQFMIa3aXSnoudkf3At_zQ9faFs2k",
    authDomain: "consolidus-cinnova.firebaseapp.com",
    projectId: "consolidus-cinnova",
    storageBucket: "consolidus-cinnova.appspot.com",
    messagingSenderId: "187396735094",
    appId: "1:187396735094:web:4127587a84d92215ec1f57",
  },
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
// https://consolidus-staging.azurewebsites.net/api/
// https://consolidusapi.azure-api.net/
