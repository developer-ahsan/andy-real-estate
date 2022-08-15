import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
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

        this.isLoadingChange.emit(false);
        this._changeDetectorRef.markForCheck();
      });
  }

  upload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    this.images = files;
  }

  uploadFile(): void {
    if (!this.images) {
      this._snackBar.open("Please attach a file", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };

    let fileType = this.images[0].type;
    if (fileType == 'image/jpeg' ||
      fileType == 'application/pdf' ||
      fileType == 'application/postscript') {
      this._snackBar.open("Artwork file uploaded successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    } else {
      this._snackBar.open("Only PDF, EPS, AI, PSD, and JPG file formats are accepted", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
  };

  openPdf(artWork) {
    const { pk_productID } = this.selectedProduct;
    const url = `https://assets.consolidus.com/globalAssets/Products/artworkTemplates/${pk_productID}/${artWork?.pk_artworkTemplateID}.${artWork?.extension}`;
    window.open(url);
  }
}
