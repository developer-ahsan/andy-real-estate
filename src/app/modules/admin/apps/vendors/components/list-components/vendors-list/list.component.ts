import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { newFLPSUser, updateFLPSUser, removeFLPSUser, applyBlanketCustomerPercentage } from 'app/modules/admin/apps/flps/components/flps.types';
import { UsersService } from 'app/modules/admin/apps/users/components/users.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
@Component({
  selector: 'app-list-vendors',
  templateUrl: './list.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorsListComponent implements OnInit, OnDestroy {
  // @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('MatPaginator') paginator: MatPaginator;
  @Input() isLoading: boolean;

  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  // Suppliers
  dataSourceSupplier = [];
  tempDataSourceSupplier = [];
  displayedColumnsSupplier: string[] = ['id', 'name', 'action'];
  totalSupplier = 0;
  temptotalSupplier = 0;
  pageSupplier = 1;

  // Search Keyword
  isSearching: boolean = false;
  blnNotDisable = 1;
  keyword: string = '';
  blnActive = 1;

  allVendros = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _UsersService: UsersService,
    private _vendorService: VendorsService,
    private _commonService: DashboardsService,
    private _router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getAllSuppliers();
    if (this._vendorService.vendorsSearchKeyword == '') {
      this.onKeywordChange();
    } else {
      this.isLoading = true;
      this.keyword = this._vendorService.vendorsSearchKeyword;
      this.getSuppliers();
    }
  };

  getAllSuppliers() {
    this.dataSourceSupplier = [];
    this.tempDataSourceSupplier = [];
    this._commonService.suppliersData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((supplier) => {
        this.allVendros = supplier["data"];
        supplier["data"].forEach(element => {
          if (element.blnActiveVendor) {
            this.dataSourceSupplier.push(element);
            this.tempDataSourceSupplier.push(element);
          }
        });
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._changeDetectorRef.markForCheck();
      });
  }
  getSuppliers() {
    if (this.blnNotDisable == 0) {
      this.dataSourceSupplier = this.allVendros.filter(supplier => {
        return supplier.companyName.toLowerCase().includes(this.keyword.toLowerCase())
      });
    } else {
      this.dataSourceSupplier = this.tempDataSourceSupplier.filter(supplier => {
        return supplier.companyName.toLowerCase().includes(this.keyword.toLowerCase())
      });
    }
  }
  ViewDetails(item) {
    this._router.navigate([item.pk_companyID + '/information'], { relativeTo: this.route });
  }
  onKeywordChange() {
    if (!this.keyword) {
      this.getAllSuppliers();
    } else {
      this.getSuppliers();
    }
  }
  resetSearch() {
    this.getAllSuppliers();
    this.keyword = '';
    this.blnNotDisable = 1;
    this.blnActive = 1;
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
