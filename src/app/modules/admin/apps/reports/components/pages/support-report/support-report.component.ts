import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { AddColor, AddImprintColor, AddImprintMethod, AddStandardImprintGroup, DeleteColor, DeleteImprintColor, DeleteStandardImprint, DeleteStandardImprintGroup, UpdateColor, UpdateImprintColor, UpdateImprintMethod, UpdateStandardImprintGroup } from '../../reports.types';
import { fuseAnimations } from '@fuse/animations';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-support-report',
  templateUrl: './support-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"],
  animations: fuseAnimations
})
export class ReportSupportComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  isLoading: boolean = false;
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
  isGenerateReportLoader: boolean;

  // ReportDropdowns
  roleID = 0;

  allRoles = [];
  selectedRoles: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public _reportService: ReportsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getRoles();
  };
  getRoles() {
    let param = {
      roles: true
    }
    this._reportService.getAPIData(param).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let roles = res["data"][0].roles.split(',,');
      roles.forEach(element => {
        const [roleName, pk_roleID] = element.split('::');
        this.allRoles.push({ roleName: roleName, pk_roleID: Number(pk_roleID) });
      });
      this.selectedRoles = 0;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  generateReport() {
    if (!this._reportService.reporter.viewSupportReport) {
      this._reportService.snackBar('You do not have permission to access this section.');
      return;
    }
    if (!this.selectedRoles) {
      this._reportService.snackBar('Please select a support role.');
      return;
    }

    this.isGenerateReportLoader = true;
    setTimeout(() => {
      this.isGenerateReportLoader = false;
      this._reportService.snackBar('No orders have been found in the specified range that match your criteria.');
      this._changeDetectorRef.markForCheck();
    }, 1000);
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