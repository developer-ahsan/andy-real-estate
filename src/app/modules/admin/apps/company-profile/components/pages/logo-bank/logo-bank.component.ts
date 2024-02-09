import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupportTicketService } from 'app/modules/admin/support-tickets/components/support-tickets.service';
import { CreateTicket } from 'app/modules/admin/support-tickets/components/support-tickets.types';
import { FLPSService } from 'app/modules/admin/apps/flps/components/flps.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { CompaniesService } from '../../companies.service';
import { addCompanyProfileLogoBank, removeCompanyProfileLogoBank } from '../../companies.types';
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

  params: any;
  companyData: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _companiesService: CompaniesService,
    private route: ActivatedRoute,
    private router: Router,
    private _flpsService: FLPSService,
    private _commonService: DashboardsService
  ) { }
  ngOnInit(): void {
    this.isLoading = true;
    let user = localStorage.getItem('userDetails');
    this.userData = JSON.parse(user);
    this.route.params.subscribe(param => {
      this.params = param;
    })
    this.initForm();
    this.getData();
  };
  initForm() {
    this.ticketForm = new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl(''),
      imprint: new FormControl(''),
    });
  }
  getData() {
    let params = {
      company_profiles: true,
      pk_companyProfileID: this.params['companyId'],
      store_id: this.params['storeId'],
      bln_active: 1,
      keyword: ''
    }
    this.isLoading = true;
    this._companiesService.getCompaniesData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      const data = res.data[0]
      data.logoBanksData = [];
      if (data.logoBanks) {
        const logos = data.logoBanks.split(',,');
        logos.forEach(logo => {
          const [id, name, description, type, id1, imprintColors] = logo.split('::');
          data.logoBanksData.push({ id, name, description, type, id1, imprintColors });
        });
      }
      this.companyData = data;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  navigateToCompany() {
    this.router.navigateByUrl('/apps/companies/company-profile-update/' + this.params.companyId + '/' + this.params.storeId);
  }

  addLogobank() {
    const reader = new FileReader();
    reader.readAsDataURL(this.files[0]);
    reader.onload = () => {
      let files: any = {
        fileUpload: reader.result,
        fileType: this.files[0]["type"]
      };
      const { fileUpload, fileType } = files;
      const base64 = fileUpload.split(",")[1];

      const { name, description, imprint } = this.ticketForm.getRawValue();
      let payload: addCompanyProfileLogoBank = {
        companyProfileID: Number(this.params.companyId),
        name,
        description,
        colorList: imprint,
        imageExtension: fileType.split('/')[1],
        add_company_logo_bank: true
      };
      payload = this._commonService.replaceNullSpaces(payload);
      payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
      this.isCreateTicketLoader = true;
      this._changeDetectorRef.markForCheck();
      this._companiesService.postCompaniesData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
        const img_payload = [{
          image_file: base64,
          image_path: `/globalAssets/customerCompany/logoBank/${this.params.companyId}/${res.newID}.${fileType.split('/')[1]}`
        }];
        this._commonService.uploadMultipleMediaFiles(img_payload)
          .subscribe((response) => {
            this.companyData.logoBanksData.push({ id: res.newID, name, description, type: fileType.split('/')[1], id1: 0, imprintColors: imprint });
            this.isCreateTicketLoader = false;
            this._companiesService.snackBar(res["message"]);
            this.ticketForm.reset();
            this.files = null;
            this._changeDetectorRef.markForCheck();
          });

      }), err => {
        this._companiesService.snackBar('Error occured whild creating a ticket.');
      }
    };
  }
  removeLogoBank(item, index) {
    item.delLoader = true;
    let payload = {
      files: [`/globalAssets/customerCompany/logoBank/${this.params.companyId}/${item.id}.${item.type}`],
      delete_multiple_files: true
    }
    let attachmentPayload: removeCompanyProfileLogoBank = {
      companyProfileLogoBankID: item.id,
      delete_company_logo_bank: true
    }
    this._companiesService.putCompaniesData(attachmentPayload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      item.delLoader = false;
      this._companiesService.snackBar(res["message"]);
      this.companyData.logoBanksData.splice(index, 1);
      this._changeDetectorRef.markForCheck();
      this._commonService.removeMediaFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      });
    });
  }

  onSelectMain(event) {
    event.addedFiles.forEach(element => {
      this.files.push(element);
    });
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
