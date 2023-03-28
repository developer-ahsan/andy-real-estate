import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';

@Component({
  selector: 'app-inventory-summary-report',
  templateUrl: './inventory-summary-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportInventorySummaryComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['id', 'number', 'name', 'active'];
  totalUsers = 0;
  page = 1;
  not_available = 'N/A';

  supplierData: any;

  isModal: boolean = false;

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef, private _formBuilder: FormBuilder,
    private _vendorService: ReportsService
  ) { }

  ngOnInit(): void {
  };

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
