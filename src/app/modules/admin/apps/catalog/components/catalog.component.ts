import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { UserService } from 'app/core/user/user.service';
import { AuthService } from 'app/core/auth/auth.service';
import { MatDrawer } from '@angular/material/sidenav';
import Swal from 'sweetalert2'
import { CatalogService } from './catalog.service';
@Component({
  selector: 'catalog',
  templateUrl: './catalog.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogComponent {
  @ViewChild('drawer', { static: true }) sidenav: MatDrawer;


  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  routes = [];
  selectedScreeen = 'Generate Report';

  flpsToken = sessionStorage.getItem('flpsAccessToken');
  flpsName = sessionStorage.getItem('FullName');
  ngEmail = '';
  ngPassword = '';
  isLoginLoader: boolean = false;
  user: any;
  // Sidebar stuff
  @ViewChild('topScrollAnchor') topScroll: ElementRef;


  @ViewChild('drawer') drawer: MatDrawer;
  drawerMode: 'over' | 'side' = 'over';
  drawerOpened: boolean = false;
  panels: any[] = [];
  selectedPanel: string = 'admin';

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['image', 'id', 'name', 'company', 'desc', 'action'];
  total = 0;
  temptotal = 0;
  itemsPerPage = 10;
  page = 1;
  isPageLoading: boolean = false;

  // fiters
  catalogFilter = {
    perPage: 25
  }
  isFilterLoader: boolean = false;
  /**
   * Constructor
   */
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _catalogService: CatalogService,
    private _router: Router,
    private route: ActivatedRoute,
    private _authService: AuthService,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
  ) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  toggleDrawer() {
    this.sidenav.toggle();
  }
  ngOnInit(): void {
    this.isLoading = true;
    this.getCatalogs(1);
    // Subscribe to media changes
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {

        // Set the drawerMode and drawerOpened
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
  getNextCatalogData(event) {
    this.page = event;
    this.isPageLoading = true;
    this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });

    // const { previousPageIndex, pageIndex } = event;
    // if (pageIndex > previousPageIndex) {
    //   this.page++;
    // } else {
    //   this.page--;
    // };
    this.getCatalogs(this.page);
  };
  getCatalogs(page) {
    this.isFilterLoader = true;
    let params = {
      catalog_products: true,
      page: page,
      size: this.catalogFilter.perPage
    }
    this._catalogService.getCatalogData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.total = res["totalRecords"];
      res["data"].forEach((element, index) => {
        element.Cost = JSON.parse(element.Cost);
        element.Imprint = JSON.parse(element.Imprint);
      });
      this.dataSource = res["data"];
      this.isLoading = false;
      this.isFilterLoader = false;
      this.isPageLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isFilterLoader = false;
      this.isLoading = false;
      this.isPageLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  onPageChange(ev) {
    this.catalogFilter.perPage = ev.value;
    this.getCatalogs(1);
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
  goToPanel(panel): void {
    this.selectedPanel = panel.id;

    // Close the drawer on 'over' mode
    if (this.drawerMode === 'over') {
      this.drawer.close();
    }
    this._router.navigate([panel.route], { relativeTo: this.route })
    // this._router.navigateByUrl('admin-users');
    this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Get the details of the panel
   *
   * @param id
   */
  getPanelInfo(id: string): any {
    return this.panels.find(panel => panel.id === id);
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
