import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

interface Transaction {
  item: string;
  min: number;
  max: number;
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html'
})
export class TimelineComponent implements OnInit {
  @Input() isLoading: boolean;
  @Input() selectedOrder: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  displayedColumns: string[] = ['item', 'min', 'max'];
  transactions: Transaction[] = [
    { item: 'ARTWORK', min: 1, max: 5 },
    { item: 'PRODUCTION', min: 3, max: 3 },
    { item: 'SHIPPING', min: 4, max: 4 },
  ];

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
      this.isLoadingChange.emit(false)
    }, 100);
  }

  getTotalMin() {
    return this.transactions.map(t => t.min).reduce((acc, value) => acc + value, 0);
  }

  getTotalMax() {
    return this.transactions.map(t => t.max).reduce((acc, value) => acc + value, 0);
  }
}
