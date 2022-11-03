import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import moment from "moment";
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-email-blast',
  templateUrl: './email-blast.component.html',
  styles: ['::ng-deep {.ql-container {height: auto}}']
})
export class EmailBlastComponent implements OnInit, OnDestroy {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
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
  fruits = [];

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value) {
      this.fruits.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(fruit): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
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
    this.getEmailTemplate('get');
  }
  initAddForm() {
    this.addOptInForm = new FormGroup({
      email: new FormControl('', Validators.required),
      blnActive: new FormControl(true)
    })
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
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        let statsParams = {
          email_stats: true,
          start_date: "2022-10-29",
          end_date: "2022-11-03"
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
    this.previewData = null;
    this.presentationScreen = 'Preview';
    let params = {
      emails: true,
      template_id: this.selectedTemplate.id
    }

    const { pk_storeID } = this.selectedStore;
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        console.log("html_content", res["data"].versions[0].html_content);

        const html = res["data"].versions[0].html_content;
        html.replace("{{store_id}}", pk_storeID);
        console.log("after", html);

        this.previewData = html;
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

    if (!this.fruits.length) {
      this._snackBar.open("Emails are needed", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    };

    this.sendEmailLoader = true;
    let payload = {
      "email_list": this.fruits,
      "subject": heading,
      "store_id": pk_storeID,
      "campaign_id": campaign.pk_campaignID,
      "heading": heading,
      "message": message,
      "template_id": this.selectedTemplate?.id,
      "email": true
    }

    console.log("payload => ", payload);
    this._fileManagerService.postStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.sendEmailLoader = false;
        this._snackBar.open("Email sent successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
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

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
