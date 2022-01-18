import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cost-analysis',
  templateUrl: './cost-analysis.component.html'
})
export class CostAnalysisComponent implements OnInit {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

}
