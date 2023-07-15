import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FileManagerService } from "app/modules/admin/apps/file-manager/store-manager.service";
import moment from "moment";
import { FuseMediaWatcherService } from "@fuse/services/media-watcher";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";

@Component({
  selector: "file-manager-details",
  templateUrl: "./details.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`layout router-outlet + *  {display: block !important}`]
})
export class StoresDetailsComponent implements OnInit, OnDestroy {
  @ViewChild("panel") panel;
  @ViewChild('topScrollAnchor') topScroll: ElementRef;

  selectedStore: any = null;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  routes = null;
  selectedScreeen = '';
  selectedRoute = '';

  not_available: string = "N/A";
  stores = [];
  launchDate = "";

  // Boolean
  isLoading: boolean = true;

  // Sidebar stuff
  drawerMode: "over" | "side" = "side";
  drawerOpened: boolean = true;

  // Default details screen
  selectedIndex: string = "Dashboard";

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _storesManagerService: FileManagerService,
    private route: ActivatedRoute,
    private _router: Router
  ) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  doSomething() {
    //do stuff
    this.panel.close();
  }
  ngOnInit(): void {
    let storeId;
    this.route.params.subscribe(param => {
      storeId = param.id;
    })
    this.routes = this._storesManagerService.navigationLabels;

    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.selectedScreeen = this.route.children[0].snapshot.data.title;
        this.selectedRoute = this.route.children[0].snapshot.data.url;
      }
    })
    this.selectedScreeen = this.route.children[0].snapshot.data.title;
    this.selectedRoute = this.route.children[0].snapshot.data.url;
    // Get the items
    this._storesManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.stores = items["data"];
        this.selectedStore = items["data"][0];
        this.launchDate = this.selectedStore?.launchDate
          ? moment.utc(this.selectedStore?.launchDate).format("lll")
          : "N/A";
        let title = '';
        if (items.rapidBuildCount > 0) {
          title = ` (${items.rapidBuildCount})`;
        }
        this.routes[2].children[4].title = 'RapidBuild' + title;
        console.log(this.routes)
        this.isLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    // Subscribe to media changes
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
        // Set the drawerMode and drawerOpened if the given breakpoint is active
        if (matchingAliases.includes("lg")) {
          this.drawerMode = "side";
          this.drawerOpened = true;
        } else {
          this.drawerMode = "over";
          this.drawerOpened = false;
        }

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
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  clicked(item) {
    if (item.route != this.selectedRoute) {
      this.selectedScreeen = item.title;
      this.selectedRoute = item.route;
      setTimeout(() => {
        this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      this._router.navigate([item.route], { relativeTo: this.route });
    }
  }

  // clicked(index) {
  //   if (window.screen.width < 760) {
  //     this.drawerOpened = false;
  //   }
  //   const { title } = index;
  //   if (title === this.selectedIndex) {
  //     return;
  //   }
  //   // this.isLoading = true;
  //   this.selectedIndex = title;
  // }

  goToLink(link: string) {
    const { storeURL, protocol } = this.selectedStore;

    if (link == "storeURL") {
      window.open(`${protocol}${storeURL}`, "_blank");
    }
  }

  backToStoresScreen(): void {
    this.isLoading = true;
    this._router.navigate(["/apps/stores"]);
  }

  toggleDrawer() {
    this.drawerOpened = !this.drawerOpened;
  }

  changeStoreSelection(event): void {
    const { pk_storeID } = event;
    this.isLoading = true;
    let newUrl = `${location.origin}/apps/stores/${pk_storeID}`;
    history.pushState({}, null, newUrl);

    // Get the items
    this._storesManagerService.stores$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.ngOnInit();
        setTimeout(() => {
          this.stores = items["data"];
          this.selectedStore =
            this.stores.find((value) => value.pk_storeID == pk_storeID) ||
            this.stores[0];
          this.launchDate = this.selectedStore?.launchDate
            ? moment.utc(this.selectedStore?.launchDate).format("lll")
            : "N/A";
          this.isLoading = false;
        }, 3000);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

}
