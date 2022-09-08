import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.component.html',
  styles: ['::ng-deep {.ql-container {height: auto}}']
})
export class CampaignsComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  selected = 'YES';
  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': ['white'] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };
  checked = false;
  indeterminate = false;
  labelPosition: 'before' | 'after' = 'after';
  disabled = false;

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['objective', 'blnFeature', 'blnActive'];
  dataSource = [];
  duplicatedDataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;

  mainScreen: string = "Campaigns";
  screens = [
    "Campaigns",
    "New Campaign",
    "Set Featured",
    "Display Order"
  ];

  updateFeatureLoading: boolean = false;
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.dataSourceLoading = true;
    this.getFirstCall();
  };
  initialize() {
  }
  getFirstCall() {
    const { pk_storeID } = this.selectedStore;

    // Get the supplier products
    this._storeManagerService.getCampaigns(pk_storeID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {

        // Recall on error
        this.getFirstCall();
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getMainStoreCall(this.page);
  };

  getMainStoreCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the offline products
    this._storeManagerService.getCampaignsByPage(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.dataSource = [];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  calledScreen(screenName): void {
    this.mainScreen = screenName;
  };

  updateFeature() {
    this.updateFeatureLoading = true;
    let checkArray = []
    this.dataSource.forEach(element => {
      if (element.blnFeature) {
        checkArray.push(element.pk_campaignID)
      }
    });
    let params = {
      store_id: this.selectedStore.pk_storeID,
      campaign_ids: checkArray.toString(),
      bln_feature: true
    }
    this._storeManagerService.puttStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.updateFeatureLoading = false;
        this._changeDetectorRef.markForCheck();
      })
  }

}
