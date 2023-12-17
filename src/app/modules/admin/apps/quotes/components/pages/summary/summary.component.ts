import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { QuotesService } from '../../quotes.service';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { deleteCart } from '../../quotes.types';
declare var $: any;
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
  imprintStatuses: any;
  strReturn = {
    errorCode: 0,
    message: '',
    statusID: 0,
    statusName: '',
    statusDescription: ''
  };


  not_available = 'N/A';
  currentComment: any = [];
  ngStatus = 0;
  statusText = '';
  isRemoveQuote: boolean = false;
  @ViewChild('removeQuote') removeQuote: ElementRef;
  imprintStatus: boolean;

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
        console.log(this.selectedQuoteDetail)
        this.imprintStatuses = quote['imprintStatuses']
        this.setQuoteTracker();
        console.log(this.strReturn);

        // this.setCartLineTrackerData();
        // console.log(this.strReturn);

        this.imprintStatus = this.getCartImprintStatus()




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

  setQuoteTracker() {
    const sortedData = this.imprintStatuses.sort((a, b) => a.fk_statusID - b.fk_statusID);
    console.log(sortedData[0]);

    if (this.selectedQuoteDetail.blnEProcurement) {
      if (this.selectedQuoteDetail.punchoutDate) {
        this.strReturn.statusID = 5;
        this.strReturn.statusName = "Punchout Initiated - Awaiting Purchase Order";
        this.strReturn.statusDescription = "<b>Punchout Has Been Initiated!</b><br />We will receive a purchase order electronically from your procurement system next.";
      }



      if (sortedData[0].fk_statusID === 2) {
        this.strReturn.statusID = 2;
        this.strReturn.statusName = "Proof Is Awaiting Your Approval";
        this.strReturn.statusDescription = "<b>Artwork Proofing Process Has Begun!</b><br />We are now waiting for your proof approval.";
      } else if (sortedData[0].fk_statusID === 3) {
        this.strReturn.statusID = 3;
        this.strReturn.statusName = "Your Proof Approval Received";
        this.strReturn.statusDescription = "<b>Your artwork approval has been received!</b><br />We are now waiting for any additional approvals required.";
      } else if (sortedData[0].fk_statusID === 4) {
        this.strReturn.statusID = 4;
        this.strReturn.statusName = "Secondary Approval(s) Received - Ready For Punchout";
        this.strReturn.statusDescription = "<b>All Approvals Have Been Received!</b><br />All approvals have been received and you can now load your quote and punchout.";
      } else {
        this.strReturn.statusID = 1;
        this.strReturn.statusName = "Quote Generated";
        this.strReturn.statusDescription = "<b>Your Quote Has Been Created!</b><br />You will receive artwork proof(s) within 24 hours.";
      }
    } else {
      if (sortedData[0].fk_statusID === 2) {
        this.strReturn.statusID = 2;
        this.strReturn.statusName = 'Proofing';
        this.strReturn.statusDescription = '<b>An artwork proof has been sent!</b><br />The artwork approval process is underway.';
      } else if (sortedData[0].fk_statusID === 3) {
        this.strReturn.statusID = 3;
        this.strReturn.statusName = 'Your Art Approval Received';
        this.strReturn.statusDescription = '<b>Your artwork approval has been received!</b><br />We are now waiting for any additional approvals required.';
      } else if (sortedData[0].fk_statusID === 4) {
        this.strReturn.statusID = 4;
        this.strReturn.statusName = 'All Approvals Received';
        this.strReturn.statusDescription = '<b>All approvals have been received!</b><br />All approvals have been received and you can now convert the quote into an order.';
      } else {
        this.strReturn.statusID = 1;
        this.strReturn.statusName = 'Quote Placed';
        this.strReturn.statusDescription = '<b>Your quote has been created!</b><br />You will receive artwork proof(s) within 24 hours.';
      }
    }
  }


  listFindNoCase(list, value) {
  // Convert the comma-separated list to an array
  const listArray = list.split(',');

  // Check if the value exists in the array (case insensitive)
  return listArray.some(item => item.trim().toLowerCase() === value.toString().toLowerCase());
}


  setCartLineTrackerData() {

    if (this.selectedQuoteDetail.blnEProcurement) {
      let blnApproved = true;

      blnApproved = !this.imprintStatuses.some(obj =>
        obj["fk_statusID"] === 7 || obj["fk_statusID"] === 9
      );

      if (blnApproved) {
        this.strReturn.statusID = 4;
        this.strReturn.statusName = 'Secondary Approvals(s) Received - Ready For Punchout';
        this.strReturn.statusDescription = '<b>All Approvals Have Been Received!</b><br />All approvals have been received and you can now load your quote and punchout.';
      } else {
        let blnArtApprovalReceived = this.imprintStatuses.some(obj =>
          (obj["fk_statusID"] === 3 || obj["fk_statusID"] === 4 || obj["fk_statusID"] === 13) &&
          (obj["fk_artApprovalContactID"] || obj["fk_storeUserApprovalContactID"])
        );

        if (!blnArtApprovalReceived) {
          let blnProofAwaiting = this.imprintStatuses.some(obj =>
            (obj["fk_statusID"] === 3 || obj["fk_statusID"] === 4 || obj["fk_statusID"] === 13) &&
            !obj["fk_artApprovalContactID"] &&
            !obj["fk_storeUserApprovalContactID"]
          );

          if (blnProofAwaiting) {
            this.strReturn.statusID = 2;
            this.strReturn.statusName = 'Proof Is Awaiting Your Approval';
            this.strReturn.statusDescription = '<b>Artwork Proofing Process Has Begun!</b><br />We are now waiting for your proof approval.';
          } else {
            let blnNew = this.imprintStatuses.every(obj =>
              obj["fk_statusID"] !== 1 && obj["fk_statusID"] !== 2
            );

            if (!blnNew) {
              this.strReturn.statusID = 3;
              this.strReturn.statusName = 'Your Art Approval Received';
              this.strReturn.statusDescription = '<b>Your artwork approval has been received!</b><br />We are now waiting for any additional approval required.';
            } else {
              this.strReturn.statusID = 1;
              this.strReturn.statusName = 'Quote Generated';
              this.strReturn.statusDescription = '<b>Your Quote Has Been Created!</b><br />You will receive artwork proof(s) within 24 hours.';
            }
          }
        } else {
          this.strReturn.statusID = 3;
          this.strReturn.statusName = 'Your Art Approval Received';
          this.strReturn.statusDescription = '<b>Your artwork approval has been received!</b><br />We are now waiting for any additional approval required.';
        }
      }
    } else {
      let blnApproved = !this.imprintStatuses.some(obj =>
        obj["fk_statusID"] === 7 || obj["fk_statusID"] === 9
      );

      if (blnApproved) {
        this.strReturn.statusID = 4;
        this.strReturn.statusName = 'All Approvals Received';
        this.strReturn.statusDescription = '<b>All approvals have been received!</b><br />All approvals have been received and we are ready to send to production as long as payment has been arranged.';
      } else {
        let blnNew = this.imprintStatuses.every(obj =>
          obj["fk_statusID"] !== 1
        );

        if (!blnNew) {
          this.strReturn.statusID = 3;
          this.strReturn.statusName = 'Your Art Approval Received';
          this.strReturn.statusDescription = '<b>Your artwork approval has been received!</b><br />We are now waiting for any additional approval required.';
        } else {
          this.strReturn.statusID = 2;
          this.strReturn.statusName = 'Proofing';
          this.strReturn.statusDescription = '<b>An art proof has been sent!</b><br />The artwork approval process is underway';
        }
      }
    }
  }

  // Assuming you have appropriate models/interfaces and services set up in Angular

  getCartImprintStatus(): boolean {
    const foundStatus = this.imprintStatuses.some(obj =>
      !['7', '9'].includes(obj["fk_statusID"].toString())
    );
    return !foundStatus;
  }



  getQuoteComments() {
    this._quoteService.qoutesComments$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.currentComment = res["data"];
    });
  }
  goToComments() {
    this._router.navigateByUrl(`apps/quotes/${this.selectedQuoteDetail.pk_cartID}/comments`);
  }
  openRemoveModal() {
    $(this.removeQuote.nativeElement).modal('show');
  }
  removeCart() {
    $(this.removeQuote.nativeElement).modal('hide');
    this.isRemoveQuote = true;
    let payload: deleteCart = {
      cartID: this.selectedQuoteDetail.pk_cartID,
      blnQuote: true,
      siteName: this.selectedQuoteDetail.storeName,
      storeId: this.selectedQuoteDetail.storeID,
      calledFrom: 'cart',
      customerName: this.selectedQuoteDetail.CustomerName,
      customerEmail: this.selectedQuoteDetail.customerEmail,
      pk_userID: this.selectedQuoteDetail.pk_userID,
      customerDayPhone: this.selectedQuoteDetail.customerDayPhone,
      discountCode: this.selectedQuoteDetail.discountCode,
      discountAmount: this.selectedQuoteDetail.discountAmount,
      cartLineSumAmount: this.selectedQuoteDetail.cartTotal,
      shipping: 0,
      delete_cart: true
    }
    this._quoteService.UpdateQuoteData(payload)
      .subscribe((response) => {
        if (response["success"]) {
          this._quoteService.snackBar(response["message"]);
          this._router.navigate([`/apps/quotes/${this.selectedQuoteDetail.pk_cartID}`]);
        } else {
          this._quoteService.snackBar(response["message"]);
        }
        this.isRemoveQuote = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isRemoveQuote = false;
        this._changeDetectorRef.markForCheck();
      })
  }

  navigateToArtworkDetails() {
    this._router.navigate([`/apps/quotes/${this.selectedQuoteDetail.pk_cartID}/artwork-details`]);
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
