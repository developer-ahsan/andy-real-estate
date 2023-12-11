import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CustomersService } from '../../orders.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { CurrencyPipe } from '@angular/common';
import moment from 'moment';

@Component({
  selector: 'app-orders-history',
  templateUrl: './orders-history.component.html'
})
export class OrdersHistoryComponent implements OnInit, OnDestroy {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['pk_orderID', 'orderDate', 'productName', 'storeName', 'total', 'paid', 'cancel', 'status'];
  dataSource = [];
  ordersHistoryLength: number = 0;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  page = 1;
  totalOrder = 0;
  grandTotal = 0;
  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _commonService: DashboardsService,
    private currencyPipe: CurrencyPipe,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getCustomer();
  }
  getCustomer() {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        this.getOrdersHistory();
      });
  }
  getOrdersHistory() {
    let params = {
      orders_history: true,
      user_id: this.selectedCustomer.pk_userID,
      page: this.page,
      size: 20
    }
    this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(quotes => {
      quotes["data"].forEach(element => {
        if (element.blnCancelled) {
          element.statusResult = { statusColor: 'text-red-500', statusValue: 'Cancelled' };
        } else if (element.blnClosed) {
          element.statusResult = { statusColor: 'text-red-500', statusValue: 'Closed' };
        } else if (element.statusIDs) {
          element.statusResult = this.getStatusValue(element.statusIDs);
        } else {
          element.statusResult = { statusColor: '', statusValue: 'N/A' };
        }
      });
      this.dataSource = quotes["data"];

      this.totalOrder = quotes["totalRecords"];
      this.grandTotal = quotes["grandTotal"];
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getNextOrders(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getOrdersHistory();
  };
  orderDetails(id) {
    this._router.navigate([`/apps/orders/${id}`]);
  }

  getStatusValue(statusValues: any) {
    let statusColor = '';
    let statusValue = '';
    let status = statusValues?.split(',');
    status.forEach(element => {
      let status = Number(element);
      if (status == 1 || status == 2 || status == 3 || status == 4) {
        statusValue = 'Processing';
        statusColor = 'text-red-500';
      } else if (status == 5) {
        statusValue = 'Shipped';
        statusColor = 'text-green-500';
      } else if (status == 6) {
        statusValue = 'Delivered';
        statusColor = 'text-green-500';
      } else if (status == 7) {
        statusValue = 'P.O. Needed';
        statusColor = 'text-purple-500';
      } else if (status == 8) {
        statusValue = 'Picked up';
        statusColor = 'text-green-500';
      } else if (status == 10) {
        statusValue = 'Awaiting Group Order';
        statusColor = 'text-orange-500';
      } else {
        statusValue = 'N/A';
      }
    });
    let result = {
      statusColor: statusColor,
      statusValue: statusValue
    }
    return result;
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }


  generatePdf() {
    const documentDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [10, 10, 10, 10],
      content: [
        // Add a title for your PDF
        { text: 'Order Summary For ' + this.selectedCustomer?.firstName + ' ' + this.selectedCustomer?.lastName, fontSize: 14 },
        { text: 'TotalSales: ' + this.currencyPipe.transform(Number(this.grandTotal), 'USD', 'symbol', '1.0-2', 'en-US'), fontSize: 10 },
        // Add a spacer element to create a margin above the table
        { text: '', margin: [0, 20, 0, 0] },
        {
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'], // Adjust the widths as needed
            body: [
              [
                { text: 'ID', bold: true },
                { text: 'Date', bold: true },
                { text: 'Store', bold: true },
                { text: 'Products', bold: true },
                { text: 'Total', bold: true },
                { text: 'Paid', bold: true },
                { text: 'Cancelled', bold: true },
                { text: 'Status', bold: true }
              ]
            ]
          },
          fontSize: 8
        }
      ],
      styles: {
        tableHeader: {
          bold: true
        }
      }
    };
    this.dataSource.forEach(order => {
      let products = [];
      let productsItems = '';
      if (order.products) {
        products = order.products?.split(',');
        products.forEach((prod, index) => {
          productsItems += (index + 1) + '.) ' + prod + '\n';
        });
      }
      order.products?.split(',')
      documentDefinition.content[3].table.body.push(
        [
          order.pk_orderID,
          moment(order.orderDate).format('MM/DD/yyyy'),
          order.storeName,
          productsItems,
          { text: this.currencyPipe.transform(Number(order.Total), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
          { text: order.paymentDate ? 'Paid' : 'Not Paid', color: order.paymentDate ? 'green' : 'red' },
          { text: order.blnCancelled ? 'Cancelled' : 'Active', color: order.blnCancelled ? 'red' : 'green' },
          order.statusResult.statusValue
        ]
      )
    });
    pdfMake.createPdf(documentDefinition).download(`${this.selectedCustomer.pk_userID}-Order-Report.pdf`);
  }


}
