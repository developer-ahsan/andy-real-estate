import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html'
})
export class WarehouseComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  videosLength: number = 0;
  wareHouseLength: number = 0;
  wareHouseForm: FormGroup;
  images: FileList = null;
  imageRequired: string = '';

  selected: string = 'No';
  seasons: string[] = ['Yes', 'No'];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.wareHouseForm = this._formBuilder.group({
      inventory: ['', Validators.required],
      inventoryThreshold: ['', Validators.required],
      warehousingCost: ['', Validators.required],
      handlingCost: ['', Validators.required],
      maxQuantity: [''],
      warehouseCode: [''],
      deliveryFee: [''],
      notes: ['']
    });

    const { pk_productID } = this.selectedProduct;

    this._inventoryService.getWarehouseByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((warehouse) => {
        console.log("wareHouse", warehouse["data"][0]);
        this.wareHouseLength = warehouse["totalRecords"];
        this.wareHouseForm.patchValue(warehouse["data"][0]);
        this._changeDetectorRef.markForCheck();
      });

    this.isLoadingChange.emit(false);
  }

  radioChange(event) {
    console.log(event.value);
  }

  upload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    this.images = files;
  }

  uploadImage(): void {
    if (!this.images) {
      this.imageRequired = "*Please attach an image and continue"
      return;
    }
    this.imageRequired = '';
    console.log("files", this.images);
  }
}


