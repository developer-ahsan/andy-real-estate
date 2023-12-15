import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { map, retry, switchMap, take, tap } from "rxjs/operators";
import {
  AddArtwork,
  AddAvailableMember,
  AddCampaign,
  AddFeatureImage,
  AddQuickGuide,
  AddStaticFeatureImage,
  AddSurvey,
  CreateStore,
  CreateStoreSettings,
  DeleteArtwork,
  DeleteAvailableMember,
  DeleteFeatureImage,
  DeleteMobileImage,
  EditAvailableMember,
  editSocialMedia,
  EditStaticFeatureImage,
  email_preview,
  GroupBuy,
  RemoveQuickGuide,
  ShippingNotification,
  StoreList,
  StoreSettings,
  UpdateArtwork,
  UpdateArtworkDisplayOrder,
  UpdateFeatureImage,
  UpdateHeaderImage,
  UpdatePaymentMethod,
  UpdateProductBuilder,
} from "app/modules/admin/apps/file-manager/stores.types";
import { environment } from "environments/environment";
import { navigations } from "./navigation-data";
import { AuthService } from "app/core/auth/auth.service";
import { AddNewsFeed, AddScroller, AddTestimonial, colorHeaderUpdate, colorsUpdate, DefaultEmailUpdate, DeleteNewsFeed, DeleteScroller, DeleteTestimonial, UpdateDefaultScroller, UpdateFeatureCampaign, UpdateNewsFeed, UpdateScroller, UpdateScrollerOrder, UpdateSpecialOffer, UpdateTestimonials, UpdateTestimonialStatus, UpdateTypeKit } from "./navigation/presentation/presentation.types";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root",
})
export class FileManagerService {

  public isEditMainCategory: boolean = false;
  public isEditSubCategory: boolean = false;
  public subCatData: any;
  public _storeSearchKeyword = '';
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
    private _authService: AuthService,
    private _snackBar: MatSnackBar,
  ) { }
  snackBar(msg) {
    this._snackBar.open(msg, '', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 3500
    });
  }
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
      .get<any[]>(environment.storeNewUrl, {
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
      .get<any[]>(environment.storeNewUrl, {
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
        store_products_offline_products: true,
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

  getStoreProductsEmailBlast(params): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeProducts, { params });
  }

  getExtendedListStoreProducts(storeID, pageNo): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        store_product: true,
        store_id: storeID,
        view_type: 1,
        size: 30,
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
  getRapidBuildData(params): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrlRapidBuild, {
      params: params,
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

  getStoreCategory(storeID, pageNo, catID): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        category: true,
        store_id: storeID,
        category_id: catID,
        size: 100,
        page: pageNo,
      },
    });
  }

  getStoreSubCategory(catID, subCatId): Observable<any[]> {
    return this._httpClient.get<any[]>(environment.storeNewUrl, {
      params: {
        sub_category: true,
        category_id: catID,
        sub_category_id: subCatId,
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
      .get<any[]>(environment.storeNewUrl, { params: params })
      .pipe(retry(3));
  }

  getDashboardData(params) {
    return this._httpClient
      .get<any[]>(environment.storeNewUrl, { params: params })
      .pipe(retry(3));
  }

  getDashboardGraphData(params) {
    return this._httpClient
      .get<any[]>(environment.storeNewUrl, { params: params })
      .pipe(retry(3));
  }

  getMainCampaign(params) {
    return this._httpClient
      .get<any[]>(environment.storeNewUrl, { params: params })
      .pipe(retry(3));
  }

  getStoresData(params) {
    return this._httpClient
      .get<any[]>(environment.storeNewUrl, { params: params })
      .pipe(retry(3));
  }

  getUserData(params) {
    return this._httpClient
      .get<any[]>(environment.storeNewUrl, { params: params })
      .pipe(retry(3));
  }
  putStoresRapidData(payload) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrlRapidBuild, payload, { headers }).pipe(retry(3));
  }

  putStoresData(payload) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }

  putStoreProductsData(payload) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeProducts, payload, { headers }).pipe(retry(3));
  }
  postStoresData(payload) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }

  postProductData(payload) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(environment.storeProducts, payload, { headers }).pipe(retry(3));
  }

  getRapidData(params) {
    return this._httpClient
      .get<any[]>(environment.storeNewUrlRapidBuild, { params: params })
      .pipe(retry(3));
  }
  getProductsData(params) {
    return this._httpClient
      .get<any[]>(environment.products, { params: params })
      .pipe(retry(3));
  }

  CreateNewStore(payload: CreateStore) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(environment.stores, payload, { headers }).pipe(retry(1));
  }
  CreateStoreSettings(payload: CreateStoreSettings) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(environment.stores, payload, { headers }).pipe(retry(1));
  }



  // Presentation Calls 
  colorHeaderUpdate(payload: colorHeaderUpdate) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  colorsUpdate(payload: colorsUpdate) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  UpdateSpecialOffer(payload: UpdateSpecialOffer) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  UpdateTypeKit(payload: UpdateTypeKit) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  AddNewsFeed(payload: AddNewsFeed) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  UpdateNewsFeed(payload: UpdateNewsFeed) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  DeleteNewsFeed(payload: DeleteNewsFeed) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  // Dashboard Emails
  DefaultEmailUpdate(payload: DefaultEmailUpdate) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  // Testimonials
  UpdateTestimonialStatus(payload: UpdateTestimonialStatus) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  UpdateTestimonials(payload: UpdateTestimonials) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  DeleteTestimonial(payload: DeleteTestimonial) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  AddTestimonial(payload: AddTestimonial) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  UpdateDefaultScroller(payload: UpdateDefaultScroller) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  UpdateScrollerOrder(payload: UpdateScrollerOrder) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  AddScroller(payload: AddScroller) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  DeleteScroller(payload: DeleteScroller) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  UpdateScroller(payload: UpdateScroller) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  UpdateFeatureCampaign(payload: UpdateFeatureCampaign) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  AddCampaign(payload: AddCampaign) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  addCampaignMedia(payload) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(
      environment.storeNewUrl, payload, { headers });
  };
  addPresentationMedia(payload) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(
      environment.storeNewUrl, payload, { headers });
  };
  getEmailPriviewTemplate(payload: email_preview) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(
      environment.storeNewUrl, payload, { headers });
  };
  UpdateSocialMedia(payload: editSocialMedia) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  AddStaticFeatureImage(payload: AddStaticFeatureImage) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  EditStaticFeatureImage(payload: EditStaticFeatureImage) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  DeleteMobileImage(payload: DeleteMobileImage) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  AddFeatureImage(payload: AddFeatureImage) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  UpdateFeatureImage(payload: UpdateFeatureImage) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  DeleteFeatureImage(payload: DeleteFeatureImage) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  // Support Team
  AddAvailableMember(payload: AddAvailableMember) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  EditAvailableMember(payload: EditAvailableMember) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  DeleteAvailableMember(payload: DeleteAvailableMember) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  // Payment Methods
  UpdatePaymentMethod(payload: UpdatePaymentMethod) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  // Artwork Tags
  UpdateArtworkDisplayOrder(payload: UpdateArtworkDisplayOrder) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  AddArtwork(payload: AddArtwork) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  DeleteArtwork(payload: DeleteArtwork) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  UpdateArtwork(payload: UpdateArtwork) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  // Product Builder
  UpdateProductBuilder(payload: UpdateProductBuilder) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  // Quick Guides
  RemoveQuickGuide(payload: RemoveQuickGuide) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  AddQuickGuide(payload: AddQuickGuide) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  // Header Image
  UpdateHeaderImage(payload: UpdateHeaderImage) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(environment.storeNewUrl, payload, { headers }).pipe(retry(3));
  }
  addMedia(payload) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.post(
      environment.products, payload, { headers });
  };
  removeMedia(payload) {
    const headers = { 'Authorization': `Bearer ${this._authService.accessToken}` };
    return this._httpClient.put(
      environment.products, payload, { headers });
  };
}
