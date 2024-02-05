import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Subject } from 'rxjs';
import { OrdersService } from '../../orders.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-orders-shipping-reports',
  templateUrl: './orders-shipping-reports.component.html'
})
export class OrdersShippingReportsComponent implements OnInit {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  // selectedOrder: OrdersList = null;
  orderDetail: any;
  managerDetails: any;
  qryOrderLines: any;

  groupOrderTotals: any;
  // Group Order
  groupOrderDetails: any;
  orderParticipants: any;
  ngSelectedParticipant: any;
  groupOrderOptions: any;
  shippingData: any;
  qryInitiatorOptions: any;
  isGroupLoader: boolean = false;
  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length) {
        this.orderDetail = res["data"][0];
        if (this.orderDetail.fk_groupOrderID) {
          this.initialize();
        }
        this.setOrderData();
        if (this.orderDetail.fk_groupOrderID) {
          this.getGroupOrderDetails();
        } else {
          this.getOrderProducts();
        }
      }
    })
  }
  initialize() {
    this.groupOrderTotals = {
      cost: 0,
      price: 0,
      tax: 0,
      royalties: 0,
      shippingCost: 0,
      shippingPrice: 0,
      subtractiveCost: 0,
      subtractivePrice: 0,
      margin: 0.00
    }
  }
  setOrderData() {
    this.orderDetail.totalOrderSHCost = 0;
    this.orderDetail.totalOrderSHPrice = 0;
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
        orderLine.stautes = [1, 2, 3, 4];
        orderLine.imprintsData = [];
        orderLine.colorSizesData = [];
        orderLine.accessoriesData = [];
        if (this.orderDetail.fk_groupOrderID) {
          this.setColoSizesToOrderlineGroup(orderLine, res["qryItemReport"]);
          this.setShippingDataToOrderLine(orderLine);
          this.setIntiatorOptions(orderLine);
        } else {
          this.orderDetail.totalOrderSHCost += orderLine.shippingCost;
          this.orderDetail.totalOrderSHPrice += orderLine.shippingPrice;
          this.setColoSizesToOrderline(orderLine, res["qryItemReport"]);
        }
        this.setImprintsToOrderline(orderLine, res["qryImprintsReport"]);
        this.setAccessoriesToOrderline(orderLine, res["qryAccessoriesReport"]);
      });
      this.qryOrderLines = res["data"];
      if (this.orderDetail.fk_groupOrderID) {
        this.setOrderTotals();
      }
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

  // Set Group Order Color/Sizes
  setColoSizesToOrderlineGroup(orderLine, items) {
    if (this.groupOrderOptions) {
      if (this.groupOrderOptions.length) {
        orderLine.warehouseCode = items.warehouseCode;
      }
      const matchingSizes = this.groupOrderOptions.filter(item => item.fk_orderLineID === orderLine.pk_orderLineID);
      orderLine.colorSizesData.push(...matchingSizes);
      orderLine.sumOfQuantity = orderLine.colorSizesData.reduce((sum, item) => sum + item.quantity, 0);
    }
  }
  setShippingDataToOrderLine(orderLine) {
    let shippingData = [];
    orderLine.shippingData = [];
    orderLine.TotalShippingCost = 0;
    orderLine.TotalShippingPrice = 0;
    const matchingShippings = this.shippingData.filter(item => item.fk_orderLineID === orderLine.pk_orderLineID);
    orderLine.shippingData.push(...matchingShippings);
    orderLine.shippingData.forEach(shipping => {
      orderLine.TotalShippingCost = shipping.shippingCost;
      orderLine.TotalShippingPrice = shipping.shippingPrice;
    });
  }
  setIntiatorOptions(orderLine) {
    orderLine.sumOfInitiatorQuantity = 0;
    let initiatorData = [];
    const matchingInitators = this.qryInitiatorOptions.filter(item => item.fk_orderLineID === orderLine.pk_orderLineID);
    initiatorData.push(...matchingInitators);
    orderLine.sumOfInitiatorQuantity = initiatorData.reduce((sum, item) => sum + item.quantity, 0);
  }
  // Calculate Totals
  setOrderTotals() {
    this.qryOrderLines.forEach(orderLine => {
      // Add shipping Values
      if (orderLine.colorSizesData.length && orderLine.sumOfQuantity > 0) {
        if (orderLine.shippingData.length) {
          orderLine.orderLineTotalShippingCost = orderLine.TotalShippingCost + orderLine.shippingCost;
          orderLine.orderLineTotalShippingPrice = orderLine.TotalShippingPrice + orderLine.shippingPrice;
          if (!this.groupOrderDetails.blnShipToOneLocation && this.groupOrderDetails.blnDropShipCharges) {
            orderLine.orderLineTotalShippingPrice += 5 * orderLine.qryOrderLineParticipantsCount;
          }
        } else {
          orderLine.orderLineTotalShippingCost = orderLine.shippingCost;
          orderLine.orderLineTotalShippingPrice = orderLine.shippingPrice;
          if (!this.groupOrderDetails.blnShipToOneLocation && this.groupOrderDetails.blnDropShipCharges) {
            orderLine.orderLineTotalShippingPrice += 5 * orderLine.qryOrderLineParticipantsCount;
          }
        }
        if (orderLine.sumOfInitiatorQuantity > 0) {
          // missing
          if (this.groupOrderDetails.blnDropShipCharges) {
            orderLine.orderLineTotalShippingPrice += 5
          }
        }
        this.orderDetail.totalOrderSHCost += orderLine.orderLineTotalShippingCost;
        this.orderDetail.totalOrderSHPrice += orderLine.orderLineTotalShippingPrice;
      }


    });
    this._changeDetectorRef.markForCheck();
  }
  // Group Order
  getGroupOrderDetails() {
    this._orderService.groupOrderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.groupOrderDetails = res["data"][0];
        this.getGroupOrderOptions();
        if (!this.groupOrderDetails.blnInitiatorPays) {
          this.getOrderParticapants();
        } else {
          this.isGroupLoader = false;
          this._changeDetectorRef.markForCheck();
        }
      }
    });
  }
  getOrderParticapants() {
    this._orderService.groupOrderParticipants$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.orderParticipants = res["data"];
        this.isGroupLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  getGroupOrderOptions() {
    this._orderService.groupOrderOptions$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.groupOrderOptions = res["data"];
        this.shippingData = res["strOrderLineShipping"];
        this.qryInitiatorOptions = res["qryInitiator"];
        this.getOrderProducts();
      }
    });
  }
  public exportHtmlToPDF() {
    let element = document.getElementById('htmltable');
    var positionInfo = element.getBoundingClientRect();
    var height = positionInfo.height;
    var width = positionInfo.width;
    var top_left_margin = 15;
    let PDF_Width = width + (top_left_margin * 2);
    var PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);
    var canvas_image_width = width;
    var canvas_image_height = height;

    var totalPDFPages = Math.ceil(height / PDF_Height) - 1;
    const { pk_orderID } = this.orderDetail;
    let data = document.getElementById('htmltable');
    const file_name = `ShippingReport_${pk_orderID}.pdf`;

    // Adjust html2canvas options for better quality and capturing the entire content
    html2canvas(data, { useCORS: true, scale: 2, logging: false, scrollY: -window.scrollY }).then(canvas => {
      var imgData = canvas.toDataURL("image/jpeg", 0.7); // Adjust quality here (0.7 is just an example)

      var pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);
      pdf.addImage(imgData, 'jpeg', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);

      for (var i = 1; i <= totalPDFPages; i++) {
        pdf.addPage([PDF_Width, PDF_Height]);
        pdf.addImage(imgData, 'jpeg', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height);
      }

      pdf.save(file_name);
    });

  }

}
