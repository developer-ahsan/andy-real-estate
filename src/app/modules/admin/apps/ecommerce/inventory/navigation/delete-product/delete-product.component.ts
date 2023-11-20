import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { InventoryService } from "app/modules/admin/apps/ecommerce/inventory/inventory.service";
import * as CryptoJS from 'crypto-js';
import { DashboardsService } from "app/modules/admin/dashboards/dashboard.service";
import { Router } from "@angular/router";
declare var $: any;

@Component({
  selector: "app-delete-product",
  templateUrl: "./delete-product.component.html",
})
export class RemoveProductComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('deleteProduct') deleteProduct: ElementRef;


  // boolean
  removeLoader = false;
  ngPassword: any = '';

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _commonService: DashboardsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getProductDetail();
  }
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  removeModal() {
    $(this.deleteProduct.nativeElement).modal('show');
  }
  removeProduct(): void {
    const { pk_productID } = this.selectedProduct;
    let userData = JSON.parse(localStorage.getItem('userDetails'));
    let obj = {
      pk_userID: userData.pk_userID,
      password: this.ngPassword
    }
    const secretKey = 'verify_password';
    const objectString = JSON.stringify(obj);
    const encryptedObject = CryptoJS.AES.encrypt(objectString, secretKey).toString();
    const payload = {
      productID: pk_productID,
      payload: encryptedObject,
      delete_product: true
    };
    this.removeLoader = true;
    this._inventoryService.putProductsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.removeLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res) {
        this._commonService.snackBar(res["message"]);
        this.router.navigate(['/apps/ecommerce/inventory']);
      }
      $(this.deleteProduct.nativeElement).modal('hide');
      this._changeDetectorRef.markForCheck();
    })
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
