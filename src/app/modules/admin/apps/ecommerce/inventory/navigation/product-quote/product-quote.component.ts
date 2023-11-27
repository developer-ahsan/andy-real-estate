import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import * as _ from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteImage } from 'app/modules/admin/apps/file-manager/stores.types';
import { SystemService } from 'app/modules/admin/apps/system/components/system.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';


@Component({
  selector: 'app-product-status',
  templateUrl: './product-quote.component.html'
})
export class ProductQuoteComponent implements OnInit, OnDestroy {

  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  imageUploadForm: FormGroup;
  images = null;
  fileName: string = "";
  imagesArray = [];

  imageUploadLoader: boolean = false;
  imageDeleteLoader: boolean = false;

  imageError = "";
  isImageSaved: boolean;
  cardImageBase64 = "";
  extData: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _systemService: SystemService,
    private _commonService: DashboardsService,

  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.imageUploadForm = this._formBuilder.group({
      image: ['', Validators.required]
    });

    this.getProductDetail();
  };

  getData() {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getProductsData({ product_quote: true, product_id: pk_productID }).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      if (res?.data?.length > 0)
        this.imagesArray.push(`${environment.productMedia}/quotes/${pk_productID}.${res?.data[0]?.ext}`);
      this.extData = res?.data[0]?.ext;
    })
  }

  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        const { pk_productID } = this.selectedProduct;
        this.getData();


        setTimeout(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        }, 2500);
      }
    });
  }
  checkIfImageExists(url) {
    const img = new Image();
    img.src = url;

    if (img.complete) {
      this.imagesArray.push(url);
    } else {
      img.onload = () => {
        this.imagesArray.push(url);
      };

      img.onerror = () => {
        return;
      };
    }
  }

  upload(event) {
    const file = event.target.files[0];
    this.fileName = !this.imagesArray.length ? "1" : `${this.imagesArray.length + 1}`;
    let fileType = file["type"];

    let fileExtension = file["name"].split('.').pop();  //return the extension
    if (fileExtension != "pdf" && fileExtension != "png" && fileExtension != "jpg" && fileExtension != 'jpeg') {
      this._snackBar.open("Image extensions are allowed in JPG, PDF and PNG", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this.images = null;
      return;
    };

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.images = {
        imageUpload: reader.result,
        fileType: fileType
      };
    };
  };

  uploadImage(): void {
    this.imageError = null;
    if (!this.images) {
      this._snackBar.open("Please attach a file", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };

    let image = new Image;
    const { imageUpload, fileType } = this.images;
    image.src = imageUpload;
    if (fileType != "image/jpeg" && fileType != "image/png" && fileType != "application/pdf") {
      this._snackBar.open("Image extensions are allowed in JPG, PDF and PNG", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };
    const { pk_productID } = this.selectedProduct;
    const base64 = imageUpload.split(",")[1];
    let fileExtension = fileType.split('/')[1];
    const files = [{
      image_file: base64,
      image_path: `/globalAssets/Products/quotes/${pk_productID}.${fileExtension}`
    }]
    this.imageUploadLoader = true;
    this._commonService.uploadMultipleMediaFiles(files)
      .subscribe((response) => {
        this._snackBar.open(response["message"], '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.extData = fileExtension;
        this.updateExtension(fileExtension);
        this.imageUploadLoader = false;
        this.imagesArray.pop();
        this.imagesArray.push(`${environment.productMedia}/quotes/${pk_productID}.${fileExtension}`);

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
    // }
    // }
  };

  updateExtension(extension: string, type: string = "put") {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.updateProductsData({
      productID: pk_productID,
      call_type: type,
      extension,
      update_product_quote: true
    }).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    })
  }


  deleteImage() {
    const { pk_productID } = this.selectedProduct;
    let payload = {
      files: [`/globalAssets/Products/quotes/${pk_productID}.${this.extData}`],
      delete_multiple_files: true
    }
    this.imageDeleteLoader = true;
    this._commonService.removeMediaFiles(payload).pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.imagesArray.pop();
        this.imageDeleteLoader = false;
        this._systemService.snackBar('Image Removed Successfully');
        this.updateExtension(this.extData, 'delete')
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.imageDeleteLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }

  openPDF() {
    const { pk_productID } = this.selectedProduct;

    const pdfURL = `https://assets.consolidus.com/globalAssets/Products/quotes/${pk_productID}.pdf`;

    // Open the PDF in a new window
    window.open(pdfURL, '_blank');
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
