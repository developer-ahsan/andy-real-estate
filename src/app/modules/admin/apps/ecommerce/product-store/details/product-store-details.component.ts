import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { fuseAnimations } from "@fuse/animations";
import { ActivatedRoute, Router } from "@angular/router";
import { FuseMediaWatcherService } from "@fuse/services/media-watcher";
import { InventoryService } from "app/modules/admin/apps/ecommerce/inventory/inventory.service";
import { ProductsDetails } from "app/modules/admin/apps/ecommerce/inventory/inventory.types";
import moment from "moment";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ProductStoreService } from "../store.service";

@Component({
  selector: "app-product-store-details",
  templateUrl: "./product-store-details.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
})
export class StoreProductDetailsComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  isProductFetched: boolean = true;
  ordersCount: number = 0;
  selectedProduct: ProductsDetails = null;
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

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeProductService: ProductStoreService,
    private _router: Router,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.routes = this._storeProductService.navigationLabels;
    this.route.params.subscribe((res) => {
      // this.selectedIndex = null;
      const productId = res.id;
      this.isProductFetched = false;
      this.isLoading = false;
      // this._storeProductService.product$
      //   .pipe(takeUntil(this._unsubscribeAll))
      //   .subscribe((details) => {
      //     if (details) {
      //       this.last_updated = details["data"][0]?.lastUpdatedDate
      //         ? moment.utc(details["data"][0]?.lastUpdatedDate).format("lll")
      //         : "N/A";
      //       this.isProductFetched = false;

      //       this.selectedProduct = details["data"][0];

      //       const { fk_supplierID } = this.selectedProduct;

      //       const { blnService, blnApparel, blnPromoStandard } =
      //         this.selectedProduct;
      //       this.promoStandardBoolean = blnPromoStandard;

      //       if (blnService) {
      //         this.routes = this.filterNavigation(this.routes, "Imprints");
      //       }

      //       if (!blnApparel) {
      //         this.routes = this.filterNavigation(this.routes, "Sizes");
      //       }

      //       if (fk_supplierID != 25) {
      //         this.routes = this.filterNavigation(
      //           this.routes,
      //           "Promostandard colors"
      //         );
      //       }

      //       // Mark for check
      //       this._changeDetectorRef.markForCheck();
      //     } else {
      //       this._storeProductService
      //         .getProductByProductId(productId)
      //         .pipe(takeUntil(this._unsubscribeAll))
      //         .subscribe((product) => {
      //           this.last_updated = product["data"][0]?.lastUpdatedDate
      //             ? moment
      //               .utc(product["data"][0]?.lastUpdatedDate)
      //               .format("lll")
      //             : "N/A";
      //           this.isProductFetched = false;

      //           this.selectedProduct = product["data"][0];

      //           const { fk_supplierID } = this.selectedProduct;

      //           this.routes = this._storeProductService.navigationLabels;
      //           const { blnService, blnApparel, blnPromoStandard } =
      //             this.selectedProduct;
      //           this.promoStandardBoolean = blnPromoStandard;

      //           if (blnService) {
      //             this.routes = this.filterNavigation(this.routes, "Imprints");
      //           }

      //           if (!blnApparel) {
      //             this.routes = this.filterNavigation(this.routes, "Sizes");
      //           }

      //           if (fk_supplierID != 25) {
      //             this.routes = this.filterNavigation(
      //               this.routes,
      //               "Promostandard colors"
      //             );
      //           }

      //           // Mark for check
      //           this._changeDetectorRef.markForCheck();
      //         });
      //     }
      //   });

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
    });
    // const productId = location.pathname.split('/')[4];
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  clicked(index) {
    const { title } = index;
    if (title === this.selectedIndex) {
      return;
    }
    this.isLoading = true;
    this.selectedIndex = title;
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
    this._storeProductService
      .updatePromoStandard(payload)
      .subscribe((response) => {
        this.isLoading = false;
        this._snackBar.open("Promostandards updated successfully", "", {
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
