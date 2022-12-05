import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../system.service';
import { AddColor, DeleteColor, UpdateColor } from '../../system.types';

@Component({
  selector: 'app-product-colors',
  templateUrl: './colors.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ColorsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  mainScreen: string = 'Current Colors';
  keyword = '';
  not_available = 'N/A';

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  colorList = [];
  isAddColorLoader: boolean = false;
  isUpdateColorLoader: boolean = false;
  isUpdateColors: boolean = false;
  updateColorData: any;
  isSearching: boolean = false;
  ngUpdateColorName: string = '';
  isAddMsg = '';
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
  getColors(page, type) {
    let params = {
      product_colors: true,
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
        this._systemService.snackBar('Color added successfully');
        this.isAddColorLoader = false;
        this.colorList = [];
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
    this.paginator.firstPage();
    this.keyword = value;
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getColors(1, 'get');
  }
  resetSearch() {
    this.paginator.firstPage();
    this.keyword = '';
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempRecords;
  }
  addColors(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value != '') {
      const index = this.colorList.findIndex(color => color == value);
      if (index >= 0) {
        this._systemService.snackBar('Color is already listed');
      } else {
        this.colorList.push(value);
      }
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeColor(color): void {
    const index = this.colorList.findIndex(colors => colors == color);
    if (index >= 0) {
      this.colorList.splice(index, 1);
    }
  }
  addNewColor() {
    this.isAddMsg = '';
    if (this.colorList.length == 0) {
      this._systemService.snackBar('Atleast 1 color name is required');
      return;
    }
    this.isAddColorLoader = true;
    let payload: AddColor = {
      colors: this.colorList,
      add_color: true
    }
    this._systemService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getColors(1, 'add');
        if (res['already_exist_colors'].length > 0) {
          let Colors = '';
          res['already_exist_colors'].forEach(element => {
            let comma = '';
            if (Colors) {
              comma = ',';
            }
            Colors = Colors + comma + element.colorName;
          });
          this.isAddMsg = Colors + ' already exists.';
          setTimeout(() => {
            this.isAddMsg = '';
            this._changeDetectorRef.markForCheck();
          }, 2000);
        }
      } else {
        this.isAddColorLoader = false;
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddColorLoader = false;
      this._changeDetectorRef.markForCheck();
      this._systemService.snackBar('Something went wrong');
    });
  }
  // Delete Color
  deleteColor(item) {
    item.delLoader = true;
    let payload: DeleteColor = {
      color_id: item.pk_colorID,
      delete_color: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(color => color.pk_colorID != item.pk_colorID);
      this.totalUsers--;
      this._systemService.snackBar('Color Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
    });
  }
  // Update Color
  updateColorToggle(item) {
    if (item) {
      this.ngUpdateColorName = item.colorName;
      this.updateColorData = item;
    }
    this.isUpdateColors = !this.isUpdateColors;
  }
  updateColor() {
    if (this.ngUpdateColorName == '') {
      this._systemService.snackBar('Color name is required');
      return;
    }
    let payload: UpdateColor = {
      color_id: this.updateColorData.pk_colorID,
      color_name: this.ngUpdateColorName,
      update_color: true
    }
    this.isUpdateColorLoader = true;
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateColorLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.updateColorData.colorName = this.ngUpdateColorName;
      // this.dataSource.filter(color => {
      //   if (color.pk_colorID == this.updateColorData.pk_colorID) {
      //     color.colorName = this.updateColorData.colorName;
      //   }
      // });
      this._systemService.snackBar('Color Updated Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
    })
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
