import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { FileManagerService } from '../../store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-fulfill-options',
  templateUrl: './fulfill-options.component.html'
})
export class FulfillOptionsComponent implements OnInit, OnDestroy {

  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isPageLoading: boolean = false;
  optionForm: FormGroup;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.optionForm = new FormGroup({
      billingCompanyName: new FormControl('', Validators.required),
      billingFirstName: new FormControl('', Validators.required),
      billingLastName: new FormControl('', Validators.required),
      billingAddress: new FormControl('', Validators.required),
      billingCity: new FormControl('', Validators.required),
      billingState: new FormControl('', Validators.required),
      billingZip: new FormControl('', Validators.required),
      billingPhone: new FormControl('', Validators.required),
      billingEmail: new FormControl('', Validators.required),
      blnEvent: new FormControl(true, Validators.required),
      blnBilling: new FormControl(true, Validators.required)
    })
    this.isPageLoading = true;
    this.getOptionsData();
  }
  getOptionsData() {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      fulfillment_option: true
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.optionForm.patchValue(res["data"][0]);
        this.isPageLoading = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
