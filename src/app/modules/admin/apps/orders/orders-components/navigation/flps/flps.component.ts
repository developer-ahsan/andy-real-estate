import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { FLPSService } from 'app/modules/admin/apps/flps/components/flps.service';
import moment from 'moment';
import { addFLPSOrderUser } from '../../orders.types';

@Component({
  selector: 'app-flps-users',
  templateUrl: './flps.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class FlpsComponent implements OnInit, OnDestroy {
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  dataSource = [];
  displayedColumns: string[] = ['id', 'name', 'status'];
  totalUsers = 0;
  page = 0;
  orderDetail: any;
  flpsUsers: any = [];
  selectedEmployee = 0;
  flpsUser: any;
  userIDs = [866, 2844, 6268, 6268, 11204];
  userData: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService,
    private _flpsService: FLPSService
  ) { }

  ngOnInit(): void {
    const user = localStorage.getItem('flpsData');
    this.flpsUser = JSON.parse(user);
    this.userData = JSON.parse(localStorage.getItem('userDetails'));
    this.isLoading = true;
    this.getOrderDetail();
  };
  getOrderDetail() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        if (res["data"].length) {
          this.orderDetail = res["data"][0];
          this.getFLPS(1);
        }
      }
    })
  }
  getFlpsUsers(users) {
    let employees = users;
    if (employees) {
      let employee = employees.split(',,');
      employee.forEach(emp => {
        const [id, name] = emp.split('::');
        this.flpsUsers.push({ pk_userID: Number(id), fullName: name });
      });
    }
  }
  getFLPS(page) {
    let params = {
      flps_user: true,
      order_id: this.orderDetail.pk_orderID,
      page: page
    }
    this._orderService.getOrder(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getFlpsUsers(res["available_order_users"][0].qryAvailableOrderUsers);
      this.dataSource = res["data"].map(element => ({
        ...element,
        commissionValue: element.orderCommission * 100
      }));
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateFLPSData(type, item) {
    let payload: any;
    if (type == 'mark') {
      item.isMarkLoader = true;
      payload = {
        orderID: this.orderDetail.pk_orderID,
        flpsUserID: item.pk_userID,
        isPaid: true,
        update_mark_commission_status: true
      }
    } else if (type == 'unmark') {
      item.isMarkLoader = true;
      payload = {
        orderID: this.orderDetail.pk_orderID,
        flpsUserID: item.pk_userID,
        isPaid: false,
        update_mark_commission_status: true
      }
    } else if (type == 'commission') {
      item.isCommissionLoader = true;
      payload = {
        orderID: this.orderDetail.pk_orderID,
        flpsUserID: item.pk_userID,
        orderCommission: item.commissionValue / 100,
        blnPrimary: item.blnPrimary,
        update_order_flps_user: true
      }
    } else if (type == 'remove') {
      item.isRemoveLoader = true;
      payload = {
        orderID: this.orderDetail.pk_orderID,
        flpsUserID: item.pk_userID,
        remove_flps_order_user: true
      }
    }
    this._orderService.updateOrderCalls(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.isRemoveLoader = false;
      item.isCommissionLoader = false;
      item.isMarkLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._orderService.snackBar(res["message"]);
      if (type == 'commission') {
      } else if (type == 'unmark') {
        item.commissionPaidDate = null;
        item.formattedCommissionPaidDate = null;
      } else if (type == 'mark') {
        item.commissionPaidDate = moment().format('MM/DD/yyyy hh:mm');
        item.formattedCommissionPaidDate = moment().format('MM/DD/yyyy hh:mm');
      } else if (type == 'remove') {
        this.dataSource = this.dataSource.filter(row => row.pk_ID != item.pk_ID);
      }
      this._changeDetectorRef.markForCheck();
    })
  }
  addFLPSUser() {
    if (this.selectedEmployee == 0) {
      this._orderService.snackBar('Please select any flps user');
      return;
    }
    this.orderDetail.addFLPSUserLoader = true;
    let payload: addFLPSOrderUser = {
      orderID: this.orderDetail.pk_orderID,
      storeID: this.orderDetail.fk_storeID,
      flpsUserID: Number(this.selectedEmployee),
      add_flps_order_user: true
    }
    this._orderService.orderPostCalls(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.orderDetail.addFLPSUserLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._orderService.snackBar(res["message"]);
      this.isLoading = true;
      this.getFLPS(1);
      this.selectedEmployee = 0;
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
