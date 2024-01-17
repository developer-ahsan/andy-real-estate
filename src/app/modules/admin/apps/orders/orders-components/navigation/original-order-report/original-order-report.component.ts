import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersList } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
interface Transaction {
  item: string;
  cost: number;
}

@Component({
  selector: 'app-original-order-report',
  templateUrl: './original-order-report.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OriginalOrderComponent implements OnInit {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  // selectedOrder: OrdersList = null;
  orderDetail: any;
  managerDetails: any;
  qryOrderLines: any;
  // Totals
  orderTotalPrice = 0;
  orderTotalCost = 0;
  groupOrderOptions: any;
  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length) {
        this.orderDetail = res["data"][0];
        this.setOrderData();
        this.getOrderProducts();
      }
    });

  }
  setOrderData() {
    if (!this.orderDetail.fk_groupOrderID) {
      this.orderTotalCost = this.orderDetail.orderCost;
      this.orderTotalPrice = this.orderDetail.orderTotal;
    } else {
      this.orderTotalPrice = this.orderDetail.orderPrice;
      // this.getGroupOrderOptions();
    }
    this.managerDetails = this.orderDetail.managerDetails?.split('::');
    if (this.orderDetail.qryUserLocations) {
      this.orderDetail.locationName = this.orderDetail.qryUserLocations?.split('::')[1];
      this.orderDetail.attributeName = this.orderDetail.qryUserLocations?.split('::')[3];
    }
    if (this.orderDetail.qryRoyalty) {
      const [id, name, state, percentage] = this.orderDetail.qryRoyalty?.split('::')[1];
      this.orderDetail.royaltyData = { name, state, percentage: Number(percentage) * 100 };
    }
    if (this.orderDetail.qryOrderAdjustments) {
      this.orderDetail.adjustmentsData = [];
      const adjustments = this.orderDetail.qryOrderAdjustments.split(',,');
      adjustments.forEach(adjustment => {
        const [pk_adjustmentID, cost, price, description, author, dateCreated] = adjustment.split('::');
        this.orderDetail.adjustmentsData.push({ pk_adjustmentID, cost: Number(cost), price: Number(price), description, author, dateCreated });
      });
    }
  }
  getOrderProducts() {
    this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach((orderLine) => {
        orderLine.imprintsData = [];
        orderLine.colorSizesData = [];
        orderLine.accessoriesData = [];
        this.setImprintsToOrderline(orderLine, res["qryImprintsReport"]);
        this.setAccessoriesToOrderline(orderLine, res["qryAccessoriesReport"]);
        this.setColoSizesToOrderline(orderLine, res["qryItemReport"]);
        if (this.orderDetail.fk_groupOrderID) {
          this.orderTotalCost += orderLine.getOrderLineTotalsCost;
          // this.orderTotalPrice += orderLine.royaltyPrice;
          // this.setColoSizesToOrderlineGroup(orderLine, res["qryItemReport"]);
        } else {
        }
      });
      this.qryOrderLines = res["data"];
      if (this.orderDetail.fk_groupOrderID) {
        this.orderTotalPrice += this.orderDetail.orderTax;
        // this.setColoSizesToOrderlineGroup(orderLine, res["qryItemReport"]);
      }
      console.log(this.qryOrderLines);
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
  // Set Group Order Color/Sizes
  setColoSizesToOrderlineGroup(orderLine, items) {
    if (this.groupOrderOptions) {
      if (this.groupOrderOptions.length) {
        orderLine.warehouseCode = items.warehouseCode;
      }
      const matchingSizes = this.groupOrderOptions.filter(item => item.fk_orderLineID === orderLine.pk_orderLineID);
      orderLine.colorSizesData.push(...matchingSizes);
    }
  }
  // Set Accessories Data
  setAccessoriesToOrderline(orderLine, items) {
    const matchingAccessories = items.filter(item => item.fk_orderLineID === orderLine.pk_orderLineID);
    orderLine.accessoriesData.push(...matchingAccessories);
  }
  getGroupOrderOptions() {
    this._orderService.groupOrderOptions$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.groupOrderOptions = res["data"];
        this.getOrderProducts();
      }
    });
  }
}
