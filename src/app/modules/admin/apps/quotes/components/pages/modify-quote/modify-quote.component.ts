import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QuotesService } from '../../quotes.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

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
    private _commonService: DashboardsService,
    public _quoteService: QuotesService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._quoteService.modifyQuote = this._commonService.assignPermissions('modifyQuote', this._quoteService.modifyQuote);
    this._quoteService.qoutesDetails$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((quote) => {
        this._quoteService.ModifyCurrentProducts$.subscribe(res => {
          if (!res) {
            this._quoteService.getSelectedProducts(quote["data"][0].storeID, quote["data"][0].pk_cartID).subscribe(() => {
              this.isLoading = false;
              this._changeDetectorRef.markForCheck();
            });
          }
        })

      });
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
