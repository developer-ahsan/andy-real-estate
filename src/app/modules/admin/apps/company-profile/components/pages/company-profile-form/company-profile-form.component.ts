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
      const [id, state, index] = item.split("::");
      result.push({ id: parseInt(id), state, index: parseInt(index) });
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
      this.selectedStoreId = data.fk_storeID
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  openRemoveModal() {
    $(this.removeCompanyProfile.nativeElement).modal('show');
  }


  deleteCompanyProfile() {
    let params = {
      companyProfileID: this.route.snapshot.params['companyId'],
      delete_company_profile: true
    }

    this._companiesService.UpdateCompaniesData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._supportService.snackBar("Company Profile deleted succesfuly");
      $(this.removeCompanyProfile.nativeElement).modal('hide');
      this.router.navigateByUrl('/apps/companies');
    })
  }

  addAttachment() {
    let params = {
      companyProfileID: this.route.snapshot.params['companyId'],
      extension: this.files[0].type.slice(-3),
      name: this.attachmentName,
      mimeType: this.files[0].type,
      add_company_attachment: true
    }
    this.uploadFile(params);
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

      // this.files = event.addedFiles[0];
      // const reader = new FileReader();
      // reader.readAsDataURL(event.addedFiles[0]);
      // reader.onload = () => {
      //   this.files = {
      //     imageUpload: reader.result,
      //     type: event.addedFiles[0]["type"]
      //   };
      // }
    }
    setTimeout(() => {
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  onRemoveMain(index) {
    this.files.splice(index, 1);
  }

  updateCompanyProfile() {
    let params = {
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
      // dateCreated: this.ticketForm.get('dateCreated').value,
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
      this._supportService.snackBar("Company Profile is updated successfuly");
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

  uploadFile(params: any): void {

    const { fileUpload, fileType } = this.files;

    const { pk_productID } = this.route.snapshot.params['companyId'];
    const base64 = fileUpload.split(",")[1];
    let d = new Date();

    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: `/globalAssets/customerCompany/attachments/${pk_productID}/${d.getTime()}.${fileType.slice(-3)}`
    };

    this.imageUploadLoader = true;
    this._inventoryService.addDefaultImage(payload)
      .subscribe((response) => {
        this._companiesService.postCompaniesData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          this._supportService.snackBar("Attachment is added successfuly");
          this.isCreateTicketLoader = false;
          this._changeDetectorRef.markForCheck();
        })
        this._snackBar.open(response["message"], '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.imageUploadLoader = false;
        this.files = null;
        // this.imagesArray.push({ FILENAME: `${pk_productID}-${this.fileName}.jpg` })

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
  };

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };


}
