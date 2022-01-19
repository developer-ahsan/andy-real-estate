import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

interface IncidentReports {
  id: string;
  created: string;
  created_by: string;
  store: string;
  source: string;
  source_entities: string;
}

@Component({
  selector: 'app-incident-reports',
  templateUrl: './incident-reports.component.html'
})
export class IncidentReportsComponent implements OnInit {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  displayedColumns: string[] = ['id', 'created', 'created_by', 'store', 'source', 'source_entities'];
  transactions: IncidentReports[] = [
    { id: '215', created: "10/31/2016", created_by: "false", store: "LeadingAgeOhioShop.com", source: "Supplier", source_entities: "Hit Promotional Products" }
  ];
  isView: boolean = false;
  isViewCreateIncidentReportForm: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  viewIncidentReport(): void {
    this.isView = !this.isView;
  }

  viewCreateIncidentReportForm(): void {
    this.isViewCreateIncidentReportForm = !this.isViewCreateIncidentReportForm;
  }
}

