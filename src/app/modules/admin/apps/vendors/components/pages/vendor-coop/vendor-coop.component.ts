import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { FormControl, FormGroup } from '@angular/forms';
import { AddCoops, AddFOBLocation, DeleteCoops, RemoveFOBLocation, UpdateCoops } from '../../vendors.types';
import moment from 'moment';

@Component({
  selector: 'app-vendor-coop',
  templateUrl: './vendor-coop.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorCoopComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'expired', 'action'];
  totalUsers = 0;
  tempTotalUsers = 0;
  page = 1;
  not_available = 'N/A';

  supplierData: any;

  mainScreen = 'Current'

  // States
  allStates = [];
  tempStates = [];
  totalStates = 0;

  searchStateCtrl = new FormControl();
  selectedState: any;
  isSearchingState = false;

  // Location Data for Update
  coopData: any;
  isUpdate: boolean = false;

  // Add FOB Location
  addCoopForm: FormGroup;
  isAddLoader: boolean = false;

  // Search By Keyword
  isSearching: boolean = false;
  keyword = '';

  minDate: any;
  updateDate: any;
  isUpdateLoader: boolean = false;
  updateData = {
    coOp_id: '',
    coopName: '',
    coopExpDay: null,
    pricing: '',
    ltm: '',
    setups: '',
    productionTime: '',
    update_coop: true
  }
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService
  ) { }

  initForm() {
    this.addCoopForm = new FormGroup({
      coopName: new FormControl(''),
      coopExpDay: new FormControl(new Date()),
      pricing: new FormControl(''),
      ltm: new FormControl(''),
      setups: new FormControl(''),
      productionTime: new FormControl(''),
      add_coop: new FormControl(true)
    });
  }
  ngOnInit(): void {
    this.minDate = new Date(moment().subtract(1, 'year').startOf('month').format('MM/DD/yyyy'));
    this.initForm();
    this.getStatesObservable();
    let params;
    this.searchStateCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          states: true,
          keyword: res
        }
        return res != null && res != '' && res != undefined
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allStates = [];
        this.isSearchingState = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._vendorService.getVendorsData(params)
        .pipe(
          finalize(() => {
            this.isSearchingState = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStates = data['data'];
    });
    this.isLoading = true;
    this.getVendorsData();
  };
  getStatesObservable() {
    this._vendorService.States$.pipe(takeUntil(this._unsubscribeAll)).subscribe(states => {
      this.allStates = states["data"];
      this.tempStates = states["data"];
      this.totalStates = states["totalRecords"];
      this.searchStateCtrl.setValue(this.allStates[0].state);
      this.selectedState = this.allStates[0].state;
    });
  }
  calledScreen(screen) {
    this.mainScreen = screen;
    if (screen == 'Add New Co-Ops') {
      this.allStates = this.tempStates;
      this.searchStateCtrl.setValue(this.allStates[0].state, { emitEvent: false });
      this.selectedState = this.allStates[0].state;
    } else {
      this.page = 1;
      this.dataSource = this.tempDataSource;
      this.totalUsers = this.tempTotalUsers;
      this._changeDetectorRef.markForCheck();
    }
  }
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.getCoopData(1, 'get');
    })
  }
  getCoopData(page, type) {
    let params = {
      coOps: true,
      page: page,
      keyword: this.keyword,
      size: 20,
      company_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.tempDataSource.length == 0) {
        this.tempDataSource = res["data"];
        this.tempTotalUsers = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddLoader = false;
        this.initForm();
        this.mainScreen = 'Current';
        this._vendorService.snackBar('Coop added successfully');
      }
      this.isSearching = false;
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getCoopData(this.page, 'get');
  };
  // Search By Keyword
  searchLocations() {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getCoopData(1, 'get');
  }
  resetSearch() {
    this.keyword = '';
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempTotalUsers;
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this._changeDetectorRef.markForCheck();
  }
  // Add New Coop
  addNewCoop() {
    const { coopName, coopExpDay, pricing, ltm, setups, productionTime, add_coop } = this.addCoopForm.getRawValue();
    if (coopName == '') {
      this._vendorService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: AddCoops = { coopName, company_id: this.supplierData.pk_companyID, coopExpDay, pricing, ltm, setups, productionTime, add_coop }
    this.isAddLoader = true;
    this._vendorService.postVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getCoopData(1, 'add');
      } else {
        this.isAddLoader = false;
        this._vendorService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isAddLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // RemoveLocation
  deleteCoop(coop) {
    coop.delLoader = true;
    let payload: DeleteCoops = {
      remove_coops: true,
      coOp_id: coop.pk_coopID
    }
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      coop.delLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.dataSource = this.dataSource.filter(item => item.pk_coopID != coop.pk_coopID);
        this.totalUsers--;
        this.tempDataSource = this.tempDataSource.filter(item => item.pk_coopID != coop.pk_coopID);
        this.tempTotalUsers--;
      }
      this._vendorService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      coop.delLoader = false;
      this._vendorService.snackBar('Something went wrong');
      this._changeDetectorRef.markForCheck();
    });
  }
  toggleUpdate(data) {
    this.isUpdate = true;
    this.coopData = data;
    this.updateData = {
      coOp_id: data.pk_coopID,
      coopName: data.name,
      coopExpDay: new Date(),
      pricing: data.pricing,
      ltm: data.ltm,
      setups: data.setups,
      productionTime: data.productionTime,
      update_coop: true
    }
    if (new Date(data.expirationDate) > new Date(this.minDate)) {
      this.updateData.coopExpDay = new Date(moment(data.expirationDate).format('MM/DD/yyyy'));
    } else {
      this.updateData.coopExpDay = new Date(moment(this.minDate).endOf('year').endOf('month').format('MM/DD/yyyy'));
    }
    this.searchStateCtrl.setValue(data.state, { emitEvent: false });
    this.selectedState = data.state;
  }
  backTolist() {
    this.isUpdate = false;
    this._changeDetectorRef.markForCheck();
  }

  updateCoop() {
    const { coOp_id, coopName, coopExpDay, pricing, ltm, setups, productionTime, update_coop } = this.updateData;
    if (this.coopData.name == '') {
      this._vendorService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: UpdateCoops = { coOp_id: Number(coOp_id), coopName, coopExpDay, pricing, ltm, setups, productionTime, update_coop };
    this.isUpdateLoader = true;
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.coopData.name = coopName;
        this.coopData.expirationDate = coopExpDay;
        this.coopData.pricing = pricing;
        this.coopData.ltm = ltm;
        this.coopData.setups = setups;
        this.coopData.productionTime = productionTime;
      }
      this.isUpdateLoader = false;
      this._vendorService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  onSelected(ev) {
    this.selectedState = ev.option.value;
    console.log(this.selectedState)
  }

  displayWith(value: any) {
    return value;
  }
  onBlur() {
    this.searchStateCtrl.setValue(this.selectedState, { emitEvent: false });
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
