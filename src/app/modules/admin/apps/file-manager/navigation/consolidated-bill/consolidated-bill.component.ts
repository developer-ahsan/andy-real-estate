import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { FileManagerService } from '../../store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { debounceTime, tap, switchMap, finalize, distinctUntilChanged, filter } from 'rxjs/operators';
import moment from 'moment';
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
  today = new Date();
  ngOrder = 1;
  ngDiscount = true;

  isConsolidatedBill: boolean = false;
  date: any;
  consolidatedData: any;
  totalAmount = 0;
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
  getConsolidatedBill() {
    if (this.selectedTerm == 'today') {
      this.date = moment(this.today).format('MM/DD/yyyy');
    } else {
      this.date = moment(this.ngDate).format('MM/DD/yyyy');
    }
    this.isConsolidatedBill = true;
    this.isApplyLoader = true;
    let payload = {
      consolidated_bill: true,
      store_id: this.selectedStore.pk_storeID,
      order_date: this.date,
      order_type: this.ngOrder,
      attribute_id: this.slectedLocation
    }
    this._fileManagerService.getStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.consolidatedData = res["data"];
      this.consolidatedData.forEach(element => {
        this.totalAmount += element.total;
      });
      this.isApplyLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isApplyLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getConsolidatedBillDetail(obj) {
    obj.loader = true;
    let payload = {
      consolidated_bill_products: true,
      order_line_id: obj.pk_orderLineID
    }
    this._fileManagerService.getStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      console.log(res);
      obj.productsData = res["data"];
      obj.loader = false;
      obj.hide = true;
      this._changeDetectorRef.markForCheck();
    }, err => {
      obj.loader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  backToSearch() {
    this.isConsolidatedBill = false;
  }

}
