import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupportTicketService } from 'app/modules/admin/support-tickets/components/support-tickets.service';
import { CreateTicket } from 'app/modules/admin/support-tickets/components/support-tickets.types';
import { FLPSService } from 'app/modules/admin/apps/flps/components/flps.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { CompaniesService } from '../../companies.service';
import { addCompanyLocation } from '../../companies.types';
@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html'
})
export class CompanyProfileLocationComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  isLoading: boolean = false;
  userData: any;
  isCreateLocation: boolean = false;

  config = {
    maxFiles: 1,
  };

  files = [];
  locationName: any = '';
  params: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _companiesService: CompaniesService,
    private _supportService: SupportTicketService,
    private router: Router,
    private route: ActivatedRoute,
    private _flpsService: FLPSService,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    let user = localStorage.getItem('userDetails');
    this.userData = JSON.parse(user);
    this.route.params.subscribe(param => {
      this.isLoading = true;
      this.params = param;
      this.getLocations();
    })
  };
  getLocations() {
    let params = {
      company_locations: true,
      company_profile_id: this.params.companyId
    }
    this._companiesService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      console.log(res);
      if (res["data"][0].locations) {
        const locations = res["data"][0].locations.split(',,');
        locations.forEach(location => {
          // const []
        });
      }
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  navigateToCompany() {
    this.router.navigateByUrl('/apps/companies/company-profile-update/' + this.params.companyId + '/' + this.params.storeId);
  }
  addLocation() {
    if (this.locationName.trim('') == '') {
      this._commonService.snackBar('Location Name is required');
      return;
    }
    let payload: addCompanyLocation = {
      companyProfileID: Number(this.params.companyId),
      locationName: this.locationName,
      add_company_location: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isCreateLocation = true;
    this._companiesService.postCompaniesData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._companiesService.snackBar(res["message"]);
        this.locationName = '';
      } else {
        this._companiesService.snackBar(res["message"]);
      }
      this.isCreateLocation = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  createTicket() {
    // const { userID, subject, description, blnUrgent } = this.ticketForm.getRawValue();
    // let payload: CreateTicket = {
    //   userID, subject, description, blnUrgent, create_ticket: true
    // };
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
