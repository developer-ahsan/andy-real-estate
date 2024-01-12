import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { Subject } from 'rxjs';
import { OrderManageService } from 'app/modules/admin/orderManage/components/order-manage.service';

@Component({
  selector: 'app-cost-analysis',
  templateUrl: './cost-analysis.component.html'
})
export class CostAnalysisComponent implements OnInit {
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  isLoading: boolean = false;
  selectedOrder: any;

  orderParticipants = [];
  orderDetail: any;
  orderProducts = [];

  grandTotalCost = 0;
  grandTotalPrice = 0;
  not_available = 'N/A';

  orderTotal: any;


  qryOrderLines: any;
  managerDetails: any;
  qryPOS: any;
  purchaseOrderTotal = 0;
  mainScreen = 'PROJECTED';
  constructor(
    private _orderService: OrdersService,
    private _orderManageService: OrderManageService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.orderDetail = res["data"][0];
        res["qryPO"].sort((a, b) => {
          return a.fk_orderLineID - b.fk_orderLineID;
        });
        res["qryPO"].forEach(po => {
          this.purchaseOrderTotal += po.POTotal;
        });
        this.qryPOS = res["qryPO"];
        console.log(this.qryPOS);
        this.setOrderData();
        this.getOrderProducts();
        // let params = {
        //   order_total: true,
        //   order_id: this.orderDetail.pk_orderID
        // }
        // this._orderService.getOrder(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        //   this.orderTotal = res["data"][0];
        // })
      }
    })

    // this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    //   let value = [];
    //   res["data"].forEach((element, index) => {
    //     value.push(element.pk_orderLineID);
    //     if (index == res["data"].length - 1) {
    //       this.getLineProducts(value.toString());
    //     }
    //   });
    //   // this.orderProducts = res["data"];
    // })
  }
  setOrderData() {
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
        this.setColoSizesToOrderline(orderLine, res["qryItemReport"]);
        this.setAccessoriesToOrderline(orderLine, res["qryAccessoriesReport"]);
      });
      this.qryOrderLines = res["data"];
      console.log(this.qryOrderLines)
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
  // Get Actual PO Detail
  getPoDetails(qryPO) {
    if (!qryPO.Details) {
      let params = {
        order_manage_imprint_details: true,
        orderLine_id: qryPO.fk_orderLineID,
        orderLine_POID: qryPO.pk_orderLinePOID,
        blnSupplier: qryPO.blnSupplier,
        blnDecorator: qryPO.blnDecorator,
        blnDuplicated: qryPO.blnDuplicated,
      }
      qryPO.isDetailLoader = true;
      this._orderManageService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this._changeDetectorRef.markForCheck();
        qryPO.Details = res;
        qryPO.isDetailLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        qryPO.isDetailLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    }
  }

}
