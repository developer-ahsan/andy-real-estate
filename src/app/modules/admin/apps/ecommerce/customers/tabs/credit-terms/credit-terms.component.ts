import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';

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

  credit_terms: string[] = ['Expired', 'Upon application approval', 'Net 10 days after delivery date', 'Net 30'];
  selected_credit_term: string = 'Expired';

  constructor(
    private _customerService: CustomersService
  ) { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
   
  }

  updateCreditTerm(selected_credit_term: string): void {
    console.log("selected_credit_term", selected_credit_term);
    var index = this.credit_terms.findIndex(credit => credit === selected_credit_term);
    console.log("index", index)
    return;
    const { pk_userID } = this.currentSelectedCustomer;
    this.updateLoader = true;
    console.log(this._customerService.updateCreditTerm(pk_userID));
    this.updateLoader = false;
  }
}
