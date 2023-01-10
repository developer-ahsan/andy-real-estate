import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../vendors.service';
import { AddColor, AddImprintColor, AddImprintMethod, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod, UpdateLocation } from '../../vendors.types';

@Component({
  selector: 'app-vendor-core-products',
  templateUrl: './vendor-core-products.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorCoreProductsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['id', 'number', 'name', 'active', 'ordered', 'video'];
  totalUsers = 0;
  page = 1;
  not_available = 'N/A';

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getImprintLocations(1);
  };
  getImprintLocations(page) {
    let params = {
      imprint_locations: true,
      page: page,
      size: 20
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];

      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getImprintLocations(this.page);
  };
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
