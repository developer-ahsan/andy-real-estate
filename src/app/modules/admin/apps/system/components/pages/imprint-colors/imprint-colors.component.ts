import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../system.service';
import { AddColor, AddImprintColor, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor } from '../../system.types';

@Component({
  selector: 'app-imprint-colors',
  templateUrl: './imprint-colors.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ImprintColorsComponent implements OnInit, OnDestroy {
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

  mainScreen: string = 'Current Colors';
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
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService
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
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
        this._systemService.snackBar('Color Added Successfully');
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
    if (this.ngName.trim() === '') {
      this._systemService.snackBar('Color name is required');
      return;
    }
    if (this.ngRGB.trim() === '') {
      this._systemService.snackBar('RGB is required');
      return;
    }
    let payload: AddImprintColor = {
      color_name: this.ngName.trim(),
      rgb: this.ngRGB.replace('#', ''),
      add_imprint_color: true
    }
    this.isAddColorLoader = true;
    this._systemService.AddSystemData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getColors(1, 'add')
      } else {
        this.isAddColorLoader = false;
        this._systemService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddColorLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }
  // Delete Color
  deleteColor(item) {
    item.delLoader = true;
    let payload: DeleteImprintColor = {
      imprint_color_id: item.pk_imprintColorID,
      delete_imprint_color: true
    }
    this._systemService.UpdateSystemData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(color => color.pk_imprintColorID != item.pk_imprintColorID);
      this.totalUsers--;
      this.tempDataSource = this.tempDataSource.filter(color => color.pk_imprintColorID != item.pk_imprintColorID);
      this.tempRecords--;
      this.resetSearch();
      if (res) {
        this._systemService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
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
    if (this.updateColorData.imprintColorName.trim() === '') {
      this._systemService.snackBar('Color name is required');
      return;
    }
    const rgb = this.ngRGBUpdate.replace('#', '');
    let payload: UpdateImprintColor = {
      color_id: this.updateColorData.pk_imprintColorID,
      color_name: this.updateColorData.imprintColorName.trim(),
      rgb: rgb,
      update_imprint_color: true
    }
    this.isUpdateColorLoader = true;
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateColorLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource.filter(color => {
        if (color.pk_imprintColorID == this.updateColorData.pk_imprintColorID) {
          color.imprintColorName = this.updateColorData.imprintColorName;
          color.RGB = rgb;
        }
      });
      this._systemService.snackBar('Color Updated Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
    })
  }

  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        obj[key] = obj[key]?.replace(/'/g, "''");
      }
    }
    return obj;
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
