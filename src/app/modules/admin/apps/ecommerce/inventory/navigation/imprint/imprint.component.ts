import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html'
})
export class ImprintComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['location', 'method', 'decorator', 'active'];
  imprintDisplayedColumns: string[] = ['id', 'name', 'decorator', 'order', 'action'];
  dataSource = [];
  dataSource2 = [];
  selectedValue: string;
  foods = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];

  imprints = [];
  dataSourceLength: number = 0;
  dataSource2Length: number = 0;
  page: number = 1;
  flashMessage: 'success' | 'error' | 'countError' | null = null;

  priceInclusionForm: FormGroup;
  testPricingForm: FormGroup;

  favoriteSeason: string;
  seasons: string[] = [
    'Per color (i.e. silk screening, pad printing, etc.)',
    'Per Stitch (embroidering)',
    'Simple Process (i.e. laser engraving, full color, etc.)'
  ];
  standardImprints = [];
  testPricingDataSource = [];
  testPricingDataSourceLength: number;

  priceInclusionDataSource = [];

  priceInclusionRunDataSource = [];
  priceInclusionSetupDataSource = [];

  priceInclusionFinalArray = [];

  testPricingNumbers = [
    1, 2, 3, 4, 5, 6, 7, 8, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
    11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000,
    21000, 22000, 23000, 24000, 25000, 26000, 27000, 28000, 29000, 30000
  ];
  isCountZero = false;

  isSelectAll = false;
  isSubValuesSelectAll = false;

  // boolean
  imprintList = true;
  displayList = true;
  priceInclusionLoader = false;
  priceInclusionDataLoader = false;
  updateLoader = false;
  deleteLoader = false;
  testPricingLoader = false;
  mainButtonToggleDisable = false;
  standardImprintLoader = false;

  isPriceInclusionToggleButtonDisable = true;

  showImprintScreen = "";

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _snackBar: MatSnackBar,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {

    // Defalut selected button toggle
    this.showImprintScreen = 'Imprints';
    this.getImprints(this.page);
    this.getAllImprints();

    this.priceInclusionForm = this._formBuilder.group({
      checkBox: ['']
    })

    this.testPricingForm = this._formBuilder.group({
      optionOneFirst: [''],
      optionOneSecond: [''],
      optionTwoFirst: [''],
      optionTwoSecond: [''],
      optionThreeFirst: [''],
      optionThreeSecond: [''],
      optionFourFirst: [''],
      optionFourSecond: ['']
    });
  };

  updateImprintDisplay(data): void {
    console.log("imprint order", data);
  };

  getStandardImprints(): void {
    this._inventoryService.getStandardImprints()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((standard_groups) => {
        this._inventoryService.getSubStandardImprints()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((standard_sub_imprints) => {
            const standardgroupArray = standard_groups["data"];
            const standardSubGroupArray = standard_sub_imprints["data"];

            var groupedStandard = standardSubGroupArray.reduce(function (results, org) {
              (results[org.fk_standardImprintGroupID] = results[org.fk_standardImprintGroupID] || []).push(org);
              return results;
            }, {});

            let tempArray = [];
            for (let i = 0; i < standardgroupArray.length; i++) {
              let pk_standardImprintGroupID = standardgroupArray[i].pk_standardImprintGroupID;
              let obj = {
                standard_imprints: standardgroupArray[i],
                sub_standard_imprints: groupedStandard[`${pk_standardImprintGroupID}`]
              };
              tempArray.push(obj);
            };

            this.standardImprints = tempArray;
            for (let subImprints of this.standardImprints) {
              const { sub_standard_imprints } = subImprints;
              for (const sub_standard of sub_standard_imprints) {
                sub_standard["isChecked"] = false;
              };
            };
            console.log("this.standardImprints", this.standardImprints)
            this.standardImprintLoader = false;

            // Mark for Check
            this._changeDetectorRef.markForCheck();
          });
      });
  };

  clearAllStandardImprintOptions(): void {
    this.isSelectAll = !this.isSelectAll;
    for (let subImprints of this.standardImprints) {
      const { standard_imprints, sub_standard_imprints } = subImprints;
      standard_imprints["isChecked"] = false;
      for (const sub_standard of sub_standard_imprints) {
        sub_standard["isChecked"] = this.isSelectAll ? true : false;
      };
    }
  };

  selectCheckedOption(data): void {
    this.isSubValuesSelectAll = !this.isSubValuesSelectAll;
    const { sub_standard_imprints } = data;
    for (const sub_standard of sub_standard_imprints) {
      sub_standard["isChecked"] = this.isSubValuesSelectAll ? true : false;
    };
  };

  saveStandardImprints(): void {
    let count = 0;
    for (const standardImprint of this.standardImprints) {
      const { sub_standard_imprints } = standardImprint;
      count = count + sub_standard_imprints.filter(function (s) { return s.isChecked }).length;
    };
    console.log("count", count)
    if (!count) {
      this.showFlashMessage('countError');
      return;
    }

    console.log("this.standardImprints saveStandardImprints", this.standardImprints);
  }

  getImprints(page?: number) {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getImprints(pk_productID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((imprint) => {
        if (!imprint["data"]?.length) {
          this.mainButtonToggleDisable = true;
        }
        if (this.imprintList && this.displayList) {
          this.dataSource = imprint["data"];
          this.dataSourceLength = imprint["totalRecords"];
          this.dataSource2 = imprint["data"];
          this.dataSource2Length = imprint["totalRecords"];
        }

        if (this.imprintList && !this.displayList) {
          this.dataSource = imprint["data"];
          this.dataSourceLength = imprint["totalRecords"];
        }

        if (!this.imprintList && this.displayList) {
          this.dataSource2 = imprint["data"];
          this.dataSource2Length = imprint["totalRecords"];
        };
        this._changeDetectorRef.markForCheck();
      });
  }

  getAllImprints() {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getAllImprints(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((imprint) => {
        this.testPricingDataSource = imprint["data"];
        this.testPricingLoader = false;
        this.testPricingDataSourceLength = imprint["totalRecords"];
        this.isLoadingChange.emit(false);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  getPriceInclusionImprints() {
    this.priceInclusionDataLoader = true;
    const { pk_productID } = this.selectedProduct;
    let runChargeIds = '';
    let setupChargeIds = '';
    for (const data of this.testPricingDataSource) {
      const { fk_runChargeID, fk_setupChargeID } = data;
      runChargeIds = runChargeIds + `${fk_runChargeID},`;
      setupChargeIds = setupChargeIds + `${fk_setupChargeID},`;
    };
    const finalRunChargeIds = runChargeIds.replace(/,(?=[^,]*$)/, '');
    const finalSetupChargeIds = setupChargeIds.replace(/,(?=[^,]*$)/, '');
    this._inventoryService.getPriceInclusionImprints(finalSetupChargeIds, finalRunChargeIds, pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((priceInclusionDataSource) => {
        this.priceInclusionRunDataSource = priceInclusionDataSource["data"]["run"];
        this.priceInclusionSetupDataSource = priceInclusionDataSource["data"]["setup"];

        var runDataFiltering = this.priceInclusionRunDataSource.reduce(function (results, org) {
          (results[org.pk_imprintID] = results[org.pk_imprintID] || []).push(org);
          return results;
        }, {});

        var setupDataFiltering = this.priceInclusionSetupDataSource.reduce(function (results, org) {
          (results[org.pk_imprintID] = results[org.pk_imprintID] || []).push(org);
          return results;
        }, {});

        let tempArray = [];
        for (let i = 0; i < this.testPricingDataSource.length; i++) {
          let imprintId = this.testPricingDataSource[i].pk_imprintID;
          let obj = {
            imprintObj: this.testPricingDataSource[i],
            run: runDataFiltering[`${imprintId}`],
            setup: setupDataFiltering[`${imprintId}`]
          };
          tempArray.push(obj);
        };

        this.priceInclusionFinalArray = tempArray;

        console.log("this.priceInclusionFinalArray", this.priceInclusionFinalArray);
        this.priceInclusionDataLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  onChangeEvent(event: any) {

    console.log(event.target.value);

  };

  updatePriceInclusion(): void {
    console.log("updatePriceInclusion");
  };

  updateData(): void {
    console.log("update data");
  }

  deletAllImprints(): void {
    const { pk_productID } = this.selectedProduct;

    this.deleteLoader = true;
    this._inventoryService.deleteImprints(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {

        const message = response["success"] === true
          ? "Product imprints successfully removed"
          : "An error occurred, try again!"

        this.deleteLoader = false;

        this._snackBar.open(message, '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });

        this.ngOnInit();
        // Mark for Check
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
 * Show flash message
 */
  showFlashMessage(type: 'success' | 'error' | 'countError'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3.5 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3500);
  };

  calledScreen(screenName): void {
    if (screenName === "Display Order" || screenName === "Imprints") {
      this.page = 1;
      this.getImprints(this.page);
    }

    if (screenName === "Test Pricing" || screenName === "Overlapping" || screenName === "Price Inclusion") {
      //getAllImprints will be called if imprints data is not called in ngOnInit
      if (!this.testPricingDataSourceLength) {
        this.testPricingLoader = true;
        this.getAllImprints();
      }

      if (screenName === "Price Inclusion") {
        if (!this.priceInclusionFinalArray.length) {
          this.getPriceInclusionImprints();
        }
      }
    }

    if (screenName === "Standard Imprints") {
      if (!this.standardImprints.length) {
        this.standardImprintLoader = true;
        this.getStandardImprints();
      }
    }
    this.showImprintScreen = screenName;
  }

  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.displayList = false;
    this.imprintList = true;
    this.getImprints(this.page);
  }

  getDisplayNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.displayList = true;
    this.imprintList = false;
    this.getImprints(this.page);
  }
}
