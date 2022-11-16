import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { OrdersService } from '../../orders.service';
import { Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import moment from 'moment';
import { FormControl } from '@angular/forms';
import { environment } from 'environments/environment';
interface IncidentReports {
  id: string;
  created: string;
  created_by: string;
  store: string;
  source: string;
  source_entities: string;
}

@Component({
  selector: 'app-incident-reports',
  templateUrl: './incident-reports.component.html'
})
export class IncidentReportsComponent implements OnInit {
  @Input() isLoading: boolean;
  @Input() selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  orderDetail: any;
  todayDate = moment().format('MM/DD/YYYY');

  displayedColumns: string[] = ['id', 'created', 'created_by', 'store', 'source', 'source_entities'];
  transactions: IncidentReports[] = [
    { id: '215', created: "10/31/2016", created_by: "false", store: "LeadingAgeOhioShop.com", source: "Supplier", source_entities: "Hit Promotional Products" }
  ];
  isView: boolean = false;
  isViewCreateIncidentReportForm: boolean = false;
  selectedorder: string = 'select_order';
  orders: string[] = [
    'YES',
    'NO',
    'TBD'
  ];
  isButtonLoader: boolean = false;

  productsList = [];
  supplierList = [];
  reportSources: any;

  formModal = {
    reportsSources: [],
    priority1: 'TBD',
    priority3: 'TBD',
    rerunCost: '',
    corrected: 'TBD',
    explanation: "",
    how: "",
    recommend: ''
  }
  public users = new FormControl();
  isUserLoader: boolean = false;
  usersList: any;
  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  getUsers() {
    this.users.valueChanges.pipe(debounceTime(500), tap(() => {
      //   this.errorMsg = "";
      this.usersList = [];
      this.isUserLoader = true;
      this._changeDetectorRef.markForCheck();
    }),
      switchMap(value => this._orderService.getOrderCommonCall({ admin_users: true, keyword: value })
        .pipe(
          finalize(() => {
            this.isUserLoader = false;
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    )
      .subscribe(data => {
        this.usersList = data["data"] as any[];
        this._changeDetectorRef.markForCheck();
      });
  }
  ngOnInit(): void {
    this.getUsers();
    this.getOrderDetail();
    this._orderService.orderLineProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          let value = [];
          res["data"].forEach((element, index) => {
            value.push(element.pk_orderLineID);
            if (index == res["data"].length - 1) {
              this.getLineProducts(value.toString());
            }
          });
        })
      } else {
        res["data"].forEach(element => {
          this.productsList.push({ name: element.productName, id: element.pk_productID });
          const index = this.supplierList.findIndex(item => item.id == element.supplier_id);
          if (index < 0) {
            this.supplierList.push({ name: element.supplier_name, id: element.supplier_id, link: element.supplierLink });
          }
        });
        this.isLoading = false;
        this.isLoadingChange.emit(false);
        this._changeDetectorRef.markForCheck();
      }
    });
    this.getIncidentReports();
  }
  getOrderDetail() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
      console.log(this.orderDetail)
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  public exportHtmlToPDF() {
    let data = document.getElementById('htmltable');
    const file_name = `IncidentReport_56165.pdf`;
    html2canvas(data).then(canvas => {

      let docWidth = 208;
      let docHeight = canvas.height * docWidth / canvas.width;

      const contentDataURL = canvas.toDataURL('image/png')
      let doc = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      doc.addImage(contentDataURL, 'PNG', 0, position, docWidth, docHeight)

      doc.save(file_name);
    });
  }

  viewIncidentReport(): void {
    this.isView = !this.isView;
  }

  viewCreateIncidentReportForm(): void {
    this.isViewCreateIncidentReportForm = !this.isViewCreateIncidentReportForm;
  }

  createIncidentReport(): void {
    this.isButtonLoader = !this.isButtonLoader;
  }
  getLineProducts(value) {
    let params = {
      order_line_item: true,
      order_line_id: value
    }
    this._orderService.getOrderLineProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  getIncidentReports() {
    let params = {
      incident_report_sources: true
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.reportSources = res["data"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  CreateIncidentReport() {
    // let payload = {
    //   store_id: this.selectedOrder.pk_storeID,
    //   order_id: this.selectedOrder.pk_orderID,
    //   date: this.todayDate,
    //   store_user_id: number;
    //   priority1: string;
    //   priority2: string;
    //   priority3: string;
    //   priority4: string;
    //   rerunCost: string;
    //   explanation: string;
    //   corrected: string;
    //   how: string;
    //   recommend: string;
    //   company_id: number;
    //   admin_user_id: number;
    //   soruce_admin_user_id: number;
    //   dateModified: this.todayDate,
    //   create_incident_report: true
    // }
  }
  addAndRemoveFromCheckBox(ev, item) {
    const index = this.formModal.reportsSources.findIndex(elem => elem == item.sourceName);
    if (ev.checked) {
      if (index < 0) {
        this.formModal.reportsSources.push(item.sourceName);
      }
    } else {
      if (index >= 0) {
        this.formModal.reportsSources.splice(index, 1);
      }
    }
    console.log(this.formModal)
  }
  userSelected(user) {
    console.log(user);
  }
}

