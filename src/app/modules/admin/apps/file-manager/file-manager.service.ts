import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Item, Items } from 'app/modules/admin/apps/file-manager/stores.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FileManagerService {
    // Private
    private _item: BehaviorSubject<Item | null> = new BehaviorSubject(null);
    private _items: BehaviorSubject<Items | null> = new BehaviorSubject(null);

    public navigationLabels = [
        {
            id: 1,
            title: 'Dashboard',
            icon: 'mat_outline:dashboard'
        },
        {
            id: 2,
            title: 'Store Products',
            icon: 'mat_outline:store_mall_directory',
        },
        {
            id: 3,
            title: 'Product Categories',
            icon: 'mat_outline:category',
        },
        {
            id: 4,
            title: 'Products/Supplier',
            icon: 'mat_outline:supervised_user_circle'
        },
        {
            id: 5,
            title: 'Offline Products',
            icon: 'heroicons_outline:academic-cap',
        },
        {
            id: 6,
            title: 'Store Product Videos',
            icon: 'mat_outline:ondemand_video',
        },
        {
            id: 7,
            title: 'RapidBuild',
            icon: 'mat_outline:build_circle',
        },
        {
            id: 8,
            title: 'RapidBuild Bulk Actions',
            icon: 'mat_outline:pending_actions'
        },
        {
            id: 9,
            title: 'Store Settings',
            icon: 'mat_outline:settings',
        },
        {
            id: 10,
            title: 'Jaggaer Settings',
            icon: 'mat_outline:settings',
        },
        {
            id: 11,
            title: 'Group Order Settings',
            icon: 'mat_outline:settings',
        },
        {
            id: 12,
            title: 'Campaigns',
            icon: 'mat_outline:campaign',
        },
        {
            id: 13,
            title: 'Presentation',
            icon: 'mat_outline:present_to_all',
        },
        {
            id: 14,
            title: 'Email Blast',
            icon: 'mat_outline:email',
        },
        {
            id: 15,
            title: 'Shipping Notifications',
            icon: 'mat_outline:notifications_active',
        },
        {
            id: 16,
            title: 'Reset Top Ten',
            icon: 'mat_outline:refresh',
        },
        {
            id: 17,
            title: 'Surveys',
            icon: 'mat_outline:campaign',
        },
        {
            id: 18,
            title: 'Margins',
            icon: 'mat_outline:margin',
        },
        {
            id: 19,
            title: 'Store Suppliers',
            icon: 'mat_outline:supervised_user_circle',
        },
        {
            id: 20,
            title: 'Product Clicks',
            icon: 'mat_outline:ads_click',
        },
        {
            id: 21,
            title: 'Search History',
            icon: 'mat_outline:saved_search',
        },
        {
            id: 22,
            title: 'User Data File',
            icon: 'mat_outline:data_saver_off',
        },
        {
            id: 23,
            title: 'Opt-In Data File',
            icon: 'mat_outline:data_saver_on'
        },
        {
            id: 24,
            title: 'Customer Reviews',
            icon: 'mat_outline:reviews',
        },
        {
            id: 25,
            title: 'Fulfillment Contacts',
            icon: 'mat_outline:contacts',
        },
        {
            id: 26,
            title: 'Fulfillment Invoices',
            icon: 'mat_outline:inventory',
        },
        {
            id: 27,
            title: 'Fulfillment Options',
            icon: 'heroicons_outline:template',
        },
        {
            id: 28,
            title: 'Royalities',
            icon: 'mat_outline:reviews',
        },
        {
            id: 29,
            title: 'Referral Locations',
            icon: 'mat_outline:info',
        },
        {
            id: 30,
            title: 'Art Approval Settings',
            icon: 'mat_outline:picture_in_picture',
        },
        {
            id: 31,
            title: 'Consolidated Bill',
            icon: 'mat_outline:house_siding',
        },
        {
            id: 32,
            title: 'Inventory Summary',
            icon: 'mat_outline:history',
        },
        {
            id: 33,
            title: 'Cost Center Codes',
            icon: 'mat_outline:history',
        },
        {
            id: 34,
            title: 'Locations',
            icon: 'mat_outline:speaker_notes',
        },
        {
            id: 35,
            title: 'Blanket Credit Terms',
            icon: 'mat_outline:group_work',
        },
        {
            id: 36,
            title: 'Student orgs',
            icon: 'heroicons_outline:duplicate'
        },
        {
            id: 37,
            title: 'Store Plan/Strategies',
            icon: 'heroicons_outline:duplicate'
        }
    ];

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for items
     */
    get items$(): Observable<Items> {
        return this._items.asObservable();
    }

    /**
     * Getter for item
     */
    get item$(): Observable<Item> {
        return this._item.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get items
     */
    getItems(): Observable<Item[]> {
        return this._httpClient.get<Items>('api/apps/file-manager').pipe(
            tap((response: any) => {
                // this._items.next(response);
            })
        );
    };

    getAllStores(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.stores, {
            params: {
                list: true,
                size: 2000
            }
        }).pipe(
            tap((response: any) => {
                this._items.next(response);
            })
        );
    };

    getOfflineProducts(storeID, pageNo): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeNewUrl, {
            params: {
                offline_product: true,
                store_id: storeID,
                size: 20,
                page: pageNo
            }
        })
    };

    getStoreProducts(storeID, pageNo): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeNewUrl, {
            params: {
                store_product: true,
                store_id: storeID,
                view_type: 1,
                size: 20,
                page: pageNo
            }
        })
    };

    getRapidBuildImages(storeID, statusId): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeNewUrlRapidBuild, {
            params: {
                dashboard: true,
                store_id: storeID,
                size: 20,
                search_image_status_id: statusId
            }
        })
    };

    getAllRapidBuildImages(storeID): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeNewUrlRapidBuild, {
            params: {
                dashboard: true,
                store_id: storeID,
                size: 20
            }
        })
    };

    getAllRapidBuildImagesByKeyword(storeID, keyword): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeNewUrlRapidBuild, {
            params: {
                dashboard: true,
                store_id: storeID,
                keyword: keyword,
                size: 20
            }
        })
    };

    getAllRapidBuildImagesById(storeID, id): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeNewUrlRapidBuild, {
            params: {
                dashboard: true,
                store_id: storeID,
                id: id,
                size: 20
            }
        })
    };

    getRapidBuildDropDown(storeID): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeNewUrlRapidBuild, {
            params: {
                image: true,
                store_id: storeID,
                size: 20
            }
        })
    };

    getProducts(storeID, pageNo): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeNewUrl, {
            params: {
                product: true,
                store_id: storeID,
                size: 20,
                page: pageNo
            }
        })
    };

    getStoreVideos(storeID, pageNo): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeNewUrl, {
            params: {
                product: true,
                video: true,
                store_id: storeID,
                size: 20,
                page: pageNo
            }
        })
    };

    getStoreCategory(storeID, pageNo): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeNewUrl, {
            params: {
                category: true,
                store_id: storeID,
                size: 100,
                page: pageNo
            }
        })
    };

    getStoreSubCategory(storeID): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeNewUrl, {
            params: {
                sub_category: true,
                category_id: storeID,
                size: 20
            }
        })
    };

    /**
     * Get item by id
     */
    getItemById(id: string): Observable<Item> {
        return this._items.pipe(
            take(1),
            map((items: any) => {
                const stores = items["data"];

                // Find stores
                const item = stores.find(value => value.pk_storeID == id) || null;

                // Update the item
                this._item.next(item);

                // Return the item
                return item;
            }),
            switchMap((item) => {

                if (!item) {
                    return throwError('Could not found the item with id of ' + id + '!');
                }

                return of(item);
            })
        );
    }
}
