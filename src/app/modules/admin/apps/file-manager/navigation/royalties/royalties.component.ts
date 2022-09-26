import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../store-manager.service';

@Component({
  selector: 'app-royalties',
  templateUrl: './royalties.component.html',
  styles: ['::ng-deep {.ql-container {height: auto}}']
})
export class RoyaltiesComponent implements OnInit, OnDestroy {
  @ViewChild('select') select: MatSelect;
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  quillModules: any = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: ["white"] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  includeCheckArray = [
    { value: false, viewValue: 'Include shipping', form: 'blnShipping' },
    { value: false, viewValue: 'Include runs', form: 'blnRuns' },
    { value: false, viewValue: ' Include setups', form: 'blnSetups' },
    { value: false, viewValue: ' Has cost', form: 'blnCost' },
    { value: false, viewValue: 'Has price', form: 'blnPrice' },
    { value: false, viewValue: 'Checkout option', form: 'blnCheckout' },
    { value: false, viewValue: 'Require during checkout', form: 'blnRequireCheckout' }
  ]
  allSelected: boolean = false;
  royalityForm: FormGroup;
  mainScreen: string = "Current Royalities";
  screens = [
    "Current Royalities",
    "Add Royality"
  ];

  isPageLoading: boolean = false;

  isAddLoading: boolean = false;
  isAddMsgLoading: boolean = false;
  addRoyalityForm: FormGroup;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initialize();
    this.getRoyalityList('get')
  }
  initialize() {
    this.royalityForm = this.fb.group({
      royalities: new FormArray([])
    });
    this.addRoyalityForm = this.fb.group({
      name: new FormControl('', [Validators.required]),
      percentage: new FormControl(null, [Validators.required]),
      blnSales: new FormControl(true),
      blnShipping: new FormControl(false),
      blnSetups: new FormControl(false),
      blnRuns: new FormControl(false),
      blnCheckout: new FormControl(false),
      blnRequireCheckout: new FormControl(false),
      blnCost: new FormControl(false),
      blnPrice: new FormControl(false),
      copy: new FormControl(null),
      add_royality: new FormControl(true)
    })
  }
  get royalityListArray(): FormArray {
    return this.royalityForm.get('royalities') as FormArray;
  }
  calledScreen(screenName): void {
    this.mainScreen = screenName;
  };
  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }
  optionClick() {
    let newStatus = true;
    this.select.options.forEach((item: MatOption) => {
      if (!item.selected) {
        newStatus = false;
      }
    });
    this.allSelected = newStatus;
  }
  getRoyalityList(check) {
    this.initialize();
    this.isPageLoading = true;
    let params = {
      store_id: this.selectedStore.pk_storeID,
      royality: true
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.isPageLoading = false;
        let data = res["data"];
        for (let i = 0; i < data.length; i++) {
          this.royalityListArray.push(this.fb.group({
            name: new FormControl(data[i].name, [Validators.required]),
            percentage: new FormControl((data[i].percentage * 100).toFixed(2), [Validators.required]),
            blnSales: new FormControl(data[i].blnSales),
            blnShipping: new FormControl(data[i].blnShipping),
            blnSetups: new FormControl(data[i].blnSetups),
            blnRuns: new FormControl(data[i].blnRuns),
            blnCheckout: new FormControl(data[i].blnCheckout),
            blnRequireCheckout: new FormControl(data[i].blnRequireCheckout),
            blnCost: new FormControl(data[i].blnCost),
            blnPrice: new FormControl(data[i].blnPrice),
            copy: new FormControl(data[i].copy),
            update_royality: new FormControl(true),
            loader: new FormControl(false),
            msg: new FormControl(false),
            del_loader: new FormControl(false),
            pk_royaltyID: new FormControl(data[i].pk_royaltyID)
          }));
          if (check == 'add') {
            this.isAddLoading = false;
            this.isAddMsgLoading = true;
            setTimeout(() => {
              this.isAddMsgLoading = false;
              this._changeDetectorRef.markForCheck();
            }, 2000);
          }
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isPageLoading = false;
        this._changeDetectorRef.markForCheck()
      })
  }
  updateRoyality(item) {
    item.patchValue({
      loader: true
    })
    const { name, percentage, blnSales, blnShipping, blnSetups, blnRuns, blnCheckout, blnRequireCheckout, blnCost, blnPrice, pk_royaltyID, update_royality } = item.getRawValue()
    let payload = {
      name,
      percentage: Number((percentage / 100).toFixed(2)),
      blnSales, blnShipping, blnSetups, blnRuns, blnCheckout, blnRequireCheckout, blnCost, blnPrice, pk_royaltyID, update_royality
    };
    this._fileManagerService.putStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        item.patchValue({
          loader: false,
          msg: true
        })
        setTimeout(() => {
          item.patchValue({
            msg: false
          })
          this._changeDetectorRef.markForCheck();
        }, 3000);
        this._changeDetectorRef.markForCheck();
      }, err => {
        item.patchValue({
          loader: false,
          msg: false
        })
        this._changeDetectorRef.markForCheck()
      })
  }
  removeRoyality(index): void {
    let form_data = this.royalityListArray.controls[index];
    let data = this.royalityListArray.controls[index].value;
    form_data.patchValue({
      del_loader: true
    })
    let payload = {
      pk_royaltyID: data.pk_royaltyID,
      delete_royality: true
    }
    this._fileManagerService.putStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        if (res["success"]) {
          form_data.patchValue({
            del_loader: false
          })
          this._snackBar.open("Royality Deleted Successfully!!", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3000
          });
          this.royalityListArray.removeAt(index);
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        form_data.patchValue({
          del_loader: false
        })
        this._changeDetectorRef.markForCheck()
      })
  }
  addRoyality() {
    this.isAddLoading = true;
    const { pk_storeID } = this.selectedStore;
    const { name, percentage, blnSales, blnShipping, blnSetups, blnRuns, blnCheckout, blnRequireCheckout, blnCost, blnPrice, pk_royaltyID, add_royality } = this.addRoyalityForm.getRawValue()
    let payload = {
      fk_storeID: pk_storeID,
      name,
      percentage: Number((percentage / 100).toFixed(2)),
      blnSales,
      blnShipping,
      blnSetups,
      blnRuns, blnCheckout, blnRequireCheckout, blnCost, blnPrice, pk_royaltyID, add_royality
    };
    this._fileManagerService.postStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        if (res["success"]) {
          this.getRoyalityList('add');
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isAddLoading = false;
        this.isAddMsgLoading = false;
        this._changeDetectorRef.markForCheck()
      })
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
