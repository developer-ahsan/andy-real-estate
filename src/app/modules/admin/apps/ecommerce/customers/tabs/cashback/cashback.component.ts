import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cashback',
  templateUrl: './cashback.component.html'
})
export class CashbackComponent implements OnInit {
  selectedStore: string;
  stores: string[] = [
    'AirForceROTCShop.com',
    'ArmyROTCShop.com',
    'BrandItShop.com',
    'FunnelPromos.com',
    'MySummaShop.com',
    'universitypromosandprint.com'
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
