import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { AddColor, AddImprintColor, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor } from '../../reports.types';

@Component({
  selector: 'app-graphics-support-report',
  templateUrl: './graphics-support-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class GraphicsSupportReportComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'rgb', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  mainScreen: string = 'Current Colors';
  keyword = '';
  not_available = 'N/A';


  isSearching: boolean = false;

  // AddColor
  ngName: string = '';
  ngRGB: string = '#000000';
  isAddColorLoader: boolean = false;

  // Update Color
  isUpdateColorLoader: boolean = false;
  isUpdateColors: boolean = false;
  updateColorData: any;
  ngRGBUpdate = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _ReportsService: ReportsService
  ) { }

  ngOnInit(): void {
  };

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
