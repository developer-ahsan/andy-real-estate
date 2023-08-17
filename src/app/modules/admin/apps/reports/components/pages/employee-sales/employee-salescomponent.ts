import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { updateCompanySettings } from '../../reports.types';
import { FormControl } from '@angular/forms';
import moment from 'moment';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-employee-sales',
  templateUrl: './employee-sales.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportsEmployeeSalesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // ReportDropdowns
  blnIndividualOrders = 0;
  paymentStatus = 1;
  ngEmployee = 0;

  allEmployees = [];
  searchEmployeesCtrl = new FormControl();
  selectedEmployees: any;
  isSearchingEmployees = false;
  isGenerateReportLoader: boolean;

  generateReportData: any;
  reportPage = 1;
  totalData = 0;
  displayedColumns: string[] = ['store', 'sales', 'py', 'percent', 'difference', 'n_sales', 'pyns', 'avg', 'margin'];
  storeTotals: any = {
    Sales: 0,
    PY: 0,
    percent: 0,
    DIFF: 0,
    NS: 0,
    PYNS: 0,
    AVG: 0,
    MARGIN: 0
  };
  isPdfLoader: boolean = false;
  @ViewChild('topScrollAnchor') topScroll: ElementRef;
  @ViewChild('summaryScrollAnchor') summaryScrollAnchor: ElementRef;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getEmployees();
  };
  getEmployees() {
    let param = {
      employees_list: true,
      size: 10
    }
    this._reportService.getAPIData(param).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allEmployees = this.allEmployees.concat(res["data"]);
      this.selectedEmployees = this.allEmployees[0];
      this.searchEmployeesCtrl.setValue(this.selectedEmployees);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
    let params;
    this.searchEmployeesCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          employees_list: true,
          keyword: res
        }
        return res !== null && res.length >= 2
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allEmployees = [];
        this.isSearchingEmployees = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._reportService.getAPIData(params)
        .pipe(
          finalize(() => {
            this.isSearchingEmployees = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allEmployees = data['data'];
    });
  }
  onSelectedEmployees(ev) {
    this.selectedEmployees = ev.option.value;
  }
  displayWithEmployees(value: any) {
    let name = value?.firstName + ' ' + value?.lastName;
    return name;
  }
  // Reports
  generateReport() {
    this.generateReportData = null;
    this._reportService.setFiltersReport();
    if (!this.selectedEmployees) {
      this._reportService.snackBar('Please select an employee');
      return;
    }
    this.isGenerateReportLoader = true;
    setTimeout(() => {
      let params = {
        employee_sales_report: true,
        start_date: this._reportService.startDate,
        end_date: this._reportService.endDate,
        user_id: Number(this.selectedEmployees.pk_userID),
        isIndividualOrder: this.blnIndividualOrders,
        payment_status: this.paymentStatus,
      }
      this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["data"].length > 0) {
          if (this.blnIndividualOrders == 1) {
            res["data"].forEach(element => {
              element.storeDetails = [];
              let details;
              if (element.DETAILS) {
                details = element.DETAILS.split(',,');
                details.forEach(prod => {
                  let data = prod.split('===');
                  let paid = false;
                  if (data[6]) {
                    paid = true;
                  }
                  let statusColor = '';
                  let statusValue = '';
                  let status = Number(data[8]);
                  if (status == 1 || status == 2 || status == 3 || status == 4) {
                    statusValue = 'Processing';
                    statusColor = 'text-gray-500';
                  } else if (status == 5) {
                    statusValue = 'Shipped';
                    statusColor = 'text-green-500';
                  } else if (status == 6) {
                    statusValue = 'Delivered';
                    statusColor = 'text-green-500';
                  } else if (status == 7) {
                    statusValue = 'P.O. Needed';
                    statusColor = 'text-purple-500';
                  } else if (status == 8) {
                    statusValue = 'Picked up';
                    statusColor = 'text-green-500';
                  } else if (status == 10) {
                    statusValue = 'Awaiting Group Order';
                    statusColor = 'text-orange-500';
                  } else {
                    statusValue = 'N/A';
                  }
                  element.storeDetails.push({ date: data[0], id: data[1], company: data[2], location: data[3], sale: data[4], tax: data[5], margin: Number(data[7]).toFixed(2), paid: paid, status: statusValue, statusColor: statusColor });
                });
              }
            });
            res["data"].forEach((store) => {
              store.date_data = [];
              store.storeDetails.forEach(element => {
                let date_check = moment(element.date).format('MMM,yyyy');
                if (store.date_data.length == 0) {
                  store.date_data.push({ date: moment(element.date).format('MMM,yyyy'), data: [element] });
                } else {
                  const d_index = store.date_data.findIndex(date => date.date == date_check);
                  if (d_index < 0) {
                    store.date_data.push({ date: moment(element.date).format('MMM,yyyy'), data: [element] });
                  } else {
                    store.date_data[d_index].data.push(element);
                  }
                }
              });
            });
          }
          this.generateReportData = res["data"];
          this.totalData = res["totalRecords"];
          this.generateReportData.forEach(element => {
            if (element.SALES > element.PY) {
              element.blnPercent = true;
              const diff = element.SALES - element.PY;
              if (element.PY == 0) {
                element.percent = 100;
              } else {
                element.percent = (diff / element.PY) * 100;
              }
            } else if (element.SALES < element.PY) {
              element.blnPercent = false;
              const diff = element.PY - element.SALES;
              if (element.SALES == 0) {
                element.percent = 100;
              } else {
                element.percent = (diff / element.SALES) * 100;
              }
            } else {
              element.percent = 0;
            }
            this.storeTotals.Sales = Number(this.storeTotals.Sales) + Number(element.SALES);
            this.storeTotals.PY = Number(this.storeTotals.PY) + Number(element.PY);
            this.storeTotals.percent = Number(this.storeTotals.percent) + Number(element.percent);
            this.storeTotals.DIFF = Number(this.storeTotals.DIFF) + Number(element.DIFF);
            this.storeTotals.NS = Number(this.storeTotals.NS) + Number(element.NS);
            this.storeTotals.PYNS = Number(this.storeTotals.PYNS) + Number(element.PYNS);
            this.storeTotals.AVG = Number(this.storeTotals.AVG) + Number(element.AVG);
            this.storeTotals.MARGIN = Number(this.storeTotals.MARGIN) + Number(element.MARGIN);
          });
          console.log(this.storeTotals);
          this.backtoTop();
        } else {
          this.generateReportData = null;
          this._reportService.snackBar('No records found for this user');
        }
        this.isGenerateReportLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isGenerateReportLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    }, 100);
  }
  backToList() {
    this.generateReportData = null;
    this._changeDetectorRef.markForCheck();
  }
  getNextReportData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.reportPage++;
    } else {
      this.reportPage--;
    };
    this.generateReport();
  };
  goToSummary() {
    setTimeout(() => {
      this.summaryScrollAnchor.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  backtoTop() {
    setTimeout(() => {
      this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  public exportHtmlToPDF() {
    this.isPdfLoader = true;
    let element = document.getElementById('htmltable');
    var positionInfo = element.getBoundingClientRect();
    var height = positionInfo.height;
    var width = positionInfo.width;
    var top_left_margin = 15;
    var margin_top = 30; // Set the top margin value
    var margin_bottom = 30; // Set the bottom margin value
    let PDF_Width = width + (top_left_margin * 2);
    var PDF_Height = (PDF_Width * 1.5) + (margin_top + margin_bottom); // Apply the margins here
    var canvas_image_width = width;
    var canvas_image_height = height;

    var totalPDFPages = Math.ceil(height / PDF_Height) - 1;
    let data = document.getElementById('htmltable');
    const file_name = `EmployeeSalesReport_${new Date().getTime()}.pdf`;
    html2canvas(data, { useCORS: true }).then(canvas => {
      canvas.getContext('2d');
      var imgData = canvas.toDataURL("image/jpeg", 1.0);
      var pdf = new jsPDF('p', 'pt', [PDF_Width, PDF_Height]);
      pdf.addImage(imgData, 'jpeg', top_left_margin, margin_top, canvas_image_width, canvas_image_height); // Apply top margin here

      for (var i = 1; i <= totalPDFPages; i++) {
        pdf.addPage([PDF_Width, PDF_Height]);
        pdf.addImage(imgData, 'jpeg', top_left_margin, -(PDF_Height * i) + (margin_top * (2 * i + 1)), canvas_image_width, canvas_image_height); // Adjust the position calculation for the top margin
      }
      pdf.save(file_name);
      this.isPdfLoader = false;
      this._changeDetectorRef.markForCheck();
    });

  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}