import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SmartArtService } from '../../smartart.service';
@Component({
  selector: 'app-quote-scheduler',
  templateUrl: './quote-scheduler.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class QuoteSchedulerComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('drawer', { static: true }) drawer: MatDrawer;
  @Input() isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  mainScreen = 'Artwork Approved';
  dataSourceAwaiting = [];
  dataSourceOver48 = [];
  dataSourceOnHold = [];
  dataSourceFollow = [];
  tempDataSource = [];
  displayedColumns: string[] = ['date', 'inhands', 'order', 'customer', 'product', 'status', 'action'];
  totalRecordsAwaiting = 0;
  totalRecordsOver48 = 0;
  totalRecordsOnHold = 0;
  totalRecordsFollow = 0;
  tempRecords = 0;
  page = 1;

  isLoading48: boolean = false;
  onHoldLoader: boolean = false;
  followLoader: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _smartartService: SmartArtService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getSmartArtAwaitingList(1);
  };
  calledScreen(screen) {
    this.mainScreen = screen;
    if (screen == 'Artwork Approved') {
      if (this.totalRecordsAwaiting == 0) {
        this.getSmartArtAwaitingList(1);
      }
    } else if (screen == 'On-Hold') {
      if (this.totalRecordsOver48 == 0) {
        this.isLoading48 = true;
        this.getSmartArtover48List(1);
      }
    } else if (screen == 'Follow up') {
      if (this.totalRecordsOnHold == 0) {
        this.onHoldLoader = true;
        this.getSmartArtOnHoldList(1);
      }
    } else if (screen == 'PM') {
      if (this.totalRecordsFollow == 0) {
        this.followLoader = true;
        this.getSmartArtFollowList(1);
      }
    }
  }
  // ArtworkApproval
  getSmartArtAwaitingList(page) {
    let params = {
      sort_direction: 'DESC',
      sortField: 'fk_cartID',
      data_type: 1,
      quote_scheduler: true,
      page: page,
      size: 20,
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSourceAwaiting = res["data"];
      this.totalRecordsAwaiting = res["totalRecords"];
      if (this.tempDataSource.length == 0) {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      this.isLoading = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextDataAwaiting(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getSmartArtAwaitingList(this.page);
  };
  // On Hold Over 48
  getSmartArtover48List(page) {
    let params = {
      sort_direction: 'DESC',
      sortField: 'fk_cartID',
      data_type: 2,
      quote_scheduler: true,
      page: page,
      size: 20,
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSourceOver48 = res["data"];
      this.totalRecordsOver48 = res["totalRecords"];
      this.isLoading48 = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading48 = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextDataover48(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getSmartArtover48List(this.page);
  };
  // On-Hold
  getSmartArtOnHoldList(page) {
    let params = {
      sort_direction: 'DESC',
      sortField: 'fk_cartID',
      data_type: 3,
      quote_scheduler: true,
      page: page,
      size: 20,
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSourceOnHold = res["data"];
      this.totalRecordsOnHold = res["totalRecords"];
      this.onHoldLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.onHoldLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextDataOnHold(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getSmartArtOnHoldList(this.page);
  };
  // Follow Ups
  getSmartArtFollowList(page) {
    let params = {
      sort_direction: 'DESC',
      sortField: 'fk_cartID',
      data_type: 4,
      quote_scheduler: true,
      page: page,
      size: 20,
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSourceFollow = res["data"];
      this.totalRecordsFollow = res["totalRecords"];
      this.followLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.followLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextDataFollow(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getSmartArtFollowList(this.page);
  };
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };


}
