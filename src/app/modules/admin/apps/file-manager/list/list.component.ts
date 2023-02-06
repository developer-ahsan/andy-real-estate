import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { Item, Items, StoreList } from 'app/modules/admin/apps/file-manager/stores.types';
import { Form, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import moment from 'moment';
@Component({
    selector: 'file-manager-list',
    templateUrl: './list.component.html',
    styles: ['::ng-deep {.ql-container {height: auto}}'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class StoresListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';
    selectedItem: Item;
    items: Items;
    stores: StoreList[] = [];
    duplicateStores: StoreList[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    selectedStore = null;
    quillModules: any = {
        toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ color: [] }, { background: ["white"] }],
            [{ font: [] }],
            [{ align: [] }],
            ["clean"],
        ]
    };

    // Boolean
    isLoading: boolean = false;
    isStoreNotReceived = true;
    enableAddStoreForm = false;

    storeTableColumns: string[] = ['pk_storeID', 'storeName'];

    /**
     * Constructor
     */

    firstFormGroup = this._formBuilder.group({
        firstCtrl: ['', Validators.required],
    });
    secondFormGroup = this._formBuilder.group({
        secondCtrl: ['', Validators.required],
    });
    isLinear = true;


    createStoreForm: FormGroup;
    settingStoreForm: FormGroup;
    createStoreLoader: boolean = false;
    settingStoreLoader: boolean = false;
    @ViewChild('stepper') private myStepper: MatStepper;
    ngSearch = '';
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fileManagerService: FileManagerService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _formBuilder: FormBuilder
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    initCreateStoreForm() {
        this.createStoreForm = this._formBuilder.group({
            storeName: new FormControl('', Validators.required),
            storeCode: new FormControl('', Validators.required),
            storeURL: new FormControl('', Validators.required),
            margin1: new FormControl(40, Validators.required),
            margin2: new FormControl(37, Validators.required),
            margin3: new FormControl(34, Validators.required),
            margin4: new FormControl(31, Validators.required),
            margin5: new FormControl(27, Validators.required),
            margin6: new FormControl(24, Validators.required),
            storeHandling: new FormControl(0.00),
            siteMaxSiteID: new FormControl(0),
            siteMaxQueueID: new FormControl(0),
            googleAnalyticsID: new FormControl(''),
            tagLine: new FormControl(''),
            championName: new FormControl('', Validators.required),
            secretKey: new FormControl(''),
            blnEProcurement: new FormControl(false),
            blnElectronicInvoicing: new FormControl(false),
            browserTitle: new FormControl(''),
            metaDesc: new FormControl(''),
            metaKeywords: new FormControl(''),
            blnShipping: new FormControl(false),
            launchDate: new FormControl(moment().format('MM-DD-YYYY')),
            protocol: new FormControl('Http', Validators.required),
            businessName: new FormControl(''),
            reportColor: new FormControl(''),
            add_new_store: new FormControl(true)
        });
        this.settingStoreForm = this._formBuilder.group({
            fk_storeID: new FormControl(''),
            blnOffer: new FormControl(false),
            offerText: new FormControl(''),
            offerTextBox: new FormControl(''),
            offerFooter: new FormControl(''),
            typeKitID: new FormControl(''),
            registrationText: new FormControl(''),
            blnCostCenterCodes: new FormControl(false),
            blnShowCostCenterCodes: new FormControl(false),
            blnWelcomeEmail: new FormControl(false),
            googleTag: new FormControl(''),
            bingTag: new FormControl(''),
            blnRequireCostCenterCode: new FormControl(false),
            blnRequireLocation: new FormControl(false),
            blnProductNumbers: new FormControl(false),
            blnPDFInvoice: new FormControl(false),
            blnLogoBank: new FormControl(false),
            blnDecliningProgramNotifications: new FormControl(false),
            blnCheckoutReferral: new FormControl(false),
            campaignTitle: new FormControl(''),
            blnExpandedProductSearch: new FormControl(false),
            blnQuoteHelp: new FormControl(false),
            blnExitSurvey: new FormControl(true),
            blnRequireAccountCode: new FormControl(false),
            blnSmartArtQuotes: new FormControl(false),
            blnCustomerLogoBank: new FormControl(true),
            blnSalesReport: new FormControl(true),
            blnPDFShippingNotifications: new FormControl(false),
            blnEProcurement: new FormControl(false),
            add_new_store_settings: new FormControl(true),
        })
    }
    get cs() {
        return this.createStoreForm.controls;
    }
    get ss() {
        return this.settingStoreForm.controls;
    }
    ngOnInit(): void {
        this.initCreateStoreForm();
        this.isLoading = true;

        // Get the stores
        this._fileManagerService.stores$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: any) => {
                this.stores = items["data"];
                this.duplicateStores = this.stores;
                this.isStoreNotReceived = false;
                this.isLoading = false;
                this.ngSearch = this._fileManagerService._storeSearchKeyword;
                this.searchKeyword();
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

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    };

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    toggleAddStoreFormEnable(): void {
        this.enableAddStoreForm = !this.enableAddStoreForm;
    }

    storeDetails(event): void {
        this.isLoading = true;
        const { pk_storeID } = event;
        this._router.navigate([`/apps/stores/${pk_storeID}`]);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    };

    searchKeyword(): void {
        const value = this.ngSearch;
        setTimeout(() => {
            this._fileManagerService._storeSearchKeyword = '';
        }, 300);
        this.stores = this.duplicateStores.filter((item: any) => {
            return item.storeName.toLowerCase().includes(value.toLowerCase()) || item.pk_storeID.toString().toLowerCase().includes(value.toLowerCase());
        });
    };

    clearFilter() { }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
    createStore() {
        if (this.createStoreForm.valid) {
            this.createStoreLoader = true;
            this._fileManagerService.CreateNewStore(this.createStoreForm.value).subscribe(res => {
                this.settingStoreForm.patchValue({ fk_storeID: res["message"].newStoreId });
                this.createStoreLoader = false;
                this.goForward();
                this._changeDetectorRef.markForCheck();
            }, err => {
                this.createStoreLoader = false;
                this._changeDetectorRef.markForCheck();
            });
        }
    }
    createStoreSettings() {
        if (this.settingStoreForm.valid) {
            this.settingStoreLoader = true;
            this._fileManagerService.CreateStoreSettings(this.settingStoreForm.value).subscribe(res => {
                this.settingStoreLoader = false;
                this._changeDetectorRef.markForCheck();
                const { fk_storeID } = this.settingStoreForm.getRawValue();
                this._router.navigate([`/apps/stores/${fk_storeID}`]);
            }, err => {
                this.settingStoreLoader = false;
                this._changeDetectorRef.markForCheck();
            });
        }
    }

    goBack() {
        this.myStepper.previous();
    }

    goForward() {
        this.myStepper.next();
    }
};