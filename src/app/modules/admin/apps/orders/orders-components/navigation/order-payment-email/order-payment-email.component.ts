import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyPipe } from '@angular/common';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-order-payment-email',
  templateUrl: './order-payment-email.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OrderPaymentEmailComponent implements OnInit, OnDestroy {
  isLoading: boolean;
  @Input() selectedOrder: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  orderDetail: any;
  sendEmailLoader: boolean = false;

  formData: any = {
    email: '',
    subject: '',
    message: ''
  }

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  emails = [];
  qryOrderLines: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService,
    private currencyPipe: CurrencyPipe,
    private _commonService: DashboardsService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // this.isLoading = true;
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
      this.formData.email = `${this.orderDetail.billingEmail}`
      this.formData.subject = `Payment Request`
    });
    this.getOrderProducts();
  };

  getOrderProducts() {
    this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach((orderLine) => {
        orderLine.stautes = [1, 2, 3, 4];
        this.orderDetail.totalOrderSHCost += orderLine.shippingCost;
        this.orderDetail.totalOrderSHPrice += orderLine.shippingPrice;
        orderLine.imprintsData = [];
        orderLine.colorSizesData = [];
        orderLine.accessoriesData = [];
        this.setImprintsToOrderline(orderLine, res["qryImprintsReport"]);
        this.setColoSizesToOrderline(orderLine, res["qryItemReport"]);
        this.setAccessoriesToOrderline(orderLine, res["qryAccessoriesReport"]);
      });
      this.qryOrderLines = res["data"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Set Imprints
  setImprintsToOrderline(orderLine, imprints) {
    const matchingImprints = imprints.filter(imprint => imprint.fk_orderLineID === orderLine.pk_orderLineID);
    orderLine.imprintsData.push(...matchingImprints);
  }
  // Set Color/Sizes
  setColoSizesToOrderline(orderLine, items) {
    if (items.length) {
      orderLine.warehouseCode = items.warehouseCode;
    }
    const matchingSizes = items.filter(item => item.fk_orderLineID === orderLine.pk_orderLineID);
    orderLine.colorSizesData.push(...matchingSizes);
  }
  // Set Accessories Data
  setAccessoriesToOrderline(orderLine, items) {
    const matchingAccessories = items.filter(item => item.fk_orderLineID === orderLine.pk_orderLineID);
    orderLine.accessoriesData.push(...matchingAccessories);
  }
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.emails.push({ email: value });
    }
    event.chipInput!.clear();
  }

  remove(email): void {
    const index = this.emails.indexOf(email);
    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }
  isEmailValid(email: string): boolean {
    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  sendEmail() {
    if (this.formData.email.trim() === '' || this.formData.subject.trim() === '') {
      this._snackBar.open('Please fill the required fields', '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    if (!this.isEmailValid(this.formData.email)) {
      this._snackBar.open('Email format is not correct', '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    let html_content = this.setEmailData();
    let payload = {
      email: this.formData.email,
      subject: this.formData.subject,
      message: this.formData.message,
      order_id: this.orderDetail.pk_orderID,
      email_html: html_content,
      storeName: this.orderDetail.storeName,
      send_payment_link: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.sendEmailLoader = true;

    this._orderService.orderPostCalls(payload).pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        this._orderService.snackBar(res["message"]);
        this.sendEmailLoader = false;
        this._changeDetectorRef.markForCheck();
      });
  }

  setEmailData() {
    let html = '';
    this.qryOrderLines.forEach(qryOrderLine => {
      html += `<br /><br />
      <h4>(ID: ${qryOrderLine.pk_storeProductID}) <span
            >${qryOrderLine.productName}</span></h4>
    <h5>Quantity: ${qryOrderLine?.quantity}`;
      if (qryOrderLine.blnSample) {
        html += `<span><b> * * * SAMPLE * * *</b></span><br />`;
      } else if (qryOrderLine.blnSample && qryOrderLine.blnWarehouse) {
        html += `<span><b>* * * FULFILLMENT ITEM * * *</b></span><br />`;
      }
      html += `<div style="color: #FF0000; font-weight: bold;">`
      if (qryOrderLine.blnWarehouse) {
        if (qryOrderLine.event) {
          html + `Event: ${qryOrderLine.event}<br />`
        }
        if (qryOrderLine.eventDate) {
          html + `Event Date: ${qryOrderLine.formattedEventDate}<br />`
        }
        if (qryOrderLine.warehouseCode) {
          html + `Warehouse Code: ${qryOrderLine.warehouseCode}<br />`
        }
      }
      html += `</div></h5>
  <br />
  <hr />`
      html += `<table style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; class="p-1 w-full" width="100%">
  <tr height="1">
    <td width="70%"></td>
    <td width="10%"></td>
    <td width="10%"></td>
    <td width="10%"></td>
  </tr>
  <tr>
    <td></td>
    <td align="center">QTY</td>
    <td colspan="2" align="center">PRICE</td>
  </tr>
  <tr>
    <td colspan="2"></td>
    <td align="center">unit</td>
    <td align="center">total</td>
  </tr>
  <!--- ITEM & OPTIONS --->
  <tr>
    <td colspan="6"><i>COLOR/SIZE BREAKDOWN</i></td>
  </tr>
  ${qryOrderLine.colorSizesData.map(item => `
    <tr>
      <td>${item.colorName} ${item.sizeName ? `& ${item.sizeName}` : ''}</td>
      <td align="center">${item.quantity}</td>
      <td align="center">${this.currencyPipe.transform(Number(item.runPrice), 'USD', 'symbol', '1.0-2', 'en-US')}</td>
      <td align="center">${this.currencyPipe.transform(Number(item.runPrice * item.quantity), 'USD', 'symbol', '1.0-2', 'en-US')}</td>
    </tr>
    ${item.setupCost || item.setupPrice ? `
      <tr>
        <td align="right">Color/Size Setup</td>
        <td align="center"></td>
        <td align="center"></td>
        <td align="center">${this.currencyPipe.transform(Number(item.setupPrice), 'USD', 'symbol', '1.0-2', 'en-US')}</td>
      </tr>
    ` : ''}
  `).join('')}
  <!--- IMPRINTS --->
  ${qryOrderLine.imprintsData.length ? `
    <tr>
      <td colspan="4"><br /><i>IMPRINTS</i></td>
    </tr>
    ${qryOrderLine.imprintsData.map(item => `
      <tr>
        <td>${item.locationName} (${item.methodName}) ${item.reorderNumber ? `<br /><span style="color:#FF0000;"><b>Reorder #:&nbsp; ${item.reorderNumber}</b></span>` : ''}</td>
        <td align="center">${item.quantity}</td>
        <td align="center">${this.currencyPipe.transform(Number(item.runPrice), 'USD', 'symbol', '1.0-2', 'en-US')}</td>
      <td align="center">${this.currencyPipe.transform(Number(item.runPrice * item.quantity), 'USD', 'symbol', '1.0-2', 'en-US')}</td>
      </tr>
      <tr>
        <td align="right">${item.blnStitchProcess ? 'Digitization(s)' : 'Setup(s)'}</td>
        <td align="center"></td>
        <td align="center"></td>
        <td align="center">${this.currencyPipe.transform(Number(item.setupPrice), 'USD', 'symbol', '1.0-2', 'en-US')}</td>
      </tr>
      <tr>
        <td align="right">${item.blnColorProcess ? `Total Colors: ${item.processQuantity}` : `Stitch Count: ${item.processQuantity}`} ${item.imprintColors ? `/ Colors: ${item.imprintColors}` : ''}</td>
        <td colspan="3"></td>
      </tr>
    `).join('')}
  ` : ''}
  <!--- ACCESSORIES --->
  ${qryOrderLine.accessoriesData.length ? `
    <tr>
      <td colspan="6"><br /><i>ACCESSORIES</i></td>
    </tr>
    ${qryOrderLine.accessoriesData.map(item => `
      <tr>
        <td>${item.packagingName}</td>
        <td align="center">${item.quantity}</td>
        <td align="center">${this.currencyPipe.transform(Number(item.runPrice), 'USD', 'symbol', '1.0-2', 'en-US')}</td>
      <td align="center">${this.currencyPipe.transform(Number(item.runPrice * item.quantity), 'USD', 'symbol', '1.0-2', 'en-US')}</td>
      </tr>
      </tr>
      ${item.setupCost || item.setupPrice ? `
        <tr>
          <td align="right">Accessory Setup</td>
          <td align="center"></td>
          <td align="center"></td>
        <td align="center">${this.currencyPipe.transform(Number(item.setupPrice), 'USD', 'symbol', '1.0-2', 'en-US')}</td>
        </tr>
      ` : ''}
    `).join('')}
  ` : ''}
  <!--- SHIPPING --->
  <tr height="10">
    <td colspan="4"></td>
  </tr>
  <tr>
    <td><i>SHIPPING & HANDLING</i></td>
    <td align="center"></td>
    <td align="center"></td>
    <td align="center">${this.currencyPipe.transform(Number(qryOrderLine.shippingPrice), 'USD', 'symbol', '1.0-2', 'en-US')}</td>
  </tr>
  ${this.orderDetail.blnRoyaltyStore ? `
    <tr height="10">
      <td colspan="6"></td>
    </tr>
    <tr>
      <td><i>${this.orderDetail.royaltyName}</i></td>
      <td align="center"></td>
      <td align="center"></td>
      <td align="center">${this.currencyPipe.transform(Number(qryOrderLine.royaltyPrice), 'USD', 'symbol', '1.0-2', 'en-US')}</td>
    </tr>
  ` : ''}
  <!--- SUB-TOTAL --->
  <tr>
    <td><i>MERCHANDISE SUB-TOTAL</i></td>
    <td align="center"></td>
    <td align="center"></td>
    <td align="center"><b>${this.currencyPipe.transform(Number(qryOrderLine?.getOrderLineTotalsPrice + qryOrderLine.royaltyPrice), 'USD', 'symbol', '1.0-2', 'en-US')}</b></td>
  </tr>
</table>
`
    });
    html += `<hr class="my-2">
    <table class="p-1 w-full" width="100%">
      <tr height="1">
        <td width="70%"></td>
        <td width="10%"></td>
        <td width="10%"></td>
        <td width="10%"></td>
      </tr>
      <tr>
        <td>TOTAL MERCHANDISE</td>
        <td align="center"></td>
        <td align="center"></td>
        <td align="center">
          <b>${this.currencyPipe.transform(Number(this.orderDetail?.blnRoyaltyStore
      ? this.orderDetail?.orderPrice + this.orderDetail?.royalties
      : this.orderDetail?.orderPrice), 'USD', 'symbol', '1.0-2', 'en-US')} 
          </b>
        </td>
      </tr>
      <tr>
        <td>TOTAL <span>${this.orderDetail.discount < 0 ? 'ADJUSTMENT' : 'DISCOUNT'}</span></td>
        <td align="center"></td>
        <td align="center"></td>
        <td align="center">
          <b>${this.currencyPipe.transform(Number(this.orderDetail.discount), 'USD', 'symbol', '1.0-2', 'en-US')}</b>
        </td>
      </tr>
      ${this.orderDetail.cashbackDiscount ? `
        <tr>
          <td>CASH BACK DISCOUNT</td>
          <td align="center"></td>
          <td align="center"></td>
          <td align="center">
            <b>${this.currencyPipe.transform(Number(this.orderDetail.cashbackDiscount), 'USD', 'symbol', '1.0-2', 'en-US')}</b>
          </td>
        </tr>
      ` : ''}
      <tr>
        <td>TOTAL TAX</td>
        <td align="center"></td>
        <td align="center"></td>
        <td align="center">
          <b>${this.currencyPipe.transform(Number(this.orderDetail.orderTax), 'USD', 'symbol', '1.0-2', 'en-US')}</b>
        </td>
      </tr>
      ${this.orderDetail.qryOrderAdjustments ? `
        <tr>
          <td>ADJUSTMENTS</td>
          <td align="center"></td>
          <td align="center"></td>
          <td align="center"></td>
        </tr>
        ${this.orderDetail.qryOrderAdjustments ? this.orderDetail.adjustmentsData.map(item => `
          <tr>
            <td align="right">${item.description}</td>
            <td align="center"></td>
            <td align="center"></td>
            <td align="center">
              <b>${this.currencyPipe.transform(Number(item.price), 'USD', 'symbol', '1.0-2', 'en-US')} </b>
            </td>
          </tr>
        `).join('') : ''}
      ` : ''}
    </table>
    <hr class="my-2">
    <table class="p-1" width="100%">
      <tr height="1">
        <td width="70%"></td>
        <td width="10%"></td>
        <td width="10%"></td>
        <td width="10%"></td>
      </tr>
      <tr>
        <td><b>GRAND TOTAL</b></td>
        <td></td>
        <td></td>
        <td align="center">
          <b>${this.currencyPipe.transform(Number(this.orderDetail?.blnRoyaltyStore
        ? this.orderDetail?.orderTotal
        : this.orderDetail?.orderPrice + this.orderDetail?.orderTax), 'USD', 'symbol', '1.0-2', 'en-US')}
          </b>
        </td>
      </tr>
      <tr style="color:#FF0000;">
        <td><b>BALANCE DUE</b></td>
        <td></td>
        <td></td>
        <td align="center">
          <b> ${this.currencyPipe.transform(Number(this.orderDetail.orderTotal - this.orderDetail?.currentTotal), 'USD', 'symbol', '1.0-2', 'en-US')}</b>
        </td>
      </tr>
    </table>
    </div>
    `;
    return html;
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
