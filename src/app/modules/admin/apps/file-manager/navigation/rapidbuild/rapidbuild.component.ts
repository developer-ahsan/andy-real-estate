import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../file-manager.service';

@Component({
  selector: 'app-rapidbuild',
  templateUrl: './rapidbuild.component.html'
})
export class RapidbuildComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['id', 'status', 'age', 'pid', 'spid', 'product', 'supplier', 'last_proof_of'];
  dataSource = [];
  dataSourceTotalRecord;
  dataSourceLoading = true;
  statusID: number = 2;

  dropdown = [];
  dropdownLoader = true;
  selectedStatus = null;
  dropdownFetchLoader = false;

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef
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
    this.dropdownFetchLoader = true;
    if (obj === 'all') {
      this.getAllRapidBuildImages();
      return;
    };

    const { pk_statusID } = obj;

    this.statusID = pk_statusID;

    // Get the getRapidBuildImages
    this.getRapidBuildImages(this.statusID);

  }

  getRapidBuildImages(statusId): void {
    const { pk_storeID } = this.selectedStore;

    this._fileManagerService.getRapidBuildImages(pk_storeID, statusId)
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
    this.dropdownFetchLoader = true;
    let id;
    if (event.target.value) {
      id = event.target.value;
    } else {
      id = '';
    }

    this._fileManagerService.getAllRapidBuildImagesById(pk_storeID, id)
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

  searchKeyword(event): void {
    const { pk_storeID } = this.selectedStore;
    this.dropdownFetchLoader = true;
    let keyword;
    if (event.target.value) {
      keyword = event.target.value;
    } else {
      keyword = '';
    }

    this._fileManagerService.getAllRapidBuildImagesByKeyword(pk_storeID, keyword)
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
}
