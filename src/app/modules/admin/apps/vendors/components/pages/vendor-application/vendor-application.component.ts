import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';

@Component({
  selector: 'app-vendor-application',
  templateUrl: './vendor-application.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorApplicationComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['id', 'number', 'name', 'active'];
  totalUsers = 0;
  page = 1;
  not_available = 'N/A';

  supplierData: any;

  isModal: boolean = false;

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef, private _formBuilder: FormBuilder,
    private _vendorService: VendorsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getVendorsData();
  };
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.getProductVideos(1);
    })
  }
  getProductVideos(page) {
    let params = {
      product_videos: true,
      page: page,
      size: 20,
      company_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
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
    this.getProductVideos(this.page);
  };
  openModal() {
    this.isModal = true;
  }
  closeModal() {
    this.isModal = false;
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
