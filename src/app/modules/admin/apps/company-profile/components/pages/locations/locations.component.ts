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
import { addCompanyLocation, removeCompanyLocation, updateCompanyLocation } from '../../companies.types';
@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html'
})
export class CompanyProfileLocationComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  locationsData = [];

  isLoading: boolean = false;
  userData: any;
  isCreateLocation: boolean = false;

  config = {
    maxFiles: 1,
  };

  files = [];
  locationName: any = '';
  params: any;

  companyName: string = '';

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
      this.companyName = res["companyName"];
      this.locationsData = [];
      if (res["data"][0].locations) {
        const locations = res["data"][0].locations.split(',,');
        locations.forEach(location => {
          const [id, company, locationName, departments, users] = location.split('::');
          this.locationsData.push({ id, company, locationName, departments, users });
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
        this.isLoading = true;
        this.getLocations();
      } else {
        this._companiesService.snackBar(res["message"]);
      }
      this.isCreateLocation = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  removeLoactions(item) {
    const msg = 'Are you sure you want to remove this location?  This will remove all departments and disassociate all users with this location.  This cannot be undone.';
    this._commonService.showConfirmation(msg, (confirmed) => {
      if (confirmed) {
        let payload: removeCompanyLocation = {
          locationID: Number(item.id),
          delete_company_location: true
        }
        item.delLocation = true;
        this._companiesService.putCompaniesData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          if (res["success"]) {
            this._companiesService.snackBar(res["message"]);
            this.locationsData = this.locationsData.filter(location => location.id != item.id);
          }
          item.delLocation = false;
          this._changeDetectorRef.markForCheck();
        });
      }
    });
  }

  updateLocation(location) {
    if (location.locationName.trim('') == '') {
      this._commonService.snackBar('Location Name is required');
      return;
    }
    let payload: updateCompanyLocation = {
      companyProfileID: Number(this.params.companyId),
      locationID: Number(location.id),
      locationName: location.locationName,
      update_company_location: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    location.updateLocation = true;
    this._companiesService.putCompaniesData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._companiesService.snackBar(res["message"]);
      }
      location.updateLocation = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  viewDepartments(location) {
    this.router.navigate([`apps/companies/company-location-deparments/${this.params.companyId}/${location.id}`]);
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
