import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-credit-applications',
  templateUrl: './credit-applications.component.html'
})
export class CreditApplicationsComponent implements OnInit {
  @Input() currentSelectedCustomer: any;

  constructor() { }

  ngOnInit(): void {
  }

}
