import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupportTicketService } from 'app/modules/admin/support-tickets/components/support-tickets.service';
import { CreateTicket } from 'app/modules/admin/support-tickets/components/support-tickets.types';
import { FLPSService } from 'app/modules/admin/apps/flps/components/flps.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
@Component({
  selector: 'app-company-profile-form',
  templateUrl: './company-profile-form.component.html'
})
export class CompanyProfileFormComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  isLoading: boolean = false;
  userData: any;
  ticketForm: FormGroup;
  isCreateTicketLoader: boolean = false;

  netTermsOptions: any = [
    'None',
    'PrePaid',
    'Due On Receipt',
    'Net 10',
    'Net 15',
    'Net 30',
    'Net 45',
    'Net 60'
  ]

  paymentMethodOptions: any = [
    'None',
    'American Express',
    'MasterCard',
    'Credit Card',
    'Vendor Website',
    'ACH',
    'Check',
  ]

  taxExamptOptions: any = [
    'No',
    'Yes',
  ]

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
     

      companyName: new FormControl('', Validators.required),
      store: new FormControl('', Validators.required),
      companyWebsite: new FormControl('', Validators.required),
      creditLimit: new FormControl(''),
      address: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      zip: new FormControl('', Validators.required),

      contactName: new FormControl('', Validators.required),
      apEmail: new FormControl('', [Validators.required, Validators.email]),
      remitEmail: new FormControl('', [Validators.required, Validators.email]),
      additionalEmail: new FormControl('', [Validators.email]),
      phone: new FormControl(''),
      netTerms: new FormControl('None'),
      paymentMethod: new FormControl('None'),
      salesTaxExampt: new FormControl('No'),
      chargeCode: new FormControl(false),
      mvmt: new FormControl(false),

      notes: new FormControl(''),
    });
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
