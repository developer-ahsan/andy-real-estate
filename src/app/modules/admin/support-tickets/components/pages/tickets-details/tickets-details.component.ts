import { Component, OnInit, ChangeDetectorRef, OnDestroy, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { SupportTicketService } from '../../support-tickets.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

declare var $: any;
@Component({
  selector: 'app-tickets-details-manage',
  templateUrl: './tickets-details.component.html',
})
export class TicketsDetailsComponent implements OnInit, OnDestroy {
  isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('deleteTicket') deleteTicket: ElementRef;

  dataSource: any = [];
  ticketComments: any = [];

  files: any = [];
  images: any;
  commentForm: any;
  isCreateCommentLoader: boolean = false;
  selectedStatus: string;
  estimatedTime: string;
  email: boolean = true;
  commentators = [];
  userData: any;
  isCommentatorLoader: boolean = false;
  isLoadMore: boolean = false;
  config: any = {
    maxFiles: 5,
  };

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
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService,
    private _supportService: SupportTicketService,
    private route: ActivatedRoute,
    private router: Router,
    private _commonService: DashboardsService

  ) { }

  ngOnInit(): void {
    const user = localStorage.getItem('userDetails');
    this.userData = JSON.parse(user);
    this.commentForm = new FormGroup({
      comment: new FormControl('', Validators.required),
    });
    this.getTicketDetail();
    this.getCommentators();
    this.getTicketComments();
  };
  getTicketDetail() {
    this.isLoading = true;
    const params = {
      tickets_list: true,
      ticket_id: this.route.snapshot.paramMap.get('id')
    }
    this._supportService.getApiData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.dataSource = res?.data[0];
      this.selectedStatus = this.dataSource?.statusName;
      this.estimatedTime = this.dataSource?.estimatedTime;
      this.getImages();

      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  getCommentators() {
    let params = {
      get_commentators_emails: true
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let commentators = res["data"][0].commentorsEmail.split(',,');
      commentators.forEach(commentator => {
        const [id, email] = commentator.split('::');
        this.commentators.push({ id, email });
      });
      this.isCommentatorLoader = false;
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isCommentatorLoader = false;
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getImages() {
    let payload = {
      files_fetch: true,
      path: `/globalAssets/tickets/images/${this.dataSource?.pk_ticketID}/`
    }
    this._commonService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.images = res?.data;
      const newMaxFiles = 5 - (this.images?.length || 0);
      this.config.maxFiles = newMaxFiles;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }

  createComment() {
    const filteredArray = this.commentators.filter(item => item.checked === true).map(item => item.email);
    const param = {
      ticketID: this.route.snapshot.paramMap.get('id'),
      subject: this.dataSource?.subject,
      comment: this.commentForm.get('comment').value,
      emailList: filteredArray,
      blnMasterAccount: this.userData?.blnMasterAccount,
      userID: this.userData?.pk_userID,
      add_ticket_comment: true
    }
    this._supportService.PostAPIData(param).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._supportService.snackBar('Comment is added successfuly.')
    }), err => {
      console.log(err);
      this._supportService.snackBar('Error occured whild adding a comment.')
    }

  }

  openDeleteModal() {
    $(this.deleteTicket.nativeElement).modal('show');
  }

  deleteticket() {
    this._supportService.UpdateAPiData({
      ticketID: this.dataSource.pk_ticketID,
      remove_ticket: true
    }).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._supportService.snackBar('Support ticket is deleted successfuly.')
      this.router.navigateByUrl(`support-tickets`);
    }), err => {
      console.log(err);
      this._supportService.snackBar('Error occured whild deleting the support ticket.')
    }
  }

  updateTicket() {
    const param = {
      ticketID: this.route.snapshot.paramMap.get('id'),
      subject: this.dataSource?.subject,
      estimatedTime: this.estimatedTime,
      statusID: this.statuses.find(status => status.value === this.selectedStatus).key,
      blnEmail: this.email,
      update_ticket: true
    }
    this._supportService.UpdateAPiData(param).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._supportService.snackBar('Support ticket is updated successfuly.');
    }), err => {
      console.log(err);
      this._supportService.snackBar('Error occured whild updating the support ticket.');
    }
  }

  onSelectMain(event) {
    if (event.addedFiles.length > this.config.maxFiles) {
      this._supportService.snackBar("Please select maximum 5 images.");
      return;
    }
    if (this.files.length == this.config.maxFiles) {
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

  viewImage(route: string) {
    window.open(route, '_blank');
  }

  async updateImages() {
    await this.removeFiles();
    await this.encodeImage();
  }

  async encodeImage() {
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
            this.uploadImageToServer(images, this.route.snapshot.paramMap.get('id'));
          }
        }
      }
    });
  }

  async uploadImageToServer(images, responseId) {
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
      this._supportService.snackBar('Images updated successfuly.');
      this.images = []
      this.files = []
      this.getImages();
    });
  }

  removeFiles() {
    const tempImages: any[] = this.images
      .filter(item => item.checked === true)
      .map(item => `/globalAssets/tickets/images/${this.dataSource?.pk_ticketID}/${item.FILENAME}`);
    if (tempImages.length > 0) {
      let payload = {
        files: tempImages,
        delete_multiple_files: true
      }
      this._commonService.removeMediaFiles(payload)
        .subscribe((response) => {
          this._supportService.snackBar('Images updated successfuly.');
          this.files = []
          this.getImages();
        }, err => {
          this._changeDetectorRef.markForCheck();
        })
    } else {
      this._changeDetectorRef.markForCheck();
    }
  }

  getTicketComments() {
    let params = {
      tickets_comments: true,
      ticket_id: this.route.snapshot.paramMap.get('id')
    }
    this._supportService.getApiData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      const splitData = res.data[0].ticket_comments.split(",,");
      this.ticketComments = splitData.map(item => item.split("||"));
    })
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
