import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../system.service';
import { AddPromoCode, ClearStoreRapidbuild, DeleteImprintColor, DeletePromoCode, UpdateImprintMethod, UpdatePromoCode } from '../../system.types';
import moment from 'moment';
@Component({
  selector: 'app-admin-tools',
  templateUrl: './admin-tools.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class AdminToolsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'savings', 'threshold', 'exp', 'active', 'shipping', 'used', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  mainScreen: string = 'Current Promo Codes';
  keyword = '';
  not_available = 'N/A';


  isSearching: boolean = false;

  // Add Method
  ngName: string = '';
  ngDesc: string = '';
  isAddPromoLoader: boolean = false;

  // Update Color
  isUpdatePromoLoader: boolean = false;
  isUpdatePromo: boolean = false;
  updatePromoData: any;
  ngRGBUpdate = '';

  addPromoForm: FormGroup;
  updatePromoForm: FormGroup;
  maxDate = new Date();


  ngStoreBuildID = '';
  isRemoveStoreBuildLoader: boolean = false;

  ngRemoveUserID = '';
  isRemoveUserLoader: boolean = false;

  ngRemoveOrderID = '';
  isRemoveOrderLoader: boolean = false;

  ngMergeUserID = '';
  ngMergeSlaveID = '';
  isMergeUserLoader: boolean = false;

  ngCartUserID = '';
  ngCartDate = new Date();
  isCartClearLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService
  ) { }

  initForm() {
  }
  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
    }, 100);
  };

  updateAdminTools(type) {
    let payload;
    if (type == 'Clear_Store') {
      if (!this.ngStoreBuildID) {
        this._systemService.snackBar('Store Id is required');
        return
      }
      payload = {
        store_id: Number(this.ngStoreBuildID),
        clear_rapidbuild: true
      }
      this.isRemoveStoreBuildLoader = true;
      this.updateApiCall(payload, type);
    } else if (type == 'Remove_User') {
      if (!this.ngRemoveUserID) {
        this._systemService.snackBar('User Id is required');
        return
      }
      payload = {
        user_id: Number(this.ngRemoveUserID),
        remove_user: true
      }
      this.isRemoveUserLoader = true;
      this.updateApiCall(payload, type);
    } else if (type == 'Remove_Order') {
      if (!this.ngRemoveOrderID) {
        this._systemService.snackBar('Order Id is required');
        return
      }
      payload = {
        order_id: Number(this.ngRemoveOrderID),
        remove_order: true
      }
      this.isRemoveOrderLoader = true;
      this.updateApiCall(payload, type);
    } else if (type == 'Merge_Users') {
      if (!this.ngMergeUserID || !this.ngMergeSlaveID) {
        this._systemService.snackBar('IDs are required');
        return
      }
      payload = {
        masterUserID: Number(this.ngMergeUserID),
        slaveUserID: Number(this.ngMergeSlaveID),
        merge_users: true
      }
      this.isMergeUserLoader = true;
      this.updateApiCall(payload, type);
    } else if (type == 'Clear_Cart') {
      if (!this.ngCartUserID) {
        this._systemService.snackBar('User ID is required');
        return
      }
      payload = {
        user_id: Number(this.ngCartUserID),
        date: moment(this.ngCartDate).format('MM/DD/YYYY'),
        clear_user_cart: true
      }
      this.isCartClearLoader = true;
      this.updateApiCall(payload, type);
    }

  }
  updateApiCall(payload, type) {
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isRemoveStoreBuildLoader = false;
      this.isCartClearLoader = false;
      this.isMergeUserLoader = false;
      this.isRemoveUserLoader = false;
      this.isRemoveOrderLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._systemService.snackBar(res["message"]);
        if (type == 'Clear_Store') {
          this.ngStoreBuildID = '';
        } else if (type == 'Remove_User') {
          this.ngRemoveUserID = '';
        } else if (type == 'Remove_Order') {
          this.ngRemoveOrderID = '';
        } else if (type == 'Merge_Users') {
          this.ngMergeUserID = '';
          this.ngMergeSlaveID = '';
        } else if (type == 'Clear_Cart') {
          this.ngCartUserID = '';
          this.ngCartDate = new Date();
        }
      } else {
        this._systemService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
    })
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
