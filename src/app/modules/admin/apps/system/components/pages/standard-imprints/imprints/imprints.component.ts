import { ENTER, COMMA, P } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, Subject } from 'rxjs';
import { finalize, map, startWith, takeUntil } from 'rxjs/operators';
import { AddColor, AddImprintColor, AddImprintMethod, AddStandardImprint, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod } from '../../../system.types';
import { fuseAnimations } from '@fuse/animations';
import { SystemService } from '../../../system.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ImprintRunComponent } from 'app/modules/admin/apps/ecommerce/inventory/navigation/imprint/imprint-run/imprint-run.component';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { MatDialog } from '@angular/material/dialog';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';

@Component({
  selector: 'app-addEdit-imprints',
  templateUrl: './imprints.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"],
  animations: fuseAnimations
})
export class AddEditImprintsComponent implements OnInit, OnDestroy {
  [x: string]: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @Input() imprintData: any;

  imprintName: string = '';

  addImprintDigitizers: any;
  selectedDigitizer: any;
  addImprintMethods: any[];
  selectedMethod: any;
  methodControl = new FormControl('');
  addImprintLocations: any;
  selectedLocation: any;
  methodFilteredOptions: Observable<any>;
  locationControl = new FormControl('');
  locationFilteredOptions: Observable<any>;

  suppliers: any = [];
  selectedSupplier: any;
  method_name = '';
  location_name = '';
  areaValue: string;
  favoriteSeason = 0;
  seasons = [
    {
      value: 0,
      text: 'Per color (i.e. silk screening, pad printing, etc.)'
    },
    {
      value: 1,
      text: 'Per Stitch (embroidering)'
    },
    {
      value: 2,
      text: 'Simple Process (i.e. laser engraving, full color, etc.)'
    }
  ];
  values: FormGroup;
  defaultImprintColorSpecification = "Yes";
  specifyImrpintArray: string[] = [
    'Yes',
    'No'
  ];
  maxColors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  maxColorSelected = 1;
  imprintItself = [
    {
      imprintItselfText: "Yes, this imprint can be ordered by itself.",
      value: "Yes"
    },
    {
      imprintItselfText: "No, this imprint cannot be ordered by itself.",
      value: "No"
    }
  ];
  imprintItselfSelected = this.imprintItself[0];
  priceInclusionArray = [
    {
      priceInclusionText: "Yes, when it's the only imprint, the first process is included in the product price.",
      value: "Yes"
    },
    {
      priceInclusionText: "No, all processes, including the first are extra.",
      value: "No"
    }
  ]
  priceInclusionSelected = this.priceInclusionArray[0];
  runSetupDistributorCodes = [];
  runSetup: FormGroup;
  chargesTableArray = [];
  minValue: number = 1;
  displayOrder: number = 1;
  minQuantity: number = 1;
  commentText = "";
  addImprintComment;
  addImprintDisplayOrderValue: number = 1;
  collectionIdsArray = [];

  imprintForm: FormGroup;
  getImprintColorCollectionLoader: boolean = false;

  dropdownSettings: IDropdownSettings = {};
  scrollStrategy: ScrollStrategy;
  methodsFetch = 'Fetch Methods';
  locationsFetch = 'Fetch Locations';

  addImprintLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService,
    private _inventoryServcie: InventoryService,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    private readonly sso: ScrollStrategyOptions
  ) {
    this.scrollStrategy = this.sso.noop();
  }
  initForm() {
    this.imprintForm = new FormGroup({
      imprint_name: new FormControl(''),
      imprint_decorator: new FormControl(''),
      imprint_method: new FormControl(''),
      imprint_location: new FormControl(''),
      imprint_area: new FormControl('')
    });
    this.values = this._formBuilder.group({
      twoColorQ: [1],
      threeColorQ: [1],
      fourColorQ: [1],
      fiveColorQ: [1]
    });
    this.runSetup = this._formBuilder.group({
      run: [''],
      setup: ['']
    });
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'fk_collectionID',
      textField: 'collectionName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      limitSelection: 1
    };
  }
  ngOnInit(): void {
    this.initForm();

    this.methodFilteredOptions = this.methodControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    this.locationFilteredOptions = this.locationControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterLocation(value || '')),
    );
    console.log(this.imprintData);
    if (this.imprintData.check == 'add') {
      this.getAddImprintDigitizers();
      this.getAddImprintMethods();
      this.getAddImprintLocations();
      this.getAllSuppliers();
    } else {
      const { name, pk_standardImprintID, minProductQty, maxColors, imprintComments, fk_standardImprintGroupID, fk_setupChargeID, fk_runChargeID, fk_multiColorMinQID, fk_collectionID, displayOrder, blnUserColorSelection, blnStitchProcess, blnSingleton, blnSingleProcess, blnIncludable, blnColorProcess, area } = this.imprintData.imprintData;
      this.imprintName = name;
      this.minQuantity = minProductQty;
      this.maxColorSelected = maxColors;
      this.addImprintComment = imprintComments;
      this.runSetup.patchValue({
        run: fk_runChargeID,
        setup: fk_setupChargeID
      });
      this.areaValue = area;
      this.customColorId = fk_collectionID;
      this.addImprintDisplayOrderValue = displayOrder;
      this.priceInclusionSelected = blnIncludable ? this.priceInclusionArray[1] : this.priceInclusionArray[0];
      this.imprintItselfSelected = blnSingleton ? this.imprintItself[1] : this.imprintItself[0];
      this.defaultImprintColorSpecification = blnUserColorSelection ? 'No' : 'Yes';
      if (blnColorProcess) {
        this.favoriteSeason = 0;
      } else if (blnStitchProcess) {
        this.favoriteSeason = 1;
      } else {
        this.favoriteSeason = 2;
      }
      this.getAddImprintDigitizers(this.imprintData.imprintData);
      this.getAddImprintMethods(this.imprintData.imprintData);
      this.getAddImprintLocations(this.imprintData.imprintData);
      this.getAllSuppliers(this.imprintData.imprintData);
    }
  };
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.addImprintMethods.filter(option => option.methodName.toLowerCase().includes(filterValue));
  }
  private _filterLocation(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.addImprintLocations.filter(option => option.locationName.toLowerCase().includes(filterValue));
  }
  methodSelected(obj) {
    this.selectedMethod = obj;
    if (obj.pk_methodID == 20) {
      this.favoriteSeason = 1;
    }
  }
  locationSelected(obj) {
    this.selectedLocation = obj;
  }
  getAllSuppliers(data?: any) {
    this._systemService.Suppliers$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((supplier) => {
        this.suppliers = supplier["data"];
        this.selectedSupplier = this.suppliers[0];

        if (data) {
          const { fk_decoratorID } = data
          this.selectedSupplier = this.suppliers.find(x => x.pk_companyID === fk_decoratorID) || this.suppliers[2];
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
  getAddImprintDigitizers(data?: any) {
    this._systemService.imprintDigitizer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((digitizers) => {
        if (digitizers) {
          this.addImprintDigitizers = digitizers["data"];
          this.selectedDigitizer = this.addImprintDigitizers[0];

          if (data) {
            const { fk_digitizerID } = data
            this.selectedDigitizer = this.addImprintDigitizers.find(x => x.pfk_digitizerID === fk_digitizerID) || this.addImprintDigitizers[0];
          }
        }


        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };
  getAddImprintMethods(data?: any) {
    this.addImprintMethods = [];
    this._systemService.imprintMethods$.pipe(takeUntil(this._unsubscribeAll)).subscribe((methods) => {
      if (methods) {
        this.addImprintMethods.push({ methodName: 'New Method >>>', pk_methodID: null });
        this.addImprintMethods = [...this.addImprintMethods, ...methods["data"]];

        if (data) {
          const { fk_methodID } = data
          this.selectedMethod = this.addImprintMethods.find(x => x.pk_methodID === fk_methodID) || this.addImprintMethods[0];
          this.methodControl.setValue(this.selectedMethod.methodName);
        } else {
          this.selectedMethod = this.addImprintMethods.find(x => x.pk_methodID === 254) || this.addImprintMethods[0];
          this.methodControl.setValue(this.selectedMethod.methodName);
        }
      }

      // Mark for check
      this._changeDetectorRef.markForCheck();
    });
  };
  getAddImprintLocations(data?: any) {
    this.addImprintLocations = [];

    this._systemService.imprintLocations$.pipe(takeUntil(this._unsubscribeAll)).subscribe((location) => {
      if (location) {
        this.addImprintLocations.push({ locationName: 'New Location >>>', pk_locationID: null });
        this.addImprintLocations = [...this.addImprintLocations, ...location["data"]];
        if (data) {
          const { fk_locationID } = data
          this.selectedLocation = this.addImprintLocations.find(x => x.pk_locationID === fk_locationID) || this.addImprintLocations[0];
          this.locationControl.setValue(this.selectedLocation.locationName);
        } else {
          this.selectedLocation = { locationName: 'New Location >>>', pk_locationID: null };
          this.locationControl.setValue(this.selectedLocation.locationName);
        }
      }
      // Mark for check
      this._changeDetectorRef.markForCheck();
    })
  }
  generateCollectionId() {
    this.getSupplierColorCollections();
    this.getImprintColorCollectionLoader = true;
    const { pk_companyID } = this.selectedSupplier;
    this._systemService.getCollectionIds(pk_companyID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((collection_ids) => {
        this.collectionIdsArray = collection_ids["data"];
        this.collectionIdsArray = this.collectionIdsArray.filter((value, index, self) =>
          index === self.findIndex((t) => (
            t.place === value.place && t.fk_collectionID === value.fk_collectionID
          ))
        )

        if (!this.collectionIdsArray.length) {
          this._systemService.snackBar("No collections have been specified for this supplier.");
          this.getImprintColorCollectionLoader = false;
          this._changeDetectorRef.markForCheck();
          return;
        };

        if (this.collectionIdsArray.length) {
          // this.selectedCollectionId = this.collectionIdsArray[0]
        }
        this.getImprintColorCollectionLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._systemService.snackBar("Unable to fetch imprint colors right now. Try again");
        this.getImprintColorCollectionLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };
  getSupplierColorCollections() {
    const { pk_companyID } = this.selectedSupplier;

    let params = {
      supplier_available_colors: true,
      supplier_id: pk_companyID
    }
    this._systemService.getProductsData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((colors) => {
        this.colorsCollectionIdsArray = colors["data"];
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._systemService.snackBar("Unable to fetch imprint colors right now. Try again");

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  addMinQuantity(value: number): void {
    this.minQuantity = value;
  }
  openModal() {
    const dialogRef = this.dialog.open(ImprintRunComponent, {
      // data: dialogData,
      minWidth: "300px",
      maxHeight: '90vh',
      scrollStrategy: this.scrollStrategy
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      this.runSetup.patchValue({
        run: this._inventoryServcie.run,
        setup: this._inventoryServcie.setup
      })
      if (dialogResult) {
      }
    });
  }

  GetAllImprintMethods() {
    this.methodsFetch = 'Fetching Methods...';
    this._systemService.imprintMethods$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._systemService.getAllImprintMethodsObs().pipe(takeUntil(this._unsubscribeAll)).subscribe(methods => {
        });
      }
    });
  }
  GetAllImprintLocation() {
    this.locationsFetch = 'Fetching Locations...';

    this._systemService.imprintLocations$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._systemService.getAllImprintLocationsObs().pipe(takeUntil(this._unsubscribeAll)).subscribe(locations => {
        });
      } else {
      }
    });
  }

  getAllImprintDigitizer() {
    this._systemService.imprintDigitizer$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._systemService.getAllDigitizers().pipe(takeUntil(this._unsubscribeAll)).subscribe(digitizers => {
          this.getAllDistributionCodes();
        });
      }
    });
  }

  // Add New Imprint Method
  addNewStandardImprint() {
    if (!this.selectedMethod.pk_methodID && !this.method_name) {
      this._systemService.snackBar("New Method was not specified correctly");
      return;
    }
    if (!this.selectedLocation.pk_locationID && !this.location_name) {
      this._systemService.snackBar("New Location was not specified correctly");
      return;
    }
    const { run, setup } = this.runSetup.getRawValue();
    if (this.areaValue === "") {
      this._systemService.snackBar("Imprint AREA has not been defined correctly.");
      return;
    };

    if (this.defaultImprintColorSpecification === 'Yes') {
      if (!this.collectionIdsArray.length && !this.customColorId) {
        this._systemService.snackBar("Select a color collection");
        return;
      };
    };

    if (run === "" || setup === "") {
      this._systemService.snackBar("Select a SETUP or RUN charge");
      return;
    };




    let colorProcess = false;
    let stitchProcess = false;
    let singleProcess = false;
    let processMode = this.favoriteSeason;
    if (processMode == 0) {
      colorProcess = true;
    } else if (processMode == 1) {
      stitchProcess = true;
    } else {
      singleProcess = true;
    }

    let second, third, fourth, fifth;
    let multiValue;
    if (processMode === 0) {
      const {
        twoColorQ,
        threeColorQ,
        fourColorQ,
        fiveColorQ
      } = this.values.getRawValue();
      second = twoColorQ;
      third = threeColorQ;
      fourth = fourColorQ;
      fifth = fiveColorQ;
    };

    let payload: AddStandardImprint = {
      fk_standardImprintGroupID: this.pk_standardImprintGroupID,
      name: this.imprintName,
      fk_decoratorID: this.selectedSupplier.pk_companyID,
      fk_methodID: this.selectedMethod.pk_methodID,
      fk_locationID: this.selectedLocation.pk_locationID,
      fk_setupChargeID: setup,
      fk_runChargeID: run,
      blnIncludable: this.priceInclusionSelected.value === 'Yes' ? true : false,
      area: this.areaValue,
      blnUserColorSelection: this.defaultImprintColorSpecification === 'Yes' ? true : false,
      maxColors: this.defaultImprintColorSpecification === 'Yes' ? this.maxColorSelected : null,
      fk_multiColorMinQID: 1,
      fk_collectionID: this.collectionIdsArray.length ? this.selectedCollectionId[0].fk_collectionID : Number(this.customColorId),
      blnColorProcess: colorProcess,
      blnStitchProcess: stitchProcess,
      blnSingleProcess: singleProcess,
      minProductQty: this.minQuantity,
      imprintComments: this.addImprintComment,
      fk_digitizerID: this.selectedDigitizer.pfk_digitizerID || null,
      displayOrder: this.addImprintDisplayOrderValue,
      blnSingleton: this.imprintItselfSelected.value === 'Yes' ? true : false,
      add_standard_imprint: true
    }
    this.addImprintLoader = true;
    if (processMode == 0) {
      this._systemService.getMultiColorValue(second, third, fourth, fifth).pipe(takeUntil(this._unsubscribeAll))
        .subscribe((multi_color) => {
          multiValue = multi_color["data"];
          payload.fk_multiColorMinQID = multiValue?.length ? multiValue[0].pk_multiColorMinQID : 1;
          this.addStandardImprintOBJ(payload);
        }, err => {
          this.addImprintLoader = false;
          this._changeDetectorRef.markForCheck();
        });
    } else {
      this.addStandardImprintOBJ(payload);
    }
  }
  addStandardImprintOBJ(payload) {
    this._systemService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((response) => {
      if (response["success"]) {
        this.location_name = '';
        this.method_name = '';
        this.selectedLocation = { locationName: 'New Location >>>', pk_locationID: null };
        this.selectedMethod = this.addImprintMethods.find(x => x.pk_methodID === 254) || this.addImprintMethods[0];
      } else {
        this.addImprintLoader = false;
      }
      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.addImprintLoader = false;
      this._changeDetectorRef.markForCheck();
    });
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
