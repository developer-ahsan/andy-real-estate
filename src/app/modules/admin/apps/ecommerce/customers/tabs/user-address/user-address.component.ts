import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-address',
  templateUrl: './user-address.component.html'
})
export class UserAddressComponent implements OnInit {
  @Input() currentSelectedCustomer: any;

  constructor() { }

  ngOnInit(): void { }

}
