import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../store-manager.service';
import moment from "moment";

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexFill,
  ApexMarkers,
  ApexYAxis
} from "ng-apexcharts";

interface ChartData {
  name: string;
  data: number[];
};

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
  presentationScreen: string = "Main";
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

  ngStartDate: any;
  ngEndDate: any;
  processData: any;
  processDataLoader: boolean = false;
  processDataColumns: string[] = ['clicks', 'requests', 'processed', 'delivered'];
  processDate: any;
  subProcessData: any;

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<any>;
  chartSeries: ChartData[] = [];


  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
  ) {
    this.chartOptions = {
      series: [
        {
          name: "Likes",
          data: [4, 3, 10, 9, 29, 19, 22, 9, 12, 7, 19, 5, 13, 9, 17, 2, 7, 5]
        },
        {
          name: "Clicks",
          data: [1, 3, 2, 9, 9, 9, 13, 9, 12, 7, 58, 7, 17, 9, 17, 2, 7, 5]
        }
      ],
      chart: {
        height: 500,
        type: "line"
      },
      stroke: {
        width: 7,
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: [
          "1/11/2000",
          "2/11/2000",
          "3/11/2000",
          "4/11/2000",
          "5/11/2000",
          "6/11/2000",
          "7/11/2000",
          "8/11/2000",
          "9/11/2000",
          "10/11/2000",
          "11/11/2000",
          "12/11/2000",
          "1/11/2001",
          "2/11/2001",
          "3/11/2001",
          "4/11/2001",
          "5/11/2001",
          "6/11/2001"
        ]
      },
      title: {
        text: "Statistics",
        align: "center",
        style: {
          fontSize: "20px",
          color: "#0F172A"
        }
      },
      markers: {
        size: 4,
        colors: ["#0F172A"],
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: {
          size: 7
        }
      },
      yaxis: {
        min: -10,
        max: 40,
        title: {
          text: "Engagement"
        }
      }
    };
  }

  ngOnInit(): void {
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
  getEmailTemplatePreview(element) {
    this.previewData = null;
    this.presentationScreen = 'Preview';
    let params = {
      emails: true,
      template_id: element.id
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.previewData = res["data"].versions[0].html_content;
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
  backToUpdateTemplate() {
    this.presentationScreen = 'Main';
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
