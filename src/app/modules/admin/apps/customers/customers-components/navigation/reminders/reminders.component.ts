import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Reminders } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';

@Component({
  selector: 'app-reminders',
  templateUrl: './reminders.component.html'
})
export class RemindersComponent implements OnInit, OnDestroy {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  clickedRows = new Set<Reminders>();
  displayedColumns: string[] = ['notes', 'name', 'createdOn', 'remindOn'];
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

  constructor(
    private _customerService: CustomersService,
    private _formBuilder: FormBuilder,
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
        let params = {
          reminder: true,
          user_id: this.selectedCustomer.pk_userID,
        }
        this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(reminders => {
          this.dataSource = reminders["data"];
          this.remindersLength = reminders["totalRecords"];
        }, err => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })
      });
  }
  locationFormToggle() {
    this.logoForm = !this.logoForm;
  }

  createReminder(): void {
    const payload = {
      user_id: this.selectedCustomer.pk_userID,
      created_on: Date.now().toString(),
      remind_on: this.reminderForm.getRawValue().reminderOn,
      admin_user_id: 866,
      name: this.reminderForm.getRawValue().name,
      notes: this.reminderForm.getRawValue().notes,
      reminder: true
    }

    console.log("payload", payload)
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
        this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(reminders => {
          this.dataSource = reminders["data"];
          this.remindersLength = reminders["totalRecords"];
        }, err => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })
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
