import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { QuotesService } from './quotes.service';
import { MatDrawer } from '@angular/material/sidenav';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { MatPaginator } from '@angular/material/paginator';
import moment from 'moment';
import { restoreQuote } from './quotes.types';

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
    @ViewChild('paginator') paginator: MatPaginator;

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
    restoreQuoteID = '';
    restoreLoader: boolean = false;
    // 
    /**
     * Constructor
     */
    isPageLoader: boolean = false;
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _commonService: DashboardsService,
        private _quoteService: QuotesService,
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
                    if (element.blnActive) {
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
        let start = '';
        if (this.dateStart) {
            start = moment(this.dateStart).format('yyyy-MM-DD');
        }
        let end = '';
        if (this.dateEnd) {
            end = moment(this.dateEnd).format('yyyy-MM-DD');
        }
        let params = {
            page: page,
            size: this.size,
            list: true,
            cart_id: this.quoteID,
            store_id: this.storeID,
            start_date: start,
            end_date: end
        }
        this._quoteService.getQuoteData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.quotesData = res["data"];
            this.totalRecords = res["totalRecords"]
            this.isLoading = false;
            this.isQuoteLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isQuoteLoader = false;
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        })
    }
    getNextPageQuote(event) {
        this.isPageLoader = true;
        this._changeDetectorRef.markForCheck();
        const { previousPageIndex, pageIndex } = event;
        if (pageIndex > previousPageIndex) {
            this.page++;
        } else {
            this.page--;
        };
        this.getQuotes(this.page);
    }
    filterQuoteData() {
        this.isQuoteLoader = true;
        if (this.page > 1) {
            this.paginator.pageIndex = 0;
            this.page = 1;
        }
        this.getQuotes(1);
    }
    quoteDetails(id) {
        this._router.navigateByUrl('apps/quotes/' + id);
    }
    restoreQuote() {
        if (!this.restoreQuoteID) {
            this._quoteService.snackBar('Please enter quote id to restore.');
            return;
        }
        this.restoreLoader = true;
        this._changeDetectorRef.markForCheck();
        let payload: restoreQuote = {
            cartID: Number(this.restoreQuoteID),
            restore_quote: true
        }
        this._quoteService.UpdateQuoteData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["success"]) {
                this._quoteService.snackBar(res["message"]);
                this.restoreQuoteID = '';
            } else {
                this._quoteService.snackBar(res["message"]);
                this.restoreQuoteID = '';
            }
            this.restoreLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.restoreLoader = false;
            this._changeDetectorRef.markForCheck();
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
}