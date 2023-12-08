import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../store-manager.service';
import { updateStoreRoyalty } from '../../stores.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-royalties',
  templateUrl: './royalties.component.html',
  styles: ['::ng-deep {.ql-container {height: auto}}']
})
export class RoyaltiesComponent implements OnInit, OnDestroy {
  @ViewChild('select') select: MatSelect;
  selectedStore: any;
  isLoading: boolean;
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
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _commonService: DashboardsService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.getStoreDetails()
  }
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.initialize();
      });
  }
  initialize() {
    this.addRoyalityForm = this.fb.group({
      blnRoyaltyStore: new FormControl('', [Validators.required]),
      royaltyName: new FormControl('', [Validators.required]),
      royaltyAmount: new FormControl(null, [Validators.required]),
      apparelRoyaltyAmount: new FormControl(true),
      blnRoyaltyOnByDefault: new FormControl(false),
      royaltyCopy: new FormControl(''),
    });
    this.addRoyalityForm.patchValue(this.selectedStore);
    this.addRoyalityForm.patchValue({
      royaltyAmount: this.selectedStore.royaltyAmount * 100,
      apparelRoyaltyAmount: this.selectedStore.apparelRoyaltyAmount * 100
    })
  }

  updateRoyality() {
    const { blnRoyaltyStore, royaltyName, royaltyAmount, apparelRoyaltyAmount, blnRoyaltyOnByDefault, royaltyCopy } = this.addRoyalityForm.getRawValue();
    if (royaltyName.trim() == '' || royaltyAmount == '' || apparelRoyaltyAmount == '') {
      this._commonService.snackBar('Please fill out the required fields');
      return;
    }
    if (royaltyAmount < 0) {
      this._commonService.snackBar('Royality Amount should be greater or equal to 0.');
      return;
    }
    if (apparelRoyaltyAmount < 0) {
      this._commonService.snackBar('Apparel Royality Amount should be greater or equal to 0.');
      return;
    }
    if (royaltyCopy.length > 5000) {
      this._commonService.snackBar('Royalty Copy should be less than 5000.');
      return;
    }
    let payload: updateStoreRoyalty = {
      blnRoyaltyStore,
      royaltyAmount: Number((royaltyAmount / 100).toFixed(2)),
      apparelRoyaltyAmount: Number((apparelRoyaltyAmount / 100).toFixed(2)),
      royaltyCopy,
      royaltyName,
      blnRoyaltyOnByDefault,
      storeID: this.selectedStore.pk_storeID,
      update_royality: true
    };
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isAddLoading = true;
    this._storeManagerService.putStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        if (res) {
          this._storeManagerService.snackBar(res["message"]);
        }
        this.selectedStore.blnRoyaltyStore = blnRoyaltyStore;
        this.selectedStore.royaltyCopy = royaltyCopy;
        this.selectedStore.royaltyName = royaltyName;
        this.selectedStore.blnRoyaltyOnByDefault = blnRoyaltyOnByDefault;
        this.selectedStore.royaltyAmount = royaltyAmount / 100;
        this.selectedStore.apparelRoyaltyAmount = apparelRoyaltyAmount / 100;
        this.isAddLoading = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isAddLoading = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
