import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { Reminders } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-reminders',
  templateUrl: './reminders.component.html'
})
export class RemindersComponent implements OnInit, OnDestroy {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();

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
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private _customerService: CustomersService,
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
    this.reminderForm = this._formBuilder.group({
      name: ['', Validators.required],
      reminderOn: ['', Validators.required],
      notes: ['']
    });

    const { pk_userID } = this.currentSelectedCustomer;
    this._customerService.getReminders(pk_userID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((reminders: Reminders) => {
        this.dataSource = reminders["data"];
        this.remindersLength = reminders["totalRecords"];
        this.isLoadingChange.emit(false);

        this._changeDetectorRef.markForCheck();
      });
  }

  locationFormToggle() {
    this.logoForm = !this.logoForm;
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
