import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { FLPSService } from 'app/modules/admin/apps/flps/components/flps.service';

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
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService,
    private _flpsService: FLPSService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getOrderDetail();
    this.getFlpsUsers();
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
  getFlpsUsers() {
    this._flpsService.getAllReportUsers().pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      if (res && res["data"] && res["data"][0] && res["data"][0].flpsUsers) {
        let employees = res?.data[0]?.flpsUsers || [];
        if (employees) {
          let employee = employees.split(',');
          employee.forEach(emp => {
            let colonEmp = emp.split(':');
            this.flpsUsers.push({ pk_userID: Number(colonEmp[0]), fullName: colonEmp[2], email: colonEmp[6] });
          });
        }
      }
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getFLPS(page) {
    let params = {
      flps_user: true,
      order_id: this.orderDetail.pk_orderID,
      page: page
    }
    this._orderService.getOrder(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
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
    this.getFLPS(this.page);
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
