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
        this.getOrderProducts();
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
        this.orderDetail.totalOrderSHCost += orderLine.shippingCost;
        this.orderDetail.totalOrderSHPrice += orderLine.shippingPrice;
        orderLine.imprintsData = [];
        orderLine.colorSizesData = [];
        orderLine.accessoriesData = [];
        this.setImprintsToOrderline(orderLine, res["qryImprintsReport"]);
        this.setColoSizesToOrderline(orderLine, res["qryItemReport"]);
        this.setAccessoriesToOrderline(orderLine, res["qryAccessoriesReport"]);
        if (this.orderDetail.fk_groupOrderID) {
          this.setGroupOrderTotals(orderLine);
        }
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

  // Set Group Order Totals  
  setGroupOrderTotals(orderLine) {
    console.log(orderLine)
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
