import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-surveys',
  templateUrl: './surveys.component.html'
})
export class SurveysComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['pk_surveyID', 'dateCreated', 'name', 'blnAutomate', 'blnFinalized'];
  duplicatedDataSource = [];
  dataSourceLoading: boolean = true;
  dataSourceTotalRecord: number;
  setAddSurveyText: string = "";

  isUpdate: boolean = false;
  flashMessage: 'success' | 'error' | null = null;

  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0]
        this.getFirstCall();
      });
  }
  getFirstCall() {
    const { pk_storeID } = this.selectedStore;

    // Get the supplier products
    this._storeManagerService.getSurveysByStoreId(pk_storeID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSource.forEach(element => {
          element.dateCreated = element.dateCreated ? moment.utc(element.dateCreated).format("lll") : "N/A";
        });
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        // Recall on error
        this.getFirstCall();

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  setAddSurvey(event): void {
    this.setAddSurveyText = event.target.value;
  };

  addSurvey(): void {
    if (this.setAddSurveyText) {
      const { pk_storeID } = this.selectedStore;

      const payload = {
        survey: true,
        store_id: pk_storeID,
        name: this.setAddSurveyText.trim()
      };

      if (payload.name === '') {
        this.setAddSurveyText = ''
        this._snackBar.open("Survey name is required", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        return;
      }

      this.isUpdate = true;
      this._storeManagerService.addSurvey(payload)
        .subscribe((res) => {
          // Get the supplier products
          this._storeManagerService.getSurveysByStoreId(pk_storeID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
              this.dataSource = response["data"];
              this.dataSource.forEach(element => {
                element.dateCreated = element.dateCreated ? moment.utc(element.dateCreated).format("lll") : "N/A";
              });
              this.duplicatedDataSource = this.dataSource;
              this.dataSourceTotalRecord = response["totalRecords"];
              this.dataSourceLoading = false;
              this.showFlashMessage(
                res["success"] === true ?
                  'success' :
                  'error'
              );
              this.isUpdate = false;
              this.setAddSurveyText = "";

              // Mark for check
              this._changeDetectorRef.markForCheck();
            }, err => {
              this.isUpdate = false;
              this._snackBar.open("Some error occured", '', {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
                duration: 3500
              });

              // Mark for check
              this._changeDetectorRef.markForCheck();
            });

        }, err => {
          this._snackBar.open("Some error occured", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.isUpdate = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        });
    } else {
      this._snackBar.open("Survey name is required", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
    }
  };

  /**
   * Show flash message
   */
  showFlashMessage(type: 'success' | 'error'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3000);
  };
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
