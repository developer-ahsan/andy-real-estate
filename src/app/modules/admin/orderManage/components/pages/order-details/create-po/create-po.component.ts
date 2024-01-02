import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { createPurchaseOrder } from '../../../order-manage.types';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VendorsService } from 'app/modules/admin/apps/vendors/components/vendors.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { OrderManageService } from '../../../order-manage.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { NavigationExtras, Router } from '@angular/router';

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
  selectedVendorID = 0;
  allStates = [];
  constructor(
    private _vendorService: VendorsService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderManage: OrderManageService,
    private _commonService: DashboardsService,
    private router: Router
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
      shipToCompanyName: this.orderData.shippingCompanyName,
      shipToCustomerName: this.orderData.shippingFirstName + ' ' + this.orderData.shippingLastName,
      shipToLocation: this.orderData.shippingLocation,
      shipToPurchaseOrder: this.orderData.purchaseOrderNum,
      shipToAddress: this.orderData.shippingAddress,
      shipToCity: this.orderData.shippingCity,
      shipToState: this.orderData.shippingState,
      shipToZip: this.orderData.shippingZip,
      shipToCountry: this.orderData.shippingCountry,
      shipToDeliverTo: this.orderData.shipToDeliverTo,
    });
    this.getVendorsDataLocal();
  }
  getVendorsDataLocal() {
    this._commonService.suppliersData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      // this.allVendors = res["data"];
      const activeSuppliers = res["data"].filter(element => element.blnActiveVendor);
      this.allVendors.push(...activeSuppliers);
    });
    const storedValue = JSON.parse(sessionStorage.getItem('storeStateSupplierData'));
    this.allStates = this.splitData(storedValue.data[2][0].states);
  }
  splitData(data) {
    const dataArray = data.split(",,");
    const result = [];

    dataArray.forEach(item => {
      const [id, state, name, index] = item.split("::");
      result.push({ id: parseInt(id), state, name, index: parseInt(index) });
    });

    return result;
  }
  getVendorsData(id) {
    this.selectedVendorID = id;
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
      this.createPOForm.patchValue({
        vendorShippingEmail: vendor.additionalOrderEmails
          ? `${this.createPOForm.get('vendorShippingEmail').value},${vendor.additionalOrderEmails}`
          : this.createPOForm.get('vendorShippingEmail').value,
      });

    })
  }
  CreatePurchaseOrder() {
    const { vendorShippingAddress1, vendorShippingAddress2, vendorShippingCity, vendorShippingState, vendorShippingZip, vendorShippingPhone, shipToCompanyName, shipToCustomerName, shipToLocation, shipToPurchaseOrder, shipToAddress, shipToCity, shipToState, shipToZip, shipToCountry, shipToDeliverTo, vendorShippingEmail, vendorShippingComment, companyName, productName, quantity, blnSupplier, blnDecorator } = this.createPOForm.getRawValue();
    const { pk_orderLinePOID, fk_orderID } = this.poData;
    const { pk_orderID } = this.orderData;
    if (!vendorShippingEmail.trim() || !shipToCompanyName.trim() || !shipToAddress.trim() || !shipToCity.trim() || !shipToZip.trim() || !shipToCountry.trim() || !productName.trim()) {
      this._orderManage.snackBar('Please fill out the required fields');
      return;
    }
    if (quantity < 0) {
      this._orderManage.snackBar('Quantity should be greater than 0');
      return;
    }
    let payload: createPurchaseOrder = {
      vendorPOID: this.selectedVendorID,
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
      orderID: pk_orderID,
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
      this.sendDataToParent(res["newID"]);
    });
  }
  sendDataToParent(newID) {
    const data = 'Po Created';
    const d = JSON.stringify(data)
    this.dataEvent.emit(d);
    this.redirectToPO(newID);
  }
  redirectToPO(newID) {
    const queryParams: NavigationExtras = {
      queryParams: { fk_orderID: this.orderData.pk_orderID, pk_orderLineID: 0, pk_orderLinePOID: newID }
    };
    this.router.navigate(['/ordermanage/order-details'], queryParams);
  }
  enforceMaxDigits(event: any, length): void {
    const maxDigits = length;
    const inputValue = event.target.value.toString();

    if (inputValue.length > maxDigits) {
      event.target.value = +inputValue.slice(0, maxDigits);
      event.preventDefault();
    }
  }
}
