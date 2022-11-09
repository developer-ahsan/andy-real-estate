import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../../store-manager.service';
@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
})
export class PresentationPaymentMethodsComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() screenData: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  onlineCreditForm: FormGroup;
  prepaymentForm: FormGroup;
  thirdPartyForm: FormGroup;
  creditTermsForm: FormGroup;

  updateLoader: boolean = false;
  paymentUpdateMsg: boolean = false;

  constructor(
    private _storeManagerService: FileManagerService,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }


  ngOnInit() {
    this.initialize();
  }
  initialize() {
    this.onlineCreditForm = new FormGroup({
      title: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      displayOrder: new FormControl("", Validators.required),
      blnActive: new FormControl("", Validators.required),
      blnPrimary: new FormControl("", Validators.required),
      fk_paymentMethoDID: new FormControl("")
    });
    this.prepaymentForm = new FormGroup({
      title: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      displayOrder: new FormControl("", Validators.required),
      blnActive: new FormControl("", Validators.required),
      blnPrimary: new FormControl("", Validators.required),
      fk_paymentMethoDID: new FormControl("")
    });
    this.thirdPartyForm = new FormGroup({
      title: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      displayOrder: new FormControl("", Validators.required),
      blnActive: new FormControl("", Validators.required),
      blnPrimary: new FormControl("", Validators.required),
      fk_paymentMethoDID: new FormControl("")
    });
    this.creditTermsForm = new FormGroup({
      title: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      displayOrder: new FormControl("", Validators.required),
      blnActive: new FormControl("", Validators.required),
      blnPrimary: new FormControl("", Validators.required),
      fk_paymentMethoDID: new FormControl("")
    });
    this.onlineCreditForm.patchValue(this.screenData[0]);
    this.prepaymentForm.patchValue(this.screenData[1]);
    this.thirdPartyForm.patchValue(this.screenData[2]);
    this.creditTermsForm.patchValue(this.screenData[3]);
  }
  UpdatepaymentMethods() {
    this.updateLoader = true;
    let payment = [];
    for (let index = 0; index < 4; index++) {
      if (index == 0) {
        var { title, displayOrder, description, blnPrimary, blnActive, fk_paymentMethoDID } = this.onlineCreditForm.getRawValue();
      } else if (index == 1) {
        var { title, displayOrder, description, blnPrimary, blnActive, fk_paymentMethoDID } = this.prepaymentForm.getRawValue();
      } else if (index == 2) {
        var { title, displayOrder, description, blnPrimary, blnActive, fk_paymentMethoDID } = this.thirdPartyForm.getRawValue();
      } else if (index == 3) {
        var { title, displayOrder, description, blnPrimary, blnActive, fk_paymentMethoDID } = this.creditTermsForm.getRawValue();
      }
      payment.push({
        title, displayOrder, description, blnPrimary, blnActive, fk_paymentMethodID: fk_paymentMethoDID
      })
    }
    let payload = {
      store_id: this.selectedStore.pk_storeID,
      payment_methods: payment,
      update_payment_method: true
    }
    this._storeManagerService.UpdatePaymentMethod(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.updateLoader = false;
      if (res["success"]) {
        this.paymentUpdateMsg = true;
        setTimeout(() => {
          this.paymentUpdateMsg = false;
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
