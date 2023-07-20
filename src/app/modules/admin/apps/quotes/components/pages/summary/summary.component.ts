import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { QuotesService } from '../../quotes.service';
@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styles: ["::ng-deep {.ql-container {height: auto}} .mat-paginator {border-radius: 16px !important}"]
})
export class QuoteSummaryComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  allStates = [];
  totalStates = 0;

  searchStateCtrl = new FormControl();
  selectedState: any;
  isSearchingState = false;

  updateCompnayForm: FormGroup;
  isUpdateLoader: boolean = false;

  supplierData: any;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  addOnBlur = true;

  additionalOrderEmails = [];

  websiteData: any = { userName: '', password: '' };
  isWebsiteDataLoad: boolean = false;
  isUpdateWebsiteLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: QuotesService
  ) { }

  initForm() {
    this.updateCompnayForm = new FormGroup({
      pk_companyID: new FormControl(''),
      companyName: new FormControl(''),
      address: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl(''),
      zipCode: new FormControl(''),
      country: new FormControl(''),
      phone: new FormControl(''),
      fax: new FormControl(''),
      ASI: new FormControl(''),
      PPAI: new FormControl(''),
      artworkEmail: new FormControl(''),
      ordersEmail: new FormControl(''),
      websiteURL: new FormControl(''),
      outsideRep: new FormControl(''),
      insideRep: new FormControl(''),
      outsideRepPhone: new FormControl(''),
      outsideRepEmail: new FormControl(''),
      insideRepPhone: new FormControl(''),
      insideRepEmail: new FormControl(''),
      samplesContactEmail: new FormControl(''),
      additionalOrderEmails: new FormControl(''),
      vendorRelation: new FormControl(''),
      screenprintEmail: new FormControl(''),
      embroideryEmail: new FormControl(''),
      coopPricing: new FormControl(''),
      netSetup: new FormControl(''),
      ltm: new FormControl(''),
      freeRandomSamples: new FormControl(''),
      specSamples: new FormControl(''),
      production: new FormControl(''),
      customerAccountNumber: new FormControl(''),
      shippingComment: new FormControl(''),
      notes: new FormControl('')
    });
  }
  ngOnInit(): void {
  };
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
