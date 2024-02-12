import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupportTicketService } from 'app/modules/admin/support-tickets/components/support-tickets.service';
import { FLPSService } from 'app/modules/admin/apps/flps/components/flps.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { CompaniesService } from '../../companies.service';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { addAttachment, removeAttachment, updateCompanyProfile } from '../../companies.types';
declare var $: any;
@Component({
  selector: 'app-company-profile-form',
  templateUrl: './company-profile-form.component.html'
})
export class CompanyProfileFormComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('removeCompanyProfile') removeCompanyProfile: ElementRef;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isUpdate: any = false;

  isLoading: boolean = false;
  userData: any;
  ticketForm: FormGroup;
  isCreateTicketLoader: boolean = false;

  storeOptions: any;
  selectedStoreId: any;

  netTermsOptions: string[] = [
    'None',
    'PrePaid',
    'Due On Receipt',
    'Net 10',
    'Net 15',
    'Net 30',
    'Net 45',
    'Net 60'
  ]

  paymentMethodOptions: string[] = [
    'None',
    'American Express',
    'MasterCard',
    'Credit Card',
    'Vendor Website',
    'ACH',
    'Check',
  ]

  taxExamptOptions: string[] = [
    'No',
    'Yes',
  ]

  stateOptions: string[] = []

  config = {
    maxFiles: 1,
  };

  files: any = [];
  imageUploadLoader: boolean = false;

  attachmentName: any = '';

  companyData: any;


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _supportService: SupportTicketService,
    private router: Router,
    private _flpsService: FLPSService,
    private _commonService: DashboardsService,
    private route: ActivatedRoute,
    private _companiesService: CompaniesService,
    private _inventoryService: InventoryService,
    private _snackBar: MatSnackBar,
  ) { }
  ngOnInit(): void {
    let user = localStorage.getItem('userDetails');
    this.userData = JSON.parse(user);
    this.initForm();
    this.isUpdate = this.route.snapshot.data['update'];
    this.getStores();
    this.getStates();
  };

  getStates() {
    const storedValue = JSON.parse(sessionStorage.getItem('storeStateSupplierData'));
    this.stateOptions = this.splitData(storedValue.data[2][0].states);
  }

  splitData(data) {
    const dataArray = data.split(",,");
    const result = [];

    dataArray.forEach(item => {
      const [id, state, name, index] = item.split("::");
      result.push({ id: parseInt(id), state, name, index: parseInt(index) });
    });

    return result;
  }

  getData() {
    let params = {
      company_profiles: true,
      pk_companyProfileID: this.route.snapshot.params['companyId'],
      store_id: this.route.snapshot.params['storeId'],
      bln_active: 1,
      keyword: ''
    }
    this.isLoading = true;
    this._companiesService.getCompaniesData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      const data = res.data[0]
      this.ticketForm.patchValue({
        companyName: data?.companyName,
        companyWebsite: data?.companyWebsite,
        address: data?.address,
        city: data?.city,
        state: data?.state,
        zip: data?.zip,
        dateCreated: data?.zip,
        APContactName: data?.APContactName,
        APEmail: data?.APEmail,
        remitEmail: data?.remitEmail,
        additionalEmail: data?.additionalEmail,
        creditLimit: data?.creditLimit,
        netTerms: data?.netTerms,
        paymentMethod: data?.paymentMethod,
        blnSalesTaxExempt: data?.blnSalesTaxExempt === true ? 'Yes' : 'No',
        phone: data?.phone,
        blnGovMVMTCoop: data?.blnGovMVMTCoop,
        notes: data?.notes,
        blnPORequired: data?.blnPORequired,
        storeID: this.storeOptions?.find(item => item.pk_storeID === data.fk_storeID)?.pk_storeID || '',
      });

      data.attachments = [];
      if (data.companyAttachmentFiles) {
        const attachments = data.companyAttachmentFiles.split(',,');
        attachments.forEach(attachment => {
          const [id, name, type] = attachment.split('::');
          data.attachments.push({ id, name, type });
        });
      }

      data.companyUsers = [];
      if (data.currentUsers) {
        const users = data.currentUsers.split(',,');
        users.forEach(user => {
          const [id, name, email] = user.split('::');
          data.companyUsers.push({ id, name, email });
        });
      }

      this.companyData = data;

      this.selectedStoreId = data.fk_storeID
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  openRemoveModal() {
    this._commonService.showConfirmation('Are you sure you want to remove this Company Profile? This cannot be undone.', (confirmed) => {
      if (confirmed) {
        this.deleteCompanyProfile();
      }
    });
  }


  deleteCompanyProfile() {
    let params = {
      companyProfileID: this.route.snapshot.params['companyId'],
      delete_company_profile: true
    }

    this._companiesService.UpdateCompaniesData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._supportService.snackBar("Company Profile deleted succesfuly");
      this.router.navigateByUrl('/apps/companies');
    });
  }
  navigateToCompany() {
    this.router.navigateByUrl('/apps/companies');
  }

  addAttachment() {
    let payload: addAttachment = {
      companyProfileID: this.route.snapshot.params['companyId'],
      extension: this.files[0].type.slice(-3),
      name: this.attachmentName,
      mimeType: this.files[0].type,
      add_company_attachment: true
    }
    this.imageUploadLoader = true;
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this._companiesService.postCompaniesData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.uploadFile(payload, res);
      this._changeDetectorRef.markForCheck();
    })
  }

  removeAttachements(item, index) {
    item.delLoader = true;
    let payload = {
      files: [`/globalAssets/customerCompany/attachments/${this.route.snapshot.params.companyId}/${item.id}.${item.type}`],
      delete_multiple_files: true
    }
    let attachmentPayload: removeAttachment = {
      attachmentID: item.id,
      delete_company_attachment: true
    }
    this._companiesService.putCompaniesData(attachmentPayload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      item.delLoader = false;
      this._companiesService.snackBar(res["message"]);
      this.companyData.attachments.splice(index, 1);
      this._changeDetectorRef.markForCheck();
      this._commonService.removeMediaFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      });
    });
  }


  initForm() {
    this.ticketForm = new FormGroup({
      companyName: new FormControl('', Validators.required),
      storeID: new FormControl('', Validators.required),
      companyWebsite: new FormControl('', Validators.required),
      creditLimit: new FormControl(''),
      address: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      zip: new FormControl('', Validators.required),
      dateCreated: new FormControl(''),

      APContactName: new FormControl('', Validators.required),
      APEmail: new FormControl('', [Validators.required, Validators.email]),
      remitEmail: new FormControl('', [Validators.required, Validators.email]),
      additionalEmail: new FormControl('', [Validators.email]),
      phone: new FormControl(''),
      netTerms: new FormControl('None'),
      paymentMethod: new FormControl('None'),
      blnSalesTaxExempt: new FormControl('No'),
      blnPORequired: new FormControl(false),
      blnGovMVMTCoop: new FormControl(false),

      notes: new FormControl(''),
    });
  }


  getStores() {
    this._commonService.storesData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.storeOptions = res["data"].filter(store => store.blnActive);
      if (this.isUpdate === true) {
        this.getData();
      }
    });
  }

  onSelectMain(event) {
    event.addedFiles.forEach(element => {
      this.files.push(element);
    });

    // this.files = event.addedFiles[0];
    // const reader = new FileReader();
    // reader.readAsDataURL(event.addedFiles[0]);
    // reader.onload = () => {
    //   this.files = {
    //     imageUpload: reader.result,
    //     type: event.addedFiles[0]["type"]
    //   };
    // }
    setTimeout(() => {
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  onRemoveMain(index) {
    this.files.splice(index, 1);
  }

  updateCompanyProfile() {
    let params: updateCompanyProfile = {
      companyProfileID: this.route.snapshot.params['companyId']?.trim(),
      companyName: this.ticketForm.get('companyName').value?.trim(),
      companyWebsite: this.ticketForm.get('companyWebsite').value?.trim(),
      address: this.ticketForm.get('address').value?.trim(),
      city: this.ticketForm.get('city').value?.trim(),
      state: this.ticketForm.get('state').value?.trim(),
      zip: this.ticketForm.get('zip').value,
      APContactName: this.ticketForm.get('APContactName').value?.trim(),
      APEmail: this.ticketForm.get('APEmail').value?.trim(),
      remitEmail: this.ticketForm.get('remitEmail').value?.trim(),
      additionalEmail: this.ticketForm.get('additionalEmail').value?.trim(),
      creditLimit: this.ticketForm.get('creditLimit').value,
      netTerms: this.ticketForm.get('netTerms').value?.trim(),
      paymentMethod: this.ticketForm.get('paymentMethod').value?.trim(),
      dateCreated: this.ticketForm.get('dateCreated').value,
      storeID: this.selectedStoreId,
      blnSalesTaxExempt: this.ticketForm.get('blnSalesTaxExempt').value === 'Yes' ? true : false,
      phone: this.ticketForm.get('phone').value,
      blnGovMVMTCoop: this.ticketForm.get('blnGovMVMTCoop').value,
      notes: this.ticketForm.get('notes').value?.trim(),
      blnPORequired: this.ticketForm.get('blnPORequired').value,
      update_company_profile: true,
    };

    if (params.companyName === '' || params.companyWebsite === ''
      || params.address === '' || params.zip === ''
      || params.APContactName === '' || params.APEmail === ''
      || params.remitEmail === '') {
      this._supportService.snackBar("Please fill the reuired fields");
      return;
    }
    this.isCreateTicketLoader = true;
    if (this.isUpdate == false || this.isUpdate == undefined) {
      delete params['update_company_profile'];
      delete params['companyProfileID'];
      params['add_company_profile'] = true;
      this._companiesService.postCompaniesData(this.replaceSingleQuotesWithDoubleSingleQuotes(params)).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this._supportService.snackBar("Company Profile is created successfuly");
        this.isCreateTicketLoader = false;
        this._changeDetectorRef.markForCheck();
      })
      return;
    }
    this._companiesService.putCompaniesData(this.replaceSingleQuotesWithDoubleSingleQuotes(params)).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._supportService.snackBar(res["message"]);
      this.isCreateTicketLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        obj[key] = obj[key]?.replace(/'/g, "''");
      }
    }
    return obj;
  }

  setStoreId(id) {
    this.selectedStoreId = id;
  }

  uploadFile(params: any, response): void {
    const reader = new FileReader();
    reader.readAsDataURL(this.files[0]);
    reader.onload = () => {
      let files: any = {
        fileUpload: reader.result,
        fileType: this.files[0]["type"]
      };
      const { fileUpload, fileType } = files;
      const base64 = fileUpload.split(",")[1];
      let d = new Date();

      const payload = [{
        image_file: base64,
        image_path: `/globalAssets/customerCompany/attachments/${this.route.snapshot.params.companyId}/${response.newID}.${fileType.split('/')[1]}`
      }];

      this.imageUploadLoader = true;
      this._commonService.uploadMultipleMediaFiles(payload)
        .subscribe((res) => {
          this.companyData.attachments.push({ type: fileType.split('/')[1], name: this.attachmentName, id: response.newID });
          this._companiesService.snackBar(response["message"])
          this.imageUploadLoader = false;
          this.files = null;
          this.attachmentName = '';

          // Mark for check
          this._changeDetectorRef.markForCheck();
        }, err => {
          this.imageUploadLoader = false;
          this._snackBar.open("Some error occured", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });

          // Mark for check
          this._changeDetectorRef.markForCheck();
        })
    }

  };

  navigate(location: boolean) {
    location ?
      this.router.navigateByUrl('/apps/companies/company-location/' + this.route.snapshot.params.companyId)
      : this.router.navigateByUrl('/apps/companies/company-logo/' + this.route.snapshot.params.companyId + '/' + this.route.snapshot.params['storeId']);
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
