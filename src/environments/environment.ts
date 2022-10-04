// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  signInAuth:
    "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyDdIDmQFMIa3aXSnoudkf3At_zQ9faFs2k",
  mediaKey: "DE3339BDDF8B5D1A6BD3D965D7CCB4B6A7234672505A0023485852397777D05E",
  mediaAccessUrl: "https://admin.consolidus.com/ssadm/imageUpload.cfm",
  customerList: "https://consolidus-staging.azurewebsites.net/api/users",
  customer: "https://consolidus-staging.azurewebsites.net/api/user",
  orders: "https://consolidus-staging.azurewebsites.net/api/orders",
  stores: "https://consolidus-staging.azurewebsites.net/api/stores",
  storeNewUrl: "https://stores-staging.azurewebsites.net/api/stores",
  storeNewUrlRapidBuild:
    "https://stores-staging.azurewebsites.net/api/rapid_build",
  products: "https://consolidus-staging.azurewebsites.net/api/products",
  system: "https://consolidus-staging.azurewebsites.net/api/system",
  productMedia: "https://assets.consolidus.com/globalAssets/Products",
  rapidBuildMedia: "https://assets.consolidus.com/globalAssets/rapidBuild",
  storeMedia: "https://assets.consolidus.com/globalAssets/Stores",
  supportTeam:
    "https://assets.consolidus.com/globalAssets/System/Defaults/SupportTeam/",
  featureImage:
    "https://assets.consolidus.com/globalAssets/Stores/featureImage/",
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
// http://localhost:7071/api/
