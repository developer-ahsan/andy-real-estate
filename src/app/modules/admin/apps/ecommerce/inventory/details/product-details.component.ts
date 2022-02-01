import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { ProductsDetails } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations
})
export class ProductDetailsComponent implements OnInit, OnDestroy {

  isLoading: boolean = true;
  isProductFetched: boolean = true;
  ordersCount: number = 0;
  selectedProduct: ProductsDetails = null;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  routes = [];
  selectedIndex: number = 0;
  not_available: string = 'N/A';

  // Sidebar stuff
  drawerMode: 'over' | 'side' = 'side';
  drawerOpened: boolean = true;
  storesData = [];

  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
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
    const productId = location.pathname.split('/')[4];
    this._inventoryService.getProductByProductId(productId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((product) => {
        this._inventoryService.getAllStores()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((stores) => {
            this.storesData = stores["data"];
            this.selectedProduct = product["data"][0];
            console.log("this.selectedProduct", this.selectedProduct)
            this.isProductFetched = false;
            this.isLoading = false;

            // Mark for check
            this._changeDetectorRef.markForCheck();
          });
      });

    // this.drawerMode = "side";
    this.routes = this._inventoryService.navigationLabels;
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
  clicked(index) {
    this.isLoading = true;
    this.selectedIndex = index;
  }

  toggleDrawer() {
    this.drawerOpened = !this.drawerOpened;
  }

  backToProductsScreen(): void {
    this.isLoading = true;
    this._router.navigate(['/apps/ecommerce/inventory']);
  }
}
