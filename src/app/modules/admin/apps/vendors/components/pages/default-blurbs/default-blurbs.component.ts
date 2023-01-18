import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { AddBlurb, AddColor, AddImprintColor, AddImprintMethod, DeleteBlurb, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod } from '../../vendors.types';

@Component({
  selector: 'app-default-blurbs',
  templateUrl: './default-blurbs.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class DefaultBlurbsComponent implements OnInit, OnDestroy {
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

  keyword = '';
  not_available = 'N/A';


  isSearching: boolean = false;

  // Add Method
  ngName: string = '';
  ngDesc: string = '';
  isAddLoader: boolean = false;

  // Update Color
  isUpdateMethodLoader: boolean = false;
  isUpdateMethod: boolean = false;
  updateMethodData: any;
  ngRGBUpdate = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _VendorsService: VendorsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getBlurbs(1, 'get');
  };
  getBlurbs(page, type) {
    let params = {
      get_blurbs: true,
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
        this.isAddLoader = false;
        this.ngName = '';
        this._VendorsService.snackBar('Blurb Added Successfully');
      }
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
    this.getBlurbs(this.page, 'get');
  };

  addNewBlurb() {
    if (this.ngName == '') {
      this._VendorsService.snackBar('Blurb name is required');
      return;
    }
    let payload: AddBlurb = {
      blurb: this.ngName,
      add_blurb: true
    }
    this.isAddLoader = true;
    this._VendorsService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getBlurbs(1, 'add')
      } else {
        this.isAddLoader = false;
        this._VendorsService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddLoader = false;
      this._VendorsService.snackBar('Something went wrong');
    })
  }
  // Delete Burb
  deleteBurb(item) {
    item.delLoader = true;
    let payload: DeleteBlurb = {
      blurb_id: item.pk_blurbID,
      delete_blurb: true
    }
    this._VendorsService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(elem => elem.pk_blurbID != item.pk_blurbID);
      this.totalUsers--;
      this._VendorsService.snackBar('Blurb Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._VendorsService.snackBar('Something went wrong');
    });
  }
  // Update Method
  updateMethodToggle(item) {
    console.log(item)
    this.updateMethodData = item;
    this.isUpdateMethod = !this.isUpdateMethod;
  }
  updateMethod() {
    if (this.updateMethodData.imprintColorName == '') {
      this._VendorsService.snackBar('Color name is required');
      return;
    }
    const rgb = this.ngRGBUpdate.replace('#', '');
    let payload: UpdateImprintMethod = {
      method_id: this.updateMethodData.pk_methodID,
      method_name: this.updateMethodData.methodName,
      description: this.updateMethodData.methodDescription,
      update_imprint_method: true
    }
    this.isUpdateMethodLoader = true;
    this._VendorsService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateMethodLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource.filter(elem => {
        if (elem.pk_methodID == this.updateMethodData.pk_methodID) {
          elem.methodName = this.updateMethodData.methodName;
          elem.methodDescription = this.updateMethodData.methodDescription;
        }
      });
      this._VendorsService.snackBar('Method Updated Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._VendorsService.snackBar('Something went wrong');
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
