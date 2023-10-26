import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SupportTicketService } from '../../support-tickets.service';
import { CreateTicket } from '../../support-tickets.types';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [".mat-paginator  {border-radius: 16px !important} .mat-drawer-container {border-radius: 16px !important} ::-webkit-scrollbar {height: 3px !important}"]
})
export class SmartCentsDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  isLoading: boolean = false;
  dataSource = [];
  displayedColumns: string[] = ['ID', 'Status', 'SPID', 'PID', 'Product', 'Supplier', 'Store', 'proof', 'action'];
  totalRecords = 20;
  page = 1;

  parameters: any;


  dashboardValues: any;
  // Order Type 1
  revenueData = [];
  revenueColumns: string[] = ['date', 'status', 'order', 'company', 'location', 'amount', 'pm', 'am', 'd'];
  revenueTotalRecords = 0;
  revenuePage = 1;
  // Order Type 2
  orderCloseData = [];
  orderCloseColumns: string[] = ['date', 'status', 'order', 'company', 'location', 'amount', 'pm', 'am', 'd'];
  orderCloseTotalRecords = 0;
  orderClosePage = 1;
  // Order Type 3
  posBillData = [];
  posBillColumns: string[] = ['date', 'status', 'store', 'po', 'vendor', 'esd', 'amount', 'action'];
  posBillTotalRecords = 0;
  posBillPage = 1;
  // Order Type 4
  receivePaymentData = [];
  receivePaymentColumns: string[] = ['date', 'status', 'order', 'company', 'location', 'amount', 'bd', 'po', 'acc', 'sabo', 'action'];
  receivePaymentTotalRecords = 0;
  receivePaymentPage = 1;
  // Order Type 5
  vendorBillsData = [];
  vendorBillsColumns: string[] = ['date', 'status', 'po', 'vin', 'vendor', 'esd', 'amount', 'net', 'payment', 'action'];
  vendorBillsTotalRecords = 0;
  vendorBillsPage = 1;

  orderType = 2;

  mainScreen: string = 'Tickets';
  userData: any;

  config = {
    maxFiles: 5, // Set the maximum number of files
  };
  files = [];

  ticketForm: FormGroup;
  isCreateTicketLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _supportService: SupportTicketService,
    private router: Router,
    private _route: ActivatedRoute

  ) { }
  ngOnInit(): void {
    let user = localStorage.getItem('userDetails');
    this.userData = JSON.parse(user);
    this.initForm();
    this._route.queryParams.subscribe((res: any) => {
      if (this.revenueData.length > 0 || this.orderCloseData.length > 0 || this.posBillData.length > 0 || this.receivePaymentData.length > 0 || this.vendorBillsData.length > 0) {
        this.paginator.pageIndex = 0;
        this.page = 1;
      }
      if (res) {
        if (res.order_type) {
          this.orderType = res.order_type;
        }
        this.parameters = res;
      }
      this.isLoading = true;
      this.getSupportTickets(1);
    });
  };
  initForm() {
    this.ticketForm = new FormGroup({
      userID: new FormControl(this.userData.pk_userID),
      subject: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      blnUrgent: new FormControl(false),
      created: new FormControl(''),
      modified: new FormControl('')
    });
  }
  calledScreen(screen) {
    this.initForm();
    this.mainScreen = screen;
  }
  onSelectMain(event) {
    if (event.addedFiles.length > 5) {
      this._supportService.snackBar("Please select maximum 5 images.");
      return;
    }
    if (this.files.length == 5) {
      this._supportService.snackBar("Max limit reached for image upload.");
      return;
    } else {
      event.addedFiles.forEach(element => {
        this.files.push(element);
      });
    }
    setTimeout(() => {
      this._changeDetectorRef.markForCheck();
    }, 200);
  }
  onRemoveMain(index) {
    this.files.splice(index, 1);
  }
  createTicket() {
    const { userID, subject, description, blnUrgent, created, modified } = this.ticketForm.getRawValue();
    let payload: CreateTicket = {
      userID, subject, description, blnUrgent, created, modified, create_ticket: true
    }
  }
  getSupportTickets(page) {
    let orderKeyword = '';
    if (this.parameters.keyword) {
      orderKeyword = this.parameters.keyword;
    }
    let customer = '';
    if (this.parameters.company_keyword) {
      customer = this.parameters.company_keyword;
    }
    let start_date = '';
    if (this.parameters.start_date) {
      start_date = this.parameters.start_date;
    }
    let end_date = '';
    if (this.parameters.end_date) {
      end_date = this.parameters.end_date;
    }
    let status = 0;
    if (this.parameters.status) {
      status = this.parameters.status;
    }
    let params = {
      // order_type: this.orderType,
      // storeID: this.parameters.store_id,
      // orderKeyword: orderKeyword,
      // customer: customer,
      // rangeStart: start_date,
      // rangeEnd: end_date,
      // status: status,
      admin_user_id: this.userData.pk_userID,
      tickets_list: true
    }
    this._supportService.getApiData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      console.log(res);
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
    this.getSupportTickets(this.page);
  }
  goToDetailPage(item) {
    // const queryParams: NavigationExtras = {
    //   queryParams: { fk_orderID: item.fk_orderID, pk_orderLineID: item.pk_orderLineID }
    // };
    this.router.navigate([`/smartcents/smartcents-details/${item.pk_orderLinePOID}`]);
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
