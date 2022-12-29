import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { ImprintRunComponent } from 'app/modules/admin/apps/ecommerce/inventory/navigation/imprint/imprint-run/imprint-run.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SystemService } from '../../vendors.service';
import { UpdateCharge } from '../../vendors.types';

@Component({
  selector: 'app-imprint-charges',
  templateUrl: './imprint-charges.component.html',
  styles: ['.col-width {width: 11.11%} .data-width {width: 100px}']
})
export class ImprintChargesComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isSearching: boolean = false;
  ngChargeID = '';
  scrollStrategy: ScrollStrategy;

  chargeData: any;
  chargeUsedData: any;
  page = 0;
  totalRecords = 0;
  isViewMoreLoader: boolean = false;
  processQuantities = new Array(30);
  productQuantities = new Array(8);
  horizontalArray = new Array(8);
  mainScreen: string = 'Update Charges';
  isUpdateChargeLoader: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private readonly sso: ScrollStrategyOptions,
    private _systemService: SystemService,
    private _inventoryService: InventoryService
  ) {
    this.scrollStrategy = this.sso.noop();
  }

  ngOnInit(): void {
    this.getAllDistributionCodes();
    this.isLoadingChange.emit(false);
    this.initCharges();
  };
  calledScreen(value) {
    this.mainScreen = value;
    if (value == 'Charge is used') {
      if (!this.chargeUsedData) {
        this.getChargeUsedData();
      }
    }
  }
  initCharges() {
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
  }
  openModal() {
    const dialogRef = this.dialog.open(ImprintRunComponent, {
      // data: dialogData,
      minWidth: "300px",
      maxHeight: '90vh',
      scrollStrategy: this.scrollStrategy
    });
    dialogRef.afterClosed().subscribe(dialogResult => {
      // this.runSetup.patchValue({
      //   run: this._inventoryService.run,
      //   setup: this._inventoryService.setup
      // })
      if (dialogResult) {
      }
    });
  }
  getAllDistributionCodes() {
    this._inventoryService.distributionCodes$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._inventoryService.getSystemDistributorCodes().pipe(takeUntil(this._unsubscribeAll)).subscribe(codes => {
        });
      }
    });
  }
  getChargeData() {
    if (this.ngChargeID == '') {
      this._systemService.snackBar('Please Enter Charge ID');
      return;
    }
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    let params = {
      imprint: true,
      decoration: true,
      charge_distribution: true,
      charge_id: this.ngChargeID
    }
    let run = [];

    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.chargeData = res["data"];
      if (this.chargeData.length > 0) {
        res["data"].forEach((element, index) => {
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
        if (run.length) {
          run[0].data.forEach((element, index) => {
            this.productQuantities[index] = { value: element.productQuantity };
          });
          run.forEach((element, index) => {
            this.processQuantities[index].value = element.process;
            element.data.forEach((item, inner) => {
              this.processQuantities[index]['quantitiesVal'][inner] = { value: item.charge.toFixed(3) };
            });
          });
        }
      } else {
        this.backToList();
        this._systemService.snackBar('No charges are found for this id');
      }

      this.isSearching = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSearching = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  addValues(length) {
    for (let index = 1; index <= length; index++) {
      this.processQuantities[index].value = this.processQuantities[index - 1].value + 1;
      this.processQuantities[0].quantitiesVal.forEach((element, i) => {
        if (element.value) {
          this.processQuantities[index].quantitiesVal[i].value = (this.processQuantities[index].value * element.value).toFixed(3);
        }
      });
    }
  }
  getMoareData() {
    this.isViewMoreLoader = true;
    this.getChargeUsedData();
  }
  getChargeUsedData() {
    this.page++;
    let params = {
      imprint_charge_products: true,
      charge_id: this.ngChargeID,
      page: this.page
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!this.chargeUsedData) {
        this.chargeUsedData = res;
      } else {
        res["products"].forEach(element => {
          this.chargeUsedData.products.push(element);
        });
      }
      this.totalRecords = res['totalProducts'];
      this.isViewMoreLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isViewMoreLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Update Charge
  updateImprintCharge() {
    let ChargeValue = [];
    this.processQuantities.forEach((element, i) => {
      if (element.value) {
        element.quantitiesVal.forEach((item, j) => {
          if (element.value && this.productQuantities[j].value) {
            ChargeValue.push(
              {
                process_quantity: element.value,
                product_quantity: this.productQuantities[j].value,
                value: item.value
              }
            )
          }
        });
      }
    });
    let payload: UpdateCharge = {
      charge_id: Number(this.ngChargeID),
      charges: ChargeValue,
      update_imprint_charges: true
    }
    this.isUpdateChargeLoader = true;
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._systemService.snackBar('Charge distribution updated successfully');
      }
      this.isUpdateChargeLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateChargeLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backToList() {
    this.initCharges();
    this.chargeData = null;
    this.chargeUsedData = null;
    this.totalRecords = 0;
    this.page = 0;
    this.isViewMoreLoader = false;
    this.mainScreen = 'Update Charges';
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
