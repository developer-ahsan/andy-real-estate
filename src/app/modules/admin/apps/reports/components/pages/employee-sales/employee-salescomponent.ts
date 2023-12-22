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
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { CurrencyPipe } from '@angular/common';
import { environment } from 'environments/environment';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
    MARGIN: 0,
    blnPercent: false
  };
  isPdfLoader: boolean = false;
  @ViewChild('topScrollAnchor') topScroll: ElementRef;
  @ViewChild('summaryScrollAnchor') summaryScrollAnchor: ElementRef;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef, private currencyPipe: CurrencyPipe,
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
      res["data"].forEach(element => {
        let employees = [];
        if (element.flpsUsers) {
          let emp = element.flpsUsers.split(',');
          emp.forEach(user => {
            let data_emp = user.split(':');
            this.allEmployees.push({ pk_userID: Number(data_emp[0]), name: data_emp[2] });
          });
        }
      });
      // this.allEmployees = this.allEmployees.concat(res["data"]);
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
    this.storeTotals = {
      COST: 0,
      Price: 0,
      Sales: 0,
      PY: 0,
      percent: 0,
      DIFF: 0,
      tax: 0,
      NS: 0,
      PYNS: 0,
      AVG: 0,
      MARGIN: 0,
      blnPercent: false
    };
    let is_weekly = false;
    if (this._reportService.ngPlan == 'weekly') {
      is_weekly = true;
    }
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
        is_weekly: is_weekly,
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
                  let sattusData = {
                    statusColor: '',
                    statusValue: '',
                    textColor: ''
                  };
                  if (data[10] == 1) {
                    sattusData.statusColor = 'text-red-500';
                    sattusData.statusValue = 'Cancelled';
                    sattusData.textColor = 'red';
                  } else if (data[9] == 1) {
                    sattusData.statusColor = 'text-red-500';
                    sattusData.statusValue = 'Closed';
                    sattusData.textColor = 'red';
                  } else {
                    sattusData = this._reportService.getStatusValue(data[8]);
                  }

                  element.storeDetails.push({ date: data[0], id: data[1], company: data[2], location: data[3], sale: data[4], tax: data[5], margin: Number(data[7])?.toFixed(2), paid: paid, status: sattusData.statusValue, statusColor: sattusData.statusColor, statusTextColor: sattusData.textColor });
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
                element.percent = Math.round((diff / element.PY) * 100);
              }
            } else if (element.SALES < element.PY) {
              element.blnPercent = false;
              const diff = element.PY - element.SALES;
              if (element.SALES == 0) {
                element.percent = 100;
              } else {
                element.percent = Math.round((diff / element.PY) * 100);
              }
            } else {
              element.percent = 0;
            }
            this.storeTotals.Sales = Number(this.storeTotals.Sales) + Number(element.SALES);
            this.storeTotals.PY = Number(this.storeTotals.PY) + Number(element.PY);
            this.storeTotals.tax = Number(this.storeTotals.tax) + Number(element.tax);
            this.storeTotals.DIFF = Number(this.storeTotals.DIFF) + Number(element.DIFF);
            this.storeTotals.NS = Number(this.storeTotals.NS) + Number(element.NS);
            this.storeTotals.PYNS = Number(this.storeTotals.PYNS) + Number(element.PYNS);
            this.storeTotals.AVG = Number(this.storeTotals.AVG) + Number(element.AVG);
            this.storeTotals.COST += Number(element.cost);
            this.storeTotals.Price += Number(element.price);
          });
          if (this.storeTotals.Sales > this.storeTotals.PY) {
            this.storeTotals.blnPercent = true;
            const diff = this.storeTotals.Sales - this.storeTotals.PY;
            if (this.storeTotals.PY == 0) {
              this.storeTotals.percent = 100;
            } else {
              this.storeTotals.percent = Math.round((diff / this.storeTotals.PY) * 100);
            }
          } else if (this.storeTotals.Sales < this.storeTotals.PY) {
            this.storeTotals.blnPercent = false;
            const diff = this.storeTotals.PY - this.storeTotals.Sales;
            if (this.storeTotals.Sales == 0) {
              this.storeTotals.percent = 100;
            } else {
              this.storeTotals.percent = Math.round((diff / this.storeTotals.PY) * 100);
            }
          } else {
            this.storeTotals.percent = 0;
          }
          var p = Math.pow(10, 2);
          // this.storeTotals.MARGIN = parseFloat(((this.storeTotals.Price - this.storeTotals.COST) / this.storeTotals.Price * 100).toFixed(2));
          this.storeTotals.MARGIN = Math.floor(((this.storeTotals.Price - this.storeTotals.COST) / this.storeTotals.Price) * 10000) / 100;
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
  generatePdf() {
    this.isPdfLoader = true;
    const documentDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [10, 10, 10, 10],
      content: [
        // Add a title for your PDF
        { text: this._reportService.ngPlan.toUpperCase(), fontSize: 14 },
        { text: this.selectedEmployees.name, fontSize: 10 },
        { text: 'Range: ' + this._reportService.startDate + ' - ' + this._reportService.endDate, fontSize: 10 },
        // Add a spacer element to create a margin above the table
        { text: '', margin: [0, 20, 0, 0] },
      ],
      styles: {
        tableHeader: {
          bold: true
        }
      }
    };

    if (this.blnIndividualOrders == 1) {
      documentDefinition.content.push(
        {
          table: {
            widths: ['*', '*', '*', '*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'Date', bold: true },
                { text: 'ID', bold: true },
                { text: 'Company', bold: true },
                { text: 'Sale', bold: true },
                { text: 'Tax', bold: true },
                { text: 'Margin', bold: true },
                { text: 'Paid', bold: true },
                { text: 'Status', bold: true }
              ],
            ]
          },
          fontSize: 8
        },
        { text: '', margin: [0, 20, 0, 0] },
      );
      // Add Report Data
      documentDefinition.content.push(
        { text: '', pageBreak: 'after' }
      )
      // Report Summary
      documentDefinition.content.push(
        { text: 'Report Summary', margin: [0, 2, 0, 5] },
        {
          table: {
            widths: ['15%', '10%', '10%', '9%', '10%', '9%', '9%', '9%', '10%', '9%'],
            body: [
              [
                { text: 'Store', bold: true },
                { text: 'Sales', bold: true },
                { text: 'PY', bold: true },
                { text: '%', bold: true },
                { text: 'Diff', bold: true },
                { text: 'NS', bold: true },
                { text: 'PYNS', bold: true },
                { text: 'Diff', bold: true },
                { text: 'Avg', bold: true },
                { text: 'Margin', bold: true }
              ],
            ]
          },
          fontSize: 8
        }
      );
      this.generateReportData.forEach(store => {
        if (store.date_data.length > 0) {
          // First Table Data
          documentDefinition.content[4].table.body.push(
            [
              { text: store.storeName, colSpan: 3, alignment: 'left', bold: true, margin: [0, 3, 0, 3], fontSize: 10 }, {}, {},
              { text: this.currencyPipe.transform(Number(store.SALES), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
              { text: this.currencyPipe.transform(Number(store.tax), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
              { text: store.MARGIN ? store.MARGIN?.toFixed(2) + '%' : '0.00%', bold: true, margin: [0, 3, 0, 3] },
              { text: '', margin: [0, 3, 0, 3] },
              { text: '', margin: [0, 3, 0, 3] }
            ]
          )
          // date data

          store.date_data.forEach(dateData => {
            documentDefinition.content[4].table.body.push(
              [
                { text: dateData.date, fontSize: 10, colSpan: 8, alignment: 'center', bold: true, margin: [0, 3, 0, 3] }, {}, {}, {}, {}, {}, {}, {}
              ]
            )
            dateData.data.forEach(d => {
              let paid = 'No';
              if (d.paid) {
                paid = 'Yes';
              }
              documentDefinition.content[4].table.body.push(
                [
                  moment(d.date).format('MM/DD/yyyy'),
                  { text: d.id, link: `${environment.siteDomain}apps/orders/${d.id}` },
                  d.company,
                  this.currencyPipe.transform(Number(d.sale), 'USD', 'symbol', '1.0-2', 'en-US'),
                  this.currencyPipe.transform(Number(d.tax), 'USD', 'symbol', '1.0-2', 'en-US'),
                  d.margin ? d.margin + '%' : '0.00%',
                  paid,
                  { text: d.status, color: d.statusTextColor, bold: true }
                ]
              )
            });
          });
        }
        // report Summary Data
        documentDefinition.content[8].table.body.push(
          [
            store.storeName,
            this.currencyPipe.transform(Number(store.SALES), 'USD', 'symbol', '1.0-2', 'en-US'),
            this.currencyPipe.transform(Number(store.PY), 'USD', 'symbol', '1.0-2', 'en-US'),
            { text: `${store.percent?.toFixed(2)}%`, color: store?.blnPercent ? 'green' : 'red' },
            { text: this.currencyPipe.transform(Number(store.DIFF), 'USD', 'symbol', '1.0-2', 'en-US'), color: store?.DIFF >= 0 ? 'green' : 'red' },
            store.NS,
            store.PYNS,
            store.NS_DIFF,
            this.currencyPipe.transform(Number(store.AVG), 'USD', 'symbol', '1.0-2', 'en-US'),
            store.MARGIN ? `${store.MARGIN?.toFixed(2)}%` : '0.00%'
          ]
        )
      });
      documentDefinition.content[8].table.body.push(
        [
          { text: 'Grand Total', bold: true },
          { text: this.currencyPipe.transform(Number(this.storeTotals.Sales), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
          { text: this.currencyPipe.transform(Number(this.storeTotals.PY), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
          { text: `${(this.storeTotals?.percent)?.toFixed(2)}%`, color: this.storeTotals?.blnPercent ? 'green' : 'red', bold: true },
          { text: this.currencyPipe.transform(Number(this.storeTotals.DIFF), 'USD', 'symbol', '1.0-2', 'en-US'), color: this.storeTotals?.DIFF >= 0 ? 'green' : 'red', bold: true },
          { text: this.storeTotals.NS, bold: true },
          { text: this.storeTotals.PYNS, bold: true },
          { text: '', bold: true },
          { text: this.currencyPipe.transform(Number((this.storeTotals?.Sales / this.storeTotals?.NS)), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
          { text: `${this.storeTotals?.MARGIN?.toFixed(2)}%`, bold: true }
        ]
      )
    } else {
      documentDefinition.content.push(
        { text: 'Report Summary', margin: [0, 2, 0, 5] },
        {
          table: {
            widths: ['15%', '10%', '10%', '9%', '10%', '9%', '9%', '9%', '10%', '9%'],
            body: [
              [
                { text: 'Store', bold: true },
                { text: 'Sales', bold: true },
                { text: 'PY', bold: true },
                { text: '%', bold: true },
                { text: 'Diff', bold: true },
                { text: 'NS', bold: true },
                { text: 'PYNS', bold: true },
                { text: 'Diff', bold: true },
                { text: 'Avg', bold: true },
                { text: 'Margin', bold: true }
              ],
            ]
          },
          fontSize: 8
        }
      );
      this.generateReportData.forEach(store => {
        documentDefinition.content[5].table.body.push(
          [
            store.storeName,
            this.currencyPipe.transform(Number(store.SALES), 'USD', 'symbol', '1.0-2', 'en-US'),
            this.currencyPipe.transform(Number(store.PY), 'USD', 'symbol', '1.0-2', 'en-US'),
            { text: `${store.percent?.toFixed(2)}%`, color: store?.blnPercent ? 'green' : 'red' },
            { text: this.currencyPipe.transform(Number(store.DIFF), 'USD', 'symbol', '1.0-2', 'en-US'), color: store?.DIFF >= 0 ? 'green' : 'red' },
            store.NS,
            store.PYNS,
            store.NS_DIFF,
            this.currencyPipe.transform(Number(store.AVG), 'USD', 'symbol', '1.0-2', 'en-US'),
            store.MARGIN ? `${store.MARGIN?.toFixed(2)}%` : '0.00%'
          ]
        )
      });
      documentDefinition.content[5].table.body.push(
        [
          { text: 'Grand Total', bold: true },
          { text: this.currencyPipe.transform(Number(this.storeTotals.Sales), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
          { text: this.currencyPipe.transform(Number(this.storeTotals.PY), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
          { text: `${(this.storeTotals?.percent)?.toFixed(2)}%`, color: this.storeTotals?.blnPercent ? 'green' : 'red', bold: true },
          { text: this.currencyPipe.transform(Number(this.storeTotals.DIFF), 'USD', 'symbol', '1.0-2', 'en-US'), color: this.storeTotals?.DIFF >= 0 ? 'green' : 'red', bold: true },
          { text: this.storeTotals.NS, bold: true },
          { text: this.storeTotals.PYNS, bold: true },
          { text: '', bold: true },
          { text: this.currencyPipe.transform(Number((this.storeTotals?.Sales / this.storeTotals?.NS)), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
          { text: this.storeTotals?.MARGIN ? `${this.storeTotals?.MARGIN?.toFixed(2)}%` : '0.00%', bold: true }
        ]
      )
    }
    pdfMake.createPdf(documentDefinition).download(`${this.selectedEmployees.name}-Sales-Report-${this._reportService.startDate}-${this._reportService.endDate}.pdf`);
    this.isPdfLoader = false;
    this._changeDetectorRef.markForCheck();
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