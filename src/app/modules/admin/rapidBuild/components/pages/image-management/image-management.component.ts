import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { RapidBuildService } from '../../rapid-build.service';
import { HideUnhideCart, updateAttentionFlagOrder } from '../../rapid-build.types';
@Component({
  selector: 'app-image-management',
  templateUrl: './image-management.component.html',
  styles: [".mat-paginator  {border-radius: 16px !important} .mat-drawer-container {border-radius: 16px !important} ::-webkit-scrollbar {height: 3px !important}"]
})
export class RapidImageManagementComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  mainScreen = 'Artwork Approved';
  dataSource = [];
  displayedColumns: string[] = ['ID', 'Status', 'Age', 'SPID', 'PID', 'Product', 'Supplier', 'Store', 'proof', 'action'];
  tempRecords = 20;
  page = 1;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _RapidBuildService: RapidBuildService
  ) { }

  dataInit() {
    this.dataSource = [
      {
        "FIELD1": "86912",
        "FIELD2": "Image Needed",
        "FIELD3": "12 hours",
        "FIELD4": "154328",
        "FIELD5": "3613",
        "FIELD6": "Game Day Clear Wristlet Pouch",
        "FIELD7": "Hit Promotional Products",
        "FIELD8": "SwagByConsolidus.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86911",
        "FIELD2": "Image Needed",
        "FIELD3": "12 hours",
        "FIELD4": "154327",
        "FIELD5": "LT-4218",
        "FIELD6": "Boutique Cotton Panel Tote",
        "FIELD7": "Primeline",
        "FIELD8": "universitypromosandprint.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86910",
        "FIELD2": "Image Needed",
        "FIELD3": "12 hours",
        "FIELD4": "154326",
        "FIELD5": "2196",
        "FIELD6": "3 Inch Large Carabiner",
        "FIELD7": "CPS/Keystone",
        "FIELD8": "BrandItShop.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86909",
        "FIELD2": "Image Needed",
        "FIELD3": "14 hours",
        "FIELD4": "154309",
        "FIELD5": "KM8408",
        "FIELD6": "Perka Winston 28oz Double Wall Travel Mug",
        "FIELD7": "Logomark Inc",
        "FIELD8": "universitypromosandprint.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86908",
        "FIELD2": "Image Needed",
        "FIELD3": "14 hours",
        "FIELD4": "154324",
        "FIELD5": "LG-9422",
        "FIELD6": "Tuscany Tech Padfolio",
        "FIELD7": "Primeline",
        "FIELD8": "MiamiOHshop.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86907",
        "FIELD2": "Image Needed",
        "FIELD3": "16 hours",
        "FIELD4": "154323",
        "FIELD5": "SemiGlossLargePoster",
        "FIELD6": "Large Poster Printing - 18\" x 24\"",
        "FIELD7": "UPrinting",
        "FIELD8": "AirForceROTCShop.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86906",
        "FIELD2": "Image Needed",
        "FIELD3": "18 hours",
        "FIELD4": "154318",
        "FIELD5": "NV-106",
        "FIELD6": "Wood Beach Chair Cell Phone Holder",
        "FIELD7": "Kin Image",
        "FIELD8": "BrandItShop.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86905",
        "FIELD2": "Image Needed",
        "FIELD3": "18 hours",
        "FIELD4": "154322",
        "FIELD5": "1376852_GJ",
        "FIELD6": "Under Armour Ladies' Team Tech Long-Sleeve T-Shirt",
        "FIELD7": "Alpha Broder",
        "FIELD8": "SwagByConsolidus.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86904",
        "FIELD2": "Image Needed",
        "FIELD3": "18 hours",
        "FIELD4": "154320",
        "FIELD5": "SM-6931",
        "FIELD6": "Bluff 12oz Vacuum Tumbler & Cooler",
        "FIELD7": "Bullet Line",
        "FIELD8": "theJCUShop.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86903",
        "FIELD2": "Image Needed",
        "FIELD3": "18 hours",
        "FIELD4": "154321",
        "FIELD5": "SM-6931",
        "FIELD6": "Bluff 12oz Vacuum Tumbler & Cooler",
        "FIELD7": "Bullet Line",
        "FIELD8": "theYSUshop.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86902",
        "FIELD2": "Image Needed",
        "FIELD3": "18 hours",
        "FIELD4": "154319",
        "FIELD5": "1376843_GJ",
        "FIELD6": "Under Armour Men's Team Tech Long-Sleeve T-Shirt",
        "FIELD7": "Alpha Broder",
        "FIELD8": "SwagByConsolidus.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86901",
        "FIELD2": "Image Needed",
        "FIELD3": "19 hours",
        "FIELD4": "43435",
        "FIELD5": "34",
        "FIELD6": "Kan-Tastic Laminated Foam Koozie",
        "FIELD7": "Hit Promotional Products",
        "FIELD8": "10ksbPromosAndPrint.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86900",
        "FIELD2": "Image Needed",
        "FIELD3": "15 hours",
        "FIELD4": "154317",
        "FIELD5": "LP-22 PRT_Quote",
        "FIELD6": "Full Color custom Lapel Pin",
        "FIELD7": "BizPins",
        "FIELD8": "OHIOPromoShop.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86899",
        "FIELD2": "Image Needed",
        "FIELD3": "20 hours",
        "FIELD4": "154306",
        "FIELD5": "SDMP04",
        "FIELD6": "Ergonomic Memory Foam Keyboard & Mouse Wrist S",
        "FIELD7": "Logos For You LLC",
        "FIELD8": "ConsolidusPromos.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86898",
        "FIELD2": "Image Needed",
        "FIELD3": "20 hours",
        "FIELD4": "154316",
        "FIELD5": "2301-36",
        "FIELD6": "Game Day Clear Stadium Tote",
        "FIELD7": "Leeds",
        "FIELD8": "universitypromosandprint.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86897",
        "FIELD2": "Image Needed",
        "FIELD3": "21 hours",
        "FIELD4": "154315",
        "FIELD5": "PA1141_Q47024",
        "FIELD6": "Paper Certificate Holder",
        "FIELD7": "The Leslie Company Inc",
        "FIELD8": "ConsolidusShop.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86896",
        "FIELD2": "Image Needed",
        "FIELD3": "21 hours",
        "FIELD4": "154314",
        "FIELD5": "GSTO-000/011/023-72",
        "FIELD6": "72\" Embroidered Graduation Sash",
        "FIELD7": "Wolfmark Ties",
        "FIELD8": "IUCshop.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86895",
        "FIELD2": "Image Needed",
        "FIELD3": "21 hours",
        "FIELD4": "154310",
        "FIELD5": "SLC",
        "FIELD6": "1-1/2 W x 1\" H Die Struck Lapel Pin",
        "FIELD7": "BizPins",
        "FIELD8": "OHIOPromoShop.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86894",
        "FIELD2": "Image Needed",
        "FIELD3": "22 hours",
        "FIELD4": "154313",
        "FIELD5": "A480/A481_GJ",
        "FIELD6": "Adidas Floating 3-Stripes Sport Shirt",
        "FIELD7": "S & S Active Wear",
        "FIELD8": "TuffyShop.com",
        "FIELD9": "N/A",
        "FIELD10": ""
      },
      {
        "FIELD1": "86893",
        "FIELD2": "Image Needed",
        "FIELD3": "22 hours",
        "FIELD4": "154312",
        "FIELD5": "BHEC06",
        "FIELD6": "Horizontal Badge Holder - 3\" x 4\"",
        "FIELD7": "Imprint ID",
        "FIELD8": "SwagByConsolidus.com",
        "FIELD9": "N/A",
        "FIELD10": ""
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
