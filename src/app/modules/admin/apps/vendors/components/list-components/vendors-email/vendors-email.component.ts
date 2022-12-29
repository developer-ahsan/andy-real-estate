import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SystemService } from '../../vendors.service';
@Component({
  selector: 'app-vendors-email',
  templateUrl: './vendors-email.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorsEmailComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  suppliers: any = [];
  isLoadMore: boolean = false;
  page = 1;
  totalSupplier = 0;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: SystemService
  ) { }

  initForm() {

  }
  ngOnInit(): void {
    this.getAllSuppliers();
  };
  getAllSuppliers() {
    this._vendorService.Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.suppliers = res["data"];
      this.totalSupplier = res["totalRecords"];
    });
  }
  getNextSuppliers() {
    this.page++;
    this.isLoadMore = true;
    this.getSuppliers(this.page);
  }
  getSuppliers(page) {
    let params = {
      supplier: true,
      bln_active: 1,
      size: 20,
      page: page
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let arr = res["data"];
      arr.forEach(element => {
        this.suppliers.push(element);
      });
      this.totalSupplier = res["totalRecords"];
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  checkAll() {
    this.suppliers.forEach(element => {
      element.checked = true;
    });
  }
  unCheckAll() {
    this.suppliers.forEach(element => {
      element.checked = false;
    });
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
