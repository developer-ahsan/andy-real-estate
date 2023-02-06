import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { newFLPSUser, updateFLPSUser, removeFLPSUser, applyBlanketCustomerPercentage } from 'app/modules/admin/apps/flps/components/flps.types';
import { UsersService } from 'app/modules/admin/apps/users/components/users.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
@Component({
  selector: 'app-list-vendors',
  templateUrl: './list.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorsListComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
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

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _UsersService: UsersService,
    private _vendorService: VendorsService,
    private _router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (this._vendorService.vendorsSearchKeyword == '') {
      this.getAllSuppliers();
    } else {
      this.isLoading = true;
      this.keyword = this._vendorService.vendorsSearchKeyword;
      this.getSuppliers(1);
    }
  };
  getAllSuppliers() {
    this._vendorService.Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSourceSupplier = res["data"];
      this.totalSupplier = res["totalRecords"];
      this.tempDataSourceSupplier = res["data"];
      this.temptotalSupplier = res["totalRecords"];
    });
  }
  getNextSupplierData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.pageSupplier++;
    } else {
      this.pageSupplier--;
    };
    this.getSuppliers(this.pageSupplier);
  };
  getSuppliers(page) {
    let params = {
      supplier: true,
      bln_active: this.blnActive,
      size: 20,
      page: page,
      keyword: this.keyword
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isSearching = false;
      this.isLoading = false;
      this.dataSourceSupplier = res["data"];
      this.totalSupplier = res["totalRecords"];
      this._vendorService.vendorsSearchKeyword = '';
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isSearching = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  ViewDetails(item) {
    this._router.navigate([item.pk_companyID + '/information'], { relativeTo: this.route });
  }
  searchSuppliersByKeyword() {
    // if (!this.keyword) {
    //   this._vendorService.snackBar('Keyword is required');
    // } else {
    this.isSearching = true;
    this.blnActive = this.blnNotDisable;
    if (this.blnNotDisable == 0) {
      this.blnActive = null;
    }
    this.getSuppliers(1);
    // }
  }
  resetSearch() {
    if (this.dataSourceSupplier.length > 0) {
      this.paginator.firstPage();
    }
    this.keyword = '';
    this.blnNotDisable = 1;
    this.blnActive = 1;
    this.dataSourceSupplier = this.tempDataSourceSupplier;
    this.totalSupplier = this.temptotalSupplier;
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
