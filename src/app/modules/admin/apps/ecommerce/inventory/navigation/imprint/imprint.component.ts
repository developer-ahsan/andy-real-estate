import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html'
})
export class ImprintComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  chargeDistribution: FormGroup;
  runSetup: FormGroup;

  displayedColumns: string[] = ['location', 'method', 'decorator', 'active', 'action'];
  imprintDisplayedColumns: string[] = ['id', 'name', 'decorator', 'order'];
  dataSource = [];
  dataSource2 = [];

  overlapData = null;
  overlapCheckboxPayload = [];
  overlapFirstData = [];
  overlappingIterativeData = [];
  overlappingPayloadArray = [];
  overlappingUpdateLoader = false;
  overLapDataFetchLoader = false;

  istestPricingScreenLoader = false;
  testPricingLoad = false;

  foods = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];
  values: FormGroup;

  selectedSupplier = null;
  selectedMethod = null;
  selectedLocation = null;
  selectedDigitizer = null;

  chargesTableArray = [];

  runSetupLoaderFetching = false;
  getChargesLoader = false;
  runSetupDistributorCodes = [];
  selectedDiscountCode;

  files;
  imprints = [];
  dataSourceLength: number = 0;
  dataSource2Length: number = 0;
  page: number = 1;
  flashMessage: 'success' | 'error' | 'countError' | null = null;

  priceInclusionForm: FormGroup;
  testPricingForm: FormGroup;

  standardImprintAddLoader = false;

  suppliers = [];
  addImprintLocations = [];
  addImprintMethods = [];
  addImprintDigitizers = [];

  favoriteSeason: string = "Per color (i.e. silk screening, pad printing, etc.)";
  defaultImprintColorSpecification = "Yes";

  seasons: string[] = [
    'Per color (i.e. silk screening, pad printing, etc.)',
    'Per Stitch (embroidering)',
    'Simple Process (i.e. laser engraving, full color, etc.)'
  ];

  specifyImrpintArray: string[] = [
    'Yes',
    'No'
  ];

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
  minValue: number = 1;
  displayOrder: number = 1;
  commentText = "";

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
  areaValue = "";
  minQuantity: number;
  addImprintComment;
  addImprintDisplayOrderValue;

  imprintItselfSelected = this.imprintItself[0];

  standardImprints = [];
  testPricingDataSource = [];
  testPricingDataSourceLength: number;

  priceInclusionDataSource = [];

  priceInclusionRunDataSource = [];
  priceInclusionSetupDataSource = [];

  priceInclusionFinalArray = [];

  priceInclusionIdsArraytoUpdate = [];

  collectionIdsArray = [];
  selectedCollectionId;

  priceInclusionObj = null;

  maxColors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  maxColorSelected = 1;

  testPricingNumbers = [
    1, 2, 3, 4, 5, 6, 7, 8, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
    11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000,
    21000, 22000, 23000, 24000, 25000, 26000, 27000, 28000, 29000, 30000
  ];
  isCountZero = false;
  editImprintObj;

  imprintDisplayOrderArray = [];

  isSelectAll = false;
  isSubValuesSelectAll = false;

  // boolean
  displayOrderUpdateLoader = false;
  updateImprintLoader = false;
  imprintList = true;
  displayList = true;
  priceInclusionLoader = false;
  priceInclusionDataLoader = false;
  updateLoader = false;
  deleteLoader = false;
  testPricingLoader = false;
  mainButtonToggleDisable = false;
  standardImprintLoader = false;
  addImprintLoader = false;
  getImprintColorCollectionLoader = false;

  isPriceInclusionToggleButtonDisable = true;
  priceInclusionUpdateLoader = false;

  isEditImprintScreen = false;

  showImprintScreen = "";

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _snackBar: MatSnackBar,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {

    this.chargeDistribution = this._formBuilder.group({
      charge: [0]
    })

    this.runSetup = this._formBuilder.group({
      run: [''],
      setup: ['']
    })

    // Defalut selected button toggle
    this.showImprintScreen = 'Imprints';
    this.getImprints(this.page);
    this.getSuppliers();
    this.getAllImprints();

    this.priceInclusionForm = this._formBuilder.group({
      checkBox: ['']
    })

    this.values = this._formBuilder.group({
      twoColorQ: [1],
      threeColorQ: [1],
      fourColorQ: [1],
      fiveColorQ: [1]
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
            this.standardImprintLoader = false;

            // Mark for Check
            this._changeDetectorRef.markForCheck();
          });
      });
  };

  overlapingData(source, destination) {
    const { pk_locationID } = source;
    const overlapObj = {
      source: source,
      destination: destination
    };

    const objFound = this.overlappingPayloadArray.find(x => x.source.pk_locationID === pk_locationID);
    if (objFound) {
      objFound.destination = destination;
    } else {
      this.overlappingPayloadArray.push(overlapObj);
    };
  };

  checkBoxOverlap(sourceObj, destObj): void {
    let tempObj = {
      loc_1: destObj.locationId,
      loc_2: sourceObj.locationId
    }
    if (this.containsObject(tempObj, this.overlapCheckboxPayload)) {
      const index = this.overlapCheckboxPayload.findIndex(x => x.loc_1 === tempObj.loc_1 && x.loc_2 === tempObj.loc_2);
      if (index > -1) {
        this.overlapCheckboxPayload.splice(index, 1);
      }
    } else {
      this.overlapCheckboxPayload.push(tempObj)
    };
  }

  getOverlapData() {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getOverlapData(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((overlap) => {
        this.overlapFirstData = overlap["data"];

        for (const overlap of this.overlapFirstData) {
          const { fk_locationID1, fk_locationID2 } = overlap;
          const obj = {
            loc_1: fk_locationID1,
            loc_2: fk_locationID2
          }
          this.overlapCheckboxPayload.push(obj);
        }

        if (overlap["data"]?.length) {
          this.overlapData = overlap["data"].reduce(function (r, a) {
            r[a.fk_locationID1] = r[a.fk_locationID1] || [];
            r[a.fk_locationID1].push(a);
            return r;
          }, Object.create(null));
        };

        const temporaryArray = this.overlappingIterativeData;
        const temporaryArrayInner = this.overlappingIterativeData;
        let result: any = temporaryArray.map(a => a.pk_locationID);
        result = result.flatMap(
          (v, i) => result.slice(i + 1).map(w => [w, v])
        )

        let toBeOverlapped = [];
        for (let i = 0; i < temporaryArray.length; i++) {
          const { pk_imprintID, pk_locationID, locationName } = temporaryArray[i];
          let obj = {
            imprintId: pk_imprintID,
            locationId: pk_locationID,
            locationName: locationName
          };
          let inner = [];
          for (let j = 0; j < temporaryArrayInner.length; j++) {
            const { pk_imprintID, pk_locationID, locationName } = temporaryArrayInner[j];
            let innerObj = {};
            let checkObj = this.overlapFirstData.filter(x => x.fk_locationID1 === temporaryArray[i].fk_locationID && x.fk_locationID2 === temporaryArrayInner[j].fk_locationID);
            innerObj = {
              imprintId: pk_imprintID,
              locationId: pk_locationID,
              locationName: locationName,
              isSelected: checkObj?.length ? true : false
            };
            inner.push(innerObj);
          }
          obj["overlappedArray"] = inner;
          toBeOverlapped.push(obj);
        };

        this.overlappingIterativeData = toBeOverlapped;

        this.overLapDataFetchLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  containsObject(obj, list) {
    for (const listObj of list) {
      const { loc_1, loc_2 } = listObj;
      if (loc_1 === obj.loc_1 && loc_2 === obj.loc_2) {
        return true;
      }
    }
    return false;
  }

  updateOverlapping() {
    const { pk_productID } = this.selectedProduct;

    const dedup = [...this.overlapCheckboxPayload.reduce((map, { loc_1, loc_2 }) => {
      return (map.set(`${loc_1}-${loc_2}`, { loc_1, loc_2 }));
    }, new Map()).values()];

    const payload = {
      product_id: pk_productID,
      pairs: dedup,
      imprint_overlap: true
    };

    this.overlappingUpdateLoader = true;
    this._inventoryService.updateImprintOverlapping(payload)
      .subscribe((response) => {
        this.overlappingUpdateLoader = false;
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  getRunSetup() {
    this.runSetupLoaderFetching = true;
    this._inventoryService.getSystemDistributorCodes()
      .subscribe((response) => {
        this.runSetupLoaderFetching = false;
        this.runSetupDistributorCodes = response["data"];
        this.selectedDiscountCode = this.runSetupDistributorCodes[0];

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getCharges() {
    const chargeForm = this.chargeDistribution.getRawValue();
    const { charge } = chargeForm;
    const { distrDiscount } = this.selectedDiscountCode;
    const intCharge = parseInt(charge);
    const chargeValue = intCharge * (1 - distrDiscount);

    this.getChargesLoader = true;
    this._inventoryService.getChargeValue(chargeValue)
      .subscribe((charges) => {
        if (!charges["data"]?.length) {
          const errorLog = `No charges containing ${intCharge} x (1-${distrDiscount}) = ${chargeValue} were found. Check your inputs or add a new charge.`;
          this._snackBar.open(errorLog, '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.getChargesLoader = false;
          this.chargesTableArray = [];

          // Mark for check
          this._changeDetectorRef.markForCheck();
          return;
        }

        let chargeArray = [];
        for (const response of charges["data"]) {
          const { fk_chargeID } = response;
          chargeArray.push(fk_chargeID)
        };

        this._inventoryService.getChargeValuesData(chargeArray.toString())
          .subscribe((chargeValues) => {
            this.getChargesLoader = false;

            const responseArray = chargeValues["data"];
            var array = responseArray,
              grouped = Array.from(array.reduce((m, o) =>
                m.set(o.fk_chargeID, (m.get(o.fk_chargeID) || []).concat(o)), new Map).values());

            let tempArray = [];
            for (const group of grouped) {
              let array: any = group;
              const obj = {
                groupedObj: array,
                uniqueProductQuantities: [...new Set(array.map(item => item.productQuantity))].sort(function (a: number, b: number) {
                  return a - b;
                }),
                uniqueProcessQuantity: [...new Set(array.map(item => item.processQuantity))].sort(function (a: number, b: number) {
                  return a - b;
                })
              };
              tempArray.push(obj);
            };

            for (let i = 0; i < tempArray.length; i++) {
              let array = tempArray[i].groupedObj;
              let combinedChunkArray = [];
              let processQuantities = tempArray[i]["uniqueProcessQuantity"];
              let productQuantities = tempArray[i]["uniqueProductQuantities"];
              let temporary = [];
              for (let j = 0; j < processQuantities.length; j++) {
                for (let k = 0; k < productQuantities.length; k++) {
                  const data = this.returnChargeValueForAddImrpint(processQuantities[j], productQuantities[k], array);
                  combinedChunkArray.push([processQuantities[j], productQuantities[k], data[0].charge])
                }
                temporary.push({
                  renderedArray: this.filterByIds(combinedChunkArray, processQuantities[j]),
                  verticalColumnName: processQuantities[j]
                });
              };

              tempArray[i]["rowsRendering"] = temporary;
              tempArray[i]["chargeId"] = array[0].fk_chargeID;
            };

            this.chargesTableArray = tempArray;

            // Mark for check
            this._changeDetectorRef.markForCheck();
          })
      });
  };

  setRun(e, value) {
    e.preventDefault();
    this.runSetup.controls['run'].setValue(value);
  };

  setSetup(e, value) {
    e.preventDefault();
    this.runSetup.controls['setup'].setValue(value);
  };

  filterByIds(data, value) {
    let temp = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === value) {
        temp.push(data[i]);
      }
    };
    return temp;
  }

  returnChargeValueForAddImrpint(processQuantity, productQuantity, array) {
    return array.filter(function (currentElement) {
      return currentElement.processQuantity === processQuantity && currentElement.productQuantity === productQuantity;
    });
  }

  combinationOfarrays(productArray: any, processArray: any) {
    return productArray.flatMap(d => processArray.map(v => [d, v]));
  }

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
    let imprintsToUpdate = [];
    for (const standardImprint of this.standardImprints) {
      const { sub_standard_imprints } = standardImprint;
      for (const sub_standard_imprint of sub_standard_imprints) {
        if (sub_standard_imprint.isChecked) {
          imprintsToUpdate.push(sub_standard_imprint);
        }
      }
      count = count + sub_standard_imprints.filter(function (s) { return s.isChecked }).length;
    };

    if (!count) {
      this.showFlashMessage('countError');
      return;
    }

    const { pk_productID } = this.selectedProduct;
    const finalImprintPaylaod = [];
    for (const imprint of imprintsToUpdate) {
      const {
        fk_decoratorID,
        fk_methodID,
        fk_locationID,
        fk_setupChargeID,
        fk_runChargeID,
        blnIncludable,
        area,
        blnUserColorSelection,
        maxColors,
        fk_multiColorMinQID,
        fk_collectionID,
        blnSingleProcess,
        minProductQty,
        imprintComments,
        fk_digitizerID,
        blnActive,
        blnSingleton,
        pk_standardImprintID,
        displayOrder
      } = imprint;
      const imprintObj = {
        product_id: pk_productID,
        decorator_id: fk_decoratorID,
        method_id: fk_methodID,
        location_id: fk_locationID,
        setup_charge_id: fk_setupChargeID,
        run_charge_id: fk_runChargeID,
        bln_includable: blnIncludable,
        area: area,
        bln_user_color_selection: blnUserColorSelection,
        max_colors: maxColors,
        multi_color_min_id: fk_multiColorMinQID,
        collection_id: fk_collectionID,
        bln_process_mode: blnSingleProcess,
        min_product_qty: minProductQty,
        imprint_comments: imprintComments,
        digitizer_id: fk_digitizerID,
        bln_active: blnActive,
        bln_singleton: blnSingleton,
        bln_color_selection: blnUserColorSelection,
        imprint_id: pk_standardImprintID,
        store_product_id_list: [],
        display_order: displayOrder
      };
      finalImprintPaylaod.push(imprintObj);
    }

    const payload = {
      standard_imprint: true,
      imprint_obj: finalImprintPaylaod
    };

    this.standardImprintAddLoader = true;
    this._inventoryService.addStandardImprints(payload)
      .subscribe((response) => {
        this.standardImprintAddLoader = false;

        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
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

        this.isLoadingChange.emit(false);

        // Mark for check
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
          obj["horizontalRunHeaders"] = obj.run.map(a => a.productQuantity);
          obj["verticalRunHeaders"] = obj.run.map(a => a.processQuantity);
          obj["horizontalRunHeaders"] = obj["horizontalRunHeaders"].filter(function (item, pos) {
            return obj["horizontalRunHeaders"].indexOf(item) == pos;
          })
          obj["verticalRunHeaders"] = obj["verticalRunHeaders"].filter(function (item, pos) {
            return obj["verticalRunHeaders"].indexOf(item) == pos;
          });

          let temp = [];
          for (let i = 0; i < obj["verticalRunHeaders"].length; i++) {
            let combinedChunkArray = [];
            for (let j = 0; j < obj["horizontalRunHeaders"].length; j++) {
              const data = this.returnChargeValueForRunTable(obj["verticalRunHeaders"][i], obj["horizontalRunHeaders"][j], obj.run);
              combinedChunkArray.push([obj["verticalRunHeaders"][i], obj["horizontalRunHeaders"][j], data[0].charge])
            }
            let object = {
              verticalColumnValue: obj["verticalRunHeaders"][i],
              combinationArray: combinedChunkArray
            }
            temp.push(object)
          };

          obj["combinedRunHeaders"] = temp;
          tempArray.push(obj);
        };

        this.priceInclusionFinalArray = tempArray;
        this.priceInclusionDataLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  onChangeEvent(event, data) {
    const { pk_imprintID } = data;
    const { value } = event.target;
    const intOrderValue = parseInt(value);
    const displayObj = {
      display_order: intOrderValue,
      imprint_id: pk_imprintID
    };

    let obj = this.imprintDisplayOrderArray.find(o => o.imprint_id === pk_imprintID);
    if (!obj) {
      this.imprintDisplayOrderArray.push(displayObj);
    } else {
      let objIndex = this.imprintDisplayOrderArray.findIndex((obj => obj.imprint_id == pk_imprintID));
      this.imprintDisplayOrderArray[objIndex].display_order = intOrderValue;
    }
  };

  findIndex(data, keyfield, value) {
    return data.indexOf(data.find(function (el, index) {
      return el[keyfield] === value;
    }));
  }

  updateImprintDisplay(): void {
    const payload = {
      display_order: this.imprintDisplayOrderArray,
      imprint_display_order: true
    };

    this.displayOrderUpdateLoader = true;
    this._inventoryService.updateDisplayOrder(payload)
      .subscribe((response) => {
        this.displayOrderUpdateLoader = false;
        const message = response["success"] === true
          ? "Imprint display order updated successfully."
          : "Some error occured. Please try again";

        this._snackBar.open(message, '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  updatePriceInclusion(): void {
    const { pk_productID } = this.selectedProduct;
    let idsAlreadySelected = [];
    for (const data of this.dataSource) {
      const { pk_imprintID, blnIncludable } = data;
      if (blnIncludable) {
        idsAlreadySelected.push(pk_imprintID)
      }
    };

    let tempArray = [];
    for (const imprint_id of this.priceInclusionIdsArraytoUpdate) {
      let obj = {
        imprint_id: imprint_id
      };
      obj["bln_include"] = idsAlreadySelected.includes(imprint_id) ? 0 : 1;
      tempArray.push(obj)
    }

    const payload = {
      product_id: pk_productID,
      imprint_list: tempArray,
      imprint_price_inclusion: true
    }

    this.priceInclusionUpdateLoader = true;
    this._inventoryService.updatePriceInclusion(payload)
      .subscribe((response) => {
        this.priceInclusionUpdateLoader = false;
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  selectPriceInclusion(data) {
    const { imprintObj } = data;
    const { pk_imprintID } = imprintObj;

    if (!this.priceInclusionIdsArraytoUpdate.includes(pk_imprintID)) {
      this.priceInclusionIdsArraytoUpdate.push(pk_imprintID)
    } else {
      var index = this.priceInclusionIdsArraytoUpdate.indexOf(pk_imprintID);
      if (index !== -1) {
        this.priceInclusionIdsArraytoUpdate.splice(index, 1);
      }
    }
  };

  updateData(): void {
    const {
      optionOneFirst,
      optionOneSecond,
      optionTwoFirst,
      optionTwoSecond,
      optionThreeFirst,
      optionThreeSecond,
      optionFourFirst,
      optionFourSecond
    } = this.testPricingForm.getRawValue();

    let array = [];

    if (optionOneFirst || optionOneSecond) {
      if (optionOneFirst && optionOneSecond) {
        const { pk_imprintID } = optionOneFirst;
        let Obj = {
          imprintId: pk_imprintID,
          processQuantity: optionOneSecond
        }
        array.push(Obj)
      } else {
        this._snackBar.open("Please fill out the respective fields", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        return;
      }
    }

    if (optionTwoFirst || optionTwoSecond) {
      if (optionTwoFirst && optionTwoSecond) {
        const { pk_imprintID } = optionTwoFirst;
        let Obj = {
          imprintId: pk_imprintID,
          processQuantity: optionTwoSecond
        };

        array.push(Obj)
      } else {
        this._snackBar.open("Please fill out the respective fields", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        return;
      }
    }

    if (optionThreeFirst || optionThreeSecond) {
      if (optionThreeFirst && optionThreeSecond) {
        const { pk_imprintID } = optionThreeFirst;
        let Obj = {
          imprintId: pk_imprintID,
          processQuantity: optionThreeSecond
        };

        array.push(Obj)
      } else {
        this._snackBar.open("Please fill out the respective fields", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        return;
      }
    }

    if (optionFourFirst || optionFourSecond) {
      if (optionFourFirst && optionFourSecond) {
        const { pk_imprintID } = optionFourFirst;
        let Obj = {
          imprintId: pk_imprintID,
          processQuantity: optionFourSecond
        };
        array.push(Obj)
      } else {
        this._snackBar.open("Please fill out the respective fields", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        return;
      }
    };

    if (!array.length) {
      this._snackBar.open("Please fill out the respective fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };

    this.testPricingLoad = true;

    let imprintIds = '';
    let processQuantities = '';
    for (const obj of array) {
      const { imprintId, processQuantity } = obj;
      imprintIds = imprintIds + `${imprintId},`;
      processQuantities = processQuantities + `${processQuantity},`;
    };
    const finalImprintIds = imprintIds.replace(/,(?=[^,]*$)/, '');
    const finalProcesses = processQuantities.replace(/,(?=[^,]*$)/, '');

    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getTestPricing(pk_productID, finalImprintIds, finalProcesses)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((testPricing) => {
        let tempObj;
        let tempArray = testPricing["data"];
        const maxValue = Math.max.apply(Math, tempArray.map(function (o) { return o[0].Profit; }));
        let largeProfitObj = tempArray.find(imprint => imprint[0].Profit === maxValue);
        let firstIndexObj = largeProfitObj[0];

        tempObj = {
          unibaseNetCost: firstIndexObj.productCost.toFixed(2),
          unibaseRetail: (firstIndexObj.productCost * 2).toFixed(2),
          orderBaseCount: firstIndexObj.orderBaseCount.toFixed(2),
          orderBasePrice: firstIndexObj.orderBasePrice.toFixed(2),
          orderGrandTotal: firstIndexObj.orderGrandTotal.toFixed(2),
          orderGrandCost: firstIndexObj.orderGrandCost.toFixed(2),
          orderGrandPercentage: (100 - ((firstIndexObj.orderGrandCost / firstIndexObj.orderGrandTotal) * 100)).toFixed(2),
          profit: firstIndexObj.Profit,
          totalSetupCost: firstIndexObj.setupCost,
          totalSetupPrice: firstIndexObj.setupPrice,
          orderRunCost: firstIndexObj.orderRunCost,
          orderRunPrice: firstIndexObj.orderRunPrice
        }
        let tempArray2 = [];
        for (const imprint of tempArray) {
          const { imprintID } = imprint[0];
          let name = this.testPricingDataSource.find(imprint => imprint.pk_imprintID === imprintID).locationName;
          let methodName = this.testPricingDataSource.find(imprint => imprint.pk_imprintID === imprintID).methodName;
          imprint[0]["imprintName"] = name;
          imprint[0]["methodName"] = methodName;
          tempArray2.push(imprint[0]);
        }
        tempObj["imprints"] = tempArray2;

        this.priceInclusionObj = tempObj;

        this.istestPricingScreenLoader = true;
        this.testPricingLoad = false;
        // Mark for Check
        this._changeDetectorRef.markForCheck();
      })
  };

  backToTestPricingForm() {
    this.testPricingForm.reset();
    this.istestPricingScreenLoader = false;
  }

  returnChargeValueForRunTable(processQuantity, productQuantity, run) {
    return run.filter(function (currentElement) {
      return currentElement.processQuantity === processQuantity && currentElement.productQuantity === productQuantity;
    });
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

  getUniqueListBy(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
  }

  calledScreen(screenName): void {
    if (screenName === "Display Order" || screenName === "Imprints") {
      this.isEditImprintScreen = false;
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

      if (screenName === "Overlapping") {
        this.overlappingIterativeData = this.testPricingDataSource.sort((a, b) => a["fk_locationID"] - b["fk_locationID"]);
        this.overlappingIterativeData = this.getUniqueListBy(this.overlappingIterativeData, "fk_locationID");
        this.overLapDataFetchLoader = true;
        this.getOverlapData();
      }
    }

    if (screenName === "Add Imprint") {
      this.selectedDigitizer = null;
      this.selectedMethod = null
      this.selectedLocation = null;
      this.selectedSupplier = null;
      this.getSuppliers();
      this.getAddImprintLocations();
      this.getAddImprintMethods();
      this.getAddImprintDigitizers();
    }

    if (screenName === "Standard Imprints") {
      if (!this.standardImprints.length) {
        this.standardImprintLoader = true;
        this.getStandardImprints();
      }
    }
    this.showImprintScreen = screenName;
  };

  addArea(value: string): void {
    this.areaValue = value;
  }

  addMinQuantity(value: number): void {
    this.minQuantity = value;
  }

  addImprintComments(value: string): void {
    this.addImprintComment = value;
  }

  addImprintDisplayOrder(value: number): void {
    this.addImprintDisplayOrderValue = value;
  }

  generateCollectionId() {
    this.getImprintColorCollectionLoader = true;
    const { pk_companyID } = this.selectedSupplier;
    this._inventoryService.getCollectionIds(pk_companyID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((collection_ids) => {
        this.collectionIdsArray = collection_ids["data"];
        this.collectionIdsArray = this.collectionIdsArray.filter((value, index, self) =>
          index === self.findIndex((t) => (
            t.place === value.place && t.fk_collectionID === value.fk_collectionID
          ))
        )

        if (!this.collectionIdsArray.length) {
          this._snackBar.open("No collections have been specified for this supplier.", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.getImprintColorCollectionLoader = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
          return;
        };

        if (this.collectionIdsArray.length) {
          this.selectedCollectionId = this.collectionIdsArray[0]
        }
        this.getImprintColorCollectionLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  uploadFile(event) {
    this.files = event.target.files;
  };

  addImprint() {
    const { pk_productID } = this.selectedProduct;
    const setupRunForm = this.runSetup.getRawValue();
    const { run, setup } = setupRunForm;

    if (!this.selectedLocation) {
      this._snackBar.open("New LOCATION was not specified correctly", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };

    if (this.areaValue === "") {
      this._snackBar.open("Imprint AREA has not been defined correctly.", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };

    if (!this.collectionIdsArray.length) {
      this._snackBar.open("Select a color collection", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });

      return;
    };

    if (run === "" || setup === "") {
      this._snackBar.open("Select a SETUP or RUN charge", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });

      return;
    };

    this.addImprintLoader = true;
    let processMode;
    if (this.favoriteSeason === 'Per color (i.e. silk screening, pad printing, etc.)') {
      processMode = 0;
    } else if (this.favoriteSeason === 'Per Stitch (embroidering)') {
      processMode = 1;
    } else if (this.favoriteSeason === 'Simple Process (i.e. laser engraving, full color, etc.)') {
      processMode = 2;
    };

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

    const payload = {
      product_id: pk_productID,
      decorator_id: this.selectedSupplier.pk_companyID || null,
      method_id: this.selectedMethod.pk_methodID || null,
      location_id: this.selectedLocation.pk_locationID || null,
      digitizer_id: this.selectedDigitizer.pfk_digitizerID || null,
      setup_charge_id: setup || 17,
      run_charge_id: run || 17,
      bln_includable: this.priceInclusionSelected.value === 'Yes' ? 1 : 0,
      area: this.areaValue,
      multi_color_min_id: 1,
      bln_user_color_selection: this.defaultImprintColorSpecification === 'Yes' ? 1 : 0,
      max_colors: this.defaultImprintColorSpecification === 'Yes' ? this.maxColorSelected : null,
      collection_id: this.collectionIdsArray.length ? this.selectedCollectionId.fk_collectionID : null,
      bln_process_mode: processMode,
      min_product_qty: this.minQuantity || 1,
      imprint_comments: this.addImprintComment || "",
      bln_active: 1,
      bln_singleton: this.imprintItselfSelected.value === 'Yes' ? true : false,
      bln_color_selection: this.defaultImprintColorSpecification === 'Yes' ? true : false,
      imprint_id: null,
      store_product_id_list: [],
      imprint_image: this.files || null,
      display_order: this.addImprintDisplayOrderValue || 1,
      imprint: true
    };

    if (payload.bln_process_mode === 0) {
      this._inventoryService.getMultiColorValue(second, third, fourth, fifth)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((multi_color) => {
          multiValue = multi_color["data"];
          payload.multi_color_min_id = multiValue?.length ? multiValue[0].pk_multiColorMinQID : 1;

          this._inventoryService.addImprintObj(payload)
            .subscribe((response) => {
              this.showFlashMessage(
                response["success"] === true ?
                  'success' :
                  'error'
              );
              this.addImprintLoader = false;

              // Mark for check
              this._changeDetectorRef.markForCheck();
            });
        });
      return;
    };

    this._inventoryService.addImprintObj(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.addImprintLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

  };

  showImprintList() {
    this.isEditImprintScreen = false;
  };

  updateImprint() {
    const { pk_productID } = this.selectedProduct;
    const setupRunForm = this.runSetup.getRawValue();
    const { pk_imprintID } = this.editImprintObj;
    const { run, setup } = setupRunForm;

    if (!this.selectedLocation) {
      this._snackBar.open("New LOCATION was not specified correctly", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };

    if (this.areaValue === "") {
      this._snackBar.open("Imprint AREA has not been defined correctly.", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };

    if (!this.collectionIdsArray.length) {
      this._snackBar.open("Select a color collection", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });

      return;
    };

    if (run === "" || setup === "") {
      this._snackBar.open("Select a SETUP or RUN charge", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });

      return;
    };

    this.updateImprintLoader = true;
    let processMode;
    if (this.favoriteSeason === 'Per color (i.e. silk screening, pad printing, etc.)') {
      processMode = 0;
    } else if (this.favoriteSeason === 'Per Stitch (embroidering)') {
      processMode = 1;
    } else if (this.favoriteSeason === 'Simple Process (i.e. laser engraving, full color, etc.)') {
      processMode = 2;
    };

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

    const payload = {
      product_id: pk_productID,
      decorator_id: this.selectedSupplier.pk_companyID || null,
      method_id: this.selectedMethod.pk_methodID || null,
      location_id: this.selectedLocation.pk_locationID || null,
      digitizer_id: this.selectedDigitizer.pfk_digitizerID || null,
      setup_charge_id: setup || 17,
      run_charge_id: run || 17,
      bln_includable: this.priceInclusionSelected.value === 'Yes' ? 1 : 0,
      area: this.areaValue,
      multi_color_min_id: 1,
      bln_user_color_selection: this.defaultImprintColorSpecification === 'Yes' ? 1 : 0,
      max_colors: this.defaultImprintColorSpecification === 'Yes' ? this.maxColorSelected : null,
      collection_id: this.collectionIdsArray.length ? this.selectedCollectionId.fk_collectionID : null,
      bln_process_mode: processMode,
      min_product_qty: this.minQuantity || 1,
      imprint_comments: this.addImprintComment || "",
      bln_active: 1,
      bln_singleton: this.imprintItselfSelected.value === 'Yes' ? true : false,
      bln_color_selection: this.defaultImprintColorSpecification === 'Yes' ? true : false,
      imprint_id: pk_imprintID,
      store_product_id_list: [],
      imprint_image: this.files || null,
      display_order: this.addImprintDisplayOrderValue || 1,
      imprint: true
    };

    if (payload.bln_process_mode === 0) {
      this._inventoryService.getMultiColorValue(second, third, fourth, fifth)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((multi_color) => {
          multiValue = multi_color["data"];
          payload.multi_color_min_id = multiValue?.length ? multiValue[0].pk_multiColorMinQID : 1;

          this._inventoryService.updateImprintObj(payload)
            .subscribe((response) => {
              this.showFlashMessage(
                response["success"] === true ?
                  'success' :
                  'error'
              );
              this.updateImprintLoader = false;

              // Mark for check
              this._changeDetectorRef.markForCheck();
            });
        });
      return;
    };

    this._inventoryService.updateImprintObj(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.updateImprintLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  editImprint(imprint) {
    this.editImprintObj = imprint;
    this.isEditImprintScreen = true;
    this.selectedDigitizer = null;
    this.selectedMethod = null;
    this.selectedLocation = null;
    this.selectedSupplier = null;
    this.collectionIdsArray = [];

    this.getSuppliers(imprint);
    this.getAddImprintMethods(imprint);
    this.getAddImprintLocations(imprint);
    this.getAddImprintDigitizers(imprint);

    const {
      area,
      blnUserColorSelection,
      maxColors,
      blnSingleton,
      blnIncludable,
      minProductQty,
      displayOrder,
      imprintComments,
      blnColorProcess,
      blnStitchProcess,
      blnSingleProcess,
      fk_setupChargeID,
      fk_runChargeID
    } = imprint;

    const runSetupObj = {
      run: fk_runChargeID,
      setup: fk_setupChargeID
    };

    this.runSetup.patchValue(runSetupObj);

    if (blnColorProcess) {
      this.favoriteSeason = this.seasons[0];
    } else if (blnStitchProcess) {
      this.favoriteSeason = this.seasons[1];
    } else if (blnSingleProcess) {
      this.favoriteSeason = this.seasons[2];
    }

    this.areaValue = area;
    this.defaultImprintColorSpecification = blnUserColorSelection ? 'Yes' : 'No';
    this.maxColorSelected = maxColors;
    this.imprintItselfSelected = blnSingleton ? this.imprintItself[0] : this.imprintItself[1];
    this.priceInclusionSelected = blnIncludable ? this.priceInclusionArray[0] : this.priceInclusionArray[1];
    this.minValue = minProductQty || 1;
    this.displayOrder = displayOrder || 1;
    this.commentText = imprintComments
  };

  getSuppliers(data?: any) {
    this._inventoryService.getAllSuppliers()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((suppliers) => {
        this.suppliers = suppliers["data"];
        this.selectedSupplier = this.suppliers[2];
        if (data) {
          const { pk_companyID } = data
          this.selectedSupplier = this.suppliers.find(x => x.pk_companyID === pk_companyID) || this.suppliers[2]
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  getAddImprintLocations(data?: any) {
    this._inventoryService.getAllImprintLocations()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((location) => {
        this.addImprintLocations = location["data"];
        if (data) {
          const { pk_locationID } = data
          this.selectedLocation = this.addImprintLocations.find(x => x.pk_locationID === pk_locationID) || this.addImprintLocations[0];
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  getAddImprintMethods(data?: any) {
    setTimeout(() => {
      this._inventoryService.getAllImprintMethods()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((methods) => {
          this.addImprintMethods = methods["data"];
          this.selectedMethod = this.addImprintMethods.find(x => x.pk_methodID === 254) || this.addImprintMethods[0];
          if (data) {
            const { pk_methodID } = data
            this.selectedMethod = this.addImprintMethods.find(x => x.pk_methodID === pk_methodID) || this.addImprintMethods[0];
          }

          // Mark for check
          this._changeDetectorRef.markForCheck();
        });
    }, 2000)
  };

  getAddImprintDigitizers(data?: any) {
    setTimeout(() => {
      this._inventoryService.getAllDigitizers()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((digitizers) => {
          this.addImprintDigitizers = digitizers["data"];
          this.selectedDigitizer = this.addImprintDigitizers[0];

          if (data) {
            const { fk_digitizerID } = data
            this.selectedDigitizer = this.addImprintDigitizers.find(x => x.pfk_digitizerID === fk_digitizerID) || this.addImprintDigitizers[0];
          }

          // Mark for check
          this._changeDetectorRef.markForCheck();
        });
    }, 4000)
  };

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
