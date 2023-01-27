import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { AddAdjustment, DeleteAdjustment, UpdateArtApprovalSettings } from '../../orders.types';

@Component({
  selector: 'app-order-approval-settings',
  templateUrl: './order-approval-settings.component.html',
  styles: ['']
})
export class OrderApprovalSettingsComponent implements OnInit, OnDestroy {
  isLoading: boolean;
  selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  currentApprovals: any;
  displayedColumns: string[] = ['order', 'user', 'email'];
  orderDetail: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getOrderDetail();
  };
  getOrderDetail() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
      this.getApprovals('get');
    });
  }
  getApprovals(type) {
    let params = {
      art_approval_settings_list: true,
      store_id: this.orderDetail.fk_storeID
    }
    this._orderService.getOrder(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.currentApprovals = res["data"];
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  UpdateArtApprovalSettings() {
    this._changeDetectorRef.markForCheck();
    let params: UpdateArtApprovalSettings = {
      blnAdditionalApprovalOverride: this.orderDetail.blnAdditionalApprovalOverride,
      order_id: this.orderDetail.pk_orderID,
      update_art_approval: true
    }
    this._orderService.updateOrderCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
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
