import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { OrderManageService } from '../../import-export.service';
import { HideUnhideCart, updateAttentionFlagOrder } from '../../import-export.types';
@Component({
  selector: 'app-importexport-home',
  templateUrl: './home.component.html',
  styles: [""]
})
export class ImportExportHomeComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  ngExport = 'export';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _OrderManageService: OrderManageService,
    private router: Router,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {

  };

  goToImporExport() {
    if (this.ngExport == 'export') {
      this.router.navigateByUrl('import-export/export');
    } else {
      this.router.navigateByUrl('import-export/import');
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
