import { ENTER, COMMA, P } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AddColor, AddImprintColor, AddImprintMethod, AddStandardImprint, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod, UpdateStandardImprint } from '../../../vendors.types';
import { fuseAnimations } from '@fuse/animations';
import { VendorsService } from '../../../vendors.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ImprintRunComponent } from 'app/modules/admin/apps/ecommerce/inventory/navigation/imprint/imprint-run/imprint-run.component';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { MatDialog } from '@angular/material/dialog';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { environment } from 'environments/environment';

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
  defaultImprintColorSpecification = true;
  specifyImrpintArray: string[] = [
    'Yes',
    'No'
  ];
  maxColors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  maxColorSelected = 1;
  imprintItself = [
    {
      imprintItselfText: "Yes, this imprint can be ordered by itself.",
      value: true
    },
    {
      imprintItselfText: "No, this imprint cannot be ordered by itself.",
      value: false
    }
  ];
  imprintItselfSelected = this.imprintItself[0];
  priceInclusionArray = [
    {
      priceInclusionText: "Yes, when it's the only imprint, the first process is included in the product price.",
      value: true
    },
    {
      priceInclusionText: "No, all processes, including the first are extra.",
      value: false
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

  public locationSearchControl = new FormControl();
  isLocationLoading: boolean = false;
  public methodSearchControl = new FormControl();
  isMethodLoading: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _VendorsService: VendorsService,
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
  searchMoviesCtrl = new FormControl();
  filteredMovies: any;
  isLoadings = false;
  errorMsg!: string;
  minLengthTerm = 3;
  selectedMovie: any = "";

  searchPayload: any;
  ngOnInit(): void {
    this.initForm();
    this.locationSearchControl.valueChanges
      .pipe(
        filter(res => {
          return res !== null && res.length >= this.minLengthTerm
        }),
        distinctUntilChanged(),
        debounceTime(300),
        tap(() => {
          this.addImprintLocations = [];
          this.isLoadings = true;
          this._changeDetectorRef.markForCheck();
        }),
        switchMap(value => this._VendorsService.getAllImprintLocations(value)
          .pipe(
            finalize(() => {
              this.isLoadings = false
              this._changeDetectorRef.markForCheck();
            }),
          )
        )
      )
      .subscribe((data: any) => {
        this.addImprintLocations.push({ locationName: 'New Location >>>', pk_locationID: null });
        data["data"].forEach(element => {
          this.addImprintLocations.push(element);
        });
      });

    this.methodSearchControl.valueChanges
      .pipe(
        filter(res => {
          if (res.length > 2) {
            this.isMethodLoading = true;
            this._changeDetectorRef.markForCheck();
          }

          return res !== null && res.length >= this.minLengthTerm
        }),
        distinctUntilChanged(),
        debounceTime(300),
        tap(() => {
          this.addImprintMethods = [];
          this._changeDetectorRef.markForCheck();
        }),
        switchMap(value => this._VendorsService.getAllImprintMethods(value)
          .pipe(
            finalize(() => {
              this.isMethodLoading = false
              this._changeDetectorRef.markForCheck();
            }),
          )
        )
      )
      .subscribe((data: any) => {
        this.addImprintMethods.push({ methodName: 'New Method >>>', pk_methodID: null });
        data["data"].forEach(element => {
          this.addImprintMethods.push(element);
        });
      });

    this.methodFilteredOptions = this.methodControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    this.locationFilteredOptions = this.locationControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterLocation(value || '')),
    );
    if (this.imprintData.check == 'add') {
      this.locationSearchControl.setValue('New Location >>>')
      this.getAddImprintDigitizers();
      this.getAddImprintMethods();
      this.getAddImprintLocations();
      this.getAllSuppliers();
    } else {
      const { name, pk_standardImprintID, minProductQty, maxColors, imprintComments, fk_standardImprintGroupID, fk_setupChargeID, fk_runChargeID, fk_multiColorMinQID, fk_collectionID, displayOrder, blnUserColorSelection, blnStitchProcess, blnSingleton, blnSingleProcess, blnIncludable, blnColorProcess, area, locationName, methodName } = this.imprintData.imprintData;
      this.locationSearchControl.setValue(locationName);
      this.methodSearchControl.setValue(methodName);
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
      this.defaultImprintColorSpecification = blnUserColorSelection;
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
    if (obj.methodName.includes('Embroidery') || obj.methodName.includes('Embroidering') || obj.methodName.includes('Embroidered')) {
      this.favoriteSeason = 1;
      this.selectedDigitizer = this.addImprintDigitizers.find(x => x.pfk_digitizerID == this.selectedSupplier.pk_companyID) || this.addImprintDigitizers[0];
    }
    this.methodSearchControl.setValue(obj.methodName)
    // if (obj.pk_methodID == 20) {
    // }
    this._changeDetectorRef.markForCheck();
  }
  locationSelected(obj) {
    this.selectedLocation = obj;
    this.locationSearchControl.setValue(obj.locationName)
  }
  getAllSuppliers(data?: any) {
    this._VendorsService.Suppliers$
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
    this._VendorsService.imprintDigitizer$
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
    this._VendorsService.imprintMethods$.pipe(takeUntil(this._unsubscribeAll)).subscribe((methods) => {
      if (methods) {
        this.addImprintMethods.push({ methodName: 'New Method >>>', pk_methodID: null });
        this.addImprintMethods = [...this.addImprintMethods, ...methods["data"]];

        if (data) {
          const { fk_methodID, methodName } = data
          this.selectedMethod = { methodName: methodName, pk_methodID: fk_methodID };
          // this.selectedMethod = this.addImprintMethods.find(x => x.pk_methodID === fk_methodID) || this.addImprintMethods[0];
          // this.methodControl.setValue(this.selectedMethod.methodName);
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

    this._VendorsService.imprintLocations$.pipe(takeUntil(this._unsubscribeAll)).subscribe((location) => {
      if (location) {
        this.addImprintLocations.push({ locationName: 'New Location >>>', pk_locationID: null });
        this.addImprintLocations = [...this.addImprintLocations, ...location["data"]];
        if (data) {
          const { fk_locationID, locationName } = data
          this.selectedLocation = { locationName: locationName, pk_locationID: fk_locationID };

          // this.selectedLocation = this.addImprintLocations.find(x => x.pk_locationID === fk_locationID) || this.addImprintLocations[0];
          // this.locationControl.setValue(this.selectedLocation.locationName);
        } else {
          this.selectedLocation = { locationName: 'New Location >>>', pk_locationID: null };
          // this.locationControl.setValue(this.selectedLocation.locationName);
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
    this._VendorsService.getCollectionIds(pk_companyID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((collection_ids) => {
        this.collectionIdsArray = collection_ids["data"];
        this.collectionIdsArray = this.collectionIdsArray.filter((value, index, self) =>
          index === self.findIndex((t) => (
            t.place === value.place && t.fk_collectionID === value.fk_collectionID
          ))
        )

        if (!this.collectionIdsArray.length) {
          this._VendorsService.snackBar("No collections have been specified for this supplier.");
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
        this._VendorsService.snackBar("Unable to fetch imprint colors right now. Try again");
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
    this._VendorsService.getProductsData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((colors) => {
        this.colorsCollectionIdsArray = colors["data"];
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._VendorsService.snackBar("Unable to fetch imprint colors right now. Try again");

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
    this._VendorsService.imprintMethods$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._VendorsService.getAllImprintMethodsObs('').pipe(takeUntil(this._unsubscribeAll)).subscribe(methods => {
        });
      }
    });
  }
  GetAllImprintLocation() {
    this.locationsFetch = 'Fetching Locations...';

    this._VendorsService.imprintLocations$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._VendorsService.getAllImprintLocationsObs('').pipe(takeUntil(this._unsubscribeAll)).subscribe(locations => {
        });
      } else {
      }
    });
  }

  getAllImprintDigitizer() {
    this._VendorsService.imprintDigitizer$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._VendorsService.getAllDigitizers().pipe(takeUntil(this._unsubscribeAll)).subscribe(digitizers => {
          this.getAllDistributionCodes();
        });
      }
    });
  }

  // Add New Imprint Method
  addNewStandardImprint() {
    if (!this.selectedMethod.pk_methodID && !this.method_name) {
      this._VendorsService.snackBar("New Method was not specified correctly");
      return;
    }
    if (!this.selectedLocation.pk_locationID && !this.location_name) {
      this._VendorsService.snackBar("New Location was not specified correctly");
      return;
    }
    const { run, setup } = this.runSetup.getRawValue();
    if (this.areaValue === "") {
      this._VendorsService.snackBar("Imprint AREA has not been defined correctly.");
      return;
    };

    if (this.defaultImprintColorSpecification) {
      if (!this.collectionIdsArray.length && !this.customColorId) {
        this._VendorsService.snackBar("Select a color collection");
        return;
      };
    };

    if (run === "" || setup === "") {
      this._VendorsService.snackBar("Select a SETUP or RUN charge");
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
      fk_standardImprintGroupID: this.imprintData.pk_standardImprintGroupID,
      name: this.imprintName,
      fk_decoratorID: this.selectedSupplier.pk_companyID,
      fk_methodID: this.selectedMethod.pk_methodID,
      method_name: this.method_name,
      location_name: this.location_name,
      fk_locationID: this.selectedLocation.pk_locationID,
      fk_setupChargeID: setup,
      fk_runChargeID: run,
      blnIncludable: this.priceInclusionSelected.value,
      area: this.areaValue,
      blnUserColorSelection: this.defaultImprintColorSpecification,
      maxColors: this.defaultImprintColorSpecification ? this.maxColorSelected : null,
      fk_multiColorMinQID: 1,
      fk_collectionID: this.collectionIdsArray.length ? this.selectedCollectionId[0].fk_collectionID : Number(this.customColorId),
      blnColorProcess: colorProcess,
      blnStitchProcess: stitchProcess,
      blnSingleProcess: singleProcess,
      minProductQty: this.minQuantity,
      imprintComments: this.addImprintComment ? " " : this.addImprintComment,
      fk_digitizerID: this.selectedDigitizer.pfk_digitizerID || null,
      displayOrder: this.addImprintDisplayOrderValue,
      blnSingleton: this.imprintItselfSelected.value,
      add_standard_imprint: true
    }
    this.addImprintLoader = true;
    if (processMode == 0) {
      this._VendorsService.getMultiColorValue(second, third, fourth, fifth).pipe(takeUntil(this._unsubscribeAll))
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
    this._VendorsService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((response) => {
      if (response["success"]) {
        this.location_name = '';
        this.method_name = '';
        this.selectedLocation = { locationName: 'New Location >>>', pk_locationID: null };
        this.selectedMethod = this.addImprintMethods.find(x => x.pk_methodID === 254) || this.addImprintMethods[0];
        this.getStandardImprints();
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
  // Update Imprint
  updateNewStandardImprint() {
    if (!this.selectedMethod.pk_methodID && !this.method_name) {
      this._VendorsService.snackBar("New Method was not specified correctly");
      return;
    }
    if (!this.selectedLocation.pk_locationID && !this.location_name) {
      this._VendorsService.snackBar("New Location was not specified correctly");
      return;
    }
    const { run, setup } = this.runSetup.getRawValue();
    if (this.areaValue === "") {
      this._VendorsService.snackBar("Imprint AREA has not been defined correctly.");
      return;
    };

    if (this.defaultImprintColorSpecification) {
      if (!this.collectionIdsArray.length && !this.customColorId) {
        this._VendorsService.snackBar("Select a color collection");
        return;
      };
    };

    if (run === "" || setup === "") {
      this._VendorsService.snackBar("Select a SETUP or RUN charge");
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

    let payload: UpdateStandardImprint = {
      standardImprintGroupID: this.imprintData.pk_standardImprintGroupID,
      name: this.imprintName,
      fk_decoratorID: this.selectedSupplier.pk_companyID,
      fk_methodID: this.selectedMethod.pk_methodID,
      method_name: this.method_name,
      location_name: this.location_name,
      fk_locationID: this.selectedLocation.pk_locationID,
      fk_setupChargeID: setup,
      fk_runChargeID: run,
      blnIncludable: this.priceInclusionSelected.value,
      area: this.areaValue,
      blnUserColorSelection: this.defaultImprintColorSpecification,
      maxColors: this.defaultImprintColorSpecification ? this.maxColorSelected : null,
      fk_multiColorMinQID: 1,
      fk_collectionID: this.collectionIdsArray.length ? this.selectedCollectionId[0].fk_collectionID : Number(this.customColorId),
      blnColorProcess: colorProcess,
      blnStitchProcess: stitchProcess,
      blnSingleProcess: singleProcess,
      minProductQty: this.minQuantity,
      imprintComments: this.addImprintComment ? " " : this.addImprintComment,
      fk_digitizerID: this.selectedDigitizer.pfk_digitizerID || null,
      displayOrder: this.addImprintDisplayOrderValue,
      blnSingleton: this.imprintItselfSelected.value,
      pk_standardImprintID: this.imprintData.imprintData.pk_standardImprintID,
      update_standard_imprint: true
    }
    this.addImprintLoader = true;
    if (processMode == 0) {
      this._VendorsService.getMultiColorValue(second, third, fourth, fifth).pipe(takeUntil(this._unsubscribeAll))
        .subscribe((multi_color) => {
          multiValue = multi_color["data"];
          payload.fk_multiColorMinQID = multiValue?.length ? multiValue[0].pk_multiColorMinQID : 1;
          this.updateStandardImprintOBJ(payload);
        }, err => {
          this.addImprintLoader = false;
          this._changeDetectorRef.markForCheck();
        });
    } else {
      this.updateStandardImprintOBJ(payload);
    }
  }
  updateStandardImprintOBJ(payload) {
    this._VendorsService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((response) => {
      if (response["success"]) {
        this._VendorsService.snackBar('Standard Imprint Updated Successfully');
        this.imprintData.imprintData.decoratorName = this.selectedSupplier.companyName;
        this.imprintData.imprintData.locationName = this.selectedLocation.locationName;
        this.imprintData.imprintData.methodName = this.selectedMethod.methodName;
        this.imprintData.imprintData.area = payload.area;
        this.imprintData.imprintData.blnColorProcess = payload.blnColorProcess;
        this.imprintData.imprintData.blnIncludable = payload.blnIncludable == 'Yes' ? false : true;
        this.imprintData.imprintData.blnSingleProcess = payload.blnSingleProcess;
        this.imprintData.imprintData.blnSingleton = payload.blnSingleton == 'Yes' ? false : true;
        this.imprintData.imprintData.blnStitchProcess = payload.blnStitchProcess;
        this.imprintData.imprintData.blnUserColorSelection = payload.blnUserColorSelection == 'Yes' ? false : true;
        this.imprintData.imprintData.displayOrder = payload.displayOrder;
        this.imprintData.imprintData.fk_collectionID = payload.fk_collectionID;
        this.imprintData.imprintData.fk_decoratorID = payload.fk_decoratorID;
        this.imprintData.imprintData.fk_digitizerID = payload.fk_digitizerID;
        this.imprintData.imprintData.fk_locationID = payload.fk_locationID;
        this.imprintData.imprintData.fk_methodID = payload.fk_methodID;
        this.imprintData.imprintData.fk_multiColorMinQID = payload.fk_multiColorMinQID;
        this.imprintData.imprintData.fk_runChargeID = payload.fk_runChargeID;
        this.imprintData.imprintData.fk_setupChargeID = payload.fk_setupChargeID;
        this.imprintData.imprintData.imprintComments = payload.imprintComments;
        this.imprintData.imprintData.maxColors = payload.maxColors;
        this.imprintData.imprintData.minProductQty = payload.minProductQty;
        this.imprintData.imprintData.name = payload.name;

        console.log(this.imprintData);
        this.addImprintLoader = false;
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
  // GEt Imprints
  getStandardImprints() {
    let params = {
      imprint: true,
      standard_group_id: this.imprintData.pk_standardImprintGroupID,
      standard_imprint: true,
      page: 1,
      size: 10
    }
    this._VendorsService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.imprintData.sub_imprints = res["data"];
      this.imprintData.sub_imprints_total = res["totalRecords"];
      this._VendorsService.snackBar('Imprint Added Successfully');
      this.addImprintLoader = false;
      this.imprintData.subLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.addImprintLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  changeProcessMode(ev) {
    if (ev.value == 1) {
      let digitizer = this.addImprintDigitizers.filter(digitizer => digitizer.pk_companyID == this.selectedSupplier.pk_companyID);
      if (digitizer) {
        this.selectedDigitizer = digitizer[0];
      }
      this._changeDetectorRef.markForCheck();
    }
  }
  changeSupplerSelection() {
    let digitizer = this.addImprintDigitizers.filter(digitizer => digitizer.pk_companyID == this.selectedSupplier.pk_companyID);
    if (digitizer) {
      this.selectedDigitizer = digitizer[0];
    }
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
