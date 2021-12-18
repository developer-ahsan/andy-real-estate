import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-address',
  templateUrl: './user-address.component.html'
})
export class UserAddressComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  breakpoint: number;

  constructor() { }

  ngOnInit(): void { 
    this.breakpoint = (window.innerWidth <= 800) ? 1 : 2;
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 2;
  }

}
