import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { FormControl } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { vendorComment } from '../../vendors.types';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vendor-comments',
  templateUrl: './vendor-comments.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorCommentsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  supplierData: any;

  mainScreen = 'Current Comments'
  allComments: any;
  user: any;

  emails = [];
  resultEmails = [];
  public emailControl = new FormControl;
  isEmailLoader: boolean = false;
  emailSelected = [];

  isAddCommentLoader: boolean = false;
  ngComment: string = '';
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  commentators: any;
  isCommentatorLoader: boolean;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService,
    private _authService: AuthService,
    private _orderService: OrdersService,
    private router: Router
  ) { }

  initForm() {
  }
  ngOnInit(): void {
    this.user = this._authService.parseJwt(this._authService.accessToken);
    this.initForm();
    this.isLoading = true;
    this.getVendorsData();
    this.getCommentators();
  };
  calledScreen(screen) {
    this.mainScreen = screen;
    if (screen == 'Add New Comment') {

    }
  }
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.allComments = this.supplierData.allComments;
      this.isLoading = true;
      this.getVendorsComments('get');
    })
  }
  getVendorsComments(type) {
    let params = {
      vendor_comments: true,
      size: 20,
      company_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allComments = res["data"][0];
      if (type == 'add') {
        this.ngComment = '';
        this.emails = [];
        this.commentators.forEach(element => { element.checked = false });
        this.isAddCommentLoader = false;
        this._vendorService.snackBar('Comment Added Successfylly');
        this.mainScreen = 'Current Comments';
      }
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  selectedEmails(res) {
    this.emailSelected.push(res.email);
    this.emailControl.reset();
  }
  removeSelectedEmail(index) {
    this.emailSelected.splice(index, 1);
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.emails.includes(value)) {
      this.emails.push(value);
    }
    event.chipInput!.clear();
  }

  remove(email): void {
    const index = this.emails.indexOf(email);
    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/'/g, "''");
      }
    }
    return obj;
  }

  addComment() {
    let emailArr = this.emails;
    this.commentators.forEach(element => {
      if (element.checked) {
        emailArr.push(element.email);
      }
    });
    if (this.ngComment.trim() != '') {
      this._vendorService.snackBar('Comment is required');
      return;
    }
    if (emailArr.length == 0) {
      this._vendorService.snackBar('Email is required');
      return;
    }
    this.isAddCommentLoader = true;
    let payload: vendorComment = {
      company_id: Number(this.supplierData.pk_companyID),
      admin_comment: this.ngComment.trim(),
      emails: emailArr,
      add_comment: true
    }
    payload = this.replaceSingleQuotesWithDoubleSingleQuotes(payload);

    this._vendorService.postVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getVendorsComments('add');
      } else {
        this.isAddCommentLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAddCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // GEt Commentators
  getCommentators() {
    this.commentators = [];
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
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isCommentatorLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  checkAllCommentators() {
    this.commentators.forEach(element => {
      element.checked = true;
    });
  }
  navigate() {
    this.router.navigateByUrl('/apps/users/admin-commentors');
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
