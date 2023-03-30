import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { RapidBuildService } from '../../rapid-build.service';
@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class RapidSummaryComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  mainScreen = 'Artwork Approved';
  dataSource = [];
  displayedColumns: string[] = ['store', 'images', 'approval'];
  tempRecords = 20;
  page = 1;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _RapidBuildService: RapidBuildService
  ) { }

  dataInit() {
    this.dataSource = [
      {
        "name": "10ksbPromosAndPrint.com",
        "column1": "3",
        "column2": "0"
      },
      {
        "name": "2ndFamilyShop.com",
        "column1": "7",
        "column2": "1"
      },
      {
        "name": "AirForceROTCShop.com",
        "column1": "8",
        "column2": "0"
      },
      {
        "name": "ArmyROTCShop.com",
        "column1": "7",
        "column2": "0"
      },
      {
        "name": "AZPromoShop.com",
        "column1": "2",
        "column2": "9"
      },
      {
        "name": "BrandItShop.com",
        "column1": "16",
        "column2": "2"
      },
      {
        "name": "CCUPromos.com",
        "column1": "1",
        "column2": "0"
      },
      {
        "name": "ChurchPromoShop.com",
        "column1": "2",
        "column2": "9"
      },
      {
        "name": "ConsolidusPromos.com",
        "column1": "42",
        "column2": "0"
      },
      {
        "name": "ConsolidusShop.com",
        "column1": "21",
        "column2": "14"
      },
      {
        "name": "CUpromos.com",
        "column1": "2",
        "column2": "12"
      },
      {
        "name": "FitNationPromos.com",
        "column1": "1",
        "column2": "9"
      },
      {
        "name": "FloridaPolyShop.com",
        "column1": "18",
        "column2": "0"
      },
      {
        "name": "HCHPromosAndPrint.com",
        "column1": "8",
        "column2": "0"
      },
      {
        "name": "IrreverentWarriorsStore.com",
        "column1": "12",
        "column2": "0"
      },
      {
        "name": "IUCshop.com",
        "column1": "16",
        "column2": "0"
      },
      {
        "name": "JDogShop.com",
        "column1": "5",
        "column2": "1"
      },
      {
        "name": "LeadingAgeOhioShop.com",
        "column1": "9",
        "column2": "0"
      },
      {
        "name": "MemberPromos.com",
        "column1": "9",
        "column2": "1"
      },
      {
        "name": "MiamiOHshop.com",
        "column1": "10",
        "column2": "0"
      },
      {
        "name": "MicrobrewMarketing.com",
        "column1": "2",
        "column2": "0"
      },
      {
        "name": "MyGymPromos.com",
        "column1": "1",
        "column2": "6"
      },
      {
        "name": "MySBDCshop.com",
        "column1": "8",
        "column2": "1"
      },
      {
        "name": "MySummaShop.com",
        "column1": "26",
        "column2": "0"
      }
    ]
  }
  ngOnInit(): void {
    this.dataInit();
  };
  getNextDataAwaiting(ev) {

  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };


}
