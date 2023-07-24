import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { QuotesService } from '../../quotes.service';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styles: [".tracker {background-color: #eee;} .tracker-active {background-color: green;color: #fff;} .progress {height: 2rem} ::-webkit-scrollbar {width: 3px !important}"]
})
export class QuoteSummaryComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  selectedQuoteDetail: any;
  not_available = 'N/A';
  currentComment: any = [];
  ngStatus = 0;
  statusText = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _quoteService: QuotesService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.getQuotesDetails();
    this.getQuoteComments();
  };
  getQuotesDetails() {
    this._quoteService.qoutesDetails$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((quote) => {
        this.selectedQuoteDetail = quote["data"][0];
        if (this.selectedQuoteDetail.artworkStatus.includes('7') || this.selectedQuoteDetail.artworkStatus.includes('9')) {
          this.selectedQuoteDetail.statusName = 'All artwork approved';
          this.selectedQuoteDetail.statusColor = 'text-green-600';
        } else {
          this.selectedQuoteDetail.statusName = 'Artwork pending';
          this.selectedQuoteDetail.statusColor = 'text-red-600';
        }
        this.ngStatus = Number(this.selectedQuoteDetail.artworkStatus);
        if (this.ngStatus == 1) {
          this.statusText = '<b>Your Quote Has Been Created!</b><br />You will receive artwork proof(s) within 24 hours.';
        } else if (this.ngStatus == 2) {
          this.statusText = '<b>An artwork proof has been sent!</b><br />The artwork approval process is underway.';
        } else if (this.ngStatus == 3) {
          this.statusText = '<b>Your artwork approval has been received!</b><br />We are now waiting for any additional approvals required.';
        } else if (this.ngStatus == 4) {
          this.statusText = '<b>All approvals have been received!</b><br />All approvals have been received and you can now convert the quote into an order.';
        } else if (this.ngStatus == 5) {
          this.statusText = '<b>Punchout Has Been Initiated!</b><br />We will receive a purchase order electronically from your procurement system next.';
        } else if (this.ngStatus == 6) {
          this.statusText = '';
        }
        this._changeDetectorRef.markForCheck();
      });
  }
  getQuoteComments() {
    this._quoteService.qoutesComments$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.currentComment = res["data"];
    });
  }
  goToComments() {
    this._router.navigateByUrl(`apps/quotes/${this.selectedQuoteDetail.pk_cartID}/comments`);
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
