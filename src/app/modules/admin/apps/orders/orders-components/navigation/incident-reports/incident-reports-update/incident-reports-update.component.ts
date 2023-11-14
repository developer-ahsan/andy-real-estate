import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
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
import { ActivatedRoute } from '@angular/router';
interface IncidentReports {
  id: string;
  created: string;
  created_by: string;
  store: string;
  source: string;
  source_entities: string;
}

@Component({
  selector: 'app-incident-reports-update',
  templateUrl: './incident-reports-update.component.html'
})
export class IncidentReportsUpdateComponent implements OnInit {
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
  incidentID: any;
  isImageUpdateLoader: boolean = false;
  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _commonService: DashboardsService,
    private _route: ActivatedRoute
  ) {
    this.files = [];
  }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userDetails'));
    this._route.params.subscribe(res => {
      this.incidentID = res["id"];
      this.getOrderDetail();
    });
  }
  getUsers() {
    let params = {
      admin_users: true,
      order_id: this.orderDetail.pk_orderID
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUserLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      let users = [];
      if (res["data"][0].sourceOfIncidentEmployee) {
        users = res["data"][0].sourceOfIncidentEmployee.split(',,');
      }
      users.forEach(user => {
        const [name, email, id, ID] = user.split('::');
        this.usersList.push({ name, email, id, ID });
      });
      let sources = [];
      if (res["sourceOfIncidentSuppliers"][0]["sourceOfIncidentSuppliers"]) {
        sources = res["sourceOfIncidentSuppliers"][0]["sourceOfIncidentSuppliers"].split(',,');
      }
      sources.forEach(element => {
        const [id, name] = element.split('::');
        this.supplierList.push({ id: Number(id), name });
      });
    });
  }
  getReports() {
    let params = {
      incident_report: true,
      incident_report_id: this.incidentID
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.sources = [];
        let sources = []
        if (element.incidentReportSources) {
          sources = element.incidentReportSources.split(',,');
        }
        sources.forEach(source => {
          const [id, name] = source.split('::');
          element.sources.push({ id, name })
        });
      });
      this.dataSource = res["data"];
      this.viewIncidentReport(this.dataSource[0]);
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getOrderDetail() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
      this.isLoading = true;
      this.formModal.blnFianlized = this.orderDetail.blnFinalized;
      this.getUsers();
      this.getIncidentReports();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  viewIncidentReport(item): void {
    this.files = [];
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
    } else {
      this.updateFormModal.source_employee = [];
    }
    let sources = [];
    if (item.incidentReportSources) {
      sources = item.incidentReportSources.split(',,');
    }
    sources.forEach(source => {
      const [id, name] = source.split('::');
      this.updateFormModal.reportsSources.push({ sourceName: name, pk_sourceID: Number(id) });
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
            if (elem.pk_sourceID == 1 || elem.pk_sourceID == 2 || elem.pk_sourceID == 4) {
              return true;
            }
          });
          this.supplierSource = this.updateFormModal.reportsSources.some(elem => {
            if (elem.pk_sourceID == 5) {
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

  viewCreateIncidentReportForm(): void {
    this.isViewCreateIncidentReportForm = !this.isViewCreateIncidentReportForm;
  }
  getIncidentReports() {
    let params = {
      all_report_sources: true
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.reportSources = res["data"];
      this.getReports();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
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
      this.updateFormModal.source_employee = [];
      this.updateFormModal.source_supplier = null;
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
    this._changeDetectorRef.markForCheck();
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
        this.updateFormModal.source_supplier = 0;
        this._changeDetectorRef.markForCheck();
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

  // Update Incident
  updateIncident() {
    const { fk_adminUserID, fk_orderID, fk_storeUserID, fk_storeID, fk_companyID, pk_incidentReportID, sources, sourceEmployeeName, images } = this.updateIncidentObj;
    let { reportsSources, priority1, priority2, priority3, priority4, rerunCost, explanation, corrected, how, recommend, source_supplier, source_employee, blnFinalized } = this.updateFormModal;
    let reports_sources = [];
    reports_sources = reportsSources.map(element => element.pk_sourceID);

    if (!reports_sources.includes(2) && !reports_sources.includes(1) && !reports_sources.includes(4)) {
      source_employee = [];
    }

    let payload: UpdateIncidentReport = {
      store_user_id: this.updateIncidentObj.fk_storeUserID,
      date: this.updateIncidentObj.date,
      priority1: priority1,
      priority2: priority2,
      priority3: priority3,
      priority4: priority4,
      blnFinalized: blnFinalized,
      rerunCost: rerunCost,
      explanation: explanation?.replace(/'/g, "''"),
      corrected: corrected?.replace(/'/g, "''"),
      how: how?.replace(/'/g, "''"),
      recommend: recommend?.replace(/'/g, "''"),
      source_supplier: Number(source_supplier),
      admin_user_id: this.userData.pk_userID,
      source_employee: source_employee,
      incident_sources: reports_sources,
      incident_report_id: pk_incidentReportID,
      order_id: fk_orderID,
      update_incident_report: true
    }
    this.isUpdateLoader = true;
    this._orderService.updateOrderCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getReports();
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
    event.addedFiles.forEach(element => {
      this.files.push(element);
    });
    if ((this.files.length + this.updateIncidentObj.images.length) > 5) {
      this.files = [];
      this._orderService.snackBar("Please select maximum 5 images.");
      return;
    }
    if (this.updateIncidentObj.images.length == 5) {
      this.files = [];
      this._orderService.snackBar("Max limit reached for image upload.");
      return;
    }
    setTimeout(() => {
      this._changeDetectorRef.markForCheck();
    }, 200);
  }
  onRemoveMain(index) {
    this.files.splice(index, 1);
  }
  uploadMultipleImages(incidentID, reports_sources, type) {
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
            if (type != 'uploadImages') {
              this.uploadImageToServer(images, incidentID, reports_sources);
            } else {
              this.uploadImageToServers(images);
            }
          }
        }
      }
    });
  }
  uploadImageToServers(images) {
    let files = [];
    images.forEach((element, index) => {
      let d = new Date();
      let filePath = `/globalAssets/Orders/incidentReportImages/${this.orderDetail.pk_orderID}/${this.incidentID}/${d.getTime() + index}.jpg`;
      files.push({
        image_file: element.imageUpload.split(",")[1],
        image_path: filePath
      });
    });
    this._commonService.uploadMultipleMediaFiles(files).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.files = [];
      this.getIncidentFiles();
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
  updateImages() {
    this.isImageUpdateLoader = true;
    if (this.files.length > 0) {
      this.uploadMultipleImages(this.incidentID, null, 'uploadImages');
    } else {
      let images = [];
      this.updateIncidentObj.images.forEach(image => {
        if (image.isRemove) {
          images.push(image.path.replace('https://assets.consolidus.com/', ''));
        }
      });
      this.removeFiles(images);
    }
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
      this.isImageUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  // Send Incident Email
  sendIncidentEmail(type, imgs, id, sources, formData) {
    let images = [];
    this.updateIncidentObj.images.forEach(element => {
      images.push(element.path);
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
        rerunCost: formData.rerunCost,
        explanation: formData?.explanation?.replace(/'/g, "''"),
        corrected: formData?.corrected?.replace(/'/g, "''"),
        how: formData?.how?.replace(/'/g, "''"),
        recommend: formData?.recommend?.replace(/'/g, "''"),
        fk_companyID: formData.fk_companyID,
        fk_sourceAdminUserID: formData.fk_sourceAdminUserID,
        dateModified: formData.dateModified,
        blnFinalized: formData.blnFinalized,
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
    this._orderService.orderPostCalls(paylaod).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._orderService.snackBar("Incident report updated successfully");
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  removeFiles(images) {
    if (images.length > 0) {
      let payload = {
        files: images,
        delete_multiple_files: true
      }
      this._orderService.removeMedia(payload)
        .subscribe((response) => {
          this._orderService.snackBar('Files Removed Successfully');
          this.updateIncidentObj.images = this.updateIncidentObj.images.filter(item => item.isRemove == false);
          this.isImageUpdateLoader = false;
          this._changeDetectorRef.markForCheck();
        }, err => {
          this.isImageUpdateLoader = false;
          this._changeDetectorRef.markForCheck();
        })
    } else {
      this.isImageUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    }
  }
}


