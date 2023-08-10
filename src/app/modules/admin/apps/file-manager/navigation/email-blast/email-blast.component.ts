import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

  mainScreen = 'blast';
  emailActivity: any = [];
  isActivityLoader: boolean = false;
  displayedActivityColumns: string[] = ['status', 'subject', 'from_email', 'to_email', 'opens', 'clicks'];
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
      campaign: ['', Validators.required]
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
        this.getOptInEmail('get');
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

  seeCampaigns(): void {
    this.presentationScreen = "Form Screen";
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
  calledScreens(screenName) {
    this.mainScreen = screenName;
    if (screenName == 'actvity') {
      this.getActivitydata();
    }
  }
  getActivitydata() {
    let params = {
      email_recipient_stats: true,
      email: "info@" + this.selectedStore.storeName
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
    let date = this.getDateArray();
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        let statsParams = {
          email_stats: true,
          start_date: date.from,
          end_date: date.to
        }
        this._fileManagerService.getStoresData(statsParams)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe(statsRes => {
            this.processData = statsRes["data"]
            this.mainDataSource = res["data"].result;

            if (check == 'get') {
              this.mainDataLoader = false;
            }
            this._changeDetectorRef.markForCheck();
          }, err => {
            this.processDataLoader = false;
            this._changeDetectorRef.markForCheck();
          })

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
    if (!heading) {
      this._snackBar.open("Subject is required", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    if (!message) {
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
    if (ev.checked) {
      this.OptInEmails.forEach(element => {
        let index = this.emailsData.indexOf(element.email);
        if (index == -1) {
          this.emailsData.push(element.email);
        }
      });
    } else {
      this.OptInEmails.forEach(element => {
        let index = this.emailsData.indexOf(element.email);
        if (index > -1) {
          this.emailsData.splice(index, 1);
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
