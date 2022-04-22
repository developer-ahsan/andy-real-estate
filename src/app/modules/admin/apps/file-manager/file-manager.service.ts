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
            icon: 'mat_outline:sd_storage'
        },
        {
            id: 2,
            title: 'Store Products',
            icon: 'mat_outline:edit_note',
        },
        {
            id: 3,
            title: 'Product Categories',
            icon: 'mat_outline:local_shipping',
        },
        {
            id: 4,
            title: 'Products/Supplier',
            icon: 'mat_outline:price_change'
        },
        {
            id: 5,
            title: 'Offline Products',
            icon: 'mat_outline:checklist',
        },
        {
            id: 6,
            title: 'Store Product Videos',
            icon: 'mat_outline:color_lens',
        },
        {
            id: 7,
            title: 'RapidBuild',
            icon: 'heroicons_outline:arrows-expand',
        },
        {
            id: 8,
            title: 'RapidBuild Bulk Actions',
            icon: 'mat_outline:checklist'
        },
        {
            id: 9,
            title: 'Store Settings',
            icon: 'feather:package',
        },
        {
            id: 10,
            title: 'Jaggaer Settings',
            icon: 'mat_outline:image',
        },
        {
            id: 11,
            title: 'Group Order Settings',
            icon: 'mat_outline:margin',
        },
        {
            id: 12,
            title: 'Campaign',
            icon: 'mat_outline:play_circle_filled',
        },
        {
            id: 13,
            title: 'Presentation',
            icon: 'mat_outline:image',
        },
        {
            id: 14,
            title: 'Email Blast',
            icon: 'heroicons_outline:template',
        },
        {
            id: 15,
            title: 'Shipping Notifications',
            icon: 'mat_outline:reviews',
        },
        {
            id: 16,
            title: 'Reset Top Ten',
            icon: 'mat_outline:info',
        },
        {
            id: 17,
            title: 'Surveys',
            icon: 'mat_outline:picture_in_picture',
        },
        {
            id: 18,
            title: 'Margins',
            icon: 'mat_outline:house_siding',
        },
        {
            id: 19,
            title: 'Store Suppliers',
            icon: 'mat_outline:history',
        },
        {
            id: 20,
            title: 'Product Clicks',
            icon: 'mat_outline:history',
        },
        {
            id: 21,
            title: 'Search History',
            icon: 'mat_outline:speaker_notes',
        },
        {
            id: 22,
            title: 'User Data File',
            icon: 'mat_outline:group_work',
        },
        {
            id: 23,
            title: 'Opt-In Data File',
            icon: 'heroicons_outline:duplicate'
        },
        {
            id: 24,
            title: 'Customer Reviews',
            icon: 'mat_outline:margin',
        },
        {
            id: 25,
            title: 'Fulfillment Contacts',
            icon: 'mat_outline:play_circle_filled',
        },
        {
            id: 26,
            title: 'Fulfillment Invoices',
            icon: 'mat_outline:image',
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
