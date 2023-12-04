import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { SupportTicketService } from 'app/modules/admin/support-tickets/components/support-tickets.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-open-purchase-orders',
  templateUrl: './open-purchase-orders.component.html',
})
export class OpenPurchaseOrdersComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('paginator') paginator: MatPaginator;


  searchOrder: any;
  searchCustomer: any;
  selectedStore: any = 'All';

  allStores: any[];
  isLoading: boolean = false;
  dataSource: any = [];
  displayedColumns: any = [
    {
      value: 'PO#',
      key: 'pk_ticketID',
      width: '10'
    },
    {
      value: 'STATUS',
      key: 'subject',
      width: '35'
    },
    {
      value: 'EST. SHIP DATE',
      key: 'modified',
      width: '20'
    },
    {
      value: 'STORE',
      key: 'age',
      width: '10'
    },
    {
      value: 'CUSTOMER',
      key: 'firstName',
      width: '15'
    },
    {
      value: 'TOTAL',
      key: 'statusName',
      width: '10'
    }
  ];
  totalRecords = 20;
  page = 1;
  userData: any;


  params: any = {
    time_frame: 'all',
    status_id: 999,
    admin_user_id: 0,
    tickets_list: true,
    page: this.page,
    keyword: '',
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _supportService: SupportTicketService,
    private router: Router,
    private _commonService: DashboardsService,

  ) { }
  ngOnInit(): void {
    let user = localStorage.getItem('userDetails');
    this.userData = JSON.parse(user);
    this.getData();
    this.getAllStores();
  };


  getData() {
    this.isLoading = true;
    this._supportService.getApiData(this.params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
      this.setParams(this.page, 'page')
    }
    else if (!increment && this.page > 1) {
      this.page--;
      this.setParams(this.page, 'page')
    }
  }

  setParams(value?: any, key?: string) {
    if (value) {
      this.params = {
        ...this.params,
        [key]: value
      };
    }
    // this.getData();
  }

  resetParams() {

    this.searchOrder = '';
    this.searchCustomer = '';
    this.selectedStore = 'All';
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
    this.router.navigateByUrl(`support-tickets/detail/${id}`);
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
