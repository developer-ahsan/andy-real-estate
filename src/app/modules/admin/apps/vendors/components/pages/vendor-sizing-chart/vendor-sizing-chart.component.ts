import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { FormControl, FormGroup } from '@angular/forms';
import { AddSizeChart, RemoveSizeChart, UpdateSizeChart } from '../../vendors.types';

@Component({
  selector: 'app-vendor-sizing-chart',
  templateUrl: './vendor-sizing-chart.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorSizingChartComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['id', 'name', 'desc', 'action'];
  totalUsers = 0;
  tempTotalUsers = 0;
  page = 1;
  not_available = 'N/A';

  supplierData: any;

  mainScreen = 'Current'



  // Location Data for Update
  chartData: any;
  ngName = '';
  ngDescription = '';
  isUpdate: boolean = false;
  isUpdateLoader: boolean = false;

  // Add Sizing Chart
  addSizingForm: FormGroup;
  isAddLoader: boolean = false;

  // Search By Keyword
  isSearching: boolean = false;
  keyword = '';

  // Image
  file: File;
  imageValue: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService
  ) { }

  initForm() {
    this.addSizingForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl('')
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.isLoading = true;
    this.getVendorsData();
  };
  calledScreen(screen) {
    this.mainScreen = screen;
    if (screen == 'Add New Chart') {
    } else {
      this.page = 1;
      this.dataSource = this.tempDataSource;
      this.totalUsers = this.tempTotalUsers;
      this._changeDetectorRef.markForCheck();
    }
  }
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.getSizingCharts(1, 'get');
    })
  }
  getSizingCharts(page, type) {
    let params = {
      size_charts: true,
      page: page,
      keyword: this.keyword,
      size: 20,
      company_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.tempDataSource.length == 0) {
        this.tempDataSource = res["data"];
        this.tempTotalUsers = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddLoader = false;
        this.initForm();
        this.mainScreen = 'Current';
        this._vendorService.snackBar('Sizing Chart added successfully');
      }
      this.isSearching = false;
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getSizingCharts(this.page, 'get');
  };
  // Search By Keyword
  searchLocations() {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getSizingCharts(1, 'get');
  }
  resetSearch() {
    this.keyword = '';
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempTotalUsers;
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this._changeDetectorRef.markForCheck();
  }
  // Add New Chart
  addNewSize() {
    if (!this.imageValue) {
      this._vendorService.snackBar('Image is required');
      return;
    }
    let extension = null;
    if (this.imageValue) {
      extension = this.imageValue.type.replace('application/', '').replace('image/', '');
    }
    const { name, description } = this.addSizingForm.getRawValue();
    if (name == '') {
      this._vendorService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: AddSizeChart = {
      name: name.replace(/'/g, "''"), description: description.replace(/'/g, "''"), company_id: this.supplierData.pk_companyID, extension: extension, add_size: true
    }
    this.isAddLoader = true;
    this._vendorService.postVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.uploadSizeImage(res["newID"], extension)
        this.getSizingCharts(1, 'add');
      } else {
        this.isAddLoader = false;
        this._vendorService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isAddLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  uploadSizeImage(id, extension) {
    const base64 = this.imageValue.imageUpload.split(",")[1];
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: `/globalAssets/Companies/SizingCharts/${id}.${extension}`
    };
    this._vendorService.addMedia(payload)
      .subscribe((response) => {
        this.file = null;
        this.imageValue = null;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
  // Remove Chart
  deleteChart(chart) {
    chart.delLoader = true;
    let payload: RemoveSizeChart = {
      remove_size_chart: true,
      chart_id: chart.pk_chartID
    }
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      chart.delLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.dataSource = this.dataSource.filter(item => item.pk_chartID != chart.pk_chartID);
        this.totalUsers--;
        this.tempDataSource = this.tempDataSource.filter(item => item.pk_chartID != chart.pk_chartID);
        this.tempTotalUsers--;
        this.page = 1;
        this.dataSource = this.tempDataSource;
        this.totalUsers = this.tempTotalUsers;
        this._changeDetectorRef.markForCheck();
      }
      this._vendorService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      chart.delLoader = false;
      this._vendorService.snackBar('Something went wrong');
      this._changeDetectorRef.markForCheck();
    });
  }
  // Update Size Chart
  updateSizeChart() {
    let extension = null;
    if (this.imageValue) {
      extension = this.imageValue.type.replace('application/', '').replace('image/', '');
    }
    const { pk_chartID } = this.chartData;
    if (this.ngName == '') {
      this._vendorService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: UpdateSizeChart = {
      name: this.ngName,
      description: this.ngDescription,
      company_id: this.supplierData.pk_companyID,
      update_size: true,
      extension: extension,
      chart_id: pk_chartID
    }
    this.isUpdateLoader = true;
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        if (this.imageValue) {
          this.uploadSizeImage(pk_chartID, extension)
        }
        this.dataSource.filter(item => {
          if (item.pk_chartID == pk_chartID) {
            item.name = this.ngName;
            item.description = this.ngDescription;
          }
        });
        this.tempDataSource.filter(item => {
          if (item.pk_chartID == pk_chartID) {
            item.name = this.ngName;
            item.description = this.ngDescription;
          }
        });
        this.isUpdate = false;
      }
      this.isUpdateLoader = false;
      this._vendorService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  toggleUpdate(data) {
    this.isUpdate = true;
    this.chartData = data;
    this.ngName = data.name;
    this.ngDescription = data.description;
  }
  backTolist() {
    this.isUpdate = false;
    this._changeDetectorRef.markForCheck();
  }
  onSelect(event) {
    this.file = event.addedFiles[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.file);
    reader.onload = () => {
      this.imageValue = {
        imageUpload: reader.result,
        type: this.file["type"]
      };
    }
  }
  onRemove() {
    this.file = null;
    this.imageValue = null;
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
