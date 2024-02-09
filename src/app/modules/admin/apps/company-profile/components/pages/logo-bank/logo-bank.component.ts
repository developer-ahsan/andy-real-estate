import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupportTicketService } from 'app/modules/admin/support-tickets/components/support-tickets.service';
import { CreateTicket } from 'app/modules/admin/support-tickets/components/support-tickets.types';
import { FLPSService } from 'app/modules/admin/apps/flps/components/flps.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
@Component({
  selector: 'app-logo-bank',
  templateUrl: './logo-bank.component.html'
})
export class ProfileLogoBankComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  isLoading: boolean = false;
  userData: any;
  ticketForm: FormGroup;
  isCreateTicketLoader: boolean = false;


  config = {
    maxFiles: 1,
  };

  files = [];
  attachmentName: any = '';


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _supportService: SupportTicketService,
    private router: Router,
    private _flpsService: FLPSService,
    private _commonService: DashboardsService
  ) { }
  ngOnInit(): void {
    let user = localStorage.getItem('userDetails');
    this.userData = JSON.parse(user);
    this.initForm();
  };
  initForm() {
    this.ticketForm = new FormGroup({
      name: new FormControl(''),
      description: new FormControl(''),
      imprint: new FormControl(''),
    });
  }
  navigateToCompany() {
    this.router.navigateByUrl('/apps/companies');
  }

  createTicket() {
    const { userID, subject, description, blnUrgent } = this.ticketForm.getRawValue();
    let payload: CreateTicket = {
      userID, subject, description, blnUrgent, create_ticket: true
    };
    // this._supportService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
    //   this._supportService.snackBar('Ticket is added successfuly.');
    //   this.mainScreen = 'Tickets';
    // }), err => {
    //   console.log(err);
    //   this._supportService.snackBar('Error occured whild creating a ticket.');
    // }
  }

  onSelectMain(event) {
    if (event.addedFiles.length > 1) {
      this._supportService.snackBar("Please select maximum 5 images.");
      return;
    }
    if (this.files.length == 1) {
      this._supportService.snackBar("Max limit reached for image upload.");
      return;
    } else {
      event.addedFiles.forEach(element => {
        this.files.push(element);
      });
    }
    setTimeout(() => {
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  onRemoveMain(index) {
    this.files.splice(index, 1);
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
