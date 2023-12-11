import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';
import { SmartArtService } from 'app/modules/admin/smartart/components/smartart.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-saved-carts-detail',
  templateUrl: './saved-carts-detail.component.html'
})
export class SavedCartsDetailComponent implements OnInit, OnDestroy {

  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['id', 'created', 'modified', 'ihd', 'items', 'store', 'total', 'action'];
  dataSource = [];
  quotesLength = 0;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  page = 1;
  isArtworkDetails: boolean = false;
  cartData: any = [];
  isCartLoader: boolean = false;
  cartItems: any;
  cardId:any;
  storeName:any;
  dateCreated
  constructor(
    private _customerService: CustomersService,
    private _smartartService: SmartArtService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _commonService: DashboardsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getSelectedCustomer();
    const currentRouteSnapshot = this.route.snapshot;
    this.cardId = currentRouteSnapshot.paramMap.get('cartId');
    this.storeName = currentRouteSnapshot.paramMap.get('name');

    this.dateCreated = currentRouteSnapshot.paramMap.get('date');

    this.viewArtworkDetails();
  }
  getSelectedCustomer() {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
      });
  }
  
  viewArtworkDetails() {
    this.isCartLoader = true;
    this.isArtworkDetails = true;
    let params = {
      user_quote_lines: true,
      cart_id: this.cardId
    }
    this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isCartLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      res["data"].forEach(element => {
        element.artworkFiles = [];
        this.checkFileExist(element);
      });
      this.cartData = res["data"];
    });
  }


  checkFileExist(imprint) {
    let params = {
      file_check: true,
      url: `https://assets.consolidus.com/artwork/Proof/Quotes/${this.selectedCustomer.pk_userID}/${imprint.pk_cartID}/${imprint.pk_cartLineID}/${imprint.imprintID}.jpg`
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      imprint.proof = res["isFileExist"];
    })
  }
  updateCartItems(imprint) {
    imprint.updateLoader = true;
    let payload = {
      customerArtworkComment: imprint.customerArtworkComment,
      cartLineID: imprint.pk_cartLineID,
      updateCartLine_artwork: true
    }
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this._customerService.PutApiData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      imprint.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res) {
        this._customerService.snackBar(res["message"]);
      }
    })
  }
  removeCart(cart) {
    cart.removeLoader = true;
    let payload = {
      userID: this.selectedCustomer.pk_userID,
      cartID: cart.pk_cartID,
      remove_store_user_quote: true
    }
    this._customerService.PutApiData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {

      cart.removeLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res) {
        this.dataSource = this.dataSource.filter(item => item.pk_cartID != cart.pk_cartID);
        this.quotesLength--;
        this._customerService.snackBar(res["message"]);
      }
    })
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}

