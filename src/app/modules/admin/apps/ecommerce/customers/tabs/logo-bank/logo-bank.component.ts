import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-logo-bank',
  templateUrl: './logo-bank.component.html'
})
export class LogoBankComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  
  clickedRows = new Set<PeriodicElement>();
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;
  logoBanksLength = 10;
  logoForm = false;

  selectedStore: string = 'select_store';
  stores: string[] = [
    'RaceWorldPromos.com',
    'RaceWorldPromos.com',
    'RaceWorldPromos.com'
  ];
  

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor() { }

  ngOnInit(): void {  
    this.isLoadingChange.emit(false);
  }

  locationFormToggle(){
    this.logoForm = !this.logoForm;
  }
}
