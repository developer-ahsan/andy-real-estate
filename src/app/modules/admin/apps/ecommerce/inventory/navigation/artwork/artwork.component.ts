import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';

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
  images = null;
  imageRequired: string = '';
  artWorkData = [];
  imageUploadLoader: boolean = false;

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

  upload(event) {
    const file = event.target.files[0];
    if (file) {
      let fileExtension = file["name"].split('.').pop();  //return the extension
      let fileName = !this.artWorkData.length ? `1.${fileExtension}` : `${this.artWorkData.length + 1}.${fileExtension}`;
      let fileType = fileExtension == "pdf" ? "application/pdf" : file["type"];
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

    if (fileType == 'image/jpeg' ||
      fileType == 'application/pdf' ||
      fileType == 'application/postscript') {
      const { pk_productID } = this.selectedProduct;
      const base64 = fileUpload.split(",")[1];
      const payload = {
        file_upload: true,
        image_file: base64,
        image_path: `/globalAssets/Products/ArtworkTemplates/${pk_productID}/${pk_productID}-${fileName}`
      };

      this.imageUploadLoader = true;
      this._inventoryService.addArtworkTemplate(payload)
        .subscribe((response) => {
          this._inventoryService.getArtworkTemplateByProductId(pk_productID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((artwork) => {
              this.artWorkData = artwork["data"];
              this._snackBar.open("File uploaded successfully", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
              });
              this.imageUploadLoader = false;
              this.artWorkData.push({
                pk_artworkTemplateID: 1,
                extension: "pdf"
              });

              // Mark for check
              this._changeDetectorRef.markForCheck();
            }, err => {
              this.imageUploadLoader = false;
              this._snackBar.open("Some error occured", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
              });

              // Mark for check
              this._changeDetectorRef.markForCheck();
            });
        }, err => {
          this.imageUploadLoader = false;
          this._snackBar.open("Some error occured", '', {
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

  openPdf(artWork) {
    const { pk_productID } = this.selectedProduct;
    const url = `${environment.productMedia}/artworkTemplates/${pk_productID}/1.pdf`;
    window.open(url);
  }
}
