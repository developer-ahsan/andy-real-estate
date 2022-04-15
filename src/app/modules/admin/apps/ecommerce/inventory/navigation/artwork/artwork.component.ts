import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-artwork',
  templateUrl: './artwork.component.html'
})
export class ArtworkComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  imageUploadForm: FormGroup;
  images: FileList = null;
  imageRequired: string = '';
  artWorkData = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.imageUploadForm = this._formBuilder.group({
      image: ['', Validators.required]
    });

    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getArtworkTemplateByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((artwork) => {
        this.artWorkData = artwork["data"];
        this._changeDetectorRef.markForCheck();
      });

    this.isLoadingChange.emit(false);
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
  };

  openPdf(artWork) {
    const { pk_productID } = this.selectedProduct;
    const url = `https://assets.consolidus.com/globalAssets/Products/artworkTemplates/${pk_productID}/${artWork?.pk_artworkTemplateID}.${artWork?.extension}`;
    window.open(url);
  }
}
