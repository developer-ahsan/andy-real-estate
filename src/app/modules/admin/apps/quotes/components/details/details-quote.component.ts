import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { QuotesService } from '../quotes.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { RemoveCartComment } from '../quotes.types';
@Component({
  selector: 'app-details-quote',
  templateUrl: './details-quote.component.html',
  styles: [".mat-paginator {border-radius: 16px !important} .mat-expansion-panel-body{padding: 0px !important}"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuotesDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('topScrollAnchor') topScroll: ElementRef;

  isLoading: boolean = false;
  selectedQuoteDetail: any = null;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  routes = [];
  selectedScreeen = '';
  selectedRoute = '';

  not_available: string = 'N/A';

  // Sidebar stuff
  drawerMode: 'over' | 'side' = 'side';
  drawerOpened: boolean = true;
  // @ViewChild("panel") panel;
  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public _quoteService: QuotesService,
    private _commonService: DashboardsService,
    private route: ActivatedRoute,
    private _router: Router,
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
    this._quoteService.quotePermissions = this._commonService.assignPermissions('quote', this._quoteService.quotePermissions);
    this.routes = this._quoteService.navigationLabels;
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.selectedScreeen = this.route.children[0].snapshot.data.title;
        this.selectedRoute = this.route.children[0].snapshot.data.url;
      }
    })
    this.selectedScreeen = this.route.children[0].snapshot.data.title;
    this.selectedRoute = this.route.children[0].snapshot.data.url;

    // Subscribe to media changes
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {

        // Set the drawerMode and drawerOpened if the given breakpoint is active
        if (matchingAliases.includes('lg')) {
          this.drawerMode = 'side';
          this.drawerOpened = true;
        }
        else {
          this.drawerMode = 'over';
          this.drawerOpened = false;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    this.getQuotesDetails();
  }
  getQuotesDetails() {
    this._quoteService.qoutesDetails$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((quote) => {
        this.selectedQuoteDetail = quote["data"][0];
        if (this.selectedQuoteDetail.programManagerDetails) {
          let program_manager = this.selectedQuoteDetail.programManagerDetails.split('||');
          this.selectedQuoteDetail.ManagerName = program_manager[0];
          this.selectedQuoteDetail.ManagerEmail = program_manager[1];
          this.selectedQuoteDetail.ManagerID = program_manager[2];
        }
        if (this.selectedQuoteDetail?.artworkStatus && (this.selectedQuoteDetail?.artworkStatus.includes('7') || this.selectedQuoteDetail?.artworkStatus.includes('9'))) {
          this.selectedQuoteDetail.statusName = 'All artwork approved';
          this.selectedQuoteDetail.statusColor = 'text-green-600';
        } else {
          this.selectedQuoteDetail.statusName = 'Artwork pending';
          this.selectedQuoteDetail.statusColor = 'text-red-600';
        }
        if (this.selectedRoute != 'modify-reports') {
          this.getCurrentQuoteProducts();
        }
        this._changeDetectorRef.markForCheck();
      });
  }


  getCurrentQuoteProducts() {
    this._quoteService.ModifyCurrentProducts$.subscribe(res => {
      if (!res) {
        this._quoteService.getSelectedProducts(this.selectedQuoteDetail.storeID, this.selectedQuoteDetail.pk_cartID).subscribe(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        });
      } else {
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  doSomething() {
    // this.panel.close();
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
  clicked(item) {
    if (item.route != this.selectedRoute) {
      if (item.title == 'Customer Info') {
        let route = '/apps/customers/' + this.selectedQuoteDetail.fk_storeUserID;
        this._router.navigate([route]);
      } else {
        this.selectedScreeen = item.title;
        this.selectedRoute = item.route;
        setTimeout(() => {
          this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        this._router.navigate([item.route], { relativeTo: this.route });
      }
    }
  }

  toggleDrawer() {
    this.drawerOpened = !this.drawerOpened;
  }

  backToQuotesScreen(): void {
    this.isLoading = true;
    this._router.navigate(['/apps/quotes']);
  }

}
