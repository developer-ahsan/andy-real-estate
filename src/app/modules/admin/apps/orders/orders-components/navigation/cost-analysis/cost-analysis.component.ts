import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { Subject } from 'rxjs';

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
  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;


    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.orderDetail = res["data"][0];
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
  getLineProducts(value) {
    let params = {
      order_line_item: true,
      order_line_id: value
    }
    this._orderService.getOrderLineProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let products = [];

      res["data"].forEach(element => {
        let prod = [];
        if (products.length == 0) {
          let cost = (element.cost * element.quantity) + element.shippingCost;
          let price = (element.price * element.quantity) + element.shippingPrice;
          prod.push(element);
          products.push({ products: prod, order_line_id: element.fk_orderLineID, accessories: [], imprints: [], totalQuantity: element.quantity, totalMercandiseCost: cost, totalMerchendisePrice: price });
        } else {
          const index = products.findIndex(item => item.order_line_id == element.fk_orderLineID);
          if (index < 0) {
            let cost = (element.cost * element.quantity) + element.shippingCost;
            let price = (element.price * element.quantity) + element.shippingPrice;
            prod.push(element);
            products.push({ products: prod, order_line_id: element.fk_orderLineID, accessories: [], imprints: [], totalQuantity: element.quantity, totalMercandiseCost: cost, totalMerchendisePrice: price });
          } else {
            let cost = (element.cost * element.quantity);
            let price = (element.price * element.quantity);
            prod = products[index].products;
            prod.push(element);
            products[index].products = prod;
            products[index].totalQuantity = products[index].totalQuantity + element.quantity;
            products[index].totalMercandiseCost = products[index].totalMercandiseCost + cost;
            products[index].totalMerchendisePrice = products[index].totalMerchendisePrice + price;
          }
        }
      });
      if (res["accessories"].length > 0) {
        res["accessories"].forEach(element => {
          let cost = (element.runCost * element.quantity);
          let price = (element.runPrice * element.quantity);
          const index = products.findIndex(item => item.order_line_id == element.orderLineID);
          products[index].accessories.push(element);
          products[index].totalMercandiseCost = products[index].totalMercandiseCost + cost;
          products[index].totalMerchendisePrice = products[index].totalMerchendisePrice + price;
        });
      }
      this.getProductImprints(value, products);
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  getProductImprints(value, data) {
    let params = {
      imprint_report: true,
      order_line_id: value
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let tempArr = [];
      res["data"].forEach(element => {
        let cost = (element.runCost * element.quantity) + element.setupCost;
        let price = (element.runPrice * element.quantity) + element.setupPrice;
        const index = data.findIndex(item => item.order_line_id == element.fk_orderLineID);
        data[index].imprints.push(element);
        data[index].totalMercandiseCost = data[index].totalMercandiseCost + cost;
        data[index].totalMerchendisePrice = data[index].totalMerchendisePrice + price;
      });


      this.orderProducts = data;
      this.getProductTotal();
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getProductTotal() {
    this.grandTotalCost = 0;
    this.grandTotalPrice = 0;
    // this.orderProducts.forEach(element => {
    //   let runCost = 0;
    //   let runPrice = 0;
    //   let setupCost = 0;
    //   let setupPrice = 0;
    //   if (element.imprint) {
    //     runCost = element.imprints.runCost;
    //     runPrice = element.imprints.runPrice;
    //     setupCost = element.imprints.setupCost;
    //     setupPrice = element.imprints.setupPrice;
    //   }
    //   this.grandTotalCost = this.grandTotalCost + ((element.products[0].cost * element.products[0].quantity) + (runCost * element.products[0].quantity) + (setupCost));
    //   this.grandTotalPrice = this.grandTotalPrice + ((element.product.price * element.product.quantity) + (runPrice * element.product.quantity) + (setupPrice))
    // });
  }


  public exportHtmlToPDF(id) {
    let element = document.getElementById(id);
    var positionInfo = element.getBoundingClientRect();
    var height = positionInfo.height;
    var width = positionInfo.width;
    var top_left_margin = 15;
    let PDF_Width = width + (top_left_margin * 2);
    var PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 2);
    var canvas_image_width = width;
    var canvas_image_height = height;

    var totalPDFPages = Math.ceil(height / PDF_Height) - 1;
    const file_name = `CostAnalysisReport_56165.pdf`;
    html2canvas(element, { useCORS: true }).then(canvas => {
      canvas.getContext('2d');
      var imgData = canvas.toDataURL("image/jpeg", 1.0);
      var pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);
      pdf.addImage(imgData, 'jpeg', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);


      for (var i = 1; i <= totalPDFPages; i++) {
        pdf.addPage([PDF_Width, PDF_Height]);
        pdf.addImage(imgData, 'jpeg', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height);
      }

      pdf.save(file_name);
      this._changeDetectorRef.markForCheck();
    });
  }
  getMerchendiseTotalCost(item) {
    return 50
    // return (item.imprints?.runCost * item.products[0]?.quantity) + (item.products[0]?.cost * item.products[0]?.quantity) + (item.imprints?.setupCost) + (item.products[0]?.shippingCost);
  }
  getMerchendiseTotalPrice(item) {
    return 50

    // return (item.imprints?.runPrice * item.products[0]?.quantity) + (item.products[0]?.price * item.products[0]?.quantity) + (item.imprints?.setupPrice) + (item.products[0]?.shippingPrice);
  }
  getPercentage(item, check) {
    if (check == 'shipping') {
      if (item.products[0].shippingPrice == 0) {
        return 0;
      }
      let percentage = ((1 - (item.products[0].shippingCost / item.products[0].shippingPrice)) * 100)
      return percentage;
    }
    if (check == 'imprints') {
      if (item.runPrice == 0) {
        return 0;
      }
      let percentage = ((1 - (item.runCost / item.runPrice)) * 100);
      return percentage;
    }
    if (check == 'setup') {
      if (item.setupPrice == 0) {
        return 0;
      }
      let percentage = ((1 - (item.setupCost / item.setupPrice)) * 100);
      return percentage;

    }
  }

  getTotal(item) {
    let imprintAddition = 0;
    item.products.forEach((data: any) => {
      imprintAddition = imprintAddition + (data.cost * data.quantity)
    })

    item.imprints.forEach((data: any) => {
      imprintAddition = imprintAddition + data.setupCost
    })

    item.accessories.forEach((data: any) => {
      imprintAddition = imprintAddition + (data?.runCost * data?.quantity)
    })
    return `$${imprintAddition}`
  }
  grandTotal: any = 0;
  calculateGrandTotal() {
    this.grandTotal = 0;
    this.orderProducts.forEach((product: any) => {
      product.products.forEach((data: any) => {
        this.grandTotal = this.grandTotal + (data.cost * data.quantity)
      })

      product.imprints.forEach((data: any) => {
        this.grandTotal = this.grandTotal + data.setupCost
      })

      product.accessories.forEach((data: any) => {
        this.grandTotal = this.grandTotal + (data?.runCost * data?.quantity)
      })
    })
    return this.grandTotal.toFixed(2);
  }


}
