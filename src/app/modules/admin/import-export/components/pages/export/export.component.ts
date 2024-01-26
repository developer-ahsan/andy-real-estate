import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject } from 'rxjs';
import { ImportExportService } from '../../import-export.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-export-order',
  templateUrl: './export.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class OrderExportComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  store_id = 0;
  ngType = 'products';

  // Stores
  allStores = [];
  searchStoreCtrl = new FormControl();
  selectedStore: any;
  isSearchingStore = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    public _exportService: ImportExportService,
    private _commonService: DashboardsService,
    private router: Router,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getAllStores();
  };
  getAllStores() {
    this._commonService.storesData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.allStores = [
          ...res["data"].filter(element => element.blnActive)
        ];
      });
    this.selectedStore = this.allStores[0]
  }
  onSelected(ev) {
    this.selectedStore = ev.option.value;
  }
  displayWith(value: any) {
    return value?.storeName;
  }
  goBack() {
    this.router.navigateByUrl('import-export/home');
  }
  goToDetails() {
    if (!this.selectedStore) {
      this._exportService.snackBar('Please select a store');
      return;
    }
    if (this._exportService.adminUserPermissions.selectCategories) {
      const queryParams: NavigationExtras = {
        queryParams: { storeID: this.selectedStore.pk_storeID, type: this.ngType, storeName: this.selectedStore.storeName }
      };
      this.router.navigate(['/import-export/export-details'], queryParams);
    } else {
      this._exportService.snackBar('You do not have permission to access this section.');
    }
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
