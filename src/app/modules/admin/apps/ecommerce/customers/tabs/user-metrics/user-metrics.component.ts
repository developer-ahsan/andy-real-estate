import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-metrics',
  templateUrl: './user-metrics.component.html'
})
export class UserMetricsComponent implements OnInit {
  @Input() currentSelectedCustomer: any;

  constructor() { }

  ngOnInit(): void {
  }
}
