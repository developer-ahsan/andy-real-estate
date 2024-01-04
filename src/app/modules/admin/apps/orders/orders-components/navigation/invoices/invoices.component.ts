import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { takeUntil } from 'rxjs/operators';
import { OrdersList } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html'
})
export class InvoicesComponent implements OnInit {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  // selectedOrder: OrdersList = null;
  orderDetail: any;
  managerDetails: any;
  qryOrderLines: any;
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
    })
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
    const file_name = `OrderReport_${pk_orderID}.pdf`;
    html2canvas(data, { useCORS: true }).then(canvas => {
      canvas.getContext('2d');
      var imgData = canvas.toDataURL("image/jpeg", 1.0);
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