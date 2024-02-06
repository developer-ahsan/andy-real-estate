import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
@Component({
  selector: 'app-orders-report',
  templateUrl: './orders-report.component.html',
  styles: ['.fuse-mat-rounded .mat-tab-group .mat-tab-body-content {overflow-x: hidden !important}'],
  encapsulation: ViewEncapsulation.None,
})
export class OrdersReportComponent implements OnInit {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  // selectedOrder: OrdersList = null;
  orderDetail: any;
  managerDetails: any;
  qryOrderLines: any;
  isGeneratePDFLoader: boolean = false;
  // Group Order
  groupOrderDetails: any;
  groupOrderOptions: any;
  orderParticipants: any;
  ngSelectedParticipant: any;
  shippingData: any;
  qryInitiatorOptions: any;
  isGroupLoader: boolean = false;
  blnInitiator: boolean = false;
  blnEmail: boolean = false;
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
          this.getGroupOrderDetails();
        } else {
          this.getOrderProducts();
        }
        this.setOrderData();
      }
    });
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
      orderLine.optionsPrice = orderLine.colorSizesData.reduce((sum, item) => sum + (item.basePrice * item.quantity) + (item.runPrice * item.quantity) + item.setupPrice, 0);

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
    this.orderDetail.totalCost = 0;
    this.orderDetail.totalPrice = 0;
    this.orderDetail.totalRoyalties = 0;

    if (this.orderDetail.qryOrderAdjustments) {
      this.orderDetail.adjustmentsData.forEach(adjustment => {
        this.orderDetail.totalCost += adjustment.cost;
        this.orderDetail.totalPrice += adjustment.price;
      });
    }

    this.qryOrderLines.forEach(orderLine => {
      orderLine.orderLineTotalCost = 0;
      orderLine.blnInitiatorOptions = 0;
      orderLine.orderLineTotalPrice = 0;
      orderLine.orderLineTotalShippingCost = 0;
      orderLine.orderLineTotalShippingPrice = 0;
      if (orderLine.sumOfQuantity > 0) {
        // Set Royalties
        if (this.orderDetail.blnRoyaltyStore && orderLine.blnRoyalty) {
          if (orderLine.blnApparel) {
            orderLine.royaltyPrice = orderLine.optionsPrice * this.orderDetail.apparelRoyaltyAmount;
            this.orderDetail.totalRoyalties += orderLine.optionsPrice * this.orderDetail.apparelRoyaltyAmount;
          } else {
            orderLine.royaltyPrice = orderLine.optionsPrice * this.orderDetail.royaltyAmount;
            this.orderDetail.totalRoyalties += orderLine.optionsPrice * this.orderDetail.royaltyAmount;
          }
        }
        // this.orderDetail.totalRoyalties += orderLine.royaltyPrice;

        orderLine.colorSizesData.forEach(color => {
          orderLine.orderLineTotalCost += ((color.baseCost + color.runCost) * color.quantity) + color.setupCost;
          orderLine.orderLineTotalPrice += ((color.basePrice + color.runPrice) * color.quantity) + color.setupPrice;
        });
        orderLine.imprintsData.forEach(imprint => {
          if (imprint.quantity) {
            orderLine.blnInitiatorOptions = 1;
          }
          if (this.blnEmail) {
            orderLine.orderLineTotalCost += (imprint.runCost * orderLine.sumOfQuantity);
            orderLine.orderLineTotalPrice += (imprint.runPrice * orderLine.sumOfQuantity);
          } else {
            orderLine.orderLineTotalCost += (imprint.runCost * orderLine.sumOfQuantity) + imprint.setupCost;
            orderLine.orderLineTotalPrice += (imprint.runPrice * orderLine.sumOfQuantity) + imprint.setupPrice;
          }
        });

        orderLine.accessoriesData.forEach(accessory => {
          let blnInitator = 0;
          for (let imprint of orderLine.imprintsData) {
            if (imprint.quantity) {
              blnInitator = 1;
            }
          }
          if (!this.blnEmail && !this.blnInitiator) {
            orderLine.orderLineTotalCost += (accessory.runCost * orderLine.sumOfQuantity) + (accessory.setupCost * (blnInitator + orderLine.qryOrderLineParticipantsCount));
            orderLine.orderLineTotalPrice += (accessory.runPrice * orderLine.sumOfQuantity) + (accessory.setupPrice * (blnInitator + orderLine.qryOrderLineParticipantsCount));
          } else {
            orderLine.orderLineTotalCost += (accessory.runCost * orderLine.sumOfQuantity) + accessory.setupCost;
            orderLine.orderLineTotalPrice += (accessory.runPrice * orderLine.sumOfQuantity) + accessory.setupPrice;
          }
        });

        if (this.orderDetail.blnRoyaltyStore && orderLine.blnRoyalty) {
          orderLine.orderLineTotalPrice += orderLine.royaltyPrice;
        }

        // Add shipping Values
        if (this.blnInitiator) {
          orderLine.orderLineTotalShippingCost = orderLine.TotalShippingCost + orderLine.shippingCost;
          orderLine.orderLineTotalShippingPrice = orderLine.TotalShippingPrice + orderLine.shippingPrice;
          // Add Total
          orderLine.orderLineTotalCost += orderLine.orderLineTotalShippingCost;
          orderLine.orderLineTotalPrice += orderLine.orderLineTotalShippingPrice;
        } else if (this.blnEmail) {
          if (orderLine.colorSizesData.length && orderLine.sumOfQuantity > 0 && !this.groupOrderDetails.blnShipToOneLocation) {
            if (orderLine.shippingData.length) {
              orderLine.orderLineTotalShippingCost = orderLine.TotalShippingCost;
              if (this.groupOrderDetails.blnDropShipCharges) {
                orderLine.orderLineTotalShippingPrice = orderLine.TotalShippingPrice + 5;
              } else {
                orderLine.orderLineTotalShippingPrice = orderLine.TotalShippingPrice;
              }
            } else {
              orderLine.orderLineTotalShippingCost = 0;
              orderLine.orderLineTotalShippingPrice = 0;
            }
          } else {
            orderLine.orderLineTotalShippingCost = 0;
            orderLine.orderLineTotalShippingPrice = 0;
          }
          orderLine.orderLineTotalCost += orderLine.orderLineTotalShippingCost;
          orderLine.orderLineTotalPrice += orderLine.orderLineTotalShippingPrice;
        } else {
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
        }

        this.orderDetail.totalCost += orderLine.orderLineTotalCost;
        this.orderDetail.totalPrice += orderLine.orderLineTotalPrice;
      }

    });
    this.orderDetail.totalPrice += (-1 * this.orderDetail.discount) + (((this.orderDetail.totalPrice + (-1 * this.orderDetail.discount)) - this.orderDetail.totalRoyalties) * this.orderDetail.salesTaxRate);
    this._changeDetectorRef.markForCheck();
  }
  // Group Order
  getGroupOrderDetails() {
    this._orderService.groupOrderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.groupOrderDetails = res["data"][0];
        this.getGroupOrderOptions();
        this.getOrderParticapants();
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  getOrderParticapants() {
    this._orderService.groupOrderParticipants$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.orderParticipants = res["data"];
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
        this.isGroupLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    });
  }
  onChangeParticipant() {
    this.blnInitiator = false;
    this.blnEmail = false;
    this.isLoading = true;
    this.isGroupLoader = true;
    this._changeDetectorRef.markForCheck();
    let email = '';
    if (this.ngSelectedParticipant != 0 && this.ngSelectedParticipant != 1) {
      this.blnEmail = true;
      email = this.ngSelectedParticipant;
    }
    if (this.ngSelectedParticipant == 0) {
      this.getGroupOrderOptions();
    } else if (this.ngSelectedParticipant == 1) {
      this.blnInitiator = true;
      this.groupOrderOptions = this.qryInitiatorOptions;
      this.getOrderProducts();
      setTimeout(() => {
        this.isGroupLoader = false;
        this._changeDetectorRef.markForCheck();
      }, 200);
      this._changeDetectorRef.markForCheck();
    } else {
      this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        const orderLineIds = res["data"].map(element => element.pk_orderLineID);
        this._orderService.getGroupOrderOptions(this.orderDetail.pk_orderID, this.orderDetail.fk_storeID, email, orderLineIds.toString()).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          if (res) {
            this.groupOrderOptions = res["qryParticipant"];
            this.shippingData = res["strOrderLineShipping"];
            this.qryInitiatorOptions = res["qryInitiator"];
            this.getOrderProducts();
            this.isGroupLoader = false;
            this._changeDetectorRef.markForCheck();
          }
        }, err => {
          this.isGroupLoader = false;
          this.isLoading = false;
          this._orderService.snackBar('Something went wrong');
          this._changeDetectorRef.markForCheck();
        });
      });
    }
  }
  public exportHtmlToPDF() {
    this.isGeneratePDFLoader = true;
    this._changeDetectorRef.markForCheck();
    setTimeout(() => {
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

      // Adjust html2canvas options for better quality and capturing the entire content
      html2canvas(data, { useCORS: true, scale: 2, logging: false, scrollY: -window.scrollY }).then(canvas => {
        var imgData = canvas.toDataURL("image/jpeg", 0.7);

        var pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);
        pdf.addImage(imgData, 'jpeg', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);

        for (var i = 1; i <= totalPDFPages; i++) {
          pdf.addPage([PDF_Width, PDF_Height]);

          // Adjust the position to account for padding at the bottom
          var yPosition = -(PDF_Height * i) + (top_left_margin * 4);
          pdf.addImage(imgData, 'jpeg', top_left_margin, yPosition, canvas_image_width, canvas_image_height);
        }
        pdf.save(file_name);
        this.isGeneratePDFLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    }, 100);
  }

}
