import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { SupportTicketService } from 'app/modules/admin/support-tickets/components/support-tickets.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { VendorsService } from '../../vendors.service';

@Component({
  selector: 'app-open-purchase-orders',
  templateUrl: './open-purchase-orders.component.html',
})
export class OpenPurchaseOrdersComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('paginator') paginator: MatPaginator;


  searchOrder: any = '';
  searchCustomer: any = '';
  selectedStoreId: any = 0;

  selectedStore: any = 'All';

  allStores: any[];
  isLoading: boolean = false;
  dataSource: any = [];
  displayedColumns: any = [
    {
      value: 'PO#',
      key: ['fk_orderID', 'pk_orderLineID'],
      width: '15',
      moneyField: false,
      isArray: true,
      sortName: 'PO',
      showIcon: false
    },
    {
      value: 'STATUS',
      key: 'statusName',
      width: '20',
      moneyField: false,
      isArray: false,
      sortName: 'status',
      showIcon: false
    },
    {
      value: 'EST. SHIP DATE',
      key: 'estimatedShippingDate',
      width: '20',
      moneyField: false,
      isArray: false,
      sortName: 'estShipDate',
      showIcon: false
    },
    {
      value: 'STORE',
      key: 'storeName',
      width: '10',
      moneyField: false,
      isArray: false,
      sortName: 'store',
      showIcon: false
    },
    {
      value: 'CUSTOMER',
      key: ['companyName', 'firstName', 'lastName'],
      width: '25',
      moneyField: false,
      isArray: true,
      sortName: 'customer',
      showIcon: false
    },
    {
      value: 'TOTAL',
      key: 'TOTAL',
      width: '10',
      moneyField: true,
      isArray: false,
      sortName: 'total',
      showIcon: false
    }
  ];
  totalRecords = 20;
  page = 1;
  userData: any;
  params: any = {}
  vendorData: any;

  sortingOrder: any = 'ASC'
  sortBy: any = '';

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _supportService: SupportTicketService,
    private router: Router,
    private _commonService: DashboardsService,
    private _vendorService: VendorsService,


  ) { }
  ngOnInit(): void {
    let user = localStorage.getItem('userDetails');
    this.userData = JSON.parse(user);
    this.getVendorsData();
    this.getAllStores();
  };

  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.vendorData = supplier["data"][0];
      this.getData();
    })
  }

  getValue(data: any, key: string | string[]): string {
    if (Array.isArray(key)) {
      return key.map(k => data[k]).join(' - ');
    } else {
      return data[key] !== null ? data[key] : '---';
    }
  }


  getData() {
    this.params = {
      vendor_openPOs: true,
      company_id: this.vendorData.pk_companyID,
      store_id: this.selectedStoreId,
      order_search: this.searchOrder,
      customer_search: this.searchCustomer,
      sort_order: this.sortingOrder,
      sort_by: this.sortBy,
      page: this.page,
    }
    this.isLoading = true;
    this._vendorService.getVendorsData(this.params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }


  changePage(increment: boolean) {
    if (increment && this.page <= Math.ceil(this.dataSource.totalRecords / this.dataSource.size)) {
      this.page++;
      this.getData()
    }
    else if (!increment && this.page > 1) {
      this.page--;
      this.getData()
    }
  }

  setParams(value: any = '') {
    if (value !== '') {
      this.selectedStoreId = value;
    }
    this.getData();
  }

  setSort(column: any) {
    this.sortBy = column.sortName;
    if (this.sortingOrder === 'ASC') {
      this.sortingOrder = 'DESC'
    } else {
      this.sortingOrder = 'ASC'
    }
    this.displayedColumns.forEach((item) => {
      if (item.sortName === column.sortName) {
        item.showIcon = true;
      } else {
        item.showIcon = false;
      }
    })
    this.getData();
  }

  resetParams() {
    this.searchOrder = '';
    this.searchCustomer = '';
    this.selectedStoreId = 0;
    this.selectedStore = 'All';
    this.sortingOrder = 'ASC'
    this.sortBy = '';
    this.displayedColumns.forEach((item) => {
      item.showIcon = false;
    })
    this.getData();
  }



  getAllStores() {
    this._commonService.storesData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.allStores = [
          ...res["data"].filter(element => element.blnActive)
        ];
      });
  }



  navigateToPage(id: string) {
    this.router.navigateByUrl(`/apps/orders/${id}/summary`);
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
