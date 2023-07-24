import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QuotesService } from '../../quotes.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-modify-quote',
  templateUrl: './modify-quote.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class QuoteModifyComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['id', 'number', 'name', 'times', 'core'];
  totalUsers = 0;
  page = 1;
  not_available = 'N/A';

  supplierData: any;
  fileDownloadLoader: boolean;

  mainScreen = 'Contact Information';

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _quoteService: QuotesService
  ) { }

  ngOnInit(): void {
  };
  calledScreen(screen) {
    this.mainScreen = screen;
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
