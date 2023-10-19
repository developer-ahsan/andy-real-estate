import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import moment from 'moment';
import { FormControl } from '@angular/forms';
import { environment } from 'environments/environment';
import { I } from '@angular/cdk/keycodes';
import { CreateIncidentReport, DeleteIncidentReport, UpdateIncidentReport, sendIncidentReportEmail } from '../../../orders.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { OrdersService } from '../../../orders.service';
declare var $;
@Component({
  selector: 'app-incident-reports-list',
  templateUrl: './incident-reports-list.component.html'
})
export class IncidentReportsListComponent implements OnInit {
  @ViewChild('incidentModal') incidentModal: ElementRef;
  removeIncidentData: any;
  config = {
    maxFiles: 5, // Set the maximum number of files
  };
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  orderDetail: any;
  todayDate = moment().format('MM/DD/YYYY');
  isLoading: boolean = false;
  selectedOrder: any;

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
    selectedEmployess: [],
    blnFianlized: false,
    priority1: 'TBD',
    priority3: 'TBD',
    rerunCost: '',
    corrected: 'TBD',
    explanation: "",
    how: "",
    recommend: '',
    source_supplier: 0,
    source_employee: null
  }
  updateFormModal = {
    reportsSources: [],
    priority1: 'TBD',
    priority2: 'TBD',
    priority3: 'TBD',
    priority4: 'TBD',
    rerunCost: '',
    corrected: 'TBD',
    explanation: "",
    how: "",
    recommend: '',
    source_supplier: null,
    source_employee: null,
    supplierID: null,
    employeeID: null,
    blnFinalized: false
  }
  public users = new FormControl();
  isUserLoader: boolean = false;
  usersList: any = [];

  // Create Incident 
  employeeSource: boolean = false;
  supplierSource: boolean = false;
  isIncidentLoader: boolean = false;


  // New Declarations
  mainScreen: string = 'Current Incident Reports';

  updateIncidentObj: any;
  isUpdateLoader: boolean = false;

  userIDs = [866, 2844, 6268, 6268, 11204];
  userData: any;
  incidentReportPage = 1;
  totalIncidentRecords = 0;

  files: any = [];
  iDsForFinalized = [2844, 11204, 6268, 6286];
  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _commonService: DashboardsService
  ) { }
  calledScreen(value) {
    this.files = [];
    this.mainScreen = value;
  }
  getUsers() {
    this.isUserLoader = true;
    let params = {
      admin_users: true,
      order_id: this.orderDetail.pk_orderID
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUserLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      let users = res["data"][0].sourceOfIncidentEmployee.split(',,');
      users.forEach(user => {
        const [name, email, id, ID] = user.split('::');
        this.usersList.push({ name, email, id, ID });
      });
      let sources = res["sourceOfIncidentSuppliers"][0]["sourceOfIncidentSuppliers"].split(',,');
      sources.forEach(element => {
        const [id, name] = element.split('::');
        this.supplierList.push({ id: Number(id), name });
      });
    });
  }
  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userDetails'));
    this.getOrderDetail();
  }
  getReports(type) {
    let params = {
      incident_report: true,
      order_id: this.orderDetail.pk_orderID,
      page: this.incidentReportPage,
      size: 20
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.sources = [];
        let sources = element.incidentReportSources.split(',,');
        sources.forEach(source => {
          const [id, name] = source.split('::');
          element.sources.push({ id, name })
        });
      });
      this.dataSource = res["data"];
      this.totalIncidentRecords = res["totalRecords"];
      if (type == 'add') {
        this.isIncidentLoader = false;
        this._orderService.snackBar('Incident Created Successfully');
        this.mainScreen = 'Current Incident Reports';
      }
      if (type == 'update') {
        this.isUpdateLoader = false;
        this._orderService.snackBar('Incident Updated Successfully');
      }
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  getNextIncidentReports(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.incidentReportPage++;
    } else {
      this.incidentReportPage--;
    };
    this.getReports('get');
  }
  getOrderDetail() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
      this.isLoading = true;
      this.formModal.blnFianlized = this.orderDetail.blnFinalized;
      this.getUsers();
      this.getIncidentReports();
      this.getReports('get');

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

  viewIncidentReport(item): void {
    this.files = [];
    this.isView = !this.isView;
    if (this.isView) {
      this.updateIncidentObj = item;
      this.updateFormModal.blnFinalized = item.blnFinalized;
      this.updateFormModal.rerunCost = item.rerunCost;
      this.updateFormModal.recommend = item.recommend;
      this.updateFormModal.explanation = item.explanation;
      this.updateFormModal.how = item.how;
      this.updateFormModal.priority1 = item.priority1;
      this.updateFormModal.priority2 = item.priority2;
      this.updateFormModal.priority3 = item.priority3;
      this.updateFormModal.priority4 = item.priority4;
      this.updateFormModal.corrected = item.corrected;
      const index = this.supplierList.findIndex(elem => elem.id == item.fk_companyID);
      if (index > -1) {
        this.updateFormModal.source_supplier = item.fk_companyID;
      } else {
        this.updateFormModal.source_supplier = 0;
      }
      if (item.fk_sourceAdminUserID) {
        this.updateFormModal.source_employee = item.fk_sourceAdminUserID.split(',');
      }
      let sources = item.incidentReportSources.split(',,');
      sources.forEach(source => {
        const [id, name] = source.split('::');
        this.updateFormModal.reportsSources.push(Number(id));
        this.reportSources.filter((item, index) => {
          if (item.pk_sourceID == id) {
            item.checked = true;
            this._changeDetectorRef.markForCheck();
          }
          if (index == this.reportSources.length - 1) {
            if (this.updateFormModal.reportsSources.length == 0) {
              this.employeeSource = false;
              this.supplierSource = false;
            }
            this.employeeSource = this.updateFormModal.reportsSources.some(elem => {
              if (elem == 1 || elem == 2 || elem == 4) {
                return true;
              }
            });
            this.supplierSource = this.updateFormModal.reportsSources.some(elem => {
              if (elem == 5) {
                return true;
              }
            });
          }
        });
      });
      if (this.updateIncidentObj.incidentReportHistory) {
        this.updateIncidentObj.incidentReportshistory = [];
        let history = this.updateIncidentObj.incidentReportHistory.split(',,');
        history.forEach(element => {
          const [date, id, ID, name] = element.split('::');
          this.updateIncidentObj.incidentReportshistory.push({ date, id, ID, name });
        });
      }
      this.getIncidentFiles();
      this._changeDetectorRef.markForCheck();
    }
  }

  viewCreateIncidentReportForm(): void {
    this.isViewCreateIncidentReportForm = !this.isViewCreateIncidentReportForm;
  }

  createIncidentReport(): void {
    this.isButtonLoader = !this.isButtonLoader;
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
      store_id: this.orderDetail.fk_storeID,
      order_id: this.orderDetail.pk_orderID,
      store_user_id: this.orderDetail.fk_storeUserID,
      priority1: this.formModal.priority1,
      priority2: 'TBD',
      priority3: this.formModal.priority3,
      priority4: 'TBD',
      rerunCost: this.formModal.rerunCost,
      explanation: this.formModal.explanation.replace(/'/g, "''"),
      corrected: this.formModal.corrected,
      how: this.formModal.how.replace(/'/g, "''"),
      recommend: this.formModal.recommend.replace(/'/g, "''"),
      source_supplier: Number(this.formModal.source_supplier),
      source_employee: this.formModal.source_employee.toString(),
      admin_user_id: this.userData.pk_userID,
      incident_sources: reports_sources,
      create_incident_report: true
    }
    this.isIncidentLoader = true;
    this._orderService.CreateIncidentReport(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      // this.isIncidentLoader = false;
      this.getReports('add');
      if (this.files.length > 0) {
        this.uploadMultipleImages(res["newID"], reports_sources);
      } else {
        this.sendIncidentEmail('post', [], res["newID"], reports_sources, null);
      }
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
      if (elem.sourceName == 'Program Manager/Service Rep' || elem.sourceName == 'Support') {
        return true;
      } else {
        return false;
      }
    });
    this.supplierSource = this.formModal.reportsSources.some(elem => {
      if (elem.sourceName == 'Supplier') {
        return true;
      } else {
        this.formModal.source_supplier = 0;
        return false;
      }
    });
  }
  updateAndRemoveFromCheckBox(ev, item) {
    const index = this.updateFormModal.reportsSources.findIndex(elem => elem.sourceName == item.sourceName);
    if (ev.checked) {
      if (index < 0) {
        this.updateFormModal.reportsSources.push(item);
      }
    } else {
      if (index >= 0) {
        this.updateFormModal.reportsSources.splice(index, 1);
      }
    }
    if (this.updateFormModal.reportsSources.length == 0) {
      this.employeeSource = false;
      this.supplierSource = false;
    }
    this.employeeSource = this.updateFormModal.reportsSources.some(elem => {
      if (elem.sourceName == 'Program Manager/Service Rep' || elem.sourceName == 'Customer' || elem.sourceName == 'Support') {
        return true;
      } else {
        return false;
      }
    });
    this.supplierSource = this.updateFormModal.reportsSources.some(elem => {
      if (elem.sourceName == 'Supplier') {
        return true;
      } else {
        this.updateFormModal.source_supplier = null;
        return false;
      }
    });
  }
  updateuserSelected(user) {
    this.updateFormModal.source_employee = user.pk_userID;
  }
  updatecheckEmployeeSourceValue(val) {
    this.employeeSource = false;
    this.updateFormModal.reportsSources.filter(elem => {
      if (elem.sourceName == val) {
        this.employeeSource = true;
      }
    });
  }
  updatecheckSupplierSourceValue(val) {
    this.supplierSource = false;
    this.updateFormModal.reportsSources.filter(elem => {
      if (elem.sourceName == val) {
        this.supplierSource = true;
      }
    })
  }

  userSelected(user) {
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


  // Update Incident Reports

  // Delete Incident Report
  openRemovalModal(data) {
    this.removeIncidentData = data;
    $(this.incidentModal.nativeElement).modal('show');
  }
  deleteIncidentReport() {
    this.removeIncidentData.isRemoveLoader = true;
    this._changeDetectorRef.markForCheck();
    let params: DeleteIncidentReport = {
      incident_report_id: this.removeIncidentData.pk_incidentReportID,
      remove_incident_report: true
    }
    this._orderService.updateOrderCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this._orderService.snackBar(res["message"]);
        this.dataSource = this.dataSource.filter(elem => elem.pk_incidentReportID != this.removeIncidentData.pk_incidentReportID);
        this.totalIncidentRecords--;
        $(this.incidentModal.nativeElement).modal('hide');
        this.sendIncidentEmail('delete', [], this.removeIncidentData.pk_incidentReportID, null, this.removeIncidentData);
      }
      this.removeIncidentData.isRemoveLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.removeIncidentData.isRemoveLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Update Incident
  updateIncident() {
    const { fk_adminUserID, fk_orderID, fk_storeUserID, fk_storeID, fk_companyID, pk_incidentReportID, sources, sourceEmployeeName, images } = this.updateIncidentObj;
    const { reportsSources, priority1, priority2, priority3, priority4, rerunCost, explanation, corrected, how, recommend, source_supplier, source_employee, blnFinalized } = this.updateFormModal;
    let reports_sources = [];
    let payload: UpdateIncidentReport = {
      store_user_id: this.updateIncidentObj.fk_storeUserID,
      date: this.updateIncidentObj.date,
      priority1: priority1,
      priority2: priority2,
      priority3: priority3,
      priority4: priority4,
      blnFinalized: blnFinalized,
      rerunCost: rerunCost,
      explanation: explanation,
      corrected: corrected,
      how: how,
      recommend: recommend,
      source_supplier: Number(source_supplier),
      admin_user_id: this.userData.pk_userID,
      source_employee: source_employee,
      incident_sources: reportsSources,
      incident_report_id: pk_incidentReportID,
      order_id: fk_orderID,
      update_incident_report: true
    }
    this.isUpdateLoader = true;
    this._orderService.updateOrderCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getReports('update');
      let imagesData = [];
      images.forEach(image => {
        imagesData.push(image.path);
      });
      this.sendIncidentEmail('put', imagesData, pk_incidentReportID, sources, this.updateIncidentObj);
    }, err => {
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  // Select & Upload Images
  onSelectMain(event) {
    if (event.addedFiles.length > 5) {
      this._orderService.snackBar("Please select maximum 5 images.");
      return;
    }
    if (this.files.length == 5) {
      this._orderService.snackBar("Max limit reached for image upload.");
      return;
    } else {
      event.addedFiles.forEach(element => {
        this.files.push(element);
      });
    }
    setTimeout(() => {
      this._changeDetectorRef.markForCheck();
    }, 200);
  }
  onRemoveMain(index) {
    this.files.splice(index, 1);
  }
  uploadMultipleImages(incidentID, reports_sources) {
    let images = [];
    this.files.forEach((file, index) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let image: any = new Image;
        image.src = reader.result;
        image.onload = () => {
          images.push({
            imageUpload: reader.result,
            type: file["type"]
          });
          if (index == this.files.length - 1) {
            this.uploadImageToServer(images, incidentID, reports_sources);
          }
        }
      }
    });
  }
  uploadImageToServer(images, incidentID, reports_sources) {
    let files = [];
    let imagesData = [];
    images.forEach((element, index) => {
      let d = new Date();
      let filePath = `/globalAssets/Orders/incidentReportImages/${this.orderDetail.pk_orderID}/${incidentID}/${d.getTime() + index}.jpg`;
      files.push({
        image_file: element.imageUpload.split(",")[1],
        image_path: filePath
      });
      imagesData.push('https://assets.consolidus.com' + filePath);
      if (index == images.length - 1) {
        this.sendIncidentEmail('post', imagesData, incidentID, reports_sources, null);
      }
    });
    this._commonService.uploadMultipleMediaFiles(files).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    });
  }
  // GEt getIncidentFiles Images 
  getIncidentFiles() {
    this.updateIncidentObj.imgLoader = true;
    this.updateIncidentObj.images = [];
    let payload = {
      files_fetch: true,
      path: `/globalAssets/Orders/incidentReportImages/${this.orderDetail.pk_orderID}/${this.updateIncidentObj.pk_incidentReportID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._commonService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      res["data"].forEach(element => {
        this.updateIncidentObj.images.push({ path: environment.assetsURL + `/globalAssets/Orders/incidentReportImages/${this.orderDetail.pk_orderID}/${this.updateIncidentObj.pk_incidentReportID}/${element.FILENAME}`, isRemove: false })
      });
      this.updateIncidentObj.imgLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  // Send Incident Email
  sendIncidentEmail(type, imgs, id, sources, formData) {
    let images = [];
    imgs.forEach(element => {
      images.push(element);
    });
    let reports_sources = [];
    let OldIncidentReport = null;
    if (type == 'post') {
      OldIncidentReport = null;
      sources.forEach(source => {
        this.formModal.reportsSources.forEach(element => {
          if (source == element.pk_sourceID) {
            reports_sources.push(element.sourceName);
          }
        });
      });
    } else {
      formData.sources.forEach(source => {
        reports_sources.push(source.name);
      });
      OldIncidentReport = {
        pk_incidentReportID: id,
        fk_storeID: formData.fk_storeID,
        fk_orderID: formData.fk_orderID,
        date: formData.date,
        fk_storeUserID: formData.fk_storeUserID,
        priority1: formData.priority1,
        priority2: formData.priority2,
        priority3: formData.priority3,
        priority4: formData.priority4,
        rerunCost: formData.rerunCost,
        explanation: formData.explanation,
        corrected: formData.corrected,
        how: formData.how,
        recommend: formData.recommend,
        fk_companyID: formData.fk_companyID,
        sourceEntity: formData.sourceEntity,
        fk_adminUserID: formData.fk_adminUserID,
        fk_sourceAdminUserID: formData.fk_sourceAdminUserID,
        sourceEmployeeName: formData.sourceEmployeeName,
        dateModified: formData.dateModified,
        blnFinalized: formData.blnFinalized,
        storeName: formData.storeName,
        storeCode: formData.storeCode,
        storeUserFirstName: formData.storeUserFirstName,
        storeUserLastName: formData.storeUserLastName,
        storeUserCompanyName: formData.storeUserCompanyName,
        createdBy: formData.createdBy,
        incidentReportSources: reports_sources
      }
    }
    let vendors = [];
    this.supplierList.forEach(element => {
      vendors.push(element.name);
    });
    let paylaod: sendIncidentReportEmail = {
      incident_report_id: id,
      type: type,
      images: images,
      vendors: vendors,
      oldIncidentReport: OldIncidentReport,
      incidentReportSources: reports_sources, // only names array
      send_incident_report_email: true
    }
    this._orderService.orderPostCalls(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    });
  }
}


