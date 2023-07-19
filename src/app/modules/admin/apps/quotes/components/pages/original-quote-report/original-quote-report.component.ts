import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { ImprintRunComponent } from 'app/modules/admin/apps/ecommerce/inventory/navigation/imprint/imprint-run/imprint-run.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QuotesService } from '../../quotes.service';
import { UpdateCharge } from '../../quotes.types';

@Component({
  selector: 'app-original-quote-report',
  templateUrl: './original-quote-report.component.html',
  styles: ['.col-width {width: 11.11%} .data-width {width: 100px}']
})
export class ImprintChargesComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isSearching: boolean = false;
  ngChargeID = '';
  scrollStrategy: ScrollStrategy;

  chargeData: any;
  chargeUsedData: any;
  page = 0;
  totalRecords = 0;
  isViewMoreLoader: boolean = false;
  processQuantities = new Array(30);
  productQuantities = new Array(8);
  horizontalArray = new Array(8);
  mainScreen: string = 'Update Charges';
  isUpdateChargeLoader: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private readonly sso: ScrollStrategyOptions,
    private _QuotesService: QuotesService,
    private _inventoryService: InventoryService
  ) {
    this.scrollStrategy = this.sso.noop();
  }

  ngOnInit(): void {

  };

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
