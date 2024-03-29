import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';

@Component({
  selector: 'app-original-order-report',
  templateUrl: './original-order-report.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OriginalOrderComponent implements OnInit, OnDestroy {
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  selectedOrder: any;
  // url: any = null;
  url: string = '';
  urlSafe: SafeResourceUrl;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.getOrderDetail();
  };
  getOrderDetail() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        if (res["data"].length) {
          this.selectedOrder = res["data"][0];
          this.url = `https://assets.consolidus.com/globalAssets/Orders/originalOrderReport/${this.selectedOrder.pk_orderID}.html`;
          this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
          setTimeout(() => {
            this.isLoading = true;
            this.isLoadingChange.emit(false);
          }, 100);
        }
      }
    })
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
