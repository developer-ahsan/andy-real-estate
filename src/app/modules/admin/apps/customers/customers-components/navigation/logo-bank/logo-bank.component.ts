import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { CustomersService } from '../../orders.service';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { addLogoBank, deleteLogoBank, updateLogoBank } from '../../orders.types';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

@Component({
  selector: 'app-logo-bank',
  templateUrl: './logo-bank.component.html'
})
export class LogoBankComponent implements OnInit {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  clickedRows = new Set<PeriodicElement>();
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;
  logoBanksLength = 10;
  logoForm = false;

  stores: string[] = [
    'RaceWorldPromos.com',
    'RaceWorldPromos.com',
    'RaceWorldPromos.com'
  ];


  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  allStores = [];
  alllStores = [];
  searchStoreCtrl = new FormControl();
  selectedStore: any;
  isSearchingStore = false;

  mainScreen = 'Logo Banks'
  addLogoBankForm: FormGroup;

  logoBanks: any = [];
  logoBanksLoader: boolean = false;
  logoBanksTotal = 0;
  logoBanksPage = 1;
  logoBanksLoadMore: boolean = false;
  logoBankImageValue: any;
  isAddLogoBankLoader: boolean = false;

  isSearchLaoder: boolean = false;
  searchKeyword = '';
  constructor(
    private _cutomerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this._cutomerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        this.initialize();
        this.getLogoBanks(1);
        this.getStores();
      });
  }
  calledScreen(screen) {
    this.mainScreen = screen;
    if (screen == 'Logo Banks') {
      this.selectedStore = this.allStores[0];
      this.searchStoreCtrl.setValue({ storeName: 'All Stores', storeID: null });
    } else {
      if (this.alllStores.length > 0) {
        this.selectedStore = this.alllStores[0];
        this.searchStoreCtrl.setValue(this.selectedStore);
      }
    }
  }
  initialize() {
    this.addLogoBankForm = new FormGroup({
      name: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      colorList: new FormControl("", Validators.required),
    });
    let params;
    this.searchStoreCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          logo_banks_stores: true,
          user_id: this.selectedCustomer.pk_userID,
          keyword: res
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allStores = [];
        this.isSearchingStore = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._cutomerService.GetApiData(params)
        .pipe(
          finalize(() => {
            this.isSearchingStore = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStores.push({ storeName: 'All Stores', storeID: null });
      this.allStores = this.allStores.concat(data["data"]);
      this.alllStores = data["data"];
    });
    this.selectedStore = this.allStores[0];
    this.searchStoreCtrl.setValue({ storeName: 'All Stores', storeID: null });
  }
  searchLogoBank() {
    this.isSearchLaoder = true;
    this.logoBanksPage = 1;
    this.logoBanks = [];
    this.getLogoBanks(1);
  }
  getLogoBanks(page) {
    if (!this.isSearchLaoder) {
      this.logoBanksLoader = true;
    }
    let params = {
      page: page,
      keyword: this.searchKeyword,
      logo_banks: true,
      user_id: this.selectedCustomer.pk_userID,
      store_id: this.selectedStore?.storeID
    }
    if (page == 1) { }
    this._cutomerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.logoBanksTotal = res["totalRecords"];
      this.logoBanks = res["data"];
      this.logoBanksLoader = false;
      this.isSearchLaoder = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.logoBanksLoader = false;
      this.isSearchLaoder = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  nextLogoBanks() {
    this.logoBanksPage++;
    this.logoBanksLoadMore = true;
    this._changeDetectorRef.markForCheck();
    this.getLogoBanks(this.logoBanksPage);
  }
  getStores() {
    let params = {
      logo_banks_stores: true,
      user_id: this.selectedCustomer.pk_userID
    }
    this._cutomerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStores.push({ storeName: 'All Stores', storeID: null });
      this.allStores = this.allStores.concat(res["data"]);
      this.alllStores = res["data"];
      this._changeDetectorRef.markForCheck();
    }, err => { });
    this._changeDetectorRef.markForCheck();
  }
  onSelected(ev) {
    if (this.selectedStore != ev.option.value) {
      this.selectedStore = ev.option.value;
      this.logoBanks = [];
      this.logoBanksPage = 1;
      this.getLogoBanks(1);
    }
  }
  displayWith(value: any) {
    return value?.storeName;
  }

  updateLogoBank(item) {

    if(item.name.trim() === '' || item.description.trim() === '' || item.colorList.trim() == '') {
      this._cutomerService.snackBar('Please fill the required fields');
      return;
    }


    let payload: updateLogoBank = {
      name: item.name,
      description: item.description,
      vectorFileExtension: item.vectorFileExtension,
      colorList: item.colorList,
      logoBankID: item.pk_logoBankID,
      update_logo_bank: true
    }
    item.updateLoader = true;
    this._cutomerService.PutApiData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._cutomerService.snackBar(res["message"]);
      }
      item.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  removeLogoBank(item) {
    let payload: deleteLogoBank = {
      logoBankID: item.pk_logoBankID,
      delete_logo_bank: true
    }
    item.removeLoader = true;
    this._cutomerService.PutApiData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._cutomerService.snackBar(res["message"]);
        let index = this.logoBanks.findIndex(logo => logo.pk_logoBankID == item.pk_logoBankID);
        this.logoBanks.splice(index, 1);
        this.logoBanksTotal--;
      }
      item.removeLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.removeLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  uploadLogoBank() {
    if (!this.logoBankImageValue) {
      this._cutomerService.snackBar('Please select any file');
      return;
    }
    const { name, description, colorList } = this.addLogoBankForm.getRawValue();
    if(name.trim() === '' || description.trim() === '' || colorList.trim() == '') {
      this._cutomerService.snackBar('Please fill the required fields');
      return;
    }
    let payload: addLogoBank = {
      user_id: this.selectedCustomer.pk_userID,
      name: name.trim(),
      description: description.trim(),
      vectorFileExtension: this.logoBankImageValue.type,
      colorList: colorList.trim(),
      store_id: Number(this.selectedStore.storeID),
      add_logo_bank: true
    }
    this.isAddLogoBankLoader = true;
    this._cutomerService.PostApiData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._cutomerService.snackBar(res["message"]);
        this.uploadMediaLogoBank(res["newID"]);
        this.addLogoBankForm.reset();
        this.getLogoBanks(1);
      }
      this.isAddLogoBankLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddLogoBankLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  uploadLogoBankFile(event): void {
    const file = event.target.files[0];
    let type = '';
    // if (file.name.toLowerCase().endsWith('.eps')) {
    //   type = 'eps';
    // } else if (file.type === 'application/postscript') {
    //   type = 'ai';
    // } else {
    //   this.logoBankImageValue = null;
    //   this._cutomerService.snackBar('Please select only AI or Eps file');
    //   return;
    // }
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      this.logoBankImageValue = {
        imageUpload: reader.result,
        type: type
      };
    };
  };
  uploadMediaLogoBank(id) {
    const { imageUpload, type } = this.logoBankImageValue;
    const base64 = imageUpload.split(",")[1];
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: `/globalAssets/Stores/LogoBank/${this.selectedStore.storeID}/${id}.${type}`
    };

    this._cutomerService.addCustomerMedia(payload)
      .subscribe((response) => {
        // Mark for check
        this.logoBankImageValue = null;
        this._changeDetectorRef.markForCheck();
      }, err => {
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
}
