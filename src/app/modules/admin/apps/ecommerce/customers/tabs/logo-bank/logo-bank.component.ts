import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-logo-bank',
  templateUrl: './logo-bank.component.html'
})
export class LogoBankComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private fetchLocations: Subscription;
  locations: [];
  available_locations: [];
  locationsLength: number;
  displayedColumns: string[] = ['storeName', 'attributeName', 'locationName'];
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  locationForm: boolean = false;
  breakpoint: number;

  constructor(
    private _customerService: CustomersService
  ) { }

  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 620) ? 1 : 3;
    const { pk_userID } = this.currentSelectedCustomer;
    this.fetchLocations = this._customerService.getLocations(pk_userID)
      .subscribe((locations) => {
          this.locations = locations["data"];
          this.locationsLength = locations["totalRecords"];
          this.isLoadingChange.emit(false);
      });

      this._customerService.getAvailableLocations(pk_userID)
      .subscribe((available_locations) => {
          this.available_locations = available_locations["data"];
      });
  }

  locationFormToggle(){
    this.locationForm = !this.locationForm;
  }

  ngOnDestroy(): void {
    this.fetchLocations.unsubscribe();
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 620) ? 1 : (event.target.innerWidth <= 880) ? 2 : 3;
  }

  locationSelected(id: string){
    console.log("option id", id);
  }
  
}

