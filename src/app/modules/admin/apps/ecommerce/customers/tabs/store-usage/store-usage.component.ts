import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

export interface PeriodicElement {
  name: string;
  position: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'RaceWorldPromos.com'},
  {position: 2, name: 'AirForceROTCShop.com'},
  {position: 3, name: 'RaceWorldPromos.com'},
  {position: 4, name: 'universitypromosandprint.com'},
  {position: 5, name: 'RaceWorldPromos.com'},
  {position: 6, name: 'RaceWorldPromos.com'},
  {position: 7, name: 'universitypromosandprint.com'},
  {position: 8, name: 'RaceWorldPromos.com'},
  {position: 9, name: 'universitypromosandprint.com'},
  {position: 10, name: 'AirForceROTCShop.com'},
];

@Component({
  selector: 'app-store-usage',
  templateUrl: './store-usage.component.html'
})
export class StoreUsageComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  
  clickedRows = new Set<PeriodicElement>();
  displayedColumns: string[] = ['name', 'action'];
  dataSource = ELEMENT_DATA;
  storesLength = 10;
  addStoreForm = false;

  selectedStore: string = 'select_store';
  stores: string[] = [
    'RaceWorldPromos.com',
    'AirForceROTCShop.com',
    'universitypromosandprint.com'
  ];
  

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor() { }

  ngOnInit(): void {  
    this.isLoadingChange.emit(false);
  }

  storeFormToggle(){
    this.addStoreForm = !this.addStoreForm;
  }
}
