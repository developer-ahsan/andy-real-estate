import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { FileManagerService } from '../../store-manager.service';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-credit-terms',
  templateUrl: './credit-terms.component.html',
})
export class CreditTermsComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isPageLoading: boolean = false;
  creditTerms: any;
  selectedTerm: any;
  isApplyLoader: boolean = false;
  isApplyMsg: boolean = false;
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.isPageLoading = true;
    this.getStoreDetails();
  }
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.isPageLoading = true;
        this.getCredits();
      });
  }
  getCredits() {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      credit_term: true
    }
    this._storeManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.isPageLoading = false;
        this.creditTerms = res["data"];
        this._changeDetectorRef.markForCheck();
      })
  }
  updateCreditTerms() {
    this.isApplyLoader = true;
    if (this.selectedTerm != null) {
      let payload = {
        store_id: this.selectedStore.pk_storeID,
        credit_term_id: this.selectedTerm,
        update_credit_terms: true
      }
      this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this.selectedTerm = null;
          this.isApplyLoader = false;
          this.isApplyMsg = true;
          setTimeout(() => {
            this.isApplyMsg = false;
            this._changeDetectorRef.markForCheck();
          }, 2000);
          this._changeDetectorRef.markForCheck();
        }
      }, err => {
        this.isApplyLoader = false;
        this._changeDetectorRef.markForCheck();
      })
    } else {
      this._snackBar.open("Please Select Any Term", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 2000
      });
      this.isApplyLoader = false;
      this._changeDetectorRef.markForCheck();
    }

  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
