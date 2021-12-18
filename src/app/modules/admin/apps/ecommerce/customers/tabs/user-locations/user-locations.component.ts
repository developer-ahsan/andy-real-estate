import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-locations',
  templateUrl: './user-locations.component.html'
})
export class UserLocationsComponent implements OnInit {
  @Input() currentSelectedCustomer: any;

  constructor() { }

  ngOnInit(): void {
  }

}
