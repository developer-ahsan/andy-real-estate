import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { I } from '@angular/cdk/keycodes';

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

  mainScreen: string = "Marketing Campaign";
  screens = [
    "Marketing Campaign",
    "Campaigns",
    "New Campaign",
    "Set Featured",
    "Display Order"
  ];

  updateFeatureLoading: boolean = false;
  isEditCampaign: boolean = false;
  campaignForm: FormGroup;
  flashMessage: 'success' | 'error' | 'errorMessage' | null = null;

  mainCampaign = {
    data: {},
    loader: false,
    update_loader: false,
    update_msg: false
  }
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.dataSourceLoading = true;
    this.initialize();
    this.getFirstCall('get');
    this.getMainCampaign();
  };
  initialize() {
    this.campaignForm = new FormGroup({
      pk_campaignID: new FormControl(''),
      title: new FormControl(''),
      permalink: new FormControl(''),
      objective: new FormControl(''),
      shortDesc: new FormControl(''),
      strategy: new FormControl(''),
      results: new FormControl(''),
      videoURL: new FormControl(''),
      blnActive: new FormControl(''),
      blnFeature: new FormControl('')
    })
  }
  getFirstCall(type) {
    const { pk_storeID } = this.selectedStore;

    // Get the supplier products
    this._storeManagerService.getCampaigns(pk_storeID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;
        if (type != 'get') {
          this.updateFeatureLoading = false;
          this.flashMessage = type;
          this.hideFlashMessage();
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
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
      campaign_ids: checkArray,
      bln_feature: true,
      campaign_featured: true
    }
    this._storeManagerService.putStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.showFlashMessage(
          res["success"] === true ?
            'success' :
            'error'
        );
        this._changeDetectorRef.markForCheck();
      }, (err => {
        this.updateFeatureLoading = false;
        this._changeDetectorRef.markForCheck();
      }))
  }
  updateDisplayOrder() {
    this.updateFeatureLoading = true;
    let checkArray = []
    this.dataSource.forEach(element => {
      if (element.blnFeature) {
        checkArray.push({ campaign_id: element.pk_campaignID, display_order: Number(element.listOrder) })
      }
    });
    let params = {
      // store_id: this.selectedStore.pk_storeID,
      display_order: checkArray,
      campaign_display: true
    }
    this._storeManagerService.putStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.showFlashMessage(
          res["success"] === true ?
            'success' :
            'error'
        );
        this._changeDetectorRef.markForCheck();
      }, (err => {
        this.updateFeatureLoading = false;
        this._changeDetectorRef.markForCheck();
      }))
  }
  campaignEdit(campaign) {
    this.isEditCampaign = true;
    this.campaignForm.patchValue(campaign)
  }
  backToCampaigns() {
    this.isEditCampaign = false;
  }
  showFlashMessage(type: 'success' | 'error'): void {
    // Show the message
    this.flashMessage = null;
    this.getFirstCall(type);

    // Mark for check
    this._changeDetectorRef.markForCheck();
  };
  hideFlashMessage() {
    // Hide it after 3.5 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3500);
  }
  getMainCampaign() {
    this.mainCampaign.loader = true;
    const { pk_storeID } = this.selectedStore;
    let params = {
      store_id: pk_storeID,
      main_campaign: true
    }
    // Get the supplier products
    this._storeManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.mainCampaign.loader = false;
        this.mainCampaign.data = response["data"][0];
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.mainCampaign.loader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };
  updateMainCampaign(item) {
    this.mainCampaign.update_loader = true;
    const { pk_storeID } = this.selectedStore;
    let payload = {
      store_id: pk_storeID,
      campaign_center_copy: item.campaignCenterCopy.replace(`'`, `"`),
      title: item.campaignTitle.replace(`'`, `"`),
      campaign_update: true
    }
    // Get the supplier products
    this._storeManagerService.putStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.mainCampaign.update_loader = false;
        this.mainCampaign.update_msg = true;

        if (response["success"]) {
          setTimeout(() => {
            this.mainCampaign.update_msg = false;
            this._changeDetectorRef.markForCheck();
          }, 2000);
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.mainCampaign.update_loader = false;
        this.mainCampaign.update_msg = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };
}
