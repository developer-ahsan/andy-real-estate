import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { CreditTerm, UserCreditTerms } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';

@Component({
  selector: 'app-credit-terms',
  templateUrl: './credit-terms.component.html'
})
export class CreditTermsComponent implements OnInit {
  @Input() updateLoader: boolean;

  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private fetchCreditTerms: Subscription;
  credit_terms: string[] = ['Expired', 'Upon application approval', 'Net 10 days after delivery date', 'Net 30'];
  credit_term_options = [];
  credit_term_options_length = 0;
  selected_credit_term: CreditTerm | null = null;
  flashMessage: 'success' | 'error' | null = null;

  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._changeDetectorRef.markForCheck();
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        let params = {
          credit_terms: true,
          user_id: this.selectedCustomer.pk_userID
        }
        this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(addresses => {
          this.credit_term_options = addresses["data"];
          this.credit_term_options_length = this.credit_term_options.length;
          this.selected_credit_term = this.credit_term_options.filter(function (credit_term) { return credit_term.UserTermSelected == true })[0];
        }, err => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  updateCreditTerm(): void {
    this.updateLoader = true;
    const { pk_userID } = this.selectedCustomer;
    const { pk_creditTermID } = this.selected_credit_term;
    const payload: UserCreditTerms = {
      user_id: pk_userID,
      credit_term_id: pk_creditTermID,
      credit_term: true
    }
    this._customerService.PutApiData(payload)
      .subscribe((response: any) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.updateLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
     * Show flash message
     */
  showFlashMessage(type: 'success' | 'error'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3000);
  }
}
