import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { AddAdjustment, DeleteAdjustment } from '../../orders.types';

@Component({
  selector: 'app-order-adjustment',
  templateUrl: './order-adjustment.component.html',
  styles: ['']
})
export class OrderAdjustmentComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Input() selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  mainScreen: string = 'Current Adjustments';
  currentAdjustments: any;
  totalAdjustmentCost = 0;
  totalAdjustmentPrice = 0;


  displayedColumns: string[] = ['description', 'date', 'author', 'netcost', 'price', 'action'];

  orderDetail: any;
  addAdjsutmentForm = {
    cost: 0,
    price: 0,
    description: '',
    taxable: false
  }
  isAddLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getOrderDetail();
    this.getAdjustments('get');
  };
  getOrderDetail() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
      console.log(this.orderDetail)
    });
  }
  getAdjustments(type) {
    let params = {
      order_adjustments: true,
      order_id: this.selectedOrder.pk_orderID
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.currentAdjustments = res["data"];
      this.currentAdjustments.forEach(element => {
        this.totalAdjustmentCost += element.cost;
        this.totalAdjustmentPrice += element.price;
      });
      if (type == 'add') {
        this._orderService.snackBar('Addjustment Created Successfully');
        this.isAddLoader = false;
        this.addAdjsutmentForm = {
          cost: 0,
          price: 0,
          description: '',
          taxable: false
        }
        this.mainScreen = 'Current Adjustments';
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
  deleteAdjustment(item) {
    item.deleteLoader = true;
    this._changeDetectorRef.markForCheck();
    let params: DeleteAdjustment = {
      adjustment_id: item.pk_adjustmentID,
      order_id: this.selectedOrder.pk_orderID,
      delete_adjustment: true
    }
    this._orderService.updateOrderCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      item.deleteLoader = false;
      this.totalAdjustmentCost = 0;
      this.totalAdjustmentPrice = 0;
      this.currentAdjustments = this.currentAdjustments.filter(elem => elem.pk_adjustmentID != item.pk_adjustmentID);
      this.currentAdjustments.forEach(element => {
        this.totalAdjustmentCost += element.cost;
        this.totalAdjustmentPrice += element.price;
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  addNewAdjsustment() {
    const { cost, price, description, taxable } = this.addAdjsutmentForm;
    if (description == '') {
      this._orderService.snackBar('Description is required');
      return;
    }
    let prices = price;
    if (taxable) {
      prices = price + (this.orderDetail.salesTaxRate * price);
    }
    let payload: AddAdjustment = {
      order_id: this.selectedOrder.pk_orderID,
      cost: this.addAdjsutmentForm.cost,
      price: prices,
      description: this.addAdjsutmentForm.description,
      add_adjustment: true
    }
    this.isAddLoader = true;
    this._orderService.orderPostCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getAdjustments('add');
    }, err => {
      this.isAddLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  calledScreen(value) {
    this.mainScreen = value;
    if (value == 'Current Adjustments') {
      if (this.currentAdjustments) {
        // this.getCurrentRelatedProducts(1);
      }
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
