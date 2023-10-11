import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';
import { SmartArtService } from 'app/modules/admin/smartart/components/smartart.service';
import { FLPSService } from 'app/modules/admin/apps/flps/components/flps.service';

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

  constructor(
    private _customerService: CustomersService,
    private _flpsService: FLPSService,
    private _smartartService: SmartArtService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getSelectedCustomer();
  }
  getSelectedCustomer() {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
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

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}

