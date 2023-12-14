import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../../vendors.service';
import { AddColor, AddImprintColor, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor } from '../../../vendors.types';

@Component({
  selector: 'app-product-color-imprint',
  templateUrl: './product-imprint.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorImprintProductComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'rgb', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  mainScreen: string = 'Current Collections';
  keyword = '';
  not_available = 'N/A';


  isSearching: boolean = false;

  // AddColor
  ngName: string = '';
  ngRGB: string = '#000000';
  isAddColorLoader: boolean = false;

  // Update Color
  isUpdateColorLoader: boolean = false;
  isUpdateColors: boolean = false;
  updateColorData: any;
  ngRGBUpdate = '';

  imprintProducts = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _VendorsService: VendorsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getColors(1, 'get');
  };
  calledScreen(value) {
    this.mainScreen = value;
  }
  convertColor(color) {
    return '#' + color;
  }
  getColors(page, type) {
    let params = {
      imprint_colors: true,
      keyword: this.keyword,
      page: page,
      size: 20
    }
    this._VendorsService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.keyword == '') {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddColorLoader = false;
        this.ngName = '';
        this.ngRGB = '#000000';
        this._VendorsService.snackBar('Color Added Successfully');
        this.mainScreen = 'Current Colors';
      }
      this.isLoading = false;
      this.isSearching = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSearching = false;
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
    this.getColors(this.page, 'get');
  };
  searchColor(value) {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.keyword = value;
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getColors(1, 'get');
  }
  resetSearch() {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.keyword = '';
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempRecords;
  }

  addNewColor() {
    if (this.ngName == '') {
      this._VendorsService.snackBar('Color name is required');
      return;
    }
    if (this.ngRGB == '') {
      this._VendorsService.snackBar('RGB is required');
      return;
    }
    let payload: AddImprintColor = {
      color_name: this.ngName,
      rgb: this.ngRGB.replace('#', ''),
      add_imprint_color: true
    }
    this.isAddColorLoader = true;
    this._VendorsService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getColors(1, 'add')
      } else {
        this.isAddColorLoader = false;
        this._VendorsService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddColorLoader = false;
      this._VendorsService.snackBar('Something went wrong');
    })
  }
  // Delete Color
  deleteColor(item) {
    item.delLoader = true;
    let payload: DeleteImprintColor = {
      imprint_color_id: item.pk_imprintColorID,
      delete_imprint_color: true
    }
    this._VendorsService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(color => color.pk_imprintColorID != item.pk_imprintColorID);
      this.totalUsers--;
      this.tempDataSource = this.tempDataSource.filter(color => color.pk_imprintColorID != item.pk_imprintColorID);
      this.tempRecords--;
      this.resetSearch();
      this._VendorsService.snackBar('Color Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._VendorsService.snackBar('Something went wrong');
    });
  }
  // Update Color
  updateColorToggle(item) {
    this.updateColorData = item;
    if (item) {
      this.ngRGBUpdate = '#' + item.RGB;
    }
    this.isUpdateColors = !this.isUpdateColors;
  }
  updateColor() {
    if (this.updateColorData.imprintColorName == '') {
      this._VendorsService.snackBar('Color name is required');
      return;
    }
    const rgb = this.ngRGBUpdate.replace('#', '');
    let payload: UpdateImprintColor = {
      color_id: this.updateColorData.pk_imprintColorID,
      color_name: this.updateColorData.imprintColorName,
      rgb: rgb,
      update_imprint_color: true
    }
    this.isUpdateColorLoader = true;
    this._VendorsService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateColorLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource.filter(color => {
        if (color.pk_imprintColorID == this.updateColorData.pk_imprintColorID) {
          color.imprintColorName = this.updateColorData.imprintColorName;
          color.RGB = rgb;
        }
      });
      this._VendorsService.snackBar('Color Updated Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._VendorsService.snackBar('Something went wrong');
    })
  }

  imprintColorProductsToggle() {
    this.imprintProducts = !this.imprintProducts;
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
