import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';
import { SmartArtService } from 'app/modules/admin/smartart/components/smartart.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-quotes',
  templateUrl: './quotes.component.html'
})
export class QuotesComponent implements OnInit, OnDestroy {

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
  cartData: any;
  isCartLoader: boolean = false;
  cartItems: any;
  constructor(
    private _customerService: CustomersService,
    private _smartartService: SmartArtService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getQuotes(1);
    this.getSelectedCustomer();
  }
  getSelectedCustomer() {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
      });
  }
  getQuotes(page) {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        let params = {
          user_quotes: true,
          user_id: this.selectedCustomer.pk_userID,
          // bln_quote: 1,
          size: 20,
          page: page
        }
        this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(quotes => {
          quotes["data"].forEach(element => {
            element.items = [];
            if (element.Items) {
              let colss = [];
              let items = element.Items.split(',,');
              items.forEach(item => {
                const [product, colorss, setup, run] = item.split('||');
                let colors = colorss.split('##');
                colors.forEach(color => {
                  let cols = color.split('#');
                  colss.push(`(${cols[0]}) X ${cols[1]} - ${cols[2]}`);
                });
                element.items.push({ product: product, setup: setup, run: run, colors: colss });
              });
            }
          });
          this.dataSource = quotes["data"];
          this.quotesLength = quotes["totalRecords"];
        }, err => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })
      });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getQuotes(this.page);
  };
  viewArtworkDetails(cart) {
    this.isCartLoader = true;
    this.cartData = cart;
    this.isArtworkDetails = true;
    let params = {
      user_quote_lines: true,
      cart_id: cart.pk_cartID
    }
    this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isCartLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      res["data"].forEach(element => {
        element.artworkFiles = [];
        this.checkFileExist(element);
      });
      this.cartItems = res["data"];
      this.getArtworkFiles();
    });
  }



  getArtworkFiles() {
    // let payload = {
    //   files_fetch: true,
    //   path: `/artwork/${this.cartData.storeID}/${this.selectedCustomer.pk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/`
    // }
    // this._changeDetectorRef.markForCheck();
    // this._smartartService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
    //   this.imprintdata.forEach(element => {
    //     files["data"].forEach(file => {
    //       if (file.ID.includes(element.pk_imprintID)) {
    //         element.artworkFiles.push(file);
    //       }
    //     });
    //   });
    //   // this.imprintdata[index].artworkFiles = files["data"];
    //   this._changeDetectorRef.markForCheck();
    // }, err => {
    //   this._changeDetectorRef.markForCheck();
    // });
  }

  checkFileExist(imprint) {
    let params = {
      file_check: true,
      url: `https://assets.consolidus.com/artwork/Proof/Quotes/${this.selectedCustomer.pk_userID}/${imprint.pk_cartID}/${imprint.pk_cartLineID}/${imprint.imprintID}.jpg`
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      imprint.proof = res["isFileExist"];
      this._changeDetectorRef.markForCheck();
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

