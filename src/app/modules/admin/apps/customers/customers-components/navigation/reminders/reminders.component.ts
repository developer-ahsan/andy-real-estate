import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Reminders } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-reminders',
  templateUrl: './reminders.component.html'
})
export class RemindersComponent implements OnInit, OnDestroy {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  clickedRows = new Set<Reminders>();
  displayedColumns: string[] = ['notes', 'name', 'createdOn', 'remindOn', 'status', 'action'];
  dataSource: Reminders[] = [];
  remindersLength: number = 0;
  logoBanksLength = 10;
  logoForm = false;
  reminderForm: FormGroup;
  selectedStore: string = 'select_store';
  stores: string[] = [
    'RaceWorldPromos.com',
    'RaceWorldPromos.com',
    'RaceWorldPromos.com'
  ];
  flashMessage: 'success' | 'error' | null = null;

  commentUpdateLoader = false;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  reminderPage = 1;

  constructor(
    private _customerService: CustomersService,
    private _formBuilder: FormBuilder,
    private _commonService: DashboardsService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.reminderForm = this._formBuilder.group({
      name: ['', Validators.required],
      reminderOn: ['', Validators.required],
      notes: ['']
    });
    this.isLoading = true;
    this.getCustomer();
  }
  getCustomer() {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        this.getReminders();
      });
  }
  getReminders(type?) {
    let params = {
      reminder: true,
      user_id: this.selectedCustomer.pk_userID,
      page: this.reminderPage,
      size: 20
    }
    this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(reminders => {
      this.dataSource = reminders["data"];
      this.remindersLength = reminders["totalRecords"];
      if (type == 'add') {
        this.reminderForm.reset();
        this.commentUpdateLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextReminders(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.reminderPage++;
    } else {
      this.reminderPage--;
    };
    this.getReminders();
  };
  locationFormToggle() {
    this.logoForm = !this.logoForm;
  }

  createReminder(): void {
    const userData = JSON.parse(localStorage.getItem('userDetails'));

    const { name, reminderOn } = this.reminderForm.getRawValue();
    if (name.trim() == '' || reminderOn == '') {
      this._customerService.snackBar('Please fill out the required fields');
      return;
    }
    let payload = {
      user_id: this.selectedCustomer.pk_userID,
      created_on: Date.now().toString(),
      remind_on: this.reminderForm.getRawValue().reminderOn,
      admin_user_id: userData.pk_userID,
      name: this.reminderForm.getRawValue().name,
      notes: this.reminderForm.getRawValue().notes,
      reminder: true
    }

    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.commentUpdateLoader = true;
    this._customerService.PostApiData(payload)
      .subscribe((response: any) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        let params = {
          reminder: true,
          user_id: this.selectedCustomer.pk_userID,
        }
        this.reminderPage = 1;
        if (response["success"]) {
          this.getReminders('add');
        } else {
          this.commentUpdateLoader = false;
          this._changeDetectorRef.markForCheck();
        }
      }, err => {
        this.commentUpdateLoader = false;
        this._changeDetectorRef.markForCheck();
      });
  }

  deleteReminder(item) {
    item.delLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload = {
      reminderID: item.pk_reminderID,
      remove_reminder: true
    }
    this._customerService.PutApiData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(elem => elem.pk_reminderID != item.pk_reminderID);
      this.remindersLength--;
      this._customerService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._customerService.snackBar('Something went wrong');
    });
  }
  /**
   * Show flash message
   */
  showFlashMessage(type: 'success' | 'error'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3000);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
