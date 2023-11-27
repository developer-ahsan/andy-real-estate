import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-reset-top-ten',
  templateUrl: './reset-top-ten.component.html'
})
export class ResetTopTenComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  updateLoader: boolean = false;
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
      });
  }
  reset(): void {
    this.updateLoader = true;
    let payload = {
      files: [`/SmartSiteCom/productClickCounts/${this.selectedStore.pk_storeID}.xml`],
      delete_multiple_files: true
    }
    this._commonService.removeMediaFiles(payload).
      pipe(takeUntil(this._unsubscribeAll), finalize(() => {
        this.updateLoader = false;
        this._changeDetectorRef.markForCheck();
      }))
      .subscribe((response) => {
        this._storeManagerService.snackBar('The top ten list has been reset successfully.');
      }, err => {
        this._storeManagerService.snackBar(`Can't reset the top ten list - the file does not exist or there was an error.`);
        this._changeDetectorRef.markForCheck();
      })
  };
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
