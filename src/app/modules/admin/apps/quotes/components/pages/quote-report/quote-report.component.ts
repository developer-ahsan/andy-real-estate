import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { add_setup_charge } from '../../quotes.types';
import { QuotesService } from '../../quotes.service';

@Component({
  selector: 'app-quote-report',
  templateUrl: './quote-report.component.html',
  styles: ['.col-width {width: 11.11%} .data-width {width: 100px}']
})
export class SystemImprintRunComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  processQuantities = new Array(30);
  productQuantities = new Array(8);
  horizontalArray = new Array(8);
  ngChargeCode = 0;
  ngCostCode: any = 0;
  getChargesLoader: boolean = false;
  chargesTableArray: any;

  isNewCharge: boolean = false;
  runSetupLoaderFetching: boolean;
  runSetupDistributorCodes: any;

  newChargeValue = 0;

  createNewChargeLoader: boolean = false;
  currentChargeValue: any;
  errMsg = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _quotesService: QuotesService,
    private _snackBar: MatSnackBar,
  ) { }

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

