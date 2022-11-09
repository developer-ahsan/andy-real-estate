import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../../store-manager.service';
@Component({
  selector: 'app-news-feed',
  templateUrl: './news-feed.component.html',
})
export class PresentationNewsFeedComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() newsFeedData: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  newsFeedAddLoader: boolean = false;
  newsFeedAddMsg: boolean = false;
  newsFeedAddForm: FormGroup;
  newsFeedUpdateForm: FormGroup;
  newsFeedUpdateLoader: boolean = false;
  newsFeedUpdateMsg: boolean = false;
  isNewsFeedAdd: boolean = false;
  isNewsFeedupdate: boolean = false;
  newsFeedColumns: string[] = ['id', 'date', 'title', 'action'];
  isPageLoading: boolean;

  constructor(
    private _storeManagerService: FileManagerService,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }


  ngOnInit() {
    console.log(this.newsFeedData)
    this.initialize();
  }
  initialize() {
    this.newsFeedAddForm = new FormGroup({
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      title: new FormControl('', Validators.required),
      date: new FormControl(new Date(), Validators.required),
      news: new FormControl('', Validators.required),
      add_news_feed: new FormControl(true)
    });
    this.newsFeedUpdateForm = new FormGroup({
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      title: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      news: new FormControl('', Validators.required),
      pk_newsFeedID: new FormControl('', Validators.required),
      update_news_feed: new FormControl(true)
    });

  }
  // News Feed
  isAddToggle(check) {
    this.isNewsFeedAdd = check;
    this.isNewsFeedupdate = false;
  }
  isEditToggle(check, obj) {
    this.isNewsFeedAdd = false;
    this.isNewsFeedupdate = check;
    if (check) {
      this.newsFeedUpdateForm.patchValue(obj);
    }
  }
  AddNewsFeed() {
    const { fk_storeID, title, date, news, add_news_feed } = this.newsFeedAddForm.getRawValue();
    if (title == '' || date == '' || news == '') {
      this._snackBar.open("Please fill out required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      let payload = {
        fk_storeID, title, date: moment(date).format('MM/DD/yyyy'),
        news, add_news_feed
      }
      this.newsFeedAddLoader = true;
      this._storeManagerService.AddNewsFeed(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.newsFeedAddLoader = false;
        if (res["success"]) {
          this.getScreenData("news_feed");
          this.newsFeedAddMsg = true;
          setTimeout(() => {
            this.newsFeedAddMsg = false;
            this._changeDetectorRef.markForCheck();
          }, 3000);
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.newsFeedAddLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    }
  }
  UpdateNewsFeed() {
    const { fk_storeID, title, date, news, update_news_feed, pk_newsFeedID } = this.newsFeedUpdateForm.getRawValue();
    if (title == '' || date == '' || news == '') {
      this._snackBar.open("Please fill out required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      let payload = {
        fk_storeID, title, date: moment(date).format('MM/DD/yyyy'),
        news, update_news_feed, pk_newsFeedID
      }
      this.newsFeedUpdateLoader = true;
      this._storeManagerService.UpdateNewsFeed(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.newsFeedUpdateLoader = false;
        if (res["success"]) {
          this.getScreenData("news_feed");
          this.newsFeedUpdateMsg = true;
          setTimeout(() => {
            this.newsFeedUpdateMsg = false;
            this._changeDetectorRef.markForCheck();
          }, 3000);
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.newsFeedUpdateLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    }
  }
  DeleteNewsFeed(element) {
    element.deleteLoader = true;
    let payload = {
      fk_storeID: this.selectedStore.pk_storeID,
      pk_newsFeedID: element.pk_newsFeedID,
      delete_news_feed: true
    }
    this._storeManagerService.DeleteNewsFeed(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      element.deleteLoader = false;
      this.newsFeedData = this.newsFeedData.filter((value) => {
        return value.pk_newsFeedID != element.pk_newsFeedID;
      });
      if (res["success"]) {
        this._snackBar.open("News feed removed successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      element.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getScreenData(value) {
    this.isPageLoading = true;
    let params = {
      presentation: true,
      store_id: this.selectedStore.pk_storeID,
      [value]: true,
    };
    this._storeManagerService
      .getPresentationData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        this.isNewsFeedAdd = false;
        this.isNewsFeedupdate = false;
        this.newsFeedData = res.data;
        this.isPageLoading = false;
        this._changeDetectorRef.markForCheck();
      });
  }
}
