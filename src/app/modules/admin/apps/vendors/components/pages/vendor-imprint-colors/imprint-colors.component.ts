import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { AddColor, AddImprintColor, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor } from '../../vendors.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
declare var $: any;
@Component({
  selector: 'app-imprint-colors',
  templateUrl: './imprint-colors.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorImprintColorsComponent implements OnInit, OnDestroy {
  @ViewChild('colorModal') colorModal: ElementRef;

  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'rgb', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  mainScreen: string = 'Current Collections';
  keyword = '';
  not_available = 'N/A';


  isSearching: boolean = false;

  // AddColor
  ngName: string = '';
  ngRGB: string = '#000000';
  isAddColorLoader: boolean = false;

  // Update Color
  isUpdateColorLoader: boolean = false;
  isUpdateColors: boolean = false;
  updateColorData: any;
  ngRGBUpdate = '';

  imprintProducts = false;

  addColorsForm = [];

  supplierData: any;
  collectionsData: any;
  ngCollectionName = '';
  isImprintLoader: boolean = false;
  imprintColors: any;
  isAddCollectionLoader: boolean = false;
  modalAlertMessage = '';
  isAddNewColorLoader: boolean = false;
  @Input() selectedCollection: any;
  isEditCollectionToggle: boolean = false;
  updatedCollectionData: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _VendorsService: VendorsService,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getVendorsData();
  };
  getVendorsData() {
    this._VendorsService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.getCollectionData();
    });
  }
  getCollectionData() {
    let paramas = {
      view_vendor_collections: true,
      supplier_id: this.supplierData.pk_companyID
    }
    this._VendorsService.getVendorsData(paramas).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.collectionsData = [];
      res["data"].forEach(element => {
        element.colorsData = [];
        if (element.Colors) {
          const colors = element.Colors.split(',,');
          colors.forEach(color => {
            const [id, name, rgb] = color.split('::')
            element.colorsData.push({ id, name, rgb, rgbValue: '#' + rgb });
          });
        }
      });
      this.collectionsData = res["data"];
    })
  }
  deleteCollection(collection) {
    this._commonService.showConfirmation('Are you sure you want to remove this color collection?  The system will first check to make sure this collection is not associated with product imprints first.  This action cannot be undone.', (confirmed) => {
      if (confirmed) {
        let params = {
          collectionID: collection.pk_collectionID,
          delete_vendor_imprint_collection: true
        }
        collection.isDelLoader = true;
        this._VendorsService.putVendorsData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          collection.isDelLoader = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
          if (res["success"]) {
            this._VendorsService.snackBar(res["message"]);
            this.collectionsData = this.collectionsData.filter(item => item.pk_collectionID != collection.pk_collectionID);
          } else {
            this._VendorsService.snackBar(res["message"]);
          }
        });
      }
    });
  }
  getImprintColorsList() {
    const params = { view_imprint_colors: true };

    this._VendorsService.getVendorsData(params)
      .pipe(
        takeUntil(this._unsubscribeAll),
        finalize(() => {
          this.isImprintLoader = false;
          this._changeDetectorRef.markForCheck();
        })
      )
      .subscribe(res => {
        this.imprintColors = [];

        const colorsData = res["data"][0]?.Colors;

        if (colorsData) {
          const colors = colorsData.split(',,');
          this.imprintColors = colors.map(color => {
            const [id, name, rgb] = color.split('::');
            return { id, name, rgb, rgbValue: `#${rgb}`, checked: false };
          });
        }
      });

  }
  addNewCollection() {
    const collectionName = this.ngCollectionName.trim();

    if (collectionName === '') {
      this._VendorsService.snackBar('Collection name is required');
      return;
    }

    const selectedColors = this.imprintColors.filter(color => color.checked).map(color => Number(color.id));

    if (selectedColors.length === 0) {
      this._VendorsService.snackBar('Please select at least one color');
      return;
    }

    const payload = {
      decoratorID: this.supplierData.pk_companyID,
      collectionName: collectionName,
      imprintColorsIDList: selectedColors,
      add_vendor_imprint_collection: true
    };

    this.isAddCollectionLoader = true;

    this._VendorsService.postVendorsData(payload)
      .pipe(
        takeUntil(this._unsubscribeAll),
        finalize(() => {
          this.isAddCollectionLoader = false;
          this._changeDetectorRef.markForCheck();
        })
      )
      .subscribe(res => {
        if (res["success"]) {
          this._VendorsService.snackBar(res["message"]);
          this.ngCollectionName = '';
          this.getCollectionData();
          this.isLoading = true;
          this.mainScreen = 'Current Collections';
        }
      });

  }
  calledScreen(value) {
    this.mainScreen = value;
    if (value == 'Add New Collections') {
      this.isImprintLoader = true;
      this.getImprintColorsList();
    }
  }
  openColorModal() {
    for (let index = 0; index < 6; index++) {
      this.addColorsForm[index] = { colorName: '', rgb: '' };
    }
    $(this.colorModal.nativeElement).modal('show');
  }
  addNewColors() {
    this.modalAlertMessage = '';
    const data = this.validateColors(this.addColorsForm);
    if (!data.value) {
      this.modalAlertMessage = data.msg;
      return;
    }
    if (data.colorsData.length == 0) {
      this.modalAlertMessage = data.msg;
      return;
    }
    let payload = {
      imprintColors: data.colorsData,
      add_imprint_color: true
    }
    this.isAddNewColorLoader = true;
    this._VendorsService.postVendorsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isAddNewColorLoader = false;
    })).subscribe(res => {
      if (res["success"]) {
        $(this.colorModal.nativeElement).modal('hide');
        this._VendorsService.snackBar(res["message"]);
        if (!this.updatedCollectionData) {
          this.isImprintLoader = true;
          this.getImprintColorsList();
        } else {
          this.updatedCollectionData.isImprintLoader = true;
          this.getImprintColorsListForCollection();
        }
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  validateColors(colors: any[]): any {
    let msg = '';
    let value;
    let colorsData = [];
    let data;

    for (const color of colors) {
      const { colorName, rgb } = color;
      if (colorName.trim() === "" && rgb.trim() !== "") {
        msg = "Color name is required when RGB is provided.";
        value = false;
        data = { value, msg, colorsData }
        return data;
      }
      if (colorName.trim() !== "" && rgb.trim() === "") {
        msg = "RGB value is required when color name is provided.";
        value = false;
        data = { value, msg, colorsData }
        return data;
      }
      if (colorName.trim() !== "" && rgb.trim() !== "" && rgb.trim().length !== 6) {
        msg = "RGB value must be 6 characters long.";
        value = false;
        data = { value, msg, colorsData }
        return data;
      }
      if (colorName.trim() !== "" && rgb.trim() !== "") {
        colorsData.push(color);
        value = true;
      }
    }
    if (colorsData.length == 0) {
      data = { value: false, msg: 'Color and rgb both are required', colorsData }
    } else {
      data = { value: true, msg, colorsData }
    }
    return data;
  }
  imprintColorProductsToggle(collection, check) {
    this.selectedCollection = collection;
    this.imprintProducts = check;
    this._changeDetectorRef.markForCheck();
  }
  imprintCollectionEditToggle(collection, check) {
    this.updatedCollectionData = collection;
    this.isEditCollectionToggle = check;
    if (this.updatedCollectionData) {
      this.updatedCollectionData.isImprintLoader = true;
      this.getImprintColorsListForCollection();
    }
    this._changeDetectorRef.markForCheck();
  }
  getImprintColorsListForCollection() {
    const params = { view_imprint_colors: true };

    this._VendorsService.getVendorsData(params)
      .pipe(
        takeUntil(this._unsubscribeAll),
        finalize(() => {
          this.updatedCollectionData.isImprintLoader = false;
          this._changeDetectorRef.markForCheck();
        })
      )
      .subscribe(res => {
        this.updatedCollectionData.imprintColors = [];

        const colorsDataIds = this.updatedCollectionData.colorsData.map(item => item.id);

        if (res["data"][0]?.Colors) {
          const colors = res["data"][0].Colors.split(',,');
          colors.forEach(color => {
            const [id, name, rgb] = color.split('::');
            const checked = colorsDataIds.includes(id);

            this.updatedCollectionData.imprintColors.push({ id, name, rgb, rgbValue: `#${rgb}`, checked });
          });
        }
      });

  }
  updateCollection() {
    const collectionName = this.updatedCollectionData.collectionName.trim();
    const imprintColorsIDList = this.updatedCollectionData.imprintColors
      .filter(color => color.checked)
      .map(color => {
        return {
          id: Number(color.id),
          data: color,
        };
      });

    if (collectionName === '') {
      this._VendorsService.snackBar('Collection name is required');
      return;
    }

    if (imprintColorsIDList.length === 0) {
      this._VendorsService.snackBar('Please select at least one color');
      return;
    }

    const payload = {
      collectionID: this.updatedCollectionData.pk_collectionID,
      collectionName: collectionName,
      imprintColorsIDList: imprintColorsIDList.map(color => color.id),
      update_vendor_imprint_collection: true,
    };

    this.updatedCollectionData.isUpdateCollectionLoader = true;
    this._VendorsService.putVendorsData(payload)
      .pipe(
        takeUntil(this._unsubscribeAll),
        finalize(() => {
          this.updatedCollectionData.isUpdateCollectionLoader = false;
          this._changeDetectorRef.markForCheck();
        })
      )
      .subscribe(res => {
        if (res["success"]) {
          this.updatedCollectionData.colorsData = imprintColorsIDList.map(color => color.data);
          this._VendorsService.snackBar(res["message"]);
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
