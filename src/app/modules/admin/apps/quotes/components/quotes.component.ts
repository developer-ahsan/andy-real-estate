import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { QuotesService } from './quotes.service';
import { MatDrawer } from '@angular/material/sidenav';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
    selector: 'app-quotes-list',
    templateUrl: './quotes.component.html',
    encapsulation: ViewEncapsulation.None,
    // styles: [".mat-paginator {border-radius: 16px !important} .ngx-pagination .current {background: #2c3344 !important}"],w
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuotesComponent {
    isLoading: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // Sidebar stuff
    @ViewChild('topScrollAnchor') topScroll: ElementRef;


    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: string = 'list';

    disabledVendors: any = 0;
    totalVendors = 0;


    isQuoteLoader: boolean = false;
    page = 1;
    quotesData = [];
    displayedColumns: string[] = ['date', 'name', 'price'];
    totalRecords = 0;


    storesList = [];
    // Filters
    storeID = 0;
    dateStart = '';
    dateEnd = '';
    size = 20;
    quoteID = '';
    // 
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _commonService: DashboardsService,
        private _vendorService: QuotesService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */

    ngOnInit(): void {
        this.isLoading = true;
        this.getStores();
        this.getQuotes(1);
    }
    // get all active stores
    getStores() {
        this.storesList.push({ storeName: 'All Stores', pk_storeID: 0 });
        this._commonService.storesData$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((stores) => {
                stores["data"].forEach(element => {
                    if (!element.blnActive) {
                        this.storesList.push(element);
                    }
                });
                this._changeDetectorRef.markForCheck();
            }, err => {
                this._changeDetectorRef.markForCheck();
            });
    }
    // Get Quotes
    getQuotes(page) {
        let params = {
            page: page,
            size: 20,
            list: true
        }
        this._vendorService.getQuoteData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            console.log(res);
            this.quotesData = res["data"];
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        })
    }
    quoteDetails(id) {
        this._router.navigateByUrl('apps/quotes/' + id);
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}