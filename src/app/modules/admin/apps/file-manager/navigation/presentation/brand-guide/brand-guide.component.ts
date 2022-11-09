import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../../store-manager.service';
@Component({
  selector: 'app-brand-guide',
  templateUrl: './brand-guide.component.html',
})
export class PresentationBrandGuideComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  updateLoader: boolean = false;
  imageValue: any;

  file_path = '';
  constructor(
    private _storeManagerService: FileManagerService,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }


  ngOnInit() {
    this.file_path = environment.storeMedia + '/brandGuide/' + this.selectedStore.pk_storeID + '.pdf';
  }
  uploadFile(event): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageValue = {
        imageUpload: reader.result,
        type: file["type"]
      };
    }
  };
  uploadMedia() {
    this.updateLoader = true;
    let base64;
    const { imageUpload } = this.imageValue;
    base64 = imageUpload.split(",")[1];
    const img_path = `/globalAssets/Stores/brandGuide/${this.selectedStore.pk_storeID}.pdf`;
    console.log(base64)
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: img_path
    };
    console.log(payload)

    this._storeManagerService.addPresentationMedia(payload)
      .subscribe((response) => {
        this.imageValue = null;
        this.updateLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.updateLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
}
