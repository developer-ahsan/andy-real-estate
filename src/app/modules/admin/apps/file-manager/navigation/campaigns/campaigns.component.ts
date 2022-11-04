import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { I } from '@angular/cdk/keycodes';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.component.html',
  styles: ['::ng-deep {.ql-container {height: auto}}']
})
export class CampaignsComponent implements OnInit, OnDestroy {
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
  addCampaignForm: FormGroup;
  flashMessage: 'success' | 'error' | 'errorMessage' | null = null;

  mainCampaign = {
    data: {},
    loader: false,
    update_loader: false,
    update_msg: false
  }

  dropdownSettings: IDropdownSettings = {};
  dropdownList: any;
  addNewCampaignLoader: boolean = false;
  imageValue: { imageUpload: string | ArrayBuffer; type: any; campaign_id: any; };
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.dataSourceLoading = true;
    this.getStoreProducts();
    this.initialize();
    this.getFirstCall('get');
    this.getMainCampaign();
  };
  getStoreProducts() {
    this._storeManagerService.getExtendedListStoreProducts(this.selectedStore.pk_storeID, 1).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dropdownList = res["data"];
    });
  }
  addnewCampaign() {
    const { fk_storeID, objective, strategy, results, store_product_list_id, title, shortDesc, blnFeature, blnActive, videoURL, permalink, add_new_campaign } = this.addCampaignForm.getRawValue();
    let products = [];
    store_product_list_id.forEach(element => {
      products.push(element.pk_storeProductID);
    });
    if (title == '' || objective == '' || strategy == '' || results == '' || shortDesc == '') {
      this._snackBar.open("Please fill out the required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    if (products.length == 0) {
      this._snackBar.open("Please select four products to feature for this campaign.", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    this.addNewCampaignLoader = true;
    let payload = {
      fk_storeID,
      objective,
      strategy,
      results,
      store_product_list_id: products,
      title,
      shortDesc,
      blnFeature, blnActive, videoURL, permalink, add_new_campaign
    }
    this._storeManagerService.AddCampaign(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        if (this.imageValue) {
          this.imageValue.campaign_id = res["campaign_id"];
          this.uploadMediaCampaign(this.imageValue);
        }
        this.getFirstCall('add');
      }

    }, err => {
      this.addNewCampaignLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  uploadImage(event): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 700 || image.height != 200) {
          this._snackBar.open("Dimensions allowed are 700px x 200px", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.imageValue = null;
          this._changeDetectorRef.markForCheck();
          return;
        };
        this.imageValue = {
          imageUpload: reader.result,
          type: file["type"],
          campaign_id: null
        };
      }
    };
  };
  uploadMediaCampaign(obj) {
    // const { pk_productID } = this.selectedProduct;
    const { imageUpload, type, campaign_id } = obj;
    const base64 = imageUpload.split(",")[1];
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: `/globalAssets/Campaigns/Banners/${campaign_id}.jpg`
    };

    this._storeManagerService.addCampaignMedia(payload)
      .subscribe((response) => {
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
  initialize() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'pk_storeProductID',
      textField: 'productName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 4,
      allowSearchFilter: true,
      limitSelection: 4
    };
    this.addCampaignForm = new FormGroup({
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      objective: new FormControl(''),
      strategy: new FormControl(''),
      results: new FormControl(''),
      store_product_list_id: new FormControl([]),
      title: new FormControl(''),
      shortDesc: new FormControl(''),
      blnFeature: new FormControl(false),
      blnActive: new FormControl(true),
      videoURL: new FormControl(''),
      permalink: new FormControl(''),
      add_new_campaign: new FormControl(true),
    })
    this.campaignForm = new FormGroup({
      pk_campaignID: new FormControl(''),
      image: new FormControl(''),
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
        if (type == 'add') {
          this.initialize();
          this.mainScreen = 'Campaigns';
          this.addNewCampaignLoader = false;
          this._changeDetectorRef.markForCheck();
        }
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
    this.campaignForm.patchValue({
      image: environment.campaignMedia + `/Banners/${campaign.pk_campaignID}.jpg`
    })
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
    this._storeManagerService.getMainCampaign(params)
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


  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
