import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { QuotesService } from '../../quotes.service';

@Component({
  selector: 'app-artwork-details',
  templateUrl: './artwork-details.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorBlanketCoopComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  blnSettings: boolean = true;
  isUpdateLoader: boolean = false;
  supplierData: any;

  searchCoopCtrl = new FormControl();
  selectedCoop: any;
  isSearchingCoop = false;

  allCoops = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _quoteService: QuotesService
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
