import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { PreventNavigation } from 'app/can-deactivate.guard';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { UsersService } from '../../users.service';
import { AddAdminCommentator, applyBlanketCustomerPercentage, newFLPSUser, RemoveCommentator, removeFLPSUser, UpdateAdminCommentator, updateFLPSUser } from '../../users.types';
@Component({
  selector: 'app-order-dashboard',
  templateUrl: './order-dashboard.component.html',
  styles: [".mat-paginator {border-radius: 16px !important} ::-webkit-scrollbar {height: 3px !important}"]
})
export class OrderDashboardComponent implements OnInit, OnDestroy {
  // canDeactivate() {
  //   if (this.ngEmail == '') {
  //     return true;
  //   } else {
  //     if (confirm('Are you sure you want to save this thing into the database?')) {
  //       // Save it!
  //       return true;
  //     } else {
  //       // Do nothing!
  //       return false;
  //     }
  //   }

  // }
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['check', 'date', 'inhands', 'order', 'line', 'customer', 'product', 'supplier', 'status', 'age', 'store', 'proof', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  ngEmail = '';
  isAddNewCommentors: boolean = false;
  check: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _UsersService: UsersService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getAdminCommentors(1, 'get');
  };
  getAdminCommentors(page, type) {
    let params = {
      commentor: true,
      page: page,
      size: 20
    }
    this._UsersService.getAdminsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.tempDataSource.length == 0) {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddNewCommentors = false;
        this._UsersService.snackBar('User Added Successfully');
      }
      this.isLoading = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      // this.isLoadingChange.emit(false);
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
    this.getAdminCommentors(this.page, 'get');
  };

  addNewUser() {
    if (!this.ngEmail) {
      this._UsersService.snackBar('Email field is required');
      return;
    }
    let payload: AddAdminCommentator = {
      email: this.ngEmail,
      add_commentator: true
    }
    this.isAddNewCommentors = true;
    this._UsersService.AddAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.page = 1;
        this.getAdminCommentors(1, 'add');
      } else {
        this._UsersService.snackBar(res["message"]);
        this.isAddNewCommentors = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAddNewCommentors = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateUser(item) {
    if (!item.email) {
      this._UsersService.snackBar('Email field is required');
      return;
    }
    item.updateLoader = true;
    // return
    let payload: UpdateAdminCommentator = {
      list_order: item.listOrder,
      email: item.email,
      commentator_id: item.pk_ID,
      update_commentator: true
    }
    this._UsersService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._UsersService.snackBar('User Updated Successfully');
        item.updateLoader = false;
        this._changeDetectorRef.markForCheck();
      } else {
        this._UsersService.snackBar(res["message"]);
        item.updateLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      item.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  deleteUser(item) {
    item.delLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: RemoveCommentator = {
      commentator_id: item.pk_ID,
      remove_commentator: true
    }
    this._UsersService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(elem => elem.pk_ID != item.pk_ID);
      this.totalUsers--;
      this.tempDataSource = this.tempDataSource.filter(elem => elem.pk_ID != item.pk_ID);
      this.tempRecords--;
      this._UsersService.snackBar('User Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._UsersService.snackBar('Something went wrong');
    });
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
