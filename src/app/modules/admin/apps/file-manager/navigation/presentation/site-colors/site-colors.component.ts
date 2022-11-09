import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../../store-manager.service';
@Component({
  selector: 'app-site-colors',
  templateUrl: './site-colors.component.html',
})
export class PresentationSiteColorsComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() screenData: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  specialOfferForm: FormGroup;
  updateLoader: boolean = false;
  specialOfferMsg: boolean = false;

  constructor(
    private _storeManagerService: FileManagerService,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }


  ngOnInit() {
    this.initialize();
  }
  initialize() {
    this.specialOfferForm = new FormGroup({
      blnOffer: new FormControl(false),
      offerText: new FormControl(""),
      offerTextBox: new FormControl(""),
      offerFooter: new FormControl(""),
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      update_special_offer: new FormControl(true)
    });
    this.specialOfferForm.patchValue(this.screenData);

  }
  UpdateSpecialOffer() {
    this.updateLoader = true;
    this._storeManagerService.UpdateSpecialOffer(this.specialOfferForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.updateLoader = false;
      if (res["success"]) {
        this.specialOfferMsg = true;
        setTimeout(() => {
          this.specialOfferMsg = false;
          this._changeDetectorRef.markForCheck();
        }, 3000);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
}
