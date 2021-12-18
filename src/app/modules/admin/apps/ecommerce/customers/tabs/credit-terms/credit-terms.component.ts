import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-credit-terms',
  templateUrl: './credit-terms.component.html'
})
export class CreditTermsComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  credit_terms: string[] = ['Expired', 'Upon application approval', 'Net 10 days after delivery date', 'Net 30'];
  selected_credit_term: string = 'Expired';

  constructor() { }

  ngOnInit(): void {
  }

}
