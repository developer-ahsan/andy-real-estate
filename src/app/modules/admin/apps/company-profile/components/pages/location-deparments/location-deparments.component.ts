import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
import { addCompanyDepartment, addCompanyLocation, removeCompanyDepartment, removeCompanyLocation, updateCompanyDepartment, updateCompanyLocation } from '../../companies.types';
declare var $: any;

@Component({
  selector: 'app-location-deparments',
  templateUrl: './location-deparments.component.html'
})
export class CompanyProfileLocationDepartmentsComponent implements OnInit, OnDestroy {
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
  locationNameString: string = '';
  @ViewChild('usersModal') commentModal: ElementRef;

  modalData: any;

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
      company_locations_departments: true,
      location_id: this.params.locationId,
      company_profile_id: this.params.companyId
    }
    this._companiesService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.companyName = res["companyName"];
      this.locationNameString = res["locationName"];
      this.locationsData = [];
      if (res["data"][0].departments) {
        const departments = res["data"][0].departments.split(',,');
        departments.forEach(location => {
          const [id, department, users] = location.split('::');
          this.locationsData.push({ id, department, users });
        });
      }
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  navigateToCompany() {
    this.router.navigateByUrl('/apps/companies/company-location/' + this.params.companyId);
  }
  addLocation() {
    if (this.locationName.trim('') == '') {
      this._commonService.snackBar('Location Name is required');
      return;
    }
    let payload: addCompanyDepartment = {
      locationID: Number(this.params.locationId),
      departmentName: this.locationName,
      add_company_department: true
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
    const msg = 'Are you sure you want to remove this department?  This will disassociate all users with this department.  This cannot be undone.';
    this._commonService.showConfirmation(msg, (confirmed) => {
      if (confirmed) {
        let payload: removeCompanyDepartment = {
          departmentID: Number(item.id),
          delete_company_department: true
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

  updateLocation(item) {
    if (item.department.trim('') == '') {
      this._commonService.snackBar('Location Name is required');
      return;
    }
    let payload: updateCompanyDepartment = {
      locationID: Number(this.params.locationId),
      departmentID: Number(item.id),
      departmentName: item.department,
      update_company_department: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    item.updateLocation = true;
    this._companiesService.putCompaniesData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._companiesService.snackBar(res["message"]);
      }
      item.updateLocation = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  openUsersModal(item) {
    this.modalData = item;
    this.modalData.isUserLoader = true;
    let params = {
      company_locations_department_users: true,
      deparment_id: item.id,
      location_id: Number(this.params.locationId),
      company_profile_id: Number(this.params.companyId)
    }
    this._companiesService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.modalData.users = res["data"];
      this.modalData.isUserLoader = false;
      this._changeDetectorRef.markForCheck();
    });
    $(this.commentModal.nativeElement).modal('show');
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
