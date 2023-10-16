import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';
import { SmartArtService } from 'app/modules/admin/smartart/components/smartart.service';
import { FLPSService } from 'app/modules/admin/apps/flps/components/flps.service';
import { UpdateCustomerFLPSUser } from '../../orders.types';

@Component({
  selector: 'app-flps-users',
  templateUrl: './flps-users.component.html',
  styles: [`.mat-form-field.mat-form-field-appearance-fill .mat-form-field-wrapper .mat-form-field-subscript-wrapper .mat-hint {color: red !important}`]
})
export class CustomerFlpsUsersComponent implements OnInit, OnDestroy {

  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  selectedEmployee: any = 0;
  ngCommission: any;
  flpsUsers: any = [];
  flpsLoggedInUser: any;
  isUpdateLoader: boolean = false;
  selectedFLPSUser: any;
  constructor(
    private _customerService: CustomersService,
    private _flpsService: FLPSService,
    private _smartartService: SmartArtService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const user = localStorage.getItem('flpsData');
    if (user) {
      this.flpsLoggedInUser = JSON.parse(user);
      this.isLoading = true;
      this.getSelectedCustomer();
    }
  }
  getFLPSData() {
    let params = {
      flps_users_customers: true,
      user_id: this.selectedCustomer.pk_userID
    }
    this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedFLPSUser = res["data"][0];
      if (this.selectedFLPSUser.fk_FLPSUserID) {
        this.selectedEmployee = this.selectedFLPSUser.fk_FLPSUserID;
        this.ngCommission = this.selectedFLPSUser.commission * 100;
      } else {
        this.selectedEmployee = 0;
      }
    });
  }
  getSelectedCustomer() {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        this.getFLPSData();
        this.getFlpsUsers();
      });
  }
  getFlpsUsers() {
    this._flpsService.getAllReportUsers().pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      if (res && res["data"] && res["data"][0] && res["data"][0].flpsUsers) {
        let employees = res?.data[0]?.flpsUsers || [];
        if (employees) {
          let employee = employees.split(',');
          employee.forEach(emp => {
            let colonEmp = emp.split(':');
            this.flpsUsers.push({ pk_userID: Number(colonEmp[0]), fullName: colonEmp[2], email: colonEmp[6] });
          });
        }
      }
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateFLPSCommission() {
    let flpsID = null;
    let commission = 0;
    if (this.selectedEmployee != 0) {
      flpsID = this.selectedEmployee;
      if (this.ngCommission == '' || this.ngCommission == null || this.ngCommission == undefined) {
        this._customerService.snackBar('If you are assigning an FLPS user to this customer, please provide the required commission in decimal form.');
        return;
      } else {
        commission = this.ngCommission;
      }
    }
    let payload: UpdateCustomerFLPSUser = {
      storeUserID: this.selectedCustomer.pk_userID,
      commission: commission / 100,
      flpsUserID: this.selectedEmployee,
      update_customer_flps_user: true
    }
    this.isUpdateLoader = true;
    this._customerService.PutApiData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._customerService.snackBar(res["message"]);
    })
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}

