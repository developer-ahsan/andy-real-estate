import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { FileManagerService } from '../../store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { debounceTime, tap, switchMap, finalize, distinctUntilChanged, filter } from 'rxjs/operators';
const API_KEY = "e8067b53"

@Component({
  selector: 'app-consolidated-bill',
  templateUrl: './consolidated-bill.component.html',
})
export class ConsolidatedBillComponent implements OnInit, OnDestroy {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isPageLoading: boolean = false;
  creditTerms: any;
  selectedTerm: any = 'today';
  isApplyLoader: boolean = false;
  isApplyMsg: boolean = false;


  locationCtrl = new FormControl();
  filteredLocations: any;
  minLengthTerm = 3;
  slectedLocation: any = "";
  isLoadings: boolean = false;


  ngDate = new Date();
  ngOrder = true;
  ngDiscount = true;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private http: HttpClient
  ) { }

  onSelected() {
    this.slectedLocation = this.slectedLocation;
    console.log(this.slectedLocation)
  }

  displayWith(value: any) {
    return value;
  }

  clearSelection() {
    this.slectedLocation = "";
    this.filteredLocations = [];
  }

  ngOnInit() {
    this.getLocationsSearch();
  }
  getCredits() {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      credit_term: true
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.isPageLoading = false;
        this.creditTerms = res["data"];
        this._changeDetectorRef.markForCheck();
      })
  }
  updateCreditTerms() {
    this.isApplyLoader = true;
    if (this.selectedTerm != null) {
      let payload = {
        store_id: this.selectedStore.pk_storeID,
        credit_term_id: this.selectedTerm,
        update_credit_terms: true
      }
      this._fileManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this.selectedTerm = null;
          this.isApplyLoader = false;
          this.isApplyMsg = true;
          setTimeout(() => {
            this.isApplyMsg = false;
            this._changeDetectorRef.markForCheck();
          }, 2000);
          this._changeDetectorRef.markForCheck();
        }
      }, err => {
        this.isApplyLoader = false;
        this._changeDetectorRef.markForCheck();
      })
    } else {
      this._snackBar.open("Please Select Any Term", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 2000
      });
      this.isApplyLoader = false;
      this._changeDetectorRef.markForCheck();
    }

  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
  getLocationsSearch() {
    this.locationCtrl.valueChanges
      .pipe(
        filter(res => {
          return res !== null && res.length >= this.minLengthTerm
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.filteredLocations = [];
          this.isLoadings = true;
          this._changeDetectorRef.markForCheck();

        }),
        switchMap(value => this._fileManagerService.getStoresData({
          store_id: this.selectedStore.pk_storeID,
          store_locations: true,
          size: 20,
          keyword: value
        }).pipe(takeUntil(this._unsubscribeAll),
          finalize(() => {
            this.isLoadings = false
            this._changeDetectorRef.markForCheck();

          }),
        )
        )
      )
      .subscribe((data: any) => {
        if (data['data'].length == 0) {
          this.filteredLocations = [];
          this._changeDetectorRef.markForCheck();

        } else {
          this.filteredLocations = data['data'];
          this._changeDetectorRef.markForCheck();
        }
        console.log(this.filteredLocations);
      });
  }

}
