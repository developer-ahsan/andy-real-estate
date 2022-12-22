import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Promostandard } from 'app/modules/admin/apps/promostandards/promostandards.types';
import { TasksService } from 'app/modules/admin/apps/promostandards/promostandards.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, map, distinctUntilChanged, filter } from "rxjs/operators";

@Component({
    selector: 'tasks-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromostandardsListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    SearchInput: ElementRef;

    @ViewChild('SearchInput') set content(content: ElementRef) {
        this.SearchInput = content;
    }
    drawerMode: 'side' | 'over';
    selectedPromostandard: Promostandard;
    // List
    promostandards: Promostandard[];
    tempPromostandards: Promostandard[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    promostandardsTableColumns: string[] = ['companyName', 'url', 'type'];
    promostandardsCount: number = 0;
    tempPromostandardsCount: number = 0;
    page: number = 1;
    pageNo: number = 0;
    isLoading: boolean = true;
    showFiller = false;

    /**
     * Constructor
     */

    dropdownSettings: IDropdownSettings = {};
    dropdownList: any[] = []
    selectedItems: any;

    promoStandartForm: FormGroup;
    isAddLoader: boolean = false;

    @ViewChild('drawer', { static: true }) sidenav: MatDrawer;
    drawerTitle = '';
    drawerType = 'add';
    searchKeyword = '';

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _promostandardsService: TasksService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _snackBar: MatSnackBar
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.isLoading = false;
        this.initPromoForm();
        this.dropdownSettings = {
            singleSelection: true,
            idField: 'id',
            textField: 'name',
            // itemsShowLimit: 3,
            allowSearchFilter: true
        };
        // Get Suppliers
        this._promostandardsService.suppliers$.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                this.dropdownList = response["data"];
                this._changeDetectorRef.markForCheck();
            });
        // Get the promostandards list
        this.tempPromostandards = [];
        this._promostandardsService.promostandards$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: Promostandard[]) => {
                this.promostandards = response["data"];
                this.promostandardsCount = response["totalRecords"];
                if (this.tempPromostandards.length == 0) {
                    this.tempPromostandards = response["data"];
                    this.tempPromostandardsCount = response["totalRecords"];
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });


        // Subscribe to media query change
        this._fuseMediaWatcherService.onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {

                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    initPromoForm() {
        this.promoStandartForm = new FormGroup({
            id: new FormControl(''),
            supplier_id: new FormControl(''),
            url: new FormControl(''),
            username: new FormControl(''),
            password: new FormControl(''),
            type: new FormControl('pricing'),
            bln_active: new FormControl(true),
            version: new FormControl(''),
        })
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getPromostandards(page: number, type): void {
        let val = "";
        if (type = 'filter') {
            val = this.searchKeyword;
        }
        let payload = {
            page: page,
            keyword: val
        }
        this._promostandardsService.getPromostandards(payload)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: Promostandard[]) => {
                this.promostandards = response["data"];
                this.promostandardsCount = response["totalRecords"];
                this.isLoading = false;
                if (type == 'add') {
                    this.sidenav.toggle();
                    this.isAddLoader = false;
                    this.initPromoForm();
                    this._snackBar.open('Promostandards credentials added successfully', '', {
                        horizontalPosition: 'center',
                        verticalPosition: 'bottom',
                        duration: 3500
                    });
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            })
    };

    getNextData(event) {
        this.isLoading = true;
        const { previousPageIndex, pageIndex } = event;

        if (pageIndex > previousPageIndex) {
            this.page++;
        } else {
            this.page--;
        };
        this.getPromostandards(this.page, 'get');
    };

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
    addPromoStandard() {
        const { id, supplier_id, url, username, password, type, bln_active, version } = this.promoStandartForm.getRawValue();
        if (supplier_id == '' || url == '' || username == '' || password == '' || version == '') {
            this._snackBar.open('Please fill out required fields', '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
        } else {
            this.isAddLoader = true;
            let payload = {
                id, supplier_id, url, username, password, type, bln_active, version, promostandard_credentials_post: true
            }
            this._promostandardsService.postPromoData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                this.getPromostandards(this.page, 'add');
                this.isAddLoader = false;
                this.closeDrawer();
                this._changeDetectorRef.markForCheck();
            }, err => {
                this.isAddLoader = false;
                this.closeDrawer();
                this._changeDetectorRef.markForCheck();
            })
        }
    }
    updatePromoStandard() {
        const { id, supplier_id, url, username, password, type, bln_active, version } = this.promoStandartForm.getRawValue();
        if (supplier_id == '' || url == '' || username == '' || password == '' || version == '') {
            this._snackBar.open('Please fill out required fields', '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
            });
        } else {
            this.isAddLoader = true;
            let payload = {
                id, supplier_id, url, username, password, type, bln_active, version, promostandard_credentials_put: true
            }
            this._promostandardsService.putPromoData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                this.isAddLoader = false;
                this.closeDrawer()
                this.getPromostandards(this.page, 'add');
                this._changeDetectorRef.markForCheck();
            }, err => {
                this.isAddLoader = false;
                this._changeDetectorRef.markForCheck();
            })
        }
    }
    drawerTitleChange(type, obj) {
        this.sidenav.toggle();
        this.drawerType = type;
        if (type == 'add') {
            this.initPromoForm();
            this.drawerTitle = 'Add New Promostandard';
        } else {
            this.drawerTitle = 'Update Promostandard';
            this.promoStandartForm.patchValue(obj);
            this.promoStandartForm.patchValue({
                supplier_id: Number(obj.fk_supplierID),
                id: obj.pk_promostandards_credential_ID
            })
        }
    }
    closeDrawer() {
        this.initPromoForm();
        this.sidenav.toggle();
    }
    searchPromostandards(ev) {
        this.searchKeyword = ev.target.value;
        if (ev.target.value.length == 0) {
            this.resetSearch();
        } else {
            this.isLoading = true;
            this._changeDetectorRef.markForCheck()
            this.getPromostandards(1, 'filter');
        }
    }
    resetSearch() {
        this.searchKeyword = '';
        this.promostandardsCount = this.tempPromostandardsCount;
        this.promostandards = this.tempPromostandards;
    }
}
