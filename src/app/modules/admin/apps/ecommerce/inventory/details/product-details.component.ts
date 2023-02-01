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
export class ProductDetailsComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  isProductFetched: boolean = true;
  ordersCount: number = 0;
  selectedProduct: ProductsDetails = null;
  storeData: any = null;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  routes = [];
  selectedIndex: string = "Name & Description";
  not_available: string = "N/A";
  last_updated = "";

  // Sidebar stuff
  drawerMode: "over" | "side" = "side";
  drawerOpened: boolean = true;
  storesData = [];

  promoStandardBoolean: boolean;

  StoreProduct: boolean = false;
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
    this._storeProductService.getStoreProductsDetail(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      this.getStoreDetails(res["data"][0].fk_storeID);
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getStoreDetails(id) {
    this._storeProductService.getStoreDetail(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.storeData = res["data"][0];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  ngOnInit(): void {
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
      if (this._router.url.includes('storeProduct')) {
        this.StoreProduct = true;
        this.routes = this._storeProductService.navigationLabels;
        this.isProductFetched = false;
        this.selectedIndex = "Pricing";
        this.getStoreProductDetail(res.id);
      } else {
        this.StoreProduct = false;
        if (this._inventoryService.selectedIndex == 'Store Versions') {
          this.selectedIndex = "Store Versions";
          console.log(this.selectedIndex)
        } else if (this._inventoryService.selectedIndex == 'Warehouse Options') {
          this.selectedIndex = "Warehouse Options";
        } else {
          this.selectedIndex = "Name & Description";
        }
        const productId = res.id;
        this._inventoryService.product$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((details) => {
            if (details) {
              this.last_updated = details["data"][0]?.lastUpdatedDate
                ? moment.utc(details["data"][0]?.lastUpdatedDate).format("lll")
                : "N/A";
              this.isProductFetched = false;

              this.selectedProduct = details["data"][0];
              const { fk_supplierID } = this.selectedProduct;

              this.routes = this._inventoryService.navigationLabels;
              const { blnService, blnApparel, blnPromoStandard } =
                this.selectedProduct;
              this.promoStandardBoolean = blnPromoStandard;

              // if (blnService) {
              //   this.routes = this.filterNavigation(this.routes, "Imprints");
              // }

              if (!blnApparel) {
                this.routes = this.filterNavigation(this.routes, "Sizes");
              }

              if (fk_supplierID != 25) {
                this.routes = this.filterNavigation(
                  this.routes,
                  "Promostandard colors"
                );
              }

              // Mark for check
              this._changeDetectorRef.markForCheck();
            } else {
              this._inventoryService
                .getProductByProductId(productId)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((product) => {
                  this.last_updated = product["data"][0]?.lastUpdatedDate
                    ? moment
                      .utc(product["data"][0]?.lastUpdatedDate)
                      .format("lll")
                    : "N/A";
                  this.isProductFetched = false;

                  this.selectedProduct = product["data"][0];

                  const { fk_supplierID } = this.selectedProduct;

                  this.routes = this._inventoryService.navigationLabels;
                  const { blnService, blnApparel, blnPromoStandard } =
                    this.selectedProduct;
                  this.promoStandardBoolean = blnPromoStandard;

                  if (blnService) {
                    this.routes = this.filterNavigation(this.routes, "Imprints");
                  }

                  if (!blnApparel) {
                    this.routes = this.filterNavigation(this.routes, "Sizes");
                  }

                  if (fk_supplierID != 25) {
                    this.routes = this.filterNavigation(
                      this.routes,
                      "Promostandard colors"
                    );
                  }

                  // Mark for check
                  this._changeDetectorRef.markForCheck();
                });
            }
          });
      }
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
      }
      if (item.title == 'Store Versions' && this.StoreProduct) {
        this._router.navigate(['apps/ecommerce/inventory/' + this.selectedProduct["fk_productID"]]);
        this._inventoryService.selectedIndex = item.title;
      } else {
        this.selectedScreeen = item.title;
        this.selectedRoute = item.route;
        setTimeout(() => {
          this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        this._router.navigate([item.route], { relativeTo: this.route });
      }
    }

    // const { title } = index;
    // if (title === this.selectedIndex) {
    //   return;
    // }
    // if (title == 'Master Product') {
    //   this._router.navigate(['apps/ecommerce/inventory/' + this.selectedProduct["fk_productID"]]);
    // }
    // if (title == 'Store Versions' && this.StoreProduct) {
    //   this._router.navigate(['apps/ecommerce/inventory/' + this.selectedProduct["fk_productID"]]);
    //   this._inventoryService.selectedIndex = title;
    // }
    // this.isLoading = true;
    // this.selectedIndex = title;
    // this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
  changeProductStatus() {
    this.selectedIndex = 'Product Status';
  }
  onTogglePromoStandards(event: MatSlideToggleChange) {
    const eventState = event.checked;
    const { pk_productID } = this.selectedProduct;

    const payload = {
      product_id: pk_productID,
      bln_active: eventState,
      promo_standard: true,
    };

    this.isLoading = true;
    this._inventoryService
      .updatePromoStandard(payload)
      .subscribe((response) => {
        this.isLoading = false;
        this._snackBar.open(response["message"], "", {
          horizontalPosition: "center",
          verticalPosition: "bottom",
          duration: 3500,
        });
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  toggleDrawer() {
    this.drawerOpened = !this.drawerOpened;
  }

  filterNavigation(navigations, title) {
    return navigations.filter(function (obj) {
      return obj.title !== title;
    });
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
