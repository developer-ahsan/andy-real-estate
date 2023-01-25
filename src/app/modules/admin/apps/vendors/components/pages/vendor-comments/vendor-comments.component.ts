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

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService,
    private _authService: AuthService
  ) { }

  initForm() {
  }
  ngOnInit(): void {
    this.user = this._authService.parseJwt(this._authService.accessToken);
    let params;
    this.emailControl.valueChanges.pipe(filter((res: any) => {
      params = {
        commentors: true,
        keyword: res
      }
      return res != null && res.length >= 3
    }), debounceTime(500), tap(() => {
      this.resultEmails = [];
      this.isEmailLoader = true;
      this._changeDetectorRef.markForCheck();
    }),
      switchMap(value => this._vendorService.getVendorsData(params)
        .pipe(
          finalize(() => {
            this.isEmailLoader = false;
            this._changeDetectorRef.markForCheck();
          }),
        ))).subscribe(data => {
          this.resultEmails = data["data"] as any[];
          this._changeDetectorRef.markForCheck();
        });
    this.initForm();
    this.isLoading = true;
    this.getVendorsData();
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
        this.emailSelected = [];
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
    if (value) {
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
  addComment() {
    let emailArr = this.emails.concat(this.emailSelected);
    if (this.ngComment! == '') {
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
      admin_comment: this.ngComment,
      emails: emailArr,
      add_comment: true
    }
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
