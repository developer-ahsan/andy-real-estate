import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { createPurchaseOrder } from '../../../order-manage.types';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VendorsService } from 'app/modules/admin/apps/vendors/components/vendors.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { OrderManageService } from '../../../order-manage.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-create-po',
  templateUrl: './create-po.component.html'
})
export class CreatePoComponent implements OnInit {

  @Input() orderData: any;
  @Input() poData: any;
  @Input() allVendors: any;
  @Output() dataEvent = new EventEmitter<string>();

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  createPOForm: FormGroup;
  isCreateOrder: boolean = false;
  constructor(
    private _vendorService: VendorsService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderManage: OrderManageService,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.createPOForm = new FormGroup({
      companyName: new FormControl('', Validators.required),
      vendorShippingAddress1: new FormControl({ value: 'vendorShippingAddress1', disabled: true }, Validators.required),
      vendorShippingAddress2: new FormControl({ value: 'vendorShippingAddress2', disabled: true }, Validators.required),
      vendorShippingCity: new FormControl({ value: 'Vendor City', disabled: true }, Validators.required),
      vendorShippingState: new FormControl({ value: 'AL', disabled: true }, Validators.required),
      vendorShippingZip: new FormControl({ value: 'Vendor Zip', disabled: true }, Validators.required),
      vendorShippingEmail: new FormControl('', Validators.required),
      vendorShippingPhone: new FormControl({ value: 'Vendor Phone', disabled: true }, Validators.required),
      vendorShippingComment: new FormControl(''),
      shipToCompanyName: new FormControl('', Validators.required),
      shipToCustomerName: new FormControl('', Validators.required),
      shipToLocation: new FormControl(''),
      shipToPurchaseOrder: new FormControl(''),
      shipToAddress: new FormControl('', Validators.required),
      shipToCity: new FormControl('', Validators.required),
      shipToState: new FormControl('AL', Validators.required),
      shipToZip: new FormControl('', Validators.required),
      shipToCountry: new FormControl(''),
      shipToDeliverTo: new FormControl(''),
      productName: new FormControl('', Validators.required),
      quantity: new FormControl('', Validators.required),
      blnSupplier: new FormControl(false, Validators.required),
      blnDecorator: new FormControl(false, Validators.required)
    })
    this.createPOForm.patchValue({
      shipToCompanyName: this.poData.shipToCompanyName,
      shipToCustomerName: this.poData.shipToCustomerName,
      shipToLocation: this.poData.shipToLocation,
      shipToPurchaseOrder: this.poData.shipToPurchaseOrder,
      shipToAddress: this.poData.shipToAddress,
      shipToCity: this.poData.shipToCity,
      shipToState: this.poData.shipToState,
      shipToZip: this.poData.shipToZip,
      shipToCountry: this.poData.shipToCountry,
      shipToDeliverTo: this.poData.shipToDeliverTo,
    })
  }
  getVendorsData(id) {
    this._vendorService.getVendorsSupplierById(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      const vendor = res["data"][0];
      this.createPOForm.patchValue({
        vendorShippingAddress1: vendor.address,
        // vendorShippingAddress2: new FormControl('vendorShippingAddress2', Validators.required),
        vendorShippingCity: vendor.city,
        vendorShippingState: vendor.state,
        vendorShippingZip: vendor.zipCode,
        vendorShippingEmail: vendor.ordersEmail,
        vendorShippingPhone: vendor.phone,
        vendorShippingComment: vendor.shippingComment,
      })
    })
  }
  CreatePurchaseOrder() {
    const { vendorShippingAddress1, vendorShippingAddress2, vendorShippingCity, vendorShippingState, vendorShippingZip, vendorShippingPhone, shipToCompanyName, shipToCustomerName, shipToLocation, shipToPurchaseOrder, shipToAddress, shipToCity, shipToState, shipToZip, shipToCountry, shipToDeliverTo, vendorShippingEmail, vendorShippingComment, companyName, productName, quantity, blnSupplier, blnDecorator } = this.createPOForm.getRawValue();
    const { pk_orderLinePOID } = this.poData;
    const { fk_orderID } = this.orderData;
    if (!vendorShippingEmail.trim() || !shipToCompanyName.trim() || !shipToAddress.trim() || !shipToCity.trim() || !shipToZip.trim() || !shipToCountry.trim() || !productName.trim()) {
      this._orderManage.snackBar('Please fill out the required fields');
      return;
    }
    if (quantity < 0) {
      this._orderManage.snackBar('Quantity should be greater than 0');
      return;
    }
    let payload: createPurchaseOrder = {
      vendorPOID: pk_orderLinePOID,
      companyName: companyName,
      vendorShippingAddress1: vendorShippingAddress1,
      vendorShippingAddress2: vendorShippingAddress2,
      vendorShippingCity: vendorShippingCity,
      vendorShippingState: vendorShippingState,
      vendorShippingZip: vendorShippingZip,
      shippingComment: vendorShippingComment,
      vendorShippingPhone: vendorShippingPhone,
      vendorShippingEmail: vendorShippingEmail,
      shipToCompanyName: shipToCompanyName,
      shipToCustomerName: shipToCustomerName,
      shipToLocation: shipToLocation,
      shipToPurchaseOrder: shipToPurchaseOrder,
      shipToAddress: shipToAddress,
      shipToCity: shipToCity,
      shipToState: shipToState,
      shipToZip: shipToZip,
      shipToCountry: shipToCountry,
      shipToDeliverTo: shipToDeliverTo,
      productName: productName,
      quantity: quantity,
      blnSupplier: blnSupplier,
      blnDecorator: blnDecorator,
      orderID: fk_orderID,
      create_purchase_order: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isCreateOrder = true;
    this._orderManage.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isCreateOrder = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._orderManage.snackBar(res["message"]);
      this.sendDataToParent();
    });
  }
  sendDataToParent() {
    const data = 'Po Created';
    const d = JSON.stringify(data)
    this.dataEvent.emit(d);
  }
}
