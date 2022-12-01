import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../system.service';
import { AddColor, AddPackage, AddSize, DeleteColor, DeletePackage, DeleteSize, UpdateColor, UpdatePackage, UpdateSize } from '../../system.types';
import { NgxImageCompressService } from "ngx-image-compress";
import { CompressImageService } from '../../compress-image.service';

@Component({
  selector: 'app-product-pack-accessories',
  templateUrl: './pack-accessories.component.html',
  providers: [NgxImageCompressService],
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class PackAndAccessoriesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['image', 'name', 'action'];
  totalUsers = 0;
  page = 1;

  mainScreen: string = 'Current Pack/Accessories';
  keyword = '';
  not_available = 'N/A';

  isAddPackageLoader: boolean = false;
  isUpdatePackageLoader: boolean = false;
  isUpdatePackage: boolean = false;
  updatePackageData: any;
  ngPackageName = '';
  imageValue: any;
  imageValueCommpressed: any;
  random: any;
  imgUrl = 'https://assets.consolidus.com/globalAssets/Packagings/';
  updateImage = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService,
    private imageCompress: CompressImageService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getPackAccessories(1, 'get');
  };
  calledScreen(value) {
    this.mainScreen = value;
  }
  getPackAccessories(page, type) {
    this.random = Math.random();
    let params = {
      packs_accessories: true,
      page: page,
      size: 20
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      setTimeout(() => {
        console.clear();
      }, 2000);
      if (type == 'add') {
        this.isAddPackageLoader = false;
        this.imageCompress = null;
        this.imageValue = null;
        this.ngPackageName = '';
      } else if (type == 'update') {
        this.imageCompress = null;
        this.imageValue = null;
        this._systemService.snackBar('Package updated successfully');
        this.isUpdatePackageLoader = false;
      }
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getPackAccessories(this.page, 'get');
  };

  // Delete PackAccessories
  deletePackAccessories(item) {
    item.delLoader = true;
    let payload: DeletePackage = {
      package_id: item.pk_packagingID,
      delete_package: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(elem => elem.pk_packagingID != item.pk_packagingID);
      this.totalUsers--;
      this._systemService.snackBar('PackAccessories Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
    });
  }
  // Update Package
  updatePackageToggle(item) {
    if (item) {
      this.updateImage = this.imgUrl + 'Thumbnails/' + item.pk_packagingID + '.jpg?' + Math.random();
      this.updatePackageData = item;
    }
    this.isUpdatePackage = !this.isUpdatePackage;
  }

  uploadImage(event) {
    this.imageValue = null;
    const file = event.target.files[0];
    let type = file["type"];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageValue = {
        imageUpload: reader.result,
        type: file["type"]
      };
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 600 || image.height != 600) {
          this._systemService.snackBar('Dimensions allowed are 600px x 600px');
          this.imageValue = null;
          this._changeDetectorRef.markForCheck();
          return;
        };

        if (type != "image/jpeg") {
          this._systemService.snackBar('Image extensions are allowed in JPG');
          this.imageValue = null;
          this._changeDetectorRef.markForCheck();
          return;
        }
        const base64 = this.imageValue.imageUpload.split(",")[1];
        this.compressFile(file);
        this._changeDetectorRef.markForCheck();
      };
    }
  };
  // Commpress File
  compressFile(image) {
    this.imageCompress.compress(image)
      .pipe(take(1))
      .subscribe(compressedImage => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedImage);
        reader.onload = () => {
          this.imageValueCommpressed = {
            imageUpload: reader.result,
            type: compressedImage["type"]
          };
        }
      });
  }
  // Add Package
  addNewPackage() {
    if (this.ngPackageName == '') {
      this._systemService.snackBar('Package name is required');
      return;
    }
    let payload: AddPackage = {
      package_name: this.ngPackageName,
      add_package: true
    }
    this.isAddPackageLoader = true;
    this._systemService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        if (this.imageValue) {
          this.uploadPackegeMedia(res["newID"], 'add');
        } else {
          this.getPackAccessories(1, 'add');
        }
      } else {
        this.isAddPackageLoader = false;
        this._systemService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddPackageLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }
  // Update
  UpdatePackage() {
    if (this.updatePackageData.packagingName == '') {
      this._systemService.snackBar('Package name is required');
      return;
    }
    let payload: UpdatePackage = {
      package_id: this.updatePackageData.pk_packagingID,
      package_name: this.updatePackageData.packagingName,
      update_package: true
    }
    this.isUpdatePackageLoader = true;
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.dataSource.filter((packages: any) => {
          if (packages.pk_packagingID == this.updatePackageData.pk_packagingID) {
            packages.packagingName = this.updatePackageData.packagingName;
          }
        });
        if (this.imageValue) {
          this.updateImage = null;
          this.uploadPackegeMedia(this.updatePackageData.pk_packagingID, 'update');
        } else {
          this._systemService.snackBar('Package updated successfully');
          this.isUpdatePackageLoader = false;
          this._changeDetectorRef.markForCheck();
        }
      } else {
        this.isUpdatePackageLoader = false;
        this._systemService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdatePackageLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }
  uploadPackegeMedia(id, type) {
    const payload1 = {
      file_upload: true,
      image_file: this.imageValueCommpressed.imageUpload.split(",")[1],
      image_path: `/globalAssets/Packagings/Thumbnails/${id}.jpg`
    };
    this._systemService.AddSystemData(payload1).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.updateImage = this.imgUrl + 'Thumbnails/' + id + '.jpg';
      if (type == 'add') {
        this.getPackAccessories(1, 'add');
      } else {
        this.getPackAccessories(1, 'update');
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddPackageLoader = false;
      this.isUpdatePackageLoader = false;
      this._changeDetectorRef.markForCheck();
    });
    const payload = {
      file_upload: true,
      image_file: this.imageValue.imageUpload.split(",")[1],
      image_path: `/globalAssets/Packagings/Images/${id}.jpg`
    };
    this._systemService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._changeDetectorRef.markForCheck();
    });
    const base64 = this.imageValue.imageUpload.split(",")[1];

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
