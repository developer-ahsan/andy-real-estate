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
import { fuseAnimations } from "@fuse/animations";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { FuseMediaWatcherService } from "@fuse/services/media-watcher";
import { InventoryService } from "app/modules/admin/apps/ecommerce/inventory/inventory.service";
import { ProductsDetails } from "app/modules/admin/apps/ecommerce/inventory/inventory.types";
import moment from "moment";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { MatSnackBar } from "@angular/material/snack-bar";
import { StoreProductService } from "../../product-store/store.service";

@Component({
  selector: "app-product-details",
  templateUrl: "./product-details.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
})
export class StoreProductDetailsComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  isProductFetched: boolean = true;
  ordersCount: number = 0;
  selectedProduct: any = null;
  storeData: any = null;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  routes = [];
  not_available: string = "N/A";
  last_updated = "";

  // Sidebar stuff
  drawerMode: "over" | "side" = "side";
  drawerOpened: boolean = true;
  storesData: any;

  promoStandardBoolean: boolean;
  @ViewChild('topScrollAnchor') topScroll: ElementRef;

  selectedScreeen = '';
  selectedRoute = '';

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _router: Router,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _snackBar: MatSnackBar,
    private _storeProductService: StoreProductService,
    private route: ActivatedRoute
  ) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  getStoreProductDetail(id) {
    this._storeProductService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      if (this.selectedProduct.temp) {
        if (this.selectedProduct.blnEProcurement) {
          if (this.selectedProduct.blnProductNumbers) {
            this.selectedProduct["siteLink"] = `https://${this.selectedProduct.storeName}/${this.selectedProduct.categoryPermalink}/${this.selectedProduct.subCategoryPermalink}/${this.selectedProduct.permalink}/${this.selectedProduct.pk_storeProductID}`;
          } else {
            this.selectedProduct["siteLink"] = `https://${this.selectedProduct.storeName}/${this.selectedProduct.categoryPermalink}/${this.selectedProduct.subCategoryPermalink}/${this.selectedProduct.permalink}`;
          }
        } else {
          if (this.selectedProduct.blnProductNumbers) {
            this.selectedProduct["siteLink"] = `http://${this.selectedProduct.storeName}/${this.selectedProduct.categoryPermalink}/${this.selectedProduct.subCategoryPermalink}/${this.selectedProduct.permalink}/${this.selectedProduct.pk_storeProductID}`;
          } else {
            this.selectedProduct["siteLink"] = `http://${this.selectedProduct.storeName}/${this.selectedProduct.categoryPermalink}/${this.selectedProduct.subCategoryPermalink}/${this.selectedProduct.permalink}`;
          }
        }
      } else {
        if (this.selectedProduct.blnEProcurement) {
          this.selectedProduct["siteLink"] = `https://${this.selectedProduct.storeName}/dspProductDetails.cfm/${this.selectedProduct.fk_productID}/${this.selectedProduct.pk_storeProductID}`;
        } else {
          this.selectedProduct["siteLink"] = `http://${this.selectedProduct.storeName}/dspProductDetails.cfm/${this.selectedProduct.fk_productID}/${this.selectedProduct.pk_storeProductID}`;
        }
      }
      if (!this.selectedProduct["blnStoreActive"]) {
        let index = this.routes.findIndex(item => item.id == 212);
        if (index == -1) {
          this.routes.splice(index, 1);
          this.routes.push(
            {
              id: 212,
              title: 'Remove From Store',
              icon: 'heroicons_outline:trash',
              route: 'remove-from-store',
            }
          )
        }
        this._changeDetectorRef.markForCheck();
      } else {
        let index = this.routes.findIndex(item => item.id == 212);
        if (index > -1) {
          this.routes.splice(index, 1);
        }
      }
      this.isProductFetched = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
      // this.getStoreDetails(res["data"][0].fk_storeID);
    });
  }
  getStoreDetails(id) {
    this._storeProductService.getStoreDetail(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.storeData = res["data"][0];
    })
  }
  ngOnInit(): void {
    this.routes = [];
    // Initialize Screen
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.selectedScreeen = this.route.children[0].snapshot.data.title;
        this.selectedRoute = this.route.children[0].snapshot.data.url;
      }
    })
    this.selectedScreeen = this.route.children[0].snapshot.data.title;
    this.selectedRoute = this.route.children[0].snapshot.data.url;

    this.route.params.subscribe((res) => {
      this.routes = this._storeProductService.navigationLabels;
      this.getStoreProductDetail(res.id);
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
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  clicked(item) {
    if (item.route != this.selectedRoute) {
      if (item.title == 'Master Product') {
        this._router.navigate(['apps/ecommerce/inventory/' + this.selectedProduct["fk_productID"]]);
      } else if (item.title == 'Store Versions') {
        this._router.navigate(['apps/ecommerce/inventory/' + this.selectedProduct["fk_productID"] + '/store-versions']);
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

  backToProductsScreen(): void {
    this.isLoading = true;
    this._router.navigate(["/apps/ecommerce/inventory"]);
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
