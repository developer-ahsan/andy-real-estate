import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../../store-manager.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
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
  checkPdfExist: boolean = false;
  pdfChecked: boolean = false;
  removeLoader: boolean = false;
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _commonService: DashboardsService
  ) { }


  ngOnInit() {
    this.pdfChecked = true;
    this.file_path = environment.storeMedia + '/brandGuide/' + this.selectedStore.pk_storeID + '.pdf?' + Math.random();
    this.checkFileExist();
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
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: img_path
    };

    this._storeManagerService.addPresentationMedia(payload)
      .subscribe((response) => {
        this.imageValue = null;
        this.updateLoader = false;
        this.checkPdfExist = true;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.updateLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
  checkFileExist() {
    let params = {
      file_check: true,
      url: this.file_path
    }
    this._commonService.getCallForFileCheckData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.pdfChecked = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.checkPdfExist = res["isFileExist"];
      this._changeDetectorRef.markForCheck();
    });
  }
  removeBrandGuide() {
    const paths: string[] = [`/globalAssets/Stores/brandGuide/${this.selectedStore.pk_storeID}.pdf`];
    this.removeLoader = true;
    let payload = {
      files: paths,
      delete_multiple_files: true
    }
    this._commonService.removeMediaFiles(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.removeLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._storeManagerService.snackBar('Brand Guide Removed Successfully!');
      this.checkPdfExist = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  openPdf() {
    window.open(this.file_path, '_blank');
  }


}
