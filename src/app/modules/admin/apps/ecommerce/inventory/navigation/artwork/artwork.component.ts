import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';
declare var $: any;

@Component({
  selector: 'app-artwork',
  templateUrl: './artwork.component.html'
})
export class ArtworkComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  selectedProduct: any;
  imageUploadForm: FormGroup;
  images = null;
  artwork_name: string = "";
  imageRequired: string = '';
  artWorkData = [];
  imageUploadLoader: boolean = false;
  deleteLoader: boolean = false;
  @ViewChild('removeArtwork') removeArtwork: ElementRef;
  deleteModalData: any;



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
    this.isLoading = true;
    this._changeDetectorRef.markForCheck();
    this.getProductDetail();
  }
  getProductDetail() {
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        const { pk_productID } = this.selectedProduct;
        this._inventoryService.getArtworkTemplateByProductId(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((artwork) => {
            this.artWorkData = artwork["data"];
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
          }, err => {
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
          });

      }
    });
  }

  upload(event) {
    const file = event.target.files[0];
    if (file) {
      let fileExtension = file["name"].split('.').pop();  //return the extension
      let fileName = !this.artWorkData.length ? `1.${fileExtension}` : `${this.artWorkData.length + 1}.${fileExtension}`;
      let fileType = fileExtension;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.images = {
          fileUpload: reader.result,
          fileType: fileType,
          fileName: fileName
        };
      };
    };
  };

  uploadFile(): void {
    if (!this.images) {
      this._snackBar.open("Please attach a file", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };

    const { fileUpload, fileType, fileName } = this.images;

    const allowedTypes = ['jpg', 'psd', 'ai', 'pdf', 'eps'];
    if (allowedTypes.includes(fileType)) {
      const { pk_productID } = this.selectedProduct;
      const base64 = fileUpload.split(",")[1];
      const payload = {
        file_upload: true,
        image_file: base64
      };

      const dbPayload = {
        product_id: pk_productID,
        template_name: this.artwork_name,
        extension: fileType,
        artwork: true
      };

      this.imageUploadLoader = true;

      this._inventoryService.addArtworkTemplateToDb(dbPayload)
        .subscribe((dbResponse) => {
          payload["image_path"] = `/globalAssets/Products/ArtworkTemplates/${pk_productID}/${dbResponse["artwork_id"]}.${fileType}`;
          this.artWorkData = dbResponse["artworks"];
          this._inventoryService.addArtworkTemplate(payload)
            .subscribe((response) => {
              this._snackBar.open("File uploaded successfully", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
              });
              this.imageUploadLoader = false;

              // Mark for check
              this._changeDetectorRef.markForCheck();
            }, err => {
              this.imageUploadLoader = false;
              this._snackBar.open("Some error occured while saving file details to server", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
              });

              // Mark for check
              this._changeDetectorRef.markForCheck();
            });
        }, err => {
          this.imageUploadLoader = false;
          this._snackBar.open("Some error occured while saving file details to database", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });

          // Mark for check
          this._changeDetectorRef.markForCheck();
        })
    } else {
      this._snackBar.open("PDF, EPS, AI, PSD, and JPG file formats only!", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };
  };

  artworkDelete(): void {
    const { pk_artworkTemplateID } = this.deleteModalData;
    const { pk_productID } = this.selectedProduct;
    const payload = {
      product_id: pk_productID,
      template_id: pk_artworkTemplateID,
      artwork_delete: true
    };

    this.deleteLoader = true;
    this._inventoryService.deleteArtwork(payload)
      .subscribe((response) => {
        this.deleteLoader = false;
        this.artWorkData = response["artworks"];
        $(this.removeArtwork.nativeElement).modal('hide');

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

  };
  UpdateArtwork(data): void {
    data.updateLoader = true;
    const { pk_artworkTemplateID, name } = data;
    const { pk_productID } = this.selectedProduct;
    const payload = {
      name: name,
      template_id: pk_artworkTemplateID,
      artwork_update: true
    };

    this._inventoryService.UpdateArtwork(payload)
      .subscribe((response) => {
        data.updateLoader = false;
        this._snackBar.open("Artwork name updated successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        data.updateLoader = false;
        this._changeDetectorRef.markForCheck();

      });

  };

  accessFile(artwork) {
    const { extension, pk_artworkTemplateID } = artwork;
    const { pk_productID } = this.selectedProduct;
    const url = `${environment.productMedia}/artworkTemplates/${pk_productID}/${pk_artworkTemplateID}.${extension}`;
    window.open(url);
  };

  openRemoveModal(data) {
    this.deleteModalData = data;
    $(this.removeArtwork.nativeElement).modal('show');
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
