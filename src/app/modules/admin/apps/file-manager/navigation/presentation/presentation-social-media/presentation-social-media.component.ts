import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../../store-manager.service';
@Component({
  selector: 'app-presentation-social-media',
  templateUrl: './presentation-social-media.component.html',
})
export class PresentationSocialMediaComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() screenData: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  socialMediaForm: FormGroup;
  updateLoader: boolean = false;
  socialUpdateMsg: boolean = false;

  constructor(
    private _storeManagerService: FileManagerService,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }


  ngOnInit() {
    this.initialize();
  }
  initialize() {
    this.socialMediaForm = new FormGroup({
      facebookPage: new FormControl(""),
      twitterPage: new FormControl(""),
      linkedInPage: new FormControl(""),
      instagramPage: new FormControl(""),
    });
    this.socialMediaForm.patchValue(this.screenData);
  }
  UpdateSocialMedia() {
    const { facebookPage, twitterPage, linkedInPage, instagramPage } = this.socialMediaForm.getRawValue();
    let payload = {
      facebook_url: facebookPage,
      twitter_url: twitterPage,
      linkedin_url: linkedInPage,
      instagram_url: instagramPage,
      store_id: this.selectedStore.pk_storeID
    }
    this.updateLoader = true;
    this._storeManagerService.UpdateSocialMedia(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.updateLoader = false;
      this.socialUpdateMsg = true;
      setTimeout(() => {
        this.socialUpdateMsg = false;
        this._changeDetectorRef.markForCheck();
      }, 3000);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
}
