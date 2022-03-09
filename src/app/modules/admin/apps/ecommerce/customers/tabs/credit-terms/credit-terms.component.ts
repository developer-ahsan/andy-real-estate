import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { Subscription } from 'rxjs';
import { CreditTerm, UserCreditTerms } from 'app/modules/admin/apps/ecommerce/customers/customers.types';

@Component({
  selector: 'app-credit-terms',
  templateUrl: './credit-terms.component.html'
})
export class CreditTermsComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Input() updateLoader: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
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
    this.isLoadingChange.emit(false);
    const { pk_userID } = this.currentSelectedCustomer;
    this.fetchCreditTerms = this._customerService.getCreditTerms(pk_userID)
      .subscribe((addresses) => {
        this.credit_term_options = addresses["data"];
        this.credit_term_options_length = this.credit_term_options.length;
        this.selected_credit_term = this.credit_term_options.filter(function (credit_term) { return credit_term.UserTermSelected == true })[0];

        console.log("this.credit_term_options", this.credit_term_options)
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });


    this.isLoadingChange.emit(false);
  }

  ngOnDestroy(): void {
    this.fetchCreditTerms.unsubscribe();
  }

  updateCreditTerm(): void {
    this.updateLoader = true;
    const { pk_userID } = this.currentSelectedCustomer;
    const { pk_creditTermID } = this.selected_credit_term;
    const payload: UserCreditTerms = {
      user_id: pk_userID,
      credit_term_id: pk_creditTermID,
      credit_term: true
    }
    this._customerService.updateCreditTerm(payload)
      .subscribe((response: any) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.updateLoader = false;
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
