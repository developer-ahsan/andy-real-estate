import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { UpdateProcurementData } from '../../orders.types';

@Component({
  selector: 'app-order-procurement-data',
  templateUrl: './order-procurement-data.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OrderProccurementComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Input() selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  orderDetail: any;
  updateProcurementForm: FormGroup;
  isUpdateLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {
    this.initialize();
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
    })
    this.getProcurement();
  };
  initialize() {
    this.updateProcurementForm = new FormGroup({
      order_id: new FormControl(this.selectedOrder.pk_orderID),
      unit: new FormControl(''),
      division: new FormControl(''),
      organization: new FormControl(''),
      location: new FormControl(''),
      fundType: new FormControl(''),
      businessLine: new FormControl(''),
      account: new FormControl(''),
      activity: new FormControl(''),
      expenditureType: new FormControl(''),
      project: new FormControl(''),
      task: new FormControl(''),
      projectOrganization: new FormControl(''),
      RUInitiative: new FormControl(''),
      activity2: new FormControl(''),
      businessLine2: new FormControl(''),
      location2: new FormControl(''),
      RUInitiative2: new FormControl(''),
      contractNumber: new FormControl(''),
      update_procurement_data: new FormControl(true)
    });
  }
  getProcurement() {
    let params = {
      procurement_data_list: true,
      order_id: this.selectedOrder.pk_orderID
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        this.updateProcurementForm.patchValue(res["data"][0]);
      }
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  updateProcurement() {
    this.isUpdateLoader = true;
    const { order_id, unit, division, organization, location, fundType, businessLine, account, activity, expenditureType, project, task, projectOrganization, RUInitiative, activity2, businessLine2, location2, RUInitiative2, contractNumber, update_procurement_data } = this.updateProcurementForm.getRawValue();
    let params: UpdateProcurementData = {
      order_id, unit, division, organization, location, fundType, businessLine, account, activity, expenditureType, project, task, projectOrganization, RUInitiative, activity2, businessLine2, location2, RUInitiative2, contractNumber, update_procurement_data
    }
    this._orderService.updateOrderCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._orderService.snackBar('Procurement Data updated successfully')
      this.isUpdateLoader = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateLoader = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
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
