import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SmartArtService } from '../../smartart.service';
import { sendOrderCustomerEmail } from '../../smartart.types';
@Component({
  selector: 'app-order-emails',
  templateUrl: './order-emails.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./order-emails.scss']
})
export class SmartartOrderEmailComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('drawer', { static: true }) drawer: MatDrawer;
  @Input() isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  paramData: any;
  orderData: any = [];
  // Email Check
  emailCheckOrder: boolean = false;
  sendEmailLoader: boolean = false;
  ngFrom = '';
  ngTo = '';
  ngSubject = '';
  ngMessage = '';
  selectedContact: any;
  contactProofs = [];
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _smartartService: SmartArtService,
    private router: Router,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._activeRoute.queryParams.subscribe(res => {
      this.paramData = res;
      this.getOrderDetails();
    });
  };

  getOrderDetails() {
    let params = {
      order_online_email_functionality: true,
      orderLine_id: Number(this.paramData.pk_orderLineID),
      store_id: Number(this.paramData.store_id)
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderData = res["data"];
      if (this.orderData.length > 0) {
        this.ngFrom = this.orderData[0].FROM_EMAIL;
        this.ngSubject = this.orderData[0].SUBJECT;
      }
      this.contactProofs = res["proof_contacts"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  sendEmailRequest() {
    if (!this.selectedContact && this.ngTo == '') {
      this._smartartService.snackBar('Please choose any email');
      return;
    }
    this.sendEmailLoader = true;
    let email = [];
    if (this.ngTo != '') {
      email.push(this.ngTo);
    } else {
      email.push(this.selectedContact);
    }
    this._changeDetectorRef.markForCheck();
    let payload: sendOrderCustomerEmail = {
      to_email: email,
      from: this.ngFrom,
      subject: this.ngSubject,
      message: this.ngMessage,
      storeName: this.orderData[0].storeName,
      store_id: this.orderData[0].pk_storeID,
      userID: this.orderData[0].pfk_userID,
      storeURL: this.orderData[0].storeURL,
      orderLineID: Number(this.paramData.pk_orderLineID),
      orderID: this.orderData[0].pk_orderID,
      orderLineImprintID: this.orderData[0].pk_imprintID,
      productName: this.orderData[0].productName,
      send_order_customer_email: true
    };
    this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar(res["message"]);
      this.ngFrom = '';
      this.ngMessage = '';
      this.sendEmailLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.sendEmailLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backToList() {
    this.router.navigate(['/smartart/orders-dashboard']);
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
