import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FLPSService } from '../../flps.service';
import { AddFLPSStoreUser, DeleteFlpsUser, UpdateFlpsUser } from '../../flps.types';

@Component({
    selector: 'app-stores-management',
    templateUrl: './stores-management.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FLPSStoresManagementComponent implements OnInit {
    @ViewChild('paginator') paginator: MatPaginator;
    @ViewChild('topScroll') topScroll: ElementRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    mainScreen: string = 'Quick Reference';
    /**
     * Constructor
     */

    isUpdateStore: boolean = false;
    storeData: any;
    isStoreDetailLoader: boolean = false;
    detailedUsers = [];
    detailedUsersColumns: string[] = ['id', 'name', 'primary', 'commission', 'action'];
    totalDetailedUsers = 0;
    DetailedPage = 1;
    isAddNewUSerLoader: boolean = false;
    ngUser = '';
    ngEmailCheck = true;

    // Quick Stores
    tempquickStoresList = [];
    quickStoresList = [];
    displayedStoresColumns: string[] = ['id', 'store', 'management', 'edit'];
    totalStores = 0;
    temptotalStores = 0;
    storesPage = 1;

    // Store Manage
    tempmanageStoresList = [];
    manageStoresList = [];
    displayedTypesColumns: string[] = ['store', 'action'];
    totalManageStores = 0;
    pageManageStores = 1;
    updatedList = [];
    isUpdateStoresLoader: boolean = false;

    isSearching: boolean = false;
    keyword = '';
    employeeUser: any = [];
    isLoadingEmployee: boolean = false;


    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _flpsService: FLPSService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._flpsService.flpsStores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.tempquickStoresList = res["data"];
            this.quickStoresList = res["data"];
            this.totalStores = res["totalRecords"];
            this.temptotalStores = res["totalRecords"];

            this.tempmanageStoresList = res["data"];
            this.manageStoresList = res["data"];
            this.totalManageStores = res["totalRecords"];
        });
    }
    calledScreen(value) {
        this.mainScreen = value;
        if (this.mainScreen == 'Quick Reference') {
            this.keyword = '';
            this.storesPage = 1;
            this.quickStoresList = this.tempquickStoresList;
            this.totalStores = this.temptotalStores;
        } else {
            this.pageManageStores = 1;
            this.manageStoresList = this.tempmanageStoresList;
        }
    }
    getFlpsStore(type) {
        let params;
        if (type == 'types') {
            params = {
                view_stores: true,
                bln_active: 1,
                size: 20,
                page: this.pageManageStores
            }
        } else {
            params = {
                keyword: this.keyword,
                view_stores: true,
                bln_active: 1,
                size: 20,
                page: this.storesPage
            }
        }
        this._flpsService.getFlpsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (type == 'types') {
                this.tempmanageStoresList = res["data"];
                this.manageStoresList = res["data"];
            } else {
                this.quickStoresList = res["data"];
                this.totalStores = res["totalRecords"];
                this.isSearching = false;
            }

            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isSearching = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    getNextFLPSStore(event) {
        const { previousPageIndex, pageIndex } = event;
        if (pageIndex > previousPageIndex) {
            this.pageManageStores++;
        } else {
            this.pageManageStores--;
        };
        this.getFlpsStore('types');
    };
    getNextFLPSQuickStore(event) {
        const { previousPageIndex, pageIndex } = event;
        if (pageIndex > previousPageIndex) {
            this.storesPage++;
        } else {
            this.storesPage--;
        };
        this.getFlpsStore('quick');
    };
    changeUpdatedList(item) {
        let index = this.updatedList.findIndex(elem => elem.pk_storeID == item.pk_storeID);
        if (index > -1) {
            this.updatedList.splice(index, 1)
        }
        this.updatedList.push({ store_id: item.pk_storeID, management_type: item.flpsManagement });
    }
    updateStoresTypes() {
        let payload = {
            stores: this.updatedList,
            update_store_management: true
        }
        this.isUpdateStoresLoader = true;
        this._flpsService.UpdateFlpsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.isUpdateStoresLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isUpdateStoresLoader = false;
            this._changeDetectorRef.markForCheck();
            this._flpsService.snackBar('Something went wrong');
        });
    }
    searchStore(value) {
        if (this.quickStoresList.length > 0) {
            this.paginator.firstPage();
        }
        this.keyword = value;
        this.isSearching = true;
        this.storesPage = 1;
        this._changeDetectorRef.markForCheck();
        this.getFlpsStore('quick');
    }
    resetSearch() {
        if (this.quickStoresList.length > 0) {
            this.paginator.firstPage();
        }
        this.keyword = '';
        this.storesPage = 1;
        this.quickStoresList = this.tempquickStoresList;
        this.totalStores = this.temptotalStores;
        this._changeDetectorRef.markForCheck();
    }
    toggleUpdateStore(store) {
        this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
        this.DetailedPage = 1;
        this.isUpdateStore = true;
        this.storeData = store;
        this.isStoreDetailLoader = true;
        this.getStoreUsers('get');
        this.getActiveUsers();
    }
    getActiveUsers() {
        let params = {
            view_store_all_admins: true,
            store_id: this.storeData.pk_storeID,
            size: 100
        }
        this.isLoadingEmployee = true;
        this._flpsService.getFlpsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.employeeUser = res["data"];
            this.isLoadingEmployee = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isLoadingEmployee = false;
            this._changeDetectorRef.markForCheck();
        })
    }
    getStoreUsers(type) {
        let params = {
            view_store_users: true,
            store_id: this.storeData.pk_storeID,
            page: this.DetailedPage,
            size: 20
        }
        this._flpsService.getFlpsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.detailedUsers = res["data"];
            this.totalDetailedUsers = res["totalRecords"];
            if (type == 'add') {
                this.ngUser = '';
                this.isAddNewUSerLoader = false;
                this._flpsService.snackBar('Flps user added to store successfully');
                this.getActiveUsers();

            }
            this.isStoreDetailLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isStoreDetailLoader = false;
            this._changeDetectorRef.markForCheck();
        })
    }
    getNextPageStoreUsers(event) {
        const { previousPageIndex, pageIndex } = event;
        if (pageIndex > previousPageIndex) {
            this.DetailedPage++;
        } else {
            this.DetailedPage--;
        };
        this.getStoreUsers('get');
    };
    removeStoreUser(item) {
        item.delLoader = true;
        let payload: DeleteFlpsUser = {
            store_id: item.fk_storeID,
            flps_user_id: item.pk_userID,
            remove_flps_store_user: true
        }
        this._flpsService.UpdateFlpsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["success"]) {
                this.getActiveUsers();
                this._flpsService.snackBar(res["message"]);
                this.detailedUsers = this.detailedUsers.filter(elem => elem.pk_userID != item.pk_userID);
            }
            item.delLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            item.delLoader = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    updateStoreUser(item) {
        item.updateLoader = true;
        let payload: UpdateFlpsUser = {
            blnPrimary: item.blnPrimary,
            commission: item.commission,
            store_id: item.fk_storeID,
            flps_user_id: item.pk_userID,
            update_flps_user: true
        }
        this._flpsService.UpdateFlpsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["success"]) {
                this._flpsService.snackBar(res["message"]);
            }
            item.updateLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            item.updateLoader = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    addStoreUser() {
        if (this.ngUser == '') {
            this._flpsService.snackBar('Please select user form list');
            return;
        }
        let payload: AddFLPSStoreUser = {
            store_id: this.storeData.pk_storeID,
            store_name: this.storeData.storeName,
            flps_user_id: Number(this.ngUser),
            bln_send_email: this.ngEmailCheck,
            add_flps_store_user: true
        }
        this.isAddNewUSerLoader = true;
        this._flpsService.AddFlpsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["success"]) {
                this.getStoreUsers('add');
            }
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isAddNewUSerLoader = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    backToStoreList() {
        this.isUpdateStore = false;
    }
}
