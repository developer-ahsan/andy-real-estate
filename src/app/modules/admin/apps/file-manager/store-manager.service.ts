import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { map, retry, switchMap, take, tap } from "rxjs/operators";
import {
  AddSurvey,
  GroupBuy,
  ShippingNotification,
  StoreList,
  StoreSettings,
} from "app/modules/admin/apps/file-manager/stores.types";
import { environment } from "environments/environment";
import { navigations } from "./navigation-data";
import { AuthService } from "app/core/auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class FileManagerService {
  // Private
  private _selectedStore: BehaviorSubject<StoreList | null> =
    new BehaviorSubject(null);
  private _storeDetails: BehaviorSubject<StoreList | null> =
    new BehaviorSubject(null);
  private _stores: BehaviorSubject<StoreList | null> = new BehaviorSubject(
    null
  );
  private _suppliers: BehaviorSubject<any[] | null> = new BehaviorSubject<
    any[]
  >(null);
  private _setting: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(
    null
  );

  public navigationLabels = navigations;

  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService
  ) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for items
   */
  get stores$(): Observable<StoreList> {
    return this._stores.asObservable();
  }

  /**
   * Getter for settings
   */
  get settings$(): Observable<any> {
    return this._setting.asObservable();
  }

  /**
   * Getter for items
   */
  get suppliers$(): Observable<any> {
    return this._suppliers.asObservable();
  }

  /**
   * Getter for item
   */
  get item$(): Observable<StoreList> {
    return this._selectedStore.asObservable();
  }
  /**
     * Getter for item
     */
  get storeDetail$(): Observable<StoreList> {
    return this._storeDetails.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  getAllSuppliers(): Observable<any[]> {
    return this._httpClient
      .get<any[]>(environment.stores, {
        params: {
          supplier: true,
          bln_active: 1,
          size: 2000,
        },
      })
      .pipe(
        tap((response: any) => {
          this._suppliers.next(response);
        })
      );
  }


  // bln undefined
  getAllSuppliersBln(size: number): Observable<any[]> {
    return this._httpClient
      .get<any[]>(environment.stores, {
        params: {
          supplier: true,
          size: size
        },
      })
      .pipe(
        tap((response: any) => {
          this._suppliers.next(response);
        })
      );
  }

  /**
   * Get items
   */
  getItems(): Observable<StoreList[]> {
    return this._httpClient.get<StoreList>("api/apps/file-manager").pipe(
      tap((response: any) => {
        // this._stores.next(response);
      })
    );
  }

  getAllStores(): Observable<any[]> {
    return this._httpClient
      .get<any[]>(environment.stores, {
        params: {
          list: true,
          bln_active: true,
          size: 2000,
        },
      })
      .pipe(
        tap((response: any) => {
          this._stores.next(response);
        }),
        retry(3)
      );
  }

  getStoreByStoreId(storeId): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        list: true,
        store_id: storeId,
      },
    }).pipe(
      tap((response: any) => {
        this._storeDetails.next(response);
      })
    );
  }

  getSurveysByStoreId(storeId): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        survey: true,
        store_id: storeId,
        size: 20,
      },
    });
  }

  getOfflineProducts(storeID, pageNo): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        offline_product: true,
        store_id: storeID,
        size: 20,
        page: pageNo,
      },
    });
  }

  getOfflineProductsByKeyword(storeID, keyword): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        offline_product: true,
        keyword: keyword,
        store_id: storeID,
        size: 20,
      },
    });
  }

  getStoreProducts(storeID, pageNo): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        store_product: true,
        store_id: storeID,
        view_type: 1,
        size: 20,
        page: pageNo,
      },
    });
  }

  getStoreProductsByKeywords(storeID, keyword): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        store_product: true,
        store_id: storeID,
        view_type: 1,
        size: 20,
        keyword: keyword,
      },
    });
  }

  getRapidBuildImages(storeID, statusId): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrlRapidBuild, {
      params: {
        dashboard: true,
        store_id: storeID,
        size: 20,
        search_image_status_id: statusId,
      },
    });
  }

  getAllRapidBuildImages(storeID): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrlRapidBuild, {
      params: {
        dashboard: true,
        store_id: storeID,
        size: 20,
      },
    });
  }

  getAllRapidBuildImagesByKeyword(storeID, keyword): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrlRapidBuild, {
      params: {
        dashboard: true,
        store_id: storeID,
        keyword: keyword,
        size: 20,
      },
    });
  }

  getAllRapidBuildImagesById(storeID, id): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrlRapidBuild, {
      params: {
        dashboard: true,
        store_id: storeID,
        id: id,
        size: 20,
      },
    });
  }

  getRapidBuildDropDown(storeID): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrlRapidBuild, {
      params: {
        image: true,
        store_id: storeID,
        size: 20,
      },
    });
  }

  getProducts(storeID, pageNo): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        product: true,
        store_id: storeID,
        size: 20,
        page: pageNo,
      },
    });
  }

  getStoreVideos(storeID, pageNo): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        product: true,
        video: true,
        store_id: storeID,
        size: 20,
        page: pageNo,
      },
    });
  }

  getStoreProductLevelVideos(storeID, pageNo): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        store_product: true,
        video: true,
        store_id: storeID,
        size: 20,
        page: pageNo,
      },
    });
  }

  getStoreCategory(storeID, pageNo): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        category: true,
        store_id: storeID,
        size: 100,
        page: pageNo,
      },
    });
  }

  getStoreSubCategory(storeID): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        sub_category: true,
        category_id: storeID,
        size: 20,
      },
    });
  }

  getStoreSetting(storeID): Observable<any[]> {
    return this._httpClient
      .get<any[]>(environment.storeNewUrl, {
        params: {
          setting: true,
          store_id: storeID,
        },
      })
      .pipe(
        tap((response: any) => {
          this._setting.next(response);
        })
      );
  }

  getCampaigns(storeID): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        campaign: true,
        store_id: storeID,
        size: 20,
      },
    });
  }

  getCampaignsByPage(storeID, page): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        campaign: true,
        store_id: storeID,
        page: page,
        size: 20,
      },
    });
  }

  /**
   * update wareHouse
   **/
  updateStoreSettings(payload: StoreSettings) {
    const headers = {
      Authorization: `Bearer ${this._authService.accessToken}`,
    };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers });
  }

  /**
   * update wareHouse
   **/
  updateGroupOrderSettings(payload: GroupBuy) {
    const headers = {
      Authorization: `Bearer ${this._authService.accessToken}`,
    };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers });
  }

  /**
   * update wareHouse
   **/
  addSurvey(payload: AddSurvey) {
    const headers = {
      Authorization: `Bearer ${this._authService.accessToken}`,
    };
    return this._httpClient.post(environment.storeNewUrl, payload, { headers });
  }

  getShippingNotifications(storeID) {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        shipping_notification: true,
        store_id: storeID,
        size: 20,
      },
    });
  }

  /**
   * update wareHouse
   **/
  updateShippingNotifications(payload: ShippingNotification) {
    const headers = {
      Authorization: `Bearer ${this._authService.accessToken}`,
    };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers });
  }

  /**
   * Get item by id
   */
  getItemById(id: string): Observable<StoreList> {
    return this._stores.pipe(
      take(1),
      map((items: any) => {
        const stores = items["data"];

        // Find stores
        const item = stores.find((value) => value.pk_storeID == id) || null;

        // Update the item
        this._selectedStore.next(item);

        // Return the item
        return item;
      }),
      switchMap((item) => {
        if (!item) {
          return throwError("Could not found the item with id of " + id + "!");
        }

        return of(item);
      })
    );
  }

  getPresentationData(params) {
    return this._httpClient
      .get<any[]>(environment.stores, { params: params })
      .pipe(retry(3));
  }
  getDashboardData(params) {
    return this._httpClient
      .get<any[]>(environment.stores, { params: params })
      .pipe(retry(3));
  }

  getStoresData(params) {
    return this._httpClient
      .get<any[]>(environment.stores, { params: params })
      .pipe(retry(3));
  }
  putStoresData(payload) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.stores, payload, { headers }).pipe(retry(3));
  }
  postStoresData(payload) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(environment.stores, payload, { headers }).pipe(retry(3));
  }
}
