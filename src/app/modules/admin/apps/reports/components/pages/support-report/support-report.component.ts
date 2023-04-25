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

  // ReportDropdowns
  roleID = 0;

  allRoles = [];
  searchRolesCtrl = new FormControl();
  selectedRoles: any;
  isSearchingRoles = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService
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
      this.allRoles.push({ roleName: 'Select a role', pk_roleID: '' });
      this.allRoles = this.allRoles.concat(res["data"]);
      this.selectedRoles = this.allRoles[0];
      this.searchRolesCtrl.setValue(this.selectedRoles);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
    let params;
    this.searchRolesCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          roles: true,
          keyword: res
        }
        return res !== null && res.length >= 2
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allRoles = [];
        this.isSearchingRoles = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._reportService.getAPIData(params)
        .pipe(
          finalize(() => {
            this.isSearchingRoles = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allRoles.push({ roleName: 'Select a role', pk_roleID: '' });
      this.allRoles = this.allRoles.concat(data["data"]);
    });
  }
  onSelectedRoles(ev) {
    this.selectedRoles = ev.option.value;
  }
  displayWithRoles(value: any) {
    return value?.roleName;
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