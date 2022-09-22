import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cost-center-code',
  templateUrl: './cost-center-code.component.html'
})
export class CostCenterCodeComponent implements OnInit, OnDestroy {

  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  mainScreen: string = "Cost Center Codes";
  screens = [
    "Cost Center Codes",
    "Add New Code"
  ];

  displayedColumns: string[] = ['code', 'action'];
  dataSource = [];
  isPageLoading = false;

  isCostAddLoader: boolean = false;
  isCostAddMsg: boolean = false;
  ngCostCode = '';

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isPageLoading = true;
    this.getData('get');
    this.isLoadingChange.emit(false);
  };
  calledScreen(screenName): void {
    this.mainScreen = screenName;
  };
  getData(type) {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      center_code: true
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        if (type == 'add') {
          this.isCostAddLoader = false;
          this.isCostAddMsg = true;
          this.ngCostCode = '';
          setTimeout(() => {
            this.isCostAddMsg = false;
            this._changeDetectorRef.markForCheck();
          }, 2000);
        } else if (type == 'get') {
          this.isPageLoading = false;
        }
        this.dataSource = res["data"];
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isPageLoading = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  addCostCode() {
    if (this.ngCostCode) {
      this.isCostAddLoader = true;
      let payload = {
        fk_storeID: this.selectedStore.pk_storeID,
        code: this.ngCostCode,
        add_center_code: true
      }
      this._fileManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this.getData('add');
        }
      }, err => {
        this.isCostAddLoader = false;
        this._changeDetectorRef.markForCheck();
      })
    } else {
      this._snackBar.open("Please Check Input Fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    }
  }
  removeCostCode(item) {
    console.log(item)
    item.delLoader = true;
    let payload = {
      pk_costCenterCodeID: item.pk_costCenterCodeID,
      delete_center_code: true
    }
    this._fileManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        item.delLoader = false;
        this.dataSource = this.dataSource.filter((value) => {
          return value.pk_costCenterCodeID != item.pk_costCenterCodeID;
        });
        this._snackBar.open("Cost Code Deleted Successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      item.delLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  updateCostCode(item) {
    if (item.code) {
      item.updateLoader = true;
      let payload = {
        code: item.code,
        pk_costCenterCodeID: item.pk_costCenterCodeID,
        update_center_code: true
      }
      this._fileManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          item.updateLoader = false;
          this._snackBar.open("Cost Code Updated Successfully", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3000
          });
          this._changeDetectorRef.markForCheck();
        }
      }, err => {
        item.updateLoader = false;
        this._changeDetectorRef.markForCheck();
      })
    } else {
      this._snackBar.open("Please Check Input Field", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    }

  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}