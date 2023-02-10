import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
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

  allSuppliers = [];
  searchSupplierCtrl = new FormControl();
  selectedSupplier: any;
  isSearchingSupplier = false;
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
    this.getSupplierData();
    let params;
    this.searchSupplierCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          supplier: true,
          bln_active: 1,
          keyword: res
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allSuppliers = [];
        this.isSearchingSupplier = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._vendorsService.getVendorsData(params)
        .pipe(
          finalize(() => {
            this.isSearchingSupplier = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allSuppliers = data['data'];
    });
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
  onSelected(ev) {
    this.selectedSupplier = ev.option.value;
    this.selectedRoute = 'information';
    setTimeout(() => {
      this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 300);
    this._router.navigate([`apps/vendors/${this.selectedSupplier.pk_companyID}/information`]);
    this.selectedScreeen = 'Vendor Information';
  }
  routesInitialization() {
    this.routes = [
      {
        title: 'Information',
        icon: 'mat_outline:info',
        children: [
          {
            title: 'Vendor Information',
            icon: 'mat_outline:info',
            route: 'information'
          },
          {
            title: 'Top Order Products',
            icon: 'mat_outline:bar_chart',
            route: 'top-order-products'
          },
          {
            title: 'Vendor Settings',
            icon: 'mat_outline:settings',
            route: 'vendor-settings'
          }
        ]
      }
    ];
    if (this.supplierData.blnActiveVendor) {
      this.routes.push(
        {
          title: 'Products',
          icon: 'heroicons_outline:cube',
          children: [
            {
              title: 'Products',
              icon: 'mat_outline:production_quantity_limits',
              route: 'vendor-products'
            },
            // {
            //     title: 'Export Product List',
            //     icon: 'mat_outline:import_export',
            // },
            {
              title: 'Products/Store',
              icon: 'mat_outline:store',
              route: 'vendor-products-store'
            },
            {
              title: 'Core Products',
              icon: 'heroicons_outline:document-report',
              route: 'vendor-core-products'
            },
            {
              title: 'Products/Updates',
              icon: 'mat_outline:system_update_alt',
              route: 'vendor-products-summary'
            },
            {
              title: 'F.O.B Locations',
              icon: 'mat_outline:edit_location_alt',
              route: 'vendor-fob-locations'
            },
            {
              title: 'Blanket F.O.B',
              icon: 'mat_outline:location_on',
              route: 'vendor-blnaket-fob'
            },
            {
              title: 'Sizing Charts',
              icon: 'mat_outline:format_size',
              route: 'vendor-sizing-charts'
            },
            {
              title: 'Product Videos',
              icon: 'mat_outline:ondemand_video',
              route: 'vendor-videos'
            }
          ]
        }
      )
    }
    this.routes.push(
      {
        title: 'Orders',
        icon: 'heroicons_outline:cube',
        children: [
          {
            title: 'Co-Ops',
            icon: 'heroicons_outline:archive',
            route: 'vendor-coops'
          },
          {
            title: 'Blanket Coop',
            icon: 'heroicons_outline:receipt-tax',
            route: 'vendor-blanket-coops'
          },
          {
            title: 'Vendor Comments',
            icon: 'mat_outline:comment',
            route: 'vendor-comments'
          },
          {
            title: 'Vendor Orders',
            icon: 'mat_outline:reorder',
            route: 'vendor-orders'
          },
          {
            title: 'Supplier Application',
            icon: 'mat_outline:settings_applications',
            route: 'vendor-application'
          }
        ]
      },
      {
        title: 'Imprints',
        icon: 'mat_outline:store',
        children: [
          {
            title: 'Standard Imprints',
            icon: 'mat_outline:check',
            route: 'vendor-standard-imprints'
          },
          {
            title: 'Imprint Colors',
            icon: 'mat_outline:color_lens',
            route: 'vendor-imprint-colors'
          },
          {
            title: 'Blanket Collections',
            icon: 'heroicons_outline:collection',
            route: 'vendor-blanket-collections'
          },
          {
            title: 'Blanket Run Charges',
            icon: 'mat_outline:money',
            route: 'vendor-run-charges'
          },
          {
            title: 'Blanket Setup Charges',
            icon: 'heroicons_outline:currency-dollar',
            route: 'vendor-setup-charges'
          }
        ]
      },
      {
        title: 'Vendors',
        icon: 'mat_outline:settings',
        children: [
          {
            title: 'Vendor Users',
            icon: 'heroicons_outline:user-group',
            route: 'vendor-users'
          },
          {
            title: 'Vendor Website',
            icon: 'mat_outline:web',
            route: 'vendor-website'
          }
        ]
      },
      {
        title: 'Vendor Status',
        icon: 'mat_outline:online_prediction',
        route: 'vendor-status',
        children: []
      }
    )
  }
  displayWith(value: any) {
    return value?.companyName;
  }
  getSupplierData() {
    this._vendorsService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.routesInitialization();
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
