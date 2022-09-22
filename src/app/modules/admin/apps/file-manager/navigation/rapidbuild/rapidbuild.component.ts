import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../store-manager.service';

@Component({
  selector: 'app-rapidbuild',
  templateUrl: './rapidbuild.component.html'
})
export class RapidbuildComponent implements OnInit, OnDestroy {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['id', 'status', 'product', 'supplier', 'last_proof_of'];
  dataSource = [];
  dataSourceTotalRecord;
  dataSourceLoading = true;
  statusID: number = 2;
  duplicatedDataSource = [];
  dropdown = [];
  dropdownLoader = true;
  selectedStatus = null;
  dropdownFetchLoader = false;

  filterLoader = false;

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const { pk_storeID } = this.selectedStore;

    // Get the offline products
    this._fileManagerService.getRapidBuildDropDown(pk_storeID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dropdown = response["data"];
        this.selectedStatus = this.dropdown[1];
        this.dropdownLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    this.getRapidBuildImages(2);

    this.isLoadingChange.emit(false);
  };

  changeStatus(obj): void {
    this.filterLoader = true;
    const { pk_storeID } = this.selectedStore;

    if (obj === 'all') {
      this._fileManagerService.getAllRapidBuildImages(pk_storeID)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
          this.dataSource = response["data"];
          this.dataSourceTotalRecord = response["totalRecords"];
          this.dataSourceLoading = false;
          this.dropdownFetchLoader = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        });
      return;
    };

    const { pk_statusID } = obj;
    this.statusID = pk_statusID;

    this._fileManagerService.getRapidBuildImages(pk_storeID, pk_statusID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;
        this.dropdownFetchLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

  }

  getRapidBuildImages(statusId): void {
    const { pk_storeID } = this.selectedStore;

    this._fileManagerService.getRapidBuildImages(pk_storeID, statusId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceTotalRecord = response["totalRecords"];
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceLoading = false;
        this.dropdownFetchLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  resetSearch(): void {
    this.dataSource = this.duplicatedDataSource;

    // Mark for check
    this._changeDetectorRef.markForCheck();
  };

  getAllRapidBuildImages(): void {
    const { pk_storeID } = this.selectedStore;

    this._fileManagerService.getAllRapidBuildImages(pk_storeID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;
        this.dropdownFetchLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  searchId(event): void {
    const { pk_storeID } = this.selectedStore;
    this.filterLoader = true;
    let keyword = event.target.value;

    if (!keyword) {
      this._snackBar.open("Please enter text to search", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };

    this._fileManagerService.getAllRapidBuildImagesById(pk_storeID, keyword)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;
        this.filterLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  searchKeyword(event): void {
    const { pk_storeID } = this.selectedStore;
    this.filterLoader = true;
    let keyword = event.target.value;

    if (!keyword) {
      this._snackBar.open("Please enter text to search", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };

    this._fileManagerService.getAllRapidBuildImagesByKeyword(pk_storeID, keyword)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;
        this.filterLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
