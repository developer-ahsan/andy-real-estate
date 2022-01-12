import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-orders-summary',
  templateUrl: './orders-summary.component.html'
})
export class OrdersSummaryComponent implements OnInit {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
    this.isLoading = false;
  }

}
