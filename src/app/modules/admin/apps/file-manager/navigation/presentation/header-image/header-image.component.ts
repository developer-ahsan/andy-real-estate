import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../../store-manager.service';
@Component({
  selector: 'app-header-image',
  templateUrl: './header-image.component.html',
})
export class PresentationHeaderImageComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() screenData: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  updateLoader: boolean = false;
  headerImage: string = '';
  imageCheck: boolean = true;
  imageValue: any;
  url: any;
  constructor(
    private _storeManagerService: FileManagerService,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }


  ngOnInit() {
    this.initialize();
  }
  initialize() {
    this.headerImage = environment.storeMedia + `/headerImages/${this.selectedStore.pk_storeID}.png?${Math.random()}`;
  }
  UpdateHeaderImage() {
    if (this.imageValue) {
      this.uploadMedia();
    }
    this.updateLoader = true;
    let payload = {
      store_id: this.selectedStore.pk_storeID,
      blnImage: true,
      link: this.url,
      update_header_image: true,
    }
    this._storeManagerService.UpdateHeaderImage(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.updateLoader = false;
      this._snackBar.open("Header image updated successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  checkImageExist(ev) {
    this.imageCheck = false;
    this._changeDetectorRef.markForCheck();
  }
  uploadQuickImage(event): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 261 || image.height != 44) {
          this._snackBar.open("Dimensions allowed are 261px x 44px", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.imageValue = null;
          this._changeDetectorRef.markForCheck();
          return;
        };
        this.imageValue = {
          imageUpload: reader.result,
          type: file["type"]
        };
      }
    };
  };
  uploadMedia() {
    let payload;
    if (!this.imageValue) {
      this._snackBar.open("File is required", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    const { imageUpload, type } = this.imageValue;
    const base64 = imageUpload.split(",")[1];
    payload = {
      file_upload: true,
      image_file: base64,
      image_path: `/globalAssets/Stores/headerImages/${this.selectedStore.pk_storeID}.png`
    };

    this._storeManagerService.addPresentationMedia(payload)
      .subscribe((response) => {
        this.headerImage = environment.storeMedia + `/headerImages/${this.selectedStore.pk_storeID}.png?${Math.random()}`;
        this.imageCheck = true;
        this.imageValue = null;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
}
