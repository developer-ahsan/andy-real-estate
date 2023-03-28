import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { AddColor, AddImprintColor, AddImprintMethod, AddStandardImprintGroup, DeleteColor, DeleteImprintColor, DeleteStandardImprint, DeleteStandardImprintGroup, UpdateColor, UpdateImprintColor, UpdateImprintMethod, UpdateStandardImprintGroup } from '../../reports.types';
import { fuseAnimations } from '@fuse/animations';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';

@Component({
  selector: 'app-support-report',
  templateUrl: './support-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"],
  animations: fuseAnimations
})
export class ReportSupportComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'action', 'list'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  mainScreen: string = 'Current Imprint Methods';
  keyword = '';
  not_available = 'N/A';


  isSearching: boolean = false;

  // Add Method
  ngName: string = '';
  ngDesc: string = '';
  isAddGroupLoader: boolean = false;

  // Update Color
  isUpdateMethodLoader: boolean = false;
  isUpdateMethod: boolean = false;
  updateMethodData: any;
  ngRGBUpdate = '';

  // Group Imprint
  groupImprintData: any;
  subImprintsPage = 1;
  viewImprintLoader: boolean = false;
  isAddNewImprint: boolean = false;
  imprintGroupData: any;
  isError: boolean = false;

  // ReportDropdowns
  roleID = 0;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: ReportsService
  ) { }

  ngOnInit(): void {
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