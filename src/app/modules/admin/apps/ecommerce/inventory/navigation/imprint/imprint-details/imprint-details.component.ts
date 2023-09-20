import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { AuthService } from 'app/core/auth/auth.service';
import { AddDuplicateImprint, DeleteProductImprint, DeleteProductSingleImprint } from '../../../inventory.types';
import { stringify } from 'crypto-js/enc-base64';

@Component({
  selector: 'app-imprint-details',
  templateUrl: './imprint-details.component.html',
})
export class ImprintDetailsComponent implements OnInit, OnDestroy {
  @Output() dataEvent = new EventEmitter<string>();

  @Input() imprint: any;
  isLoading: boolean = false;
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
  colorData: any = [];
  colorDataLoader: boolean = false;

  runProcesses = [];
  runQuantity = [];
  setupProcesses = [];
  setupQuantity = [];

  // Duplicate Imprint
  isDuplicateImprint: boolean = false;
  addImprintMethods = [];
  selectedMethod: any;
  methodControl = new FormControl('');
  locationControl = new FormControl('');

  location_name = '';
  method_name = '';
  addImprintLocations = [];
  selectedLocation: any;
  isAddDuplicateLoader: boolean = false;

  methodSearchControl = new FormControl();
  isSearchingImprints = false;
  locationSearchControl = new FormControl();
  isSearchingLocation = false;
  minLengthTerm = 3;

  not_available = 'N/A';
  isDeleteLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _snackBar: MatSnackBar,
  ) { }
  methodSelected(obj) {
    this.selectedMethod = obj.option.value;
    this._changeDetectorRef.markForCheck();
  }
  locationSelected(obj) {
    this.selectedLocation = obj.option.value;
    this._changeDetectorRef.markForCheck();
  }
  ngOnInit(): void {
    this.methodSearchControl.setValue({ methodName: 'New Method >>>', pk_methodID: null });
    this.methodSearchControl.valueChanges.pipe(
      filter((res: any) => {
        return res !== null && res.length >= this.minLengthTerm
      }),
      distinctUntilChanged(),
      debounceTime(500),
      tap(() => {
        this.addImprintMethods = [];
        this.isSearchingImprints = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._inventoryService.getAllImprintMethods(value)
        .pipe(
          finalize(() => {
            this.isSearchingImprints = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.addImprintMethods.push({ methodName: 'New Method >>>', pk_methodID: null });
      this.addImprintMethods = this.addImprintMethods.concat(data["data"]);
    });

    this.locationSearchControl.setValue({ locationName: 'New Location >>>', pk_locationID: null });
    this.locationSearchControl.valueChanges.pipe(
      filter(res => {
        return res !== null && res.length >= this.minLengthTerm
      }),
      distinctUntilChanged(),
      debounceTime(500),
      tap(() => {
        this.addImprintLocations = [];
        this.isSearchingLocation = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._inventoryService.getAllImprintLocations(value)
        .pipe(
          finalize(() => {
            this.isSearchingLocation = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.addImprintLocations.push({ locationName: 'New Location >>>', pk_locationID: null });
      this.addImprintLocations = this.addImprintLocations.concat(data["data"]);
    });

    this.isLoading = true;
    this.getAddImprintLocations();
    this.getAddImprintMethods();
    this.getMultiColorRestricton();
    this.getCharges();
  };
  displayWith(value: any) {
    return value?.methodName;
  }
  displayWithLocation(value: any) {
    return value?.locationName;
  }
  getMultiColorRestricton() {
    this.colorDataLoader = true;
    let params = {
      imprint: true,
      decoration: true,
      multi_color_limit: true,
      min_color_quantity_id: this.imprint.fk_multiColorMinQID
    };
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.colorData = res["data"][0];
      this.colorDataLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.colorDataLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getCharges() {
    let params = {
      imprint: true,
      decoration: true,
      charge_distribution: true,
      charge_id: this.imprint.fk_runChargeID
    };
    let run = [];
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        if (run.length == 0) {
          run.push({ process: element.processQuantity, data: [element] });
        } else {
          const index = run.findIndex(item => item.process == element.processQuantity);
          if (index > -1) {
            run[index].data.push(element);
          } else {
            run.push({ process: element.processQuantity, data: [element] });
          }
        }
      });
      this.runProcesses = run;
      if (run.length) {
        this.runQuantity = run[0].data;
      }
      this.getSetupChages();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getSetupChages() {
    let params = {
      imprint: true,
      decoration: true,
      charge_distribution: true,
      charge_id: this.imprint.fk_setupChargeID
    };
    let run = [];
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        if (run.length == 0) {
          run.push({ process: element.processQuantity, data: [element] });
        } else {
          const index = run.findIndex(item => item.process == element.processQuantity);
          if (index > -1) {
            run[index].data.push(element);
          } else {
            run.push({ process: element.processQuantity, data: [element] });
          }
        }
      });
      this.setupProcesses = run;
      if (run.length) {
        this.setupQuantity = run[0].data;
      }
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  duplicateImprint() {
    this.isDuplicateImprint = true;
  }
  backToDetails() {
    this.isDuplicateImprint = false;
  }
  getAddImprintMethods() {
    this.addImprintMethods = [];
    this._inventoryService.imprintMethods$.pipe(takeUntil(this._unsubscribeAll)).subscribe((methods) => {
      this.addImprintMethods.push({ methodName: 'New Method >>>', pk_methodID: null });
      this.addImprintMethods = [...this.addImprintMethods, ...methods["data"]];


      this.selectedMethod = this.addImprintMethods.find(x => x.pk_methodID === 254) || this.addImprintMethods[0];
      this.methodControl.setValue(this.selectedMethod.methodName);

      // Mark for check
      this._changeDetectorRef.markForCheck();
    })
  };
  getAddImprintLocations() {
    this.addImprintLocations = [];
    this._inventoryService.imprintLocations$.pipe(takeUntil(this._unsubscribeAll)).subscribe((location) => {
      this.addImprintLocations.push({ locationName: 'New Location >>>', pk_locationID: null });
      this.addImprintLocations = [...this.addImprintLocations, ...location["data"]];
      this.selectedLocation = { locationName: 'New Location >>>', pk_locationID: null };
      this.locationControl.setValue(this.selectedLocation.locationName);
      // Mark for check
      this._changeDetectorRef.markForCheck();
    });
  }
  addDuplicateImprint() {
    if (!this.selectedMethod.pk_methodID && this.method_name == '') {
      this._snackBar.open('Please select any method', '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    if (!this.selectedLocation.pk_locationID && this.location_name == '') {
      this._snackBar.open('Please select any location', '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    let payload: AddDuplicateImprint = {
      product_id: this.imprint.fk_productID,
      imprint_id: this.imprint.pk_imprintID,
      method_id: this.selectedMethod.pk_methodID,
      method_name: this.method_name,
      location_id: this.selectedLocation.pk_locationID,
      location_name: this.location_name,
      duplicate_imprint: true
    }
    this.isAddDuplicateLoader = true;
    this._inventoryService.addDuplicateImprint(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._inventoryService.duplicateCheck = true;
      this._snackBar.open('Duplicate imprint created successfully', '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this.isAddDuplicateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddDuplicateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  deleteImprintById() {
    this.isDeleteLoader = true;
    let payload: DeleteProductSingleImprint = {
      imprintID: this.imprint.pk_imprintID,
      productID: this.imprint.fk_productID,
      delete_product_single_imprint: true
    }
    this._inventoryService.updateProductsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"] == 'true') {
        this._snackBar.open(res["message"], '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        let data = {
          id: this.imprint.pk_imprintID,
          type: 'delete'
        }
        const dataToSend = JSON.stringify(data);
        this.dataEvent.emit(dataToSend);
      } else {
        this._snackBar.open(res["message"], '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
      }
      this.isDeleteLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isDeleteLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateImprint() {
    const dataToSend = JSON.stringify(this.imprint);
    this.dataEvent.emit(dataToSend);
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

