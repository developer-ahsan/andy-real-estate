import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';

@Component({
  selector: 'app-dietary-info',
  templateUrl: './dietary-info.component.html'
})
export class DietaryInfoComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  imageUploadForm: FormGroup;
  images = null;
  pdf;
  imageUploadLoader: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _inventoryService: InventoryService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {

    const { pk_productID } = this.selectedProduct;

    // Create the selected product form
    this.imageUploadForm = this._formBuilder.group({
      image: ['', Validators.required]
    });

    this.pdf = null;

    this.isLoadingChange.emit(false);

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  upload(event) {
    const file = event.target.files[0];
    if (file) {
      let fileExtension = file["name"].split('.').pop();  //return the extension
      let fileType = fileExtension == "pdf" ? "application/pdf" : "not-accepted";
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.images = {
          fileUpload: reader.result,
          fileType: fileType
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

    const { fileUpload, fileType } = this.images;

    if (fileType == 'application/pdf') {
      const { pk_productID } = this.selectedProduct;
      const base64 = fileUpload.split(",")[1];
      const payload = {
        file_upload: true,
        image_file: base64,
        image_path: `/globalAssets/Products/DietaryInfo/${pk_productID}.pdf`
      };

      this.imageUploadLoader = true;
      this._inventoryService.addDietaryMedia(payload)
        .subscribe((response) => {

          this.pdf = `${environment.productMedia}/DietaryInfo/${pk_productID}.pdf`;
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
          this._snackBar.open("Some error occured", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });

          // Mark for check
          this._changeDetectorRef.markForCheck();
        })
    } else {
      this._snackBar.open("Only PDF files are accepted", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };
  };

  openPdf() {
    window.open(this.pdf);
  };
}
