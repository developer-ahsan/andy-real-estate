import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { FormControl } from '@angular/forms';
import { AuthService } from 'app/core/auth/auth.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { vendorComment } from '../../reports.types';

@Component({
  selector: 'app-report-incident-report',
  templateUrl: './report-incident.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportIncidentComponent implements OnInit, OnDestroy {
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
    private _vendorService: ReportsService,
    private _authService: AuthService
  ) { }

  initForm() {
  }
  ngOnInit(): void {
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
