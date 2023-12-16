import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { retry, takeUntil } from 'rxjs/operators';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import moment from "moment";
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-email-blast',
  templateUrl: './email-blast.component.html',
  styles: ['::ng-deep {.ql-container {height: auto}}']
})
export class EmailBlastComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  presentationScreen: string = "Dropdowns";
  templatesValues = ["Campaigns", "Featured"];
  selected = 'YES';
  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': ['white'] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };
  presentationButtons: string[] = [
    "Main",
    "Campaign Focused",
    "Featured products",
    "Simple Text",
    "Simple html",
    "Custom email",
    "Opt-In Email",
    "Segmented target files",
  ];
  storeProductLoader: boolean = false;
  selectedProduct: any = '3M Promotional Markets Dept';
  checked = false;
  drawerOpened: boolean = false;
  selectedIndex: any;
  drawerMode = "over";
  mainSisplayedColumns: string[] = ['template', 'action'];
  mainDataSource = [];
  mainDataLoader: boolean = false;

  displayedColumns: string[] = ['update', 'name', 'action'];
  dataSource = [];

  optDisplayedColumns: string[] = ['email', 'action'];
  optDataSource = [];

  addOptInForm: FormGroup;
  isAddMsg: boolean = false;
  isAddLoader: boolean = false;

  isPageLoading: boolean = false;
  optInData: any;
  OptInEmails: any;
  OptOutEmails: any;
  customerEmails: any;
  product_templete: any;

  previewData: any;

  selectedTemplate: any = [];
  ngStartDate: any;
  ngEndDate: any;
  processData: any;
  processDataLoader: boolean = false;
  processDataColumns: string[] = ['clicks', 'requests', 'processed', 'delivered'];
  processDate: any;
  subProcessData: any;

  campaignsList: any[] = [];
  viewCampaignsLoader: boolean = false;
  sendEmailForm: FormGroup;
  sendEmailLoader: boolean = false;

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  emailsData = [];
  productsData: any;

  featureSelectedProducts: any = {
    subProductSix: {},
    subProductFive: {},
    subProductFour: {},
    subProductThree: {},
    subProductTwo: {},
    subProductOne: {},
    featureProduct: {},
    actionTitle: '',
    actionText: ''
  };

  editorConfig = {
    toolbar: [
      { name: 'clipboard', items: ['Undo', 'Redo'] },
      { name: 'styles', items: ['Format'] },
      { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike'] },
      { name: 'align', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
      { name: 'links', items: ['Link', 'Unlink'] },
      { name: 'insert', items: ['Image', 'Table'] },
      { name: 'tools', items: ['Maximize'] },
    ],
    extraPlugins: 'uploadimage,image2',
    uploadUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json',
    filebrowserUploadMethod: 'base64',
    // Configure your file manager integration. This example uses CKFinder 3 for PHP.
    filebrowserBrowseUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/ckfinder.html',
    filebrowserImageBrowseUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/ckfinder.html?type=Images',
    filebrowserUploadUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/core/connector/php/connector.php?command=QuickUpload&type=Files',
    filebrowserImageUploadUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/core/connector/php/connector.php?command=QuickUpload&type=Images'
    // other options
  };

  mainScreen = 'blast';
  emailActivity: any = [];
  isActivityLoader: boolean = false;
  displayedActivityColumns: string[] = ['last_event_time', 'status', 'subject', 'from_email', 'to_email', 'opens', 'clicks'];
  @ViewChild('chipList', { static: false }) chipList: ElementRef<HTMLInputElement>;

  ngEmailOptIn: boolean = false;

  selectedRecipientValue: string = 'everyone';
  incomingfile(event) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    reader.onload = (e: any) => {
      /* create workbook */
      const binarystr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });
      /* selected the first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      /* save data */
      const data = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
      data.forEach((element: any) => {
        const value = (element.email || '').trim();
        // Add our fruit
        if (value) {
          this.emailsData.push(value);
          this.chipList.nativeElement.focus();
        }
      });
    };
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value) {
      this.emailsData.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(fruit): void {
    const index = this.emailsData.indexOf(fruit);

    if (index >= 0) {
      this.emailsData.splice(index, 1);
    }
  }

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.sendEmailForm = this._formBuilder.group({
      heading: ['', Validators.required],
      message: ['', Validators.required],
      campaign: ['', Validators.required],
      selectedRecipientValue: ['email', Validators.required]
    });
    this.isLoadingChange.emit(false);
    this.initAddForm();
    this.getStoreDetails();
  }
  getStoreDetails() {
    this._fileManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        // this.getOptInEmail('get');
        this.getOptInOutEmail();
        this.getEmailTemplate('get');
      });
  }
  initAddForm() {
    this.addOptInForm = new FormGroup({
      email: new FormControl('', Validators.required),
      blnActive: new FormControl(true)
    })
  }
  getDateArray() {
    let dateTo = moment().format('YYYY-MM-DD');
    let dateFrom = moment().subtract(6, 'd').format('YYYY-MM-DD');
    return { to: dateTo, from: dateFrom }

  }

  setProduct(data, key) {
    this.featureSelectedProducts[key] = data
  }
  isEmpty(obj) {
    return Object.entries(obj).length === 0;
  }

  sendProductFeatureEmail() {

    // return;
    const { pk_storeID, storeName, storeURL, protocol } = this.selectedStore;
    console.log(this.selectedStore);
    const { heading } = this.sendEmailForm.getRawValue();
    if (heading.trim() === '') {
      this._snackBar.open("Subject is required", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    if (!this.emailsData.length) {
      this._snackBar.open("Emails are needed", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    };



    this.previewData = null;
    // this.presentationScreen = 'Preview';
    let payload = {
      dynamic_email: true,
      email_list: this.emailsData,
      template_id: this.selectedTemplate.id,
      store_name: storeName,
      template: {
        store_name: storeName,
        subject: heading,
        title: this.featureSelectedProducts.actionTitle,
        text: this.featureSelectedProducts.actionText.replace(/<\/?p>/g, ''),
        banner: pk_storeID,
        featured_product: {
          title: this.featureSelectedProducts.featureProduct.productName,
          store_product_id: this.featureSelectedProducts.featureProduct.productId,
          sub_title: `${this.featureSelectedProducts.featureProduct.price}`,
          description: this.featureSelectedProducts.featureProduct.description,
          url: `${protocol}${storeURL}${this.featureSelectedProducts.featureProduct.permalink}`,
          image_url: ""
        },
        product_1: {
          title: this.isEmpty(this.featureSelectedProducts.subProductOne) ? null : this.featureSelectedProducts.subProductOne.productName,
          store_product_id: this.isEmpty(this.featureSelectedProducts.subProductOne) ? null : this.featureSelectedProducts.subProductOne.productId,
          sub_title: this.isEmpty(this.featureSelectedProducts.subProductOne) ? null : `${this.featureSelectedProducts.subProductOne.price}`,
          description: this.isEmpty(this.featureSelectedProducts.subProductOne) ? null : this.featureSelectedProducts.subProductOne.description,
          url: this.isEmpty(this.featureSelectedProducts.subProductOne) ? null : `${protocol}${storeURL}${this.featureSelectedProducts.subProductOne.permalink}`,
          image_url: this.isEmpty(this.featureSelectedProducts.subProductOne) ? null : ""
        },
        product_2: {
          title: this.isEmpty(this.featureSelectedProducts.subProductTwo) ? null : this.featureSelectedProducts.subProductTwo.productName,
          store_product_id: this.isEmpty(this.featureSelectedProducts.subProductTwo) ? null : this.featureSelectedProducts.subProductTwo.productId,
          sub_title: this.isEmpty(this.featureSelectedProducts.subProductTwo) ? null : `${this.featureSelectedProducts.subProductTwo.price}`,
          description: this.isEmpty(this.featureSelectedProducts.subProductTwo) ? null : this.featureSelectedProducts.subProductTwo.description,
          url: this.isEmpty(this.featureSelectedProducts.subProductTwo) ? null : `${protocol}${storeURL}${this.featureSelectedProducts.subProductTwo.permalink}`,
          image_url: this.isEmpty(this.featureSelectedProducts.subProductTwo) ? null : ""
        },
        product_3: {
          title: this.isEmpty(this.featureSelectedProducts.subProductThree) ? null : this.featureSelectedProducts.subProductThree.productName,
          store_product_id: this.isEmpty(this.featureSelectedProducts.subProductThree) ? null : this.featureSelectedProducts.subProductThree.productId,
          sub_title: this.isEmpty(this.featureSelectedProducts.subProductThree) ? null : `${this.featureSelectedProducts.subProductThree.price}`,
          description: this.isEmpty(this.featureSelectedProducts.subProductThree) ? null : this.featureSelectedProducts.subProductThree.description,
          url: this.isEmpty(this.featureSelectedProducts.subProductOne) ? null : `${protocol}${storeURL}${this.featureSelectedProducts.subProductThree.permalink}`,
          image_url: this.isEmpty(this.featureSelectedProducts.subProductThree) ? null : ""
        },
        product_4: {
          title: this.isEmpty(this.featureSelectedProducts.subProductFour) ? null : this.featureSelectedProducts.subProductFour.productName,
          store_product_id: this.isEmpty(this.featureSelectedProducts.subProductFour) ? null : this.featureSelectedProducts.subProductFour.productId,
          sub_title: this.isEmpty(this.featureSelectedProducts.subProductFour) ? null : `${this.featureSelectedProducts.subProductFour.price}`,
          description: this.isEmpty(this.featureSelectedProducts.subProductFour) ? null : this.featureSelectedProducts.subProductFour.description,
          url: this.isEmpty(this.featureSelectedProducts.subProductFour) ? null : `${protocol}${storeURL}${this.featureSelectedProducts.subProductFour.permalink}`,
          image_url: this.isEmpty(this.featureSelectedProducts.subProductFour) ? null : ""
        },
        product_5: {
          title: this.isEmpty(this.featureSelectedProducts.subProductFive) ? null : this.featureSelectedProducts.subProductFive.productName,
          store_product_id: this.isEmpty(this.featureSelectedProducts.subProductFive) ? null : this.featureSelectedProducts.subProductFive.productId,
          sub_title: this.isEmpty(this.featureSelectedProducts.subProductFive) ? null : `${this.featureSelectedProducts.subProductFive.price}`,
          description: this.isEmpty(this.featureSelectedProducts.subProductFive) ? null : this.featureSelectedProducts.subProductFive.description,
          url: this.isEmpty(this.featureSelectedProducts.subProductFive) ? null : `${protocol}${storeURL}${this.featureSelectedProducts.subProductFive.permalink}`,
          image_url: this.isEmpty(this.featureSelectedProducts.subProductFive) ? null : ""
        },
        product_6: {
          title: this.isEmpty(this.featureSelectedProducts.subProductSix) ? null : this.featureSelectedProducts.subProductSix.productName,
          store_product_id: this.isEmpty(this.featureSelectedProducts.subProductSix) ? null : this.featureSelectedProducts.subProductSix.productId,
          sub_title: this.isEmpty(this.featureSelectedProducts.subProductSix) ? null : `${this.featureSelectedProducts.subProductSix.price}`,
          description: this.isEmpty(this.featureSelectedProducts.subProductSix) ? null : this.featureSelectedProducts.subProductSix.description,
          url: this.isEmpty(this.featureSelectedProducts.subProductSix) ? null : `${protocol}${storeURL}${this.featureSelectedProducts.subProductSix.permalink}`,
          image_url: this.isEmpty(this.featureSelectedProducts.subProductSix) ? null : ""
        }
      }
    }
    this.storeProductLoader = true;
    this._fileManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this._snackBar.open("Email sent successfuly", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      this.resetMainScreen();
      this.storeProductLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._snackBar.open("Error occured while sending email", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      this.storeProductLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }


  createEmail() {
    let tempActionText = this.featureSelectedProducts.actionText.replace(/&nbsp;/g, '')
    tempActionText = tempActionText.replace(/<\/?p>/g, '');
    if (this.isEmpty(this.featureSelectedProducts.featureProduct)
      || this.featureSelectedProducts.actionTitle.trim() === ''
      || tempActionText.trim() == '') {
      this._snackBar.open("Please fill the required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    if(this.featureSelectedProducts.actionText?.length > 1400) {
      this._snackBar.open("Maximum limit for Action text is 1400", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    this.selectedTemplate.name = ''
  }

  seeCampaigns(): void {
    if(this.selectedTemplate?.length === 0) {
      this._snackBar.open("Please select template", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    this.presentationScreen = "Form Screen";
    if (this.selectedTemplate.name == 'Featured Products V2') {

      let params = {
        emails: true,
        template_id: this.selectedTemplate.id
      }

      // this._fileManagerService.getStoresData(params)
      //   .pipe(takeUntil(this._unsubscribeAll))
      //   .subscribe((res: any) => {

      //     this._changeDetectorRef.markForCheck();
      //   }, err => {
      //     this.mainDataLoader = false;
      //     this._changeDetectorRef.markForCheck();
      //   })
      const { pk_storeID } = this.selectedStore;
      let storeProductPayload = {
        supplier_based: true,
        store_id: pk_storeID
      }
      this.storeProductLoader = true;
      this._fileManagerService.getStoreProductsEmailBlast(storeProductPayload)
        .pipe(takeUntil(this._unsubscribeAll), retry(3))
        .subscribe((response: any) => {
          this.productsData = this.splitProductsData(response['data'][0]);
          this._changeDetectorRef.markForCheck();
          this.storeProductLoader = false;
        }, err => {
          this.storeProductLoader = false;
          this._changeDetectorRef.markForCheck();
        });




      return;
    }
    if (!this.campaignsList.length) {
      const { pk_storeID } = this.selectedStore;
      this.viewCampaignsLoader = true;

      // Get the supplier products
      this._fileManagerService.getCampaigns(pk_storeID)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
          this.campaignsList = response["data"];
          this.viewCampaignsLoader = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        }, err => {
          this.viewCampaignsLoader = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        });
    }
  }




  splitProductsData(array) {
    array.forEach(item => {
      const productsArray = item.products.split(",,");
      const splittedData = productsArray
        .filter(product => product.trim().length > 0)
        .map(product => {
          const productInfo = product.split("::");
          return {
            productId: productInfo[0],
            productName: productInfo[1],
            price: parseFloat(productInfo[2]),
            description: productInfo[3],
            link: productInfo[4],
            permalink: productInfo[5]
          };
        });
      item.splittedData = splittedData;
    });

    return array;
  }

  calledScreens(screenName) {
    this.mainScreen = screenName;
    if (screenName == 'actvity') {
      this.getActivitydata();
      this.getEmailTemplate('get');
    }
  }
  getActivitydata() {
    let date = this.getDateArray();
    this.processDataLoader = true;
    let statsParams = {
      email_stats: true,
      start_date: date.from,
      end_date: date.to
    }
    this._fileManagerService.getStoresData(statsParams)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(statsRes => {
        this.processData = statsRes["data"];
        this.processDataLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.processDataLoader = false;
        this._changeDetectorRef.markForCheck();
      })


    let params = {
      email_recipient_stats: true,
      email: "service@" + this.selectedStore.storeName,
      size: 30
    }
    this.isActivityLoader = true;
    this._fileManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.emailActivity = res["data"]["messages"];
      this.isActivityLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isActivityLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  calledScreen(screenName): void {
    this.drawerOpened = false;
    this.presentationScreen = screenName;
    if (screenName == 'Opt-In Email') {
      this.getOptInEmail('get');
    } else if (screenName == 'Main') {
      this.getEmailTemplate('get');
    }
  }
  toggleDrawer() {
    this.drawerOpened = !this.drawerOpened;
  }
  addOptInEmail() {
    this.isAddLoader = true;
    const { email, blnActive } = this.addOptInForm.getRawValue();
    let checkEmail = this.optInData.filter((value) => {
      return value.email == email;
    });
    if (checkEmail) {
      this.isAddLoader = false;
      this._snackBar.open("Email Already Exist", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      let payload = {
        email, blnActive,
        fk_storeID: this.selectedStore.pk_storeID,
        add_email_opt: true
      }
      this._fileManagerService.postStoresData(payload)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(res => {
          if (res["success"]) {
            this.getOptInEmail('add');
          }
          this._changeDetectorRef.markForCheck();
        }, err => {
          this.isAddMsg = false;
          this.isAddLoader = false;
          this._changeDetectorRef.markForCheck()
        })
    }
  }
  updateOptInEmail(item, check) {
    item.loader = true;
    item.msg = false;
    if (check == 'opt-in') {
      item.blnActive = true;
    } else {
      item.blnActive = false;
    }
    const { email, blnActive } = item;

    let payload = {
      email, blnActive,
      fk_storeID: this.selectedStore.pk_storeID,
      update_email_opt: true
    }
    this._fileManagerService.putStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        if (res["success"]) {
          this.getOptInEmail('update');
          item.msg = true;
          item.loader = false;
          setTimeout(() => {
            item.msg = false;
          }, 2000);
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        item.msg = false;
        item.loader = false;
        this._changeDetectorRef.markForCheck()
      })
  }
  getOptInOutEmail() {
    this.isPageLoading = true;
    this.optInData = null;
    let params = {
      store_id: this.selectedStore.pk_storeID,
      optIn_optOut: true
    }

    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.optInData = res["data"][0];
        let optInEmails = this.optInData.optInEmails;
        if (optInEmails) {
          this.OptInEmails = optInEmails.split(',');
        }
        let optOutEmails = this.optInData.optOutEmails;
        if (optOutEmails) {
          this.OptOutEmails = optOutEmails.split(',');
        }
        let customerEmails = this.optInData.allActiveCustomers;
        if (customerEmails) {
          this.customerEmails = customerEmails.split(',');
        }
        this.isPageLoading = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isPageLoading = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  getOptInEmail(check) {
    if (check == 'get') {
      this.isPageLoading = true;
    }
    this.optInData = [];
    this.OptInEmails = [];
    this.OptOutEmails = [];
    let params = {
      store_id: this.selectedStore.pk_storeID,
      optIn_data: true
    }

    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.optInData = res["data"];
        this.optInData.forEach(element => {
          if (element.blnActive) {
            this.OptInEmails.push(element);
          } else {
            this.OptOutEmails.push(element);
          }
        });
        if (check == 'get') {
          this.isPageLoading = false;
        } else if (check == 'add') {
          this.initAddForm();
          this.isAddLoader = false;
          this.isAddMsg = true;
          setTimeout(() => {
            this.isAddMsg = false;
            this._changeDetectorRef.markForCheck();
          }, 2000);
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isAddLoader = false;
        this.isAddMsg = false;
        this.isPageLoading = false;
        this._changeDetectorRef.markForCheck();
      })
  }

  selectTemplate(data): void {
    this.selectedTemplate = data;
  };

  getEmailTemplate(check) {
    if (check == 'get') {
      this.mainDataLoader = true;
    }
    this.mainDataSource = [];
    let params = {
      emails: true
    }

    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.mainDataSource = res["data"].result;

        if (check == 'get') {
          this.mainDataLoader = false;
        }
        this._changeDetectorRef.markForCheck();



      }, err => {
        this.mainDataLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }



  getEmailTemplatePreview() {
    const { pk_storeID, storeName } = this.selectedStore;
    const { heading, campaign, message } = this.sendEmailForm.getRawValue();

    if (!campaign) {
      this._snackBar.open("Please select campaign", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    if (heading.trim() === '') {
      this._snackBar.open("Subject is required", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    if (message.trim() === '') {
      this._snackBar.open("Message is required", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    if (!this.emailsData.length) {
      this._snackBar.open("Emails are needed", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    };



    this.previewData = null;
    this.presentationScreen = 'Preview';
    let payload = {
      get_emails_template: true,
      title: campaign.title,
      objective: campaign.objective,
      strategy: campaign.strategy,
      template_id: this.selectedTemplate.id,
      store_id: pk_storeID,
      store_name: storeName,
      campaign_id: campaign.pk_campaignID,
      subject: heading,
      header: heading,
      message: message,
      emails: this.emailsData
    }

    this._fileManagerService.getEmailPriviewTemplate(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        this.previewData = res.data;
        this.product_templete = res.products_template;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.mainDataLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }

  getGraphData() {
    if (!this.ngStartDate || !this.ngEndDate) {
      this._snackBar.open("Please Select Date Range", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      this.processDataLoader = true;
      let params = {
        start_date: moment(this.ngStartDate).format('YYYY-MM-DD'),
        end_date: moment(this.ngEndDate).format('YYYY-MM-DD'),
        email_stats: true,
        aggregated_by: 'day'
      }
      this._fileManagerService.getStoresData(params)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(res => {
          this.processDataLoader = false;
          this.processData = res["data"]
          this._changeDetectorRef.markForCheck();
        }, err => {
          this.processDataLoader = false;
          this._changeDetectorRef.markForCheck();
        })
    }
  }
  openedAccordion(item) {
    this.processDate = item.date;
    this.subProcessData = item.stats;
  }
  backToFormScreen() {
    this.presentationScreen = 'Form Screen';
  };

  resetMainScreen() {
    this.presentationScreen = 'Dropdowns';
    this.selectedTemplate = []
  }

  viewTemplateType() {
    this.presentationScreen = 'Dropdowns';
  };

  sendEmail() {
    const { pk_storeID } = this.selectedStore;
    const { heading, campaign, message } = this.sendEmailForm.getRawValue();

    if (!this.emailsData.length) {
      this._snackBar.open("Emails are needed", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    };

    this.sendEmailLoader = true;
    let payload = {
      "email_list": this.emailsData,
      "subject": heading,
      "store_id": pk_storeID,
      "campaign_id": campaign.pk_campaignID,
      "heading": heading,
      "message": message,
      "template_id": this.selectedTemplate?.id,
      "email": true
    }

    this._fileManagerService.postStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.sendEmailLoader = false;
        this._snackBar.open("Email sent successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
        this.getActivitydata();
        this.mainScreen = 'actvity';
        this.emailsData = [];
        this.sendEmailForm.reset();
        this.presentationScreen = 'Dropdowns';
        this.sendEmailForm.patchValue({ selectedRecipientValue: 'email' });
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Error occured while sending email", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
        this.sendEmailLoader = false;
        this._changeDetectorRef.markForCheck();
      });

  };
  changeEmailCheckBox(ev) {
    this.emailsData = [];
    if (ev.value == 'optIn') {
      this.OptInEmails.forEach(element => {
        let index = this.emailsData.indexOf(element);
        if (index == -1) {
          this.emailsData.push(element);
        }
      });
    }
    if (ev.value == 'customers') {
      this.customerEmails.forEach(element => {
        let index = this.emailsData.indexOf(element);
        if (index == -1) {
          this.emailsData.push(element);
        }
      });
    }
    // if(ev.value == 'email') {
    //   this.customerEmails.forEach(element => {
    //     let index = this.emailsData.indexOf(element.email);
    //     if (index == -1) {
    //       this.emailsData.push(element.email);
    //     }
    //   });
    // }
    // if (ev.checked) {
    //   this.OptInEmails.forEach(element => {
    //     let index = this.emailsData.indexOf(element.email);
    //     if (index == -1) {
    //       this.emailsData.push(element.email);
    //     }
    //   });
    // } else {
    //   this.OptInEmails.forEach(element => {
    //     let index = this.emailsData.indexOf(element.email);
    //     if (index > -1) {
    //       this.emailsData.splice(index, 1);
    //     }
    //   });
    // }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
