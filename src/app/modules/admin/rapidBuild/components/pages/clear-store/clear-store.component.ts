import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { RapidBuildService } from '../../rapid-build.service';

@Component({
  selector: 'app-clear-store',
  templateUrl: './clear-store.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class ClearStoreRapidComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Stores
  allStores = [];
  searchStoreCtrl = new FormControl();
  selectedStore: any;
  isSearchingStore = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _rapidService: RapidBuildService,
    private router: Router,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._rapidService.rapidBuildStores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(stores => {
      this.allStores = stores['data'];
    });
    let params;
    this.searchStoreCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          stores: true,
          keyword: res
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allStores = [];
        this.isSearchingStore = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._rapidService.getRapidBuildStores(params)
        .pipe(
          finalize(() => {
            this.isSearchingStore = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStores = [];
      this.allStores = data['data'];
    });
  };
  onSelected(ev) {
    this.selectedStore = ev.option.value;
  }
  displayWith(value: any) {
    return value?.storeName;
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
