import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../reports.service';
@Component({
  selector: 'app-details-reports',
  templateUrl: './details-reports.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsDetailsComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  routes = [];
  selectedScreeen = '';
  selectedRoute = '';

  // Sidebar stuff
  drawerMode: 'over' | 'side' = 'side';
  drawerOpened: boolean = true;
  @ViewChild("panel") panel;
  @ViewChild('topScrollAnchor') topScroll: ElementRef;


  supplierData: any;

  allSuppliers = [];
  searchSupplierCtrl = new FormControl();
  selectedSupplier: any;
  isSearchingSupplier = false;
  serverCurrentDate = '';
  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _ReportsService: ReportsService,
    private _router: Router,
    private route: ActivatedRoute,
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
    this.getCurrentDate();
    this.routesInitialization();
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.selectedScreeen = this.route.children[0].snapshot.data.title;
        this.selectedRoute = this.route.children[0].snapshot.data.url;
      }
    })
    this.selectedScreeen = this.route.children[0].snapshot.data.title;
    this.selectedRoute = this.route.children[0].snapshot.data.url;

    this.isLoading = false;
    this.sideDrawer();
  }
  getCurrentDate() {
    this._ReportsService.currentDate$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.serverCurrentDate = res["currentDate"];
    })
  }
  onSelected(ev) {
    this.selectedSupplier = ev.option.value;
    this.selectedRoute = 'information';
    setTimeout(() => {
      this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 300);
    this._router.navigate([`apps/vendors/${this.selectedSupplier.pk_companyID}/information`]);
    this.selectedScreeen = 'Store Sales';
  }
  routesInitialization() {
    this.routes = this._ReportsService.navigationLabels;
  }
  displayWith(value: any) {
    return value?.companyName;
  }
  getSupplierData() {
    this._ReportsService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
    });
  }
  // Close Drawer
  doSomething() {
    this.panel.close();
  }
  // Side Drawer 
  sideDrawer() {
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
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
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  clicked(item) {
    if (item.route != this.selectedRoute) {
      if (item.route == 'vendor-website') {
        window.open(this.supplierData.websiteURL);
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
  // Drawer Open Close
  toggleDrawer() {
    this.drawerOpened = !this.drawerOpened;
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
