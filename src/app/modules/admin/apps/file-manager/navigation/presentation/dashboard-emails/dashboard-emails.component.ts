import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../../store-manager.service';
import { SupportTicketService } from 'app/modules/admin/support-tickets/components/support-tickets.service';
@Component({
  selector: 'app-dashboard-emails',
  templateUrl: './dashboard-emails.component.html',
})
export class PresentationDashboardEmailsComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() screenData: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dashboardEmailsForm: FormGroup;
  dashboardEmailLoader: boolean = false;
  dashboardEmailMsg: boolean = false;
  quillModules: any = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: ["white"] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };
  constructor(
    private _storeManagerService: FileManagerService,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef,
    private _supportService: SupportTicketService,
  ) { }


  ngOnInit() {
    this.initialize();
  }
  initialize() {
    this.dashboardEmailsForm = new FormGroup({
      rescheduleFollowUp: new FormControl(''),
      sampleEmail: new FormControl(''),
      paymentNotification: new FormControl(''),
      followUpEmail: new FormControl(''),
      reorderEmail: new FormControl(''),
      surveyEmail: new FormControl(''),
      surveyEmailSubject: new FormControl(''),
      quoteEmailSubject: new FormControl(''),
      quoteEmail: new FormControl(''),
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      update_default_email: new FormControl(true)
    })
    this.dashboardEmailsForm.patchValue(this.screenData);
  }
  DefaultEmailUpdate() {
    if(this.dashboardEmailsForm.value.quoteEmailSubject.trim() === '' || this.dashboardEmailsForm.value.surveyEmailSubject.trim() === '') {
      this._supportService.snackBar("Please fill the required fields"); 
      return;
    }
    this.dashboardEmailLoader = true;

    this._storeManagerService.DefaultEmailUpdate(this.replaceSingleQuotesWithDoubleSingleQuotes(this.dashboardEmailsForm.value)).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dashboardEmailLoader = false;
      if (res["success"]) {
        this.dashboardEmailMsg = true;
        setTimeout(() => {
          this.dashboardEmailMsg = false;
          this._changeDetectorRef.markForCheck();
        }, 3000);
      }
      this._supportService.snackBar("Default email updated successfuly");
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._supportService.snackBar("Error occured while updating default email");

      this.dashboardEmailLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }


  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
            obj[key] = obj[key]?.replace(/'/g, "''");
        }
    }
    return obj;
}

}
