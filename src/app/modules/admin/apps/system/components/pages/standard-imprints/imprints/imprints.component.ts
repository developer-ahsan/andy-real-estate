import { ENTER, COMMA, P } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, Subject } from 'rxjs';
import { finalize, map, startWith, takeUntil } from 'rxjs/operators';
import { AddColor, AddImprintColor, AddImprintMethod, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod } from '../../../system.types';
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
    this.getAddImprintDigitizers();
    this.getAddImprintMethods();
    this.getAddImprintLocations();
    this.getAllSuppliers();
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
          const { fk_digitizerID } = data
          this.selectedDigitizer = this.addImprintDigitizers.find(x => x.pfk_digitizerID === fk_digitizerID) || this.addImprintDigitizers[0];
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
          const { pk_methodID } = data
          this.selectedMethod = this.addImprintMethods.find(x => x.pk_methodID === pk_methodID) || this.addImprintMethods[0];
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
          const { pk_locationID } = data
          this.selectedLocation = this.addImprintLocations.find(x => x.pk_locationID === pk_locationID) || this.addImprintLocations[0];
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
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
