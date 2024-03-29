import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { add_setup_charge } from '../../vendors.types';
import { VendorsService } from '../../vendors.service';

@Component({
  selector: 'app-imprint-run',
  templateUrl: './imprint-run.component.html',
  styles: ['.col-width {width: 11.11%} .data-width {width: 100px}']
})
export class SystemImprintRunComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  processQuantities = new Array(30);
  productQuantities = new Array(8);
  horizontalArray = new Array(8);
  ngChargeCode = 0;
  ngCostCode: any = 0;
  getChargesLoader: boolean = false;
  chargesTableArray: any;

  isNewCharge: boolean = false;
  runSetupLoaderFetching: boolean;
  runSetupDistributorCodes: any;

  newChargeValue = 0;

  createNewChargeLoader: boolean = false;
  currentChargeValue: any;
  errMsg = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _VendorsService: VendorsService,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.getRunSetup();
    const length = this.productQuantities.length;
    const process_length = this.processQuantities.length;
    for (let index = 0; index < length; index++) {
      if (index == 0) {
        this.productQuantities[0] = { value: 1 };
      } else {
        this.productQuantities[index] = { value: '' };
      }
    }
    for (let index = 0; index < process_length; index++) {
      if (index == 0) {
        this.processQuantities[0] = { value: 1, quantitiesVal: [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }] };
      } else {
        this.processQuantities[index] = { value: '', quantitiesVal: [{ value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }, { value: '' }] };
      }
    }

  };
  addValues(length) {
    for (let index = 1; index <= length; index++) {
      this.processQuantities[index].value = this.processQuantities[index - 1].value + 1;
      this.processQuantities[0].quantitiesVal.forEach((element, i) => {
        if (element.value) {
          this.processQuantities[index].quantitiesVal[i].value = this.processQuantities[index].value * element.value;
        }
      });
    }
  }
  createObj() {
    let array = [];
    this.processQuantities.forEach((element, i) => {
      if (element.value) {
        element.quantitiesVal.forEach((item, j) => {
          if (element.value && this.productQuantities[j].value) {
            array.push(
              {
                process_quantity: element.value,
                product_quantity: this.productQuantities[j].value,
                charge: item.value
              }
            )
          }
        });
      }
    });
    let payload: add_setup_charge = {
      dist_code: this.newChargeValue,
      quantities: array,
      add_charge_setup: true
    }
    this.createNewChargeLoader = true;
    this._VendorsService.AddSystemData(payload).subscribe(res => {
      this.createNewChargeLoader = false;
      this.currentChargeValue = res["new_charge"];
      this.isNewCharge = false;
      this._snackBar.open('Note: Charge was added successfully! Click the button to assign it to the imprint', '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.createNewChargeLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getCharges() {
    this.currentChargeValue = null;
    this.isNewCharge = false;
    const charge = this.ngChargeCode;
    const distrDiscount = this.ngCostCode.distrDiscount;
    const roundedDiscount = distrDiscount;
    const intCharge = Number(charge);
    let chargeValue = intCharge * (1 - roundedDiscount);
    chargeValue = Math.round(chargeValue * 10000) / 10000;
    this.getChargesLoader = true;
    this._VendorsService.getChargeValue(chargeValue)
      .subscribe((charges) => {
        if (!charges["data"]?.length) {
          const errorLog = `No charges containing ${intCharge} x (1-${roundedDiscount}) = ${chargeValue} were found. Check your inputs or add a new charge.`;
          this.errMsg = errorLog
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

        this._VendorsService.getChargeValuesData(chargeArray.toString())
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
                  const charge = data[0].charge;
                  combinedChunkArray.push([processQuantities[j], productQuantities[k], Math.round(charge * 1000) / 1000]);
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

  addNewChargeToggle() {
    this.currentChargeValue = null;
    this.chargesTableArray = [];
    this.isNewCharge = true;
  }
  setRun(e, value) {
    e.preventDefault();
    this._VendorsService.run = value;
    this._snackBar.open('Run assigned successfully', '', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 3500
    });
    this._changeDetectorRef.markForCheck();
  };

  setSetup(e, value) {
    e.preventDefault();
    this._VendorsService.setup = value;
    this._snackBar.open('Setup assigned successfully', '', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 3500
    });
    this._changeDetectorRef.markForCheck();
  };
  getRunSetup() {
    this.runSetupLoaderFetching = true;
    this._VendorsService.distributionCodes$
      .subscribe((response) => {
        this.runSetupLoaderFetching = false;
        this.runSetupDistributorCodes = response["data"];
        this.ngCostCode = this.runSetupDistributorCodes[0];
        this.newChargeValue = this.runSetupDistributorCodes[0].distrDiscount;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };
  setCurrentRun() {
    this._VendorsService.run = this.currentChargeValue;
    this._snackBar.open('Run assigned successfully', '', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 3500
    });
    this._changeDetectorRef.markForCheck();
  };

  setCurrentSetup() {
    this._VendorsService.setup = this.currentChargeValue;
    this._snackBar.open('Setup assigned successfully', '', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 3500
    });
    this._changeDetectorRef.markForCheck();
  };
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}

