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

  // Group Orders
  groupOrderDetails: any;
  groupOrderOptions: any;
  shippingData: any;
  qryInitiatorOptions: any;
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
        if (!this.orderDetail.fk_groupOrderID) {
          res["qryPO"].sort((a, b) => {
            return a.fk_orderLineID - b.fk_orderLineID;
          });
          res["qryPO"].forEach(po => {
            this.purchaseOrderTotal += po.POTotal;
          });
          this.qryPOS = res["qryPO"];
        }
        this.setOrderData();
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
    if (!this.orderDetail.fk_groupOrderID) {
      this.getOrderProducts();
    } else {
      this.getGroupOrderDetails();
    }
  }
  getOrderProducts() {
    this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach((orderLine, index) => {
        orderLine.imprintsData = [];
        orderLine.colorSizesData = [];
        orderLine.accessoriesData = [];
        this.setImprintsToOrderline(orderLine, res["qryImprintsReport"]);
        this.setAccessoriesToOrderline(orderLine, res["qryAccessoriesReport"]);
        if (this.orderDetail.fk_groupOrderID) {
          this.setColoSizesToOrderlineGroup(orderLine, res["qryItemReport"]);
          this.setShippingDataToOrderLine(orderLine);
        } else {
          this.setColoSizesToOrderline(orderLine, res["qryItemReport"]);
        }
      });
      this.qryOrderLines = res["data"];
      if (this.orderDetail.fk_groupOrderID) {
        this.setOrderTotals();
      }
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
  // Set Group Order Color/Sizes
  setColoSizesToOrderlineGroup(orderLine, items) {
    if (this.groupOrderOptions) {
      if (this.groupOrderOptions.length) {
        orderLine.warehouseCode = items.warehouseCode;
      }
      const matchingSizes = this.groupOrderOptions.filter(item => item.fk_orderLineID === orderLine.pk_orderLineID);
      orderLine.colorSizesData.push(...matchingSizes);
      console.log(orderLine.colorSizesData);
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
    shippingData.forEach(shipping => {
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
      orderLine.orderLineTotalCost = 0;
      orderLine.orderLineTotalPrice = 0;
      orderLine.orderLineTotalShippingCost = 0;
      orderLine.orderLineTotalShippingPrice = 0;

      orderLine.colorSizesData.forEach(color => {
        orderLine.orderLineTotalCost += ((color.baseCost + color.runCost) * color.quantity) + color.setupCost;
        orderLine.orderLineTotalPrice += ((color.basePrice + color.runPrice) * color.quantity) + color.setupPrice;
      });

      orderLine.imprintsData.forEach(imprint => {
        orderLine.orderLineTotalCost += (imprint.runCost * orderLine.sumOfQuantity) + imprint.setupCost;
        orderLine.orderLineTotalPrice += (imprint.runPrice * orderLine.sumOfQuantity) + imprint.setupPrice;
      });

      orderLine.accessoriesData.forEach(accessory => {
        orderLine.orderLineTotalCost += (accessory.runCost * orderLine.sumOfQuantity) + accessory.setupCost;
        orderLine.orderLineTotalPrice += (accessory.runPrice * orderLine.sumOfQuantity) + accessory.setupPrice;
      });

      if (this.orderDetail.blnRoyaltyStore && orderLine.blnRoyalty) {
        orderLine.orderLineTotalPrice += orderLine.royaltyPrice;
      }

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
        orderLine.orderLineTotalCost += orderLine.orderLineTotalShippingCost;
        orderLine.orderLineTotalPrice += orderLine.orderLineTotalShippingPrice;
      }
      console.log(this.qryOrderLines);
    });
    this._changeDetectorRef.markForCheck();
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
  getGroupOrderDetails() {
    this._orderService.groupOrderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.groupOrderDetails = res["data"][0];
        this.getGroupOrderOptions();
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
  // exportHtmlToPDF
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
    const file_name = `CostAnalysis_${pk_orderID}.pdf`;

    // Adjust html2canvas options for better quality
    html2canvas(data, { useCORS: true, scale: 2, logging: false }).then(canvas => {
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
