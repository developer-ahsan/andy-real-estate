import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { finalize, takeUntil } from 'rxjs/operators';
import moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { UpdateSurveyHiddenStatus, addSurvey, automateSurvey, deleteSurvey, finalizeSurvey } from '../../stores.types';

@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.component.html'
})
export class SurveysComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  setAddSurveyText: string = "";
  mainScreen = 'Surveys';


  dataSourceLoading: boolean = false;
  surveyPage: number = 1;
  hiddenSurveyPage: number = 1;
  surveysList = [];
  hiddentSurveysList = [];
  totalSurveys: number = 0;
  totalHiddenSurveys: number = 0;
  isPaginatorLoading: boolean = false;
  isHiddenPageLoading: boolean = false;
  isAddSurveyLoader: boolean = false;

  isHeaderImage: boolean = false;
  tempValue = Math.random();
  isHeaderRemoveLoader: boolean = false;
  isHeaderAddLoader: boolean = false;
  imageValue: any;
  @ViewChild('fileInputImage') fileInputImage: ElementRef;
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _commonService: DashboardsService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.checkHeaderImage();
        this.getSurveys(1);
      });
  }
  checkHeaderImage() {
    const url = `https://assets.consolidus.com/globalAssets/Stores/surveys/headers/${this.selectedStore.pk_storeID}.jpg?v=${Math.random()}`
    this._commonService.checkImageExistData(url).then((image: boolean) => {
      this.isHeaderImage = image;
    })
  }
  getSurveys(page) {
    const { pk_storeID } = this.selectedStore;
    let params = {
      survey: true,
      store_id: pk_storeID,
      bln_hidden: 2,
      size: 20,
      page: page
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this.dataSourceLoading = false;
      this.isPaginatorLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.surveysList = res["data"];
      this.totalSurveys = res["totalRecords"];
    });
  }
  getNextSurveysData(event) {
    this.isPaginatorLoading = true;
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.surveyPage++;
    } else {
      this.surveyPage--;
    };
    this.getSurveys(this.surveyPage);
  };
  getHiddenSurveys() {
    const { pk_storeID } = this.selectedStore;
    let params = {
      survey: true,
      store_id: pk_storeID,
      bln_hidden: 1,
      size: 20,
      page: this.hiddenSurveyPage
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this.dataSourceLoading = false;
      this.isHiddenPageLoading = false;
      this.isPaginatorLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.hiddentSurveysList = res["data"];
      this.totalHiddenSurveys = res["totalRecords"];
    });
  }
  getNextHiddenData(event) {
    this.isPaginatorLoading = true;
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.hiddenSurveyPage++;
    } else {
      this.hiddenSurveyPage--;
    };
    this.getHiddenSurveys();
  };

  setAddSurvey(event): void {
    this.setAddSurveyText = event.target.value;
  };

  addSurvey(): void {
    if (this.setAddSurveyText.trim() == '') {
      this._storeManagerService.snackBar('Survey name is required');
      return;
    }
    const { pk_storeID } = this.selectedStore;
    const payload: addSurvey = {
      add_survey: true,
      storeID: pk_storeID,
      newSurveyName: this.setAddSurveyText.trim()
    };
    this.isAddSurveyLoader = true;
    this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this._storeManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isAddSurveyLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
        this.surveyPage = 1;
        this.dataSourceLoading = true;
        this.setAddSurveyText = '';
        this._changeDetectorRef.markForCheck();
        this.getSurveys(1);
      }
      this._changeDetectorRef.markForCheck();
    });
  };
  // Delete Survey
  removeSurvey(survey) {
    let msg = 'Are you sure you want to remove this survey?';
    this._commonService.showConfirmation(msg, (confirm) => {
      if (confirm) {
        let payload: deleteSurvey = {
          surveyID: survey.pk_surveyID,
          delete_survey: true
        }
        survey.isDelLoader = true;
        this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          survey.isDelLoader = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
          if (res["success"]) {
            this._storeManagerService.snackBar(res["message"]);
            this.surveysList = this.surveysList.filter(item => item.pk_surveyID != survey.pk_surveyID);
            this.totalSurveys--;
          }
        })
      }
    });
  }
  // Survey Automation
  automateSurvey(survey, blnAutomate) {
    let payload: automateSurvey = {
      surveyID: survey.pk_surveyID,
      blnAutomate: blnAutomate,
      automate_survey: true
    }
    survey.isAutomateLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      survey.isAutomateLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
        survey.blnAutomate = blnAutomate;
      }
    });
  }
  // Finalize Survey
  finalizeSurvey(survey) {
    let payload: finalizeSurvey = {
      surveyID: survey.pk_surveyID,
      finalize_survey: true
    }
    survey.isFinalizeLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      survey.isFinalizeLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
        this.goToEditPage(survey);
      }
    });
  }
  // Hide Unhide Survey
  hideUnhideSurvey(survey, blnHidden) {
    let payload: UpdateSurveyHiddenStatus = {
      blnHidden: blnHidden,
      surveyID: survey.pk_surveyID,
      update_survey_hidden_status: true
    }
    survey.isHideLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      survey.isHideLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
        if (blnHidden) {
          this.surveysList = this.surveysList.filter(item => item.pk_surveyID != survey.pk_surveyID);
          this.totalSurveys--;
        } else {
          this.surveysList.push(survey);
          this.totalSurveys++;
          this.hiddentSurveysList = this.hiddentSurveysList.filter(item => item.pk_surveyID != survey.pk_surveyID);
          this.totalHiddenSurveys--;
        }
      }
    });
  }
  // Header Image
  removeHeaderImage() {
    const { pk_storeID } = this.selectedStore;
    let payload = {
      files: [`/globalAssets/Stores/surveys/headers/${pk_storeID}.jpg`],
      delete_multiple_files: true
    }
    this.isHeaderRemoveLoader = true;
    this._commonService.removeMediaFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar('Header Image Deleted Successfully');
        this.isHeaderImage = false;
      }
      this.isHeaderRemoveLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  upload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 1500 || image.height != 300) {
          this._snackBar.open("Dimensions allowed are 1500px x 300px", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.fileInputImage.nativeElement.value = '';
          this.imageValue = null;
          return;
        } else {
          this.imageValue = {
            imageUpload: reader.result
          };
        }
      }
    }
  };
  uploadImage() {
    if (!this.imageValue) {
      this._storeManagerService.snackBar('Header image is required');
      return;
    }
    this.isHeaderAddLoader = true;
    const { pk_storeID } = this.selectedStore;
    const base64 = this.imageValue.imageUpload.split(",")[1];
    const files = [{
      image_file: base64,
      image_path: `/globalAssets/Stores/surveys/headers/${pk_storeID}.jpg`
    }]
    this._commonService.uploadMultipleMediaFiles(files).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isHeaderAddLoader = false;
      if (res["success"]) {
        this._storeManagerService.snackBar('Header Image Update successfull');
        this.fileInputImage.nativeElement.value = '';
        this.imageValue = null;
        this.tempValue = Math.random();
        this.isHeaderImage = true;
        this._changeDetectorRef.markForCheck();
      }
    })
  }

  calledScreen(screen) {
    this.mainScreen = screen;
    if (screen == 'Hidden') {
      this.isHiddenPageLoading = true;
      this.hiddenSurveyPage = 1;
      this.getHiddenSurveys();
    }
  }
  surveysAnalytics(survey) {
    const { pk_surveyID } = survey;
    const { pk_storeID } = this.selectedStore;
    this.router.navigateByUrl(`/apps/stores/${pk_storeID}/surveys/analytics/${pk_surveyID}`);
  }
  goToEditPage(survey) {
    const { pk_storeID } = this.selectedStore;
    const { pk_surveyID } = survey;
    this.router.navigateByUrl(`/apps/stores/${pk_storeID}/surveys/edit/${pk_surveyID}`);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
