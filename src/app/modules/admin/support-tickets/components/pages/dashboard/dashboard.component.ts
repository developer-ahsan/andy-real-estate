import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupportTicketService } from '../../support-tickets.service';
import { CreateTicket } from '../../support-tickets.types';
import { FLPSService } from 'app/modules/admin/apps/flps/components/flps.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class SmartCentsDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  isLoading: boolean = false;
  dataSource: any = [];
  displayedColumns: any = [
    {
      value: 'ID',
      key: 'pk_ticketID',
      width: '10'
    },
    {
      value: 'Subject',
      key: 'subject',
      width: '35'
    },
    {
      value: 'Updated',
      key: 'modified',
      width: '20'
    },
    {
      value: 'Age',
      key: 'age',
      width: '10'
    },
    {
      value: 'Submitted by',
      key: 'firstName',
      width: '15'
    },
    {
      value: 'Status',
      key: 'statusName',
      width: '10'
    }
  ];
  totalRecords = 20;
  page = 1;

  mainScreen: string = 'Tickets';
  userData: any;

  config = {
    maxFiles: 5,
  };
  files = [];

  ticketForm: FormGroup;
  isCreateTicketLoader: boolean = false;



  selectedStatus: string = 'All';
  selectedTimeFrame: string = 'All';
  selectedUser: string = 'Anyone'
  isSubmittedRecieved: boolean = false;

  statuses: any = [
    {
      value: 'Open',
      key: 1
    },
    {
      value: 'Action Required',
      key: 2
    },
    {
      value: 'Stalled',
      key: 3
    },
    {
      value: 'Closed',
      key: 4
    },
  ];

  timeFrames: any = [
    {
      value: 'Today',
      key: 'today'
    },
    {
      value: 'This week',
      key: 'week'
    },
    {
      value: 'This month',
      key: 'month'
    },
    {
      value: 'This quarter',
      key: 'quarter'
    },
    {
      value: 'This year',
      key: 'year'
    },
  ];

  params: any = {
    time_frame: 'all',
    status_id: 999,
    admin_user_id: 0,
    tickets_list: true,
    page: this.page
  }

  submittedByUsers: any = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _supportService: SupportTicketService,
    private router: Router,
    private _flpsService: FLPSService,
    private _commonService: DashboardsService

  ) { }
  ngOnInit(): void {
    let user = localStorage.getItem('userDetails');
    this.userData = JSON.parse(user);
    this.initForm();
    this.getSubmittedByUsers();
    this.getData();
  };
  initForm() {
    this.ticketForm = new FormGroup({
      userID: new FormControl(this.userData.pk_userID),
      subject: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      blnUrgent: new FormControl(false),
    });
  }
  calledScreen(screen) {
    this.initForm();
    this.mainScreen = screen;
  }

  onSelectMain(event) {
    if (event.addedFiles.length > 5) {
      this._supportService.snackBar("Please select maximum 5 images.");
      return;
    }
    if (this.files.length == 5) {
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

  createTicket() {
    const { userID, subject, description, blnUrgent } = this.ticketForm.getRawValue();
    let payload: CreateTicket = {
      userID, subject, description, blnUrgent, create_ticket: true
    };
    this._supportService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.uploadMultipleImages(res?.pk_ticketID);
      this._supportService.snackBar('Ticket is added successfuly.');
      this.mainScreen = 'Tickets';
    }), err => {
      console.log(err);
      this._supportService.snackBar('Error occured whild creating a ticket.');
    }
  }


  getData() {
    this.isLoading = true;
    this._supportService.getApiData(this.params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }


  changePage(increment: boolean) {
    if (increment && this.page <= Math.ceil(this.dataSource.totalRecords / this.dataSource.size)) {
      this.page++;
      this.setParams(this.page, 'page')
    }
    else if (!increment && this.page > 1) {
      this.page--;
      this.setParams(this.page, 'page')
    }
  }

  setParams(value: any, key: string) {
    this.params = {
      ...this.params,
      [key]: value
    };
    this.getData();
  }

  resetParams() {
    this.selectedStatus = 'All';
    this.selectedTimeFrame = 'All';
    this.selectedUser = 'Anyone'
    this.params = {
      time_frame: 'all',
      status_id: 0,
      admin_user_id: 0,
      tickets_list: true
    }
    this.getData();
  }


  getSubmittedByUsers() {
    this.isSubmittedRecieved = false;
    this._flpsService.getAllReportUsers().pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      if (res && res["data"] && res["data"][0] && res["data"][0].flpsUsers) {
        let employees = res?.data[0]?.flpsUsers || [];
        if (employees) {
          let employee = employees.split(',');
          employee.forEach(emp => {
            let colonEmp = emp.split(':');
            this.submittedByUsers.push({ pk_userID: Number(colonEmp[0]), fullName: colonEmp[2], email: colonEmp[6] });
          });
        }
      }
      this.isSubmittedRecieved = true;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSubmittedRecieved = true;
      this._changeDetectorRef.markForCheck();
    });
  }


  uploadMultipleImages(responseId) {
    let images = [];
    this.files.forEach((file, index) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let image: any = new Image;
        image.src = reader.result;
        image.onload = () => {
          images.push({
            imageUpload: reader.result,
            type: file["type"]
          });
          if (index == this.files.length - 1) {
            this.uploadImageToServer(images, responseId);
          }
        }
      }
    });
  }

  uploadImageToServer(images, responseId) {
    let files = [];
    images.forEach((element, index) => {
      let d = new Date();
      let filePath = `/globalAssets/tickets/images/${responseId}/${d.getTime() + index}.jpg`;
      files.push({
        image_file: element.imageUpload.split(",")[1],
        image_path: filePath
      });
    });
    this._commonService.uploadMultipleMediaFiles(files).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    });
  }


  navigateToPage(id: string) {
    this.router.navigateByUrl(`support-tickets/detail/${id}`);
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
