import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { FileManagerService } from '../../store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { debounceTime, tap, switchMap, finalize, distinctUntilChanged, filter } from 'rxjs/operators';
import moment from 'moment';
import { FinalizeBill } from '../../stores.types';
const API_KEY = "e8067b53"
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { environment } from 'environments/environment';
@Component({
  selector: 'app-consolidated-bill',
  templateUrl: './consolidated-bill.component.html',
})
export class ConsolidatedBillComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isPageLoading: boolean = false;
  creditTerms: any;
  selectedTerm: any = 'today';
  isApplyLoader: boolean = false;
  isApplyMsg: boolean = false;


  locationCtrl = new FormControl();
  filteredLocations: any;
  minLengthTerm = 3;
  slectedLocation: any = "";
  isLoadings: boolean = false;
  locations: any = [];


  ngDate = new Date();
  today = new Date();
  ngOrder = 1;
  ngDiscount = true;

  isConsolidatedBill: boolean = false;
  date: any;
  consolidatedData: any;
  totalAmount = 0;
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private http: HttpClient
  ) { }

  onSelected() {
    this.slectedLocation = this.slectedLocation;
  }

  displayWith(value: any) {
    return value;
  }

  clearSelection() {
    this.slectedLocation = "";
    this.filteredLocations = [];
  }

  ngOnInit() {
    this.getStoreDetails();
    this.getLocations();
  }

  getLocations() {
    let payload = {
      store_id: this.selectedStore.pk_storeID,
      locations_departments: true
    }
    this._storeManagerService.getStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      const parts = res.qryStoreLocationAttributes[0].qryStoreLocationAttributes.split(",,");
      this.locations = parts.map(part => {
        const [id, storeId, name] = part.split("::");
        return { id, storeId, name };
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    })
  }

  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.getLocationsSearch();
      });
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
  getLocationsSearch() {
    this.locationCtrl.valueChanges
      .pipe(
        filter(res => {
          return res !== null && res.length >= this.minLengthTerm
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.filteredLocations = [];
          this.isLoadings = true;
          this._changeDetectorRef.markForCheck();

        }),
        switchMap(value => this._storeManagerService.getStoresData({
          store_id: this.selectedStore.pk_storeID,
          store_locations: true,
          size: 20,
          keyword: value
        }).pipe(takeUntil(this._unsubscribeAll),
          finalize(() => {
            this.isLoadings = false
            this._changeDetectorRef.markForCheck();

          }),
        )
        )
      )
      .subscribe((data: any) => {
        if (data['data'].length == 0) {
          this.filteredLocations = [];
          this._changeDetectorRef.markForCheck();

        } else {
          this.filteredLocations = data['data'];
          this._changeDetectorRef.markForCheck();
        }
      });
  }
  getConsolidatedBill() {
    let isCurrentDate = 0;
    let dateData = ''
    if (this.selectedTerm == 'today') {
      this.date = moment(this.today).format('MM/DD/yyyy');
      dateData = '';
      isCurrentDate = 1;
    } else {
      isCurrentDate = 0;
      this.date = moment(this.ngDate).format('MM/DD/yyyy');
      dateData = moment(this.ngDate).format('MM/DD/yyyy');
    }
    this.isConsolidatedBill = true;
    this.isApplyLoader = true;
    let payload = {
      consolidated_bill: true,
      store_id: this.selectedStore.pk_storeID,
      isCurrentDate,
      order_date: dateData,
      order_type: this.ngOrder,
      // attribute_id: this.slectedLocation
    }
    this._storeManagerService.getStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      console.log(res);
      res["data"].forEach(element => {
        element.Prducts = [];
        if (element.products) {
          let products = element.products.split(',');
          products.forEach(item => {
            let prods = item.split(':');
            element.Prducts.push({ id: prods[0], name: prods[1], unit: prods[2], qty: prods[3], extended: prods[4], setup: prods[5], shipping: prods[6], total: prods[7] });
          });
        }
      });
      this.consolidatedData = res["data"];
      this.isApplyLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isApplyLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getConsolidatedBillDetail(obj) {
    obj.loader = true;
    let payload = {
      consolidated_bill_products: true,
      order_line_id: obj.pk_orderLineID
    }
    this._storeManagerService.getStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      obj.productsData = res["data"];
      obj.loader = false;
      obj.hide = true;
      this._changeDetectorRef.markForCheck();
    }, err => {
      obj.loader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  backToSearch() {
    this.isConsolidatedBill = false;
  }
  finalizeBill() {
    let orders = [];
    this.consolidatedData.forEach(element => {
      orders.push(element.INVOICE);
    });
    let payload: FinalizeBill = {
      orderIDs: orders,
      finalize_bill: true
    }
    this.consolidatedData.finalizeLoader = true;
    this._changeDetectorRef.markForCheck();
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      this.consolidatedData.finalizeLoader = false;
      this.isConsolidatedBill = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.consolidatedData.finalizeLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  public exportHtmlToPDF() {
    this.consolidatedData.pdfLoader = true;
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
    const { pk_storeID } = this.selectedStore;
    let data = document.getElementById('printPDf');
    const file_name = `ConsolidatedBill_${pk_storeID}.pdf`;
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
      this.consolidatedData.pdfLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
}
