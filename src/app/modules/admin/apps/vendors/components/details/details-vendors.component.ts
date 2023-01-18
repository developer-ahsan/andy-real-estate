import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VendorsService } from '../vendors.service';
@Component({
  selector: 'app-details-vendors',
  templateUrl: './details-vendors.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorsDetailsComponent implements OnInit, OnDestroy {
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
  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorsService: VendorsService,
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
    this.selectedScreeen = this.route.children[0].snapshot.data.title;
    this.selectedRoute = this.route.children[0].snapshot.data.url;
    this.routes = this._vendorsService.navigationLabels;
    this.isLoading = false;
    this.sideDrawer();
    this.getSupplierData();
  }
  getSupplierData() {
    this._vendorsService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
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
      this.selectedScreeen = item.title;
    }
    this._router.navigate([item.route], { relativeTo: this.route })
    this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
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
