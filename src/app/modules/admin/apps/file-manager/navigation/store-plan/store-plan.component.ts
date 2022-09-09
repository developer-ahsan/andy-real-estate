import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-store-plan',
  templateUrl: './store-plan.component.html'
})
export class StorePlanComponent implements OnInit {

  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['quarter', 'director', 'created', 'updated', 'submitted'];
  dataSource = [];
  dataSourceLoading = false;

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.dataSourceLoading = true;
    this.getDataPlans();
    this.isLoadingChange.emit(false);
  };
  getDataPlans() {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      store_plan: true
    }
    // Get the offline products
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceLoading = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
}
