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
  selector: 'app-vendors-disabled-list',
  templateUrl: './vendors-disabled-list.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorsDisabledListComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;

  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  // Suppliers
  dataSourceSupplier = [];
  displayedColumnsSupplier: string[] = ['id', 'name', 'action'];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _UsersService: UsersService,
    private _vendorService: VendorsService,
    private _commonService: DashboardsService,
    private _router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getSuppliers();
  };
  getSuppliers() {
    this._commonService.suppliersData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((supplier) => {
        supplier["data"].forEach(element => {
          if (!element.blnActiveVendor) {
            this.dataSourceSupplier.push(element);
          }
        });
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      });
  }
  ViewDetails(item) {
    this._router.navigate([item.pk_companyID + '/information'], { relativeTo: this.route });
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
