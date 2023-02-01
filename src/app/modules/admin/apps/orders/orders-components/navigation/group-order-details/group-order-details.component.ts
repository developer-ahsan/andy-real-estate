import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { OrdersList } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApexOptions } from 'ng-apexcharts';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-group-order-details',
  templateUrl: './group-order-details.component.html'
})
export class GroupOrdersDetailsComponent implements OnInit {
  @ViewChild('recentTransactionsTable', { read: MatSort }) recentTransactionsTableMatSort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;

  data: any;
  accountBalanceOptions: ApexOptions;
  recentTransactionsDataSource: MatTableDataSource<any> = new MatTableDataSource();
  dataSource: any;
  tempDataSource: any;
  dataColumns: string[] = ['name', 'email', 'participating', 'paid', 'invoice', 'action'];
  tempTotalRecords = 0;
  totalRecords = 0;
  page = 1;
  isParticipant = -1;
  isFilterLoader: boolean = false;

  ngFilter = -1;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  not_available: string = 'N/A';
  not_available_price: string = '0';
  htmlComment: string = '';

  orderDetail: any;
  orderSummary: any;
  orderSummaryDetail: any;

  participants: any;
  totalParticipants = 0;

  isParticipantLaoder: boolean = false;

  mainScreen = 'Participants';
  orderItems: any;
  isItemsLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.isParticipantLaoder = true;
    this._changeDetectorRef.markForCheck();
    // Get the order
    this.getOrderDetail();
  }
  calledScreen(screen) {
    this.mainScreen = screen;
    if (screen == 'Current Items') {
      if (!this.orderItems) {
        this.getOrderProducts();
      }
    }
  }
  getOrderProducts() {
    this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let value = [];
      res["data"].forEach((element, index) => {
        value.push(element.pk_orderLineID);
        if (index == res["data"].length - 1) {
          this.getLineProducts(value.toString());
        }
      });
    })
  }
  getLineProducts(value) {
    this._orderService.orderLineProducts$.subscribe(res => {
      if (!res) {
        this.isItemsLoader = true;
        let params = {
          order_line_item: true,
          order_line_id: value
        }
        this._orderService.getOrderLineProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          this.orderItems = res["data"];
          this.isItemsLoader = false;
          this._changeDetectorRef.markForCheck();
        }, err => {
          this.isItemsLoader = false;
          this._changeDetectorRef.markForCheck();
          this._changeDetectorRef.markForCheck();
        })
      } else {
        this.orderItems = res["data"];
      }
    })

  }
  getOrderDetail() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
      this.getAllInvited();
      this.getAllParticipants();
    });
  }
  getAllInvited() {
    let params = {
      group_order: true,
      participant: true,
      order_id: this.orderDetail.pk_orderID,
      group_order_id: this.orderDetail.fk_groupOrderID,
      page: this.page,
      is_participating: this.isParticipant,
      size: 10
    }
    this._orderService.getOrder(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalRecords = res["totalRecords"];
      if (this.tempTotalRecords == 0) {
        this.tempDataSource = res["data"];
        this.tempTotalRecords = res["totalRecords"];
      }
      this.isFilterLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isFilterLoader = false;
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
    this.getAllInvited();
  };
  getAllParticipants() {
    let params = {
      group_order: true,
      participants: true,
      order_id: this.orderDetail.pk_orderID,
      size: 20
    }
    this._orderService.getOrder(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.participants = res["data"];
      this.totalParticipants = res["totalRecords"];
      this.isParticipantLaoder = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isParticipantLaoder = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  filterAllParticipants(value) {
    this.page = 1;
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    if (value == -1) {
      this.dataSource = this.tempDataSource;
      this.totalRecords = this.tempTotalRecords;
    } else {
      this.isParticipant = value;
      this.isFilterLoader = true;
      this.getAllInvited();
    }
  }

}
