import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { OrdersService } from '../../orders.service';
import { Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import moment from 'moment';
import { FormControl } from '@angular/forms';
import { environment } from 'environments/environment';
import { I } from '@angular/cdk/keycodes';
import { CreateIncidentReport } from '../../orders.types';
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
  dataSource = [];

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
    recommend: '',
    source_supplier: null,
    source_employee: null
  }
  public users = new FormControl();
  isUserLoader: boolean = false;
  usersList: any;

  // Create Incident 
  employeeSource: boolean = false;
  supplierSource: boolean = false;
  isIncidentLoader: boolean = false;
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
      }
    });
    this.getIncidentReports();
    this.getReports();
  }
  getReports() {
    let params = {
      incident_report: true,
      order_id: this.selectedOrder.pk_orderID
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  getOrderDetail() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
      console.log(this.orderDetail)
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
      all_report_sources: true
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
    let reports_sources = [];
    this.formModal.reportsSources.forEach(element => {
      reports_sources.push(element.pk_sourceID);
    });
    let payload: CreateIncidentReport = {
      store_id: this.selectedOrder.pk_storeID,
      order_id: this.selectedOrder.pk_orderID,
      date: this.todayDate,
      store_user_id: this.orderDetail.fk_storeUserID,
      priority1: this.formModal.priority1,
      priority2: 'TBD',
      priority3: this.formModal.priority3,
      priority4: 'TBD',
      rerunCost: this.formModal.rerunCost,
      explanation: this.formModal.explanation,
      corrected: this.formModal.corrected,
      how: this.formModal.how,
      recommend: this.formModal.recommend,
      source_supplier: this.formModal.source_supplier,
      source_employee: this.formModal.source_employee,
      admin_user_id: this.orderDetail.fk_adminUserID,
      dateModified: this.todayDate,
      incident_sources: reports_sources,
      create_incident_report: true
    }
    console.log(payload)
    this.isIncidentLoader = true;
    this._orderService.CreateIncidentReport(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      console.log(res);
      this.isIncidentLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isIncidentLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  addAndRemoveFromCheckBox(ev, item) {
    const index = this.formModal.reportsSources.findIndex(elem => elem.sourceName == item.sourceName);
    if (ev.checked) {
      if (index < 0) {
        this.formModal.reportsSources.push(item);
      }
    } else {
      if (index >= 0) {
        this.formModal.reportsSources.splice(index, 1);
      }
    }
    if (this.formModal.reportsSources.length == 0) {
      this.employeeSource = false;
      this.supplierSource = false;
    }
    this.employeeSource = this.formModal.reportsSources.some(elem => {
      if (elem.sourceName == 'Program Manager/Service Rep' || elem.sourceName == 'Customer' || elem.sourceName == 'Support') {
        return true;
      } else {
        return false;
      }
    });
    this.supplierSource = this.formModal.reportsSources.some(elem => {
      if (elem.sourceName == 'Supplier') {
        return true;
      } else {
        this.formModal.source_supplier = null;
        return false;
      }
    });
  }
  userSelected(user) {
    console.log(user);
    this.formModal.source_employee = user.pk_userID;
  }
  checkEmployeeSourceValue(val) {
    this.employeeSource = false;
    this.formModal.reportsSources.filter(elem => {
      if (elem.sourceName == val) {
        this.employeeSource = true;
      }
    });
  }
  checkSupplierSourceValue(val) {
    this.supplierSource = false;
    this.formModal.reportsSources.filter(elem => {
      if (elem.sourceName == val) {
        this.supplierSource = true;
      }
    })
  }
}

