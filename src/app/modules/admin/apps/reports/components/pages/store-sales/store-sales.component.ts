import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import moment from 'moment';
import * as pdfMake from "pdfmake/build/pdfmake";
import { CurrencyPipe } from '@angular/common';
@Component({
  selector: 'app-store-sales',
  templateUrl: './store-sales.component.html',
  styles: ["::ng-deep {.ql-container {height: auto}} .mat-paginator {border-radius: 16px !important}"]
})
export class ReportsStoreSalesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('topScrollAnchor') topScroll: ElementRef;
  @ViewChild('storesSummary') storesSummary: ElementRef;
  @ViewChild('employeeSummary') employeeSummary: ElementRef;
  @ViewChild('ytdSummary') ytdSummary: ElementRef;
  @Input() isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  allStates = [];
  searchStatesCtrl = new FormControl();
  selectedStates: any;
  isSearchingStates = false;

  allPromoCodes = [];
  searchPromoCodesCtrl = new FormControl();
  selectedPromoCodes: any;
  isSearchingPromoCodes = false;

  isGenerateReportLoader: boolean = false;


  // ReportDropdowns
  reportType = 0;
  blnShowCancelled = 0;
  paymentStatus = 1;
  blnYTD = 0;
  blnIndividualOrders = 0;
  state = '';
  promocode = '';
  blnCost = false;

  storesList = [];
  storesLoader: boolean = false;
  storesPage = 1;
  totalStores = 0;

  generateReportData: any;
  totalStoreSummary: any;
  employeesReportData: any;
  lastYear_report_summary: any;
  lastYearTotal: any;

  reportPage = 1;
  totalData = 0;
  displayedColumns: string[] = ['store', 'sales', 'py', 'percent', 'difference', 'n_sales', 'pyns', 'avg', 'margin'];

  currentYear = moment().format('yyyy');
  currentDate = moment().subtract(1, 'year').format('MM/DD/YYYY');
  currentYearCheck = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public _reportService: ReportsService,
    private currencyPipe: CurrencyPipe,
    private commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.getStores();
    this.getStates();
    this.getPromoCodes();
  };
  getStores() {
    this.commonService.storesData$.pipe(
      takeUntil(this._unsubscribeAll),
      map(res => res["data"].filter(element => element.blnActive))
    ).subscribe(filteredData => {
      filteredData.forEach(element => {
        element.isChecked = true;
      });
      this.storesList.push(...filteredData);
    });
  }
  getStates() {
    const storedValue = JSON.parse(sessionStorage.getItem('storeStateSupplierData'));
    this.allStates.push({ name: 'All States', pk_stateID: '' });
    this.allStates = this.allStates.concat(this.splitData(storedValue.data[2][0].states, 'states'));
    this.selectedStates = this.allStates[0];
  }
  getPromoCodes() {
    const storedValue = JSON.parse(sessionStorage.getItem('storeStateSupplierData'));
    this.allPromoCodes.push({ promocode: 'Any Promocode' });
    this.allPromoCodes = this.allPromoCodes.concat(this.splitData(storedValue.data[3][0].promocodes, 'promos'));
    this.selectedPromoCodes = this.allPromoCodes[0];
    this._changeDetectorRef.markForCheck();
  }
  splitData(data, type) {
    const dataArray = data.split(",,");
    const result = [];
    if (type == 'states') {
      dataArray.forEach(item => {
        const [id, state, name, index] = item.split("::");
        result.push({ pk_stateID: parseInt(id), name });
      });
    } else {
      dataArray.forEach(item => {
        const [promocode, active] = item.split("::");
        result.push({ promocode, active });
      });
    }
    return result;
  }
  selectedUnSelected(check) {
    if (check) {
      this.storesList.forEach(element => {
        element.isChecked = true;
      });
    } else {
      this.storesList.forEach(element => {
        element.isChecked = false;
      });
    }
  }
  generateReport(page) {
    this.generateReportData = null;
    this.employeesReportData = null;
    this.lastYear_report_summary = null;
    this.totalStoreSummary = {
      TAX: 0,
      SALES: 0,
      PY: 0,
      percent: 0,
      DIFF: 0,
      NS: 0,
      PYNS: 0,
      AVG: 0,
      MARGIN: 0,
      COST: 0,
      PRICE: 0,
      blnPercent: false
    }
    this.lastYearTotal = {
      SALES: 0,
      PY: 0,
      PERCENT: 0,
      NS: 0,
      PYNS: 0,
      blnPercent: false
    }
    this._reportService.setFiltersReport();
    if (this.currentYear == moment(this._reportService.endDate).format('yyyy')) {
      this.currentYearCheck = true;
    }
    const selectedStores = this.storesList
      .filter(element => element.isChecked)
      .map(element => element.pk_storeID);
    if (selectedStores.length == 0) {
      this._reportService.snackBar('Please select at least 1 store');
      return;
    }
    this.isGenerateReportLoader = true;
    let state = '';
    if (this.selectedStates.name != 'All States') {
      state = this.selectedStates.name;
    }
    let promo = '';
    if (this.selectedPromoCodes.promocode != 'Any Promocode') {
      promo = this.selectedPromoCodes.promocode;
    }
    let params = {
      is_weekly: this._reportService.ngPlan == 'weekly' ? true : false,
      store_sales_report: true,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      store_list: selectedStores.toString(),
      payment_status: this.paymentStatus,
      report_type: this.reportType,
      show_cancelled_order: this.blnShowCancelled,
      is_individual: this.blnIndividualOrders,
      is_ytd: this.blnYTD,
      state: state,
      last_year_start_date: this._reportService.lastStartDate,
      last_year_end_date: this._reportService.lastEndDate,
      promo_code: promo
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["report_summary"].length > 0) {
        res["report_summary"].forEach(element => {
          if (this.blnIndividualOrders == 1) {
            if (element.DETAILS) {
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
                    statusValue: ''
                  };
                  if (data[8] == 1) {
                    sattusData.statusColor = 'text-red-700';
                    sattusData.statusValue = 'Cancelled';
                  } else if (data[9] == 1) {
                    sattusData.statusColor = 'text-red-700';
                    sattusData.statusValue = 'Closed';
                  } else {
                    sattusData = this._reportService.getStatusValue(data[7]);
                  }
                  element.storeDetails.push({ date: data[0], id: data[1], company: data[2], sale: data[3], tax: data[4], margin: Number(data[5]) ? Number(data[5])?.toFixed(2) : 0.0, paid: paid, status: sattusData.statusValue, statusColor: sattusData.statusColor, cost: Number(data[10]) });
                });
              }
            }
          }

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
          this.totalStoreSummary.SALES += element.SALES;
          this.totalStoreSummary.PY += element.PY;
          this.totalStoreSummary.NS += element.NS;
          this.totalStoreSummary.PYNS += element.PYNS;
          this.totalStoreSummary.COST += element.cost;
          this.totalStoreSummary.PRICE += element.price;
          this.totalStoreSummary.TAX += element.tax;
        });
        if (this.blnIndividualOrders) {
          res["report_summary"].forEach((store) => {
            store.date_data = [];
            if (store?.storeDetails) {
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
            }
          });
        }
        if (this.totalStoreSummary.SALES > this.totalStoreSummary.PY) {
          this.totalStoreSummary.blnPercent = true;
          const diff = this.totalStoreSummary.SALES - this.totalStoreSummary.PY;
          if (this.totalStoreSummary.PY == 0) {
            this.totalStoreSummary.PERCENT = 100;
          } else {
            this.totalStoreSummary.PERCENT = Math.round((diff / this.totalStoreSummary.PY) * 100);
          }
        } else if (this.totalStoreSummary.SALES < this.totalStoreSummary.PY) {
          this.totalStoreSummary.blnPercent = false;
          const diff = this.totalStoreSummary.PY - this.totalStoreSummary.SALES;
          if (this.totalStoreSummary.SALES == 0) {
            this.totalStoreSummary.PERCENT = 100;
          } else {
            this.totalStoreSummary.PERCENT = Math.round((diff / this.totalStoreSummary.PY) * 100);
          }
        } else {
          this.totalStoreSummary.PERCENT = 0;
        }
        this.totalStoreSummary.AVG = this.totalStoreSummary.SALES / this.totalStoreSummary.NS;
        this.totalStoreSummary.MARGIN = Math.ceil(((this.totalStoreSummary.PRICE - this.totalStoreSummary.COST) / this.totalStoreSummary.PRICE) * 10000) / 100;
        this.totalStoreSummary.DIFF = this.totalStoreSummary.SALES - this.totalStoreSummary.PY;

        this.generateReportData = res["report_summary"];
        this.employeesReportData = res["employee_summary"];

        // Last Year
        if (this.blnYTD) {
          res["lastYear_report_summary"].forEach(element => {
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
            this.lastYearTotal.SALES += element.SALES;
            this.lastYearTotal.PY += element.PY;
            this.lastYearTotal.NS += element.NS;
            this.lastYearTotal.PYNS += element.PYNS;
          });
          if (this.lastYearTotal.SALES > this.lastYearTotal.PY) {
            this.lastYearTotal.blnPercent = true;
            const diff = this.lastYearTotal.SALES - this.lastYearTotal.PY;
            if (this.lastYearTotal.PY == 0) {
              this.lastYearTotal.PERCENT = 100;
            } else {
              this.lastYearTotal.PERCENT = Math.round((diff / this.lastYearTotal.PY) * 100);
            }
          } else if (this.lastYearTotal.SALES < this.lastYearTotal.PY) {
            this.lastYearTotal.blnPercent = false;
            const diff = this.lastYearTotal.PY - this.lastYearTotal.SALES;
            if (this.lastYearTotal.SALES == 0) {
              this.lastYearTotal.PERCENT = 100;
            } else {
              this.lastYearTotal.PERCENT = Math.round((diff / this.lastYearTotal.PY) * 100);
            }
          } else {
            this.lastYearTotal.PERCENT = 0;
          }
          this.lastYear_report_summary = res["lastYear_report_summary"];
        }
      } else {
        this.generateReportData = null;
        this._reportService.snackBar('No records found');
      }
      this.backtoTop();
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backToList() {
    this.generateReportData = null;
    this._changeDetectorRef.markForCheck();
  }
  goToSummary() {
    setTimeout(() => {
      this.storesSummary.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  goToEmployeeSummary() {
    setTimeout(() => {
      this.employeeSummary.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  goToYTDSummary() {
    setTimeout(() => {
      this.ytdSummary.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  backtoTop() {
    setTimeout(() => {
      this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  generatePdf() {
    const documentDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [10, 10, 10, 10],
      content: [
        // Add a title for your PDF
        { text: this._reportService.ngPlan.toUpperCase(), fontSize: 14 },
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
    let summaryIndex = 4;
    let employeeIndex = 6;
    let ytDIndex = 8;
    // Forn Individual Orders
    if (this.blnIndividualOrders == 1) {
      summaryIndex = 7;
      employeeIndex = 9;
      ytDIndex = 11;
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
      this.generateReportData.forEach(store => {
        // First Table Data
        documentDefinition.content[3].table.body.push(
          [
            { text: store.storeName, colSpan: 3, alignment: 'left', bold: true, margin: [0, 3, 0, 3], fontSize: 10 }, {}, {},
            { text: this.currencyPipe.transform(Number(store.SALES), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
            { text: this.currencyPipe.transform(Number(store.tax), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
            { text: store.MARGIN + '%', bold: true, margin: [0, 3, 0, 3] },
            { text: '', margin: [0, 3, 0, 3] },
            { text: '', margin: [0, 3, 0, 3] }
          ]
        )
        // date data
        if (store.date_data) {
          store.date_data.forEach(dateData => {
            documentDefinition.content[3].table.body.push(
              [
                { text: dateData.date, fontSize: 10, colSpan: 8, alignment: 'center', bold: true, margin: [0, 3, 0, 3] }, {}, {}, {}, {}, {}, {}, {}
              ]
            )
            dateData.data.forEach(d => {
              let paid = 'No';
              if (d.paid) {
                paid = 'Yes';
              }
              documentDefinition.content[3].table.body.push(
                [
                  moment(d.date).format('MM/DD/yyyy'),
                  d.id,
                  d.company,
                  this.currencyPipe.transform(Number(d.sale), 'USD', 'symbol', '1.0-2', 'en-US'),
                  this.currencyPipe.transform(Number(d.tax), 'USD', 'symbol', '1.0-2', 'en-US'),
                  d.margin + '%',
                  paid,
                  d.status
                ]
              )
            });
          });
        }
      });
    }
    // Store Summary
    documentDefinition.content.push(
      { text: 'Report Summary', margin: [0, 2, 0, 5] },
      {
        table: {
          widths: ['24%', '10%', '10%', '9%', '10%', '9%', '9%', '9%', '10%'],
          body: [
            [
              { text: 'Store', bold: true },
              { text: 'Sales', bold: true },
              { text: 'PY', bold: true },
              { text: '%', bold: true },
              { text: 'Diff', bold: true },
              { text: 'NS', bold: true },
              { text: 'PYNS', bold: true },
              { text: 'Avg', bold: true },
              { text: 'Margin', bold: true }
            ],
          ]
        },
        fontSize: 8
      }
    );
    this.generateReportData.forEach(store => {
      documentDefinition.content[summaryIndex].table.body.push(
        [
          store.storeName,
          this.currencyPipe.transform(Number(store.SALES), 'USD', 'symbol', '1.0-2', 'en-US'),
          this.currencyPipe.transform(Number(store.PY), 'USD', 'symbol', '1.0-2', 'en-US'),
          `${store.percent ? store.percent?.toFixed(2) : 0.0}%`,
          this.currencyPipe.transform(Number(store.DIFF), 'USD', 'symbol', '1.0-2', 'en-US'),
          store.NS,
          store.PYNS,
          this.currencyPipe.transform(Number(store.AVG), 'USD', 'symbol', '1.0-2', 'en-US'),
          `${store.MARGIN ? store.MARGIN?.toFixed(2) : 0.0}%`
        ]
      )
    });
    documentDefinition.content[summaryIndex].table.body.push(
      [
        { text: 'Grand Total', bold: true },
        { text: this.currencyPipe.transform(Number(this.totalStoreSummary.SALES), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
        { text: this.currencyPipe.transform(Number(this.totalStoreSummary.PY), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
        { text: `${this.totalStoreSummary?.percent}%`, bold: true },
        { text: this.currencyPipe.transform(Number(this.totalStoreSummary.DIFF), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
        { text: this.totalStoreSummary.NS, bold: true },
        { text: this.totalStoreSummary.PYNS, bold: true },
        { text: this.currencyPipe.transform(Number(this.totalStoreSummary?.AVG), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
        { text: this.totalStoreSummary?.MARGIN ? `${this.totalStoreSummary?.MARGIN}%` : '0.00%', bold: true }
      ]
    )
    // Employee Summary
    documentDefinition.content.push(
      // 5 index
      { text: 'Employee Sales Summary', margin: [0, 2, 0, 5], pageBreak: 'before' },
      // 6 Index
      {
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            [
              { text: 'EMPLOYEE', bold: true },
              { text: 'TOTAL SALES', bold: true },
              { text: 'NUM. SALES', bold: true },
              { text: 'AVG SALE', bold: true }
            ],
          ]
        },
        fontSize: 8
      }
    );
    this.employeesReportData.forEach(employee => {
      documentDefinition.content[employeeIndex].table.body.push(
        [
          employee.EMPLOYEE,
          this.currencyPipe.transform(Number(employee.TOTAL_SALES), 'USD', 'symbol', '1.0-2', 'en-US'),
          employee.NUM_SALES,
          this.currencyPipe.transform(Number(employee.AVG), 'USD', 'symbol', '1.0-2', 'en-US'),
        ]
      )
    });

    // YTD SALE
    if (this.blnYTD) {
      documentDefinition.content.push(
        { text: 'YTD Summary', margin: [0, 2, 0, 5] },
        {
          table: {
            widths: ['30%', '20%', '15%', '15%', '10%', '10%'],
            body: [
              [
                { text: 'Store', bold: true },
                { text: 'Sales', bold: true },
                { text: 'PY', bold: true },
                { text: '%', bold: true },
                { text: 'NS', bold: true },
                { text: 'PYNS', bold: true }
              ],
            ]
          },
          fontSize: 8
        }
      );
      this.lastYear_report_summary.forEach(store => {
        documentDefinition.content[ytDIndex].table.body.push(
          [
            store.storeName,
            this.currencyPipe.transform(Number(store.SALES), 'USD', 'symbol', '1.0-2', 'en-US'),
            this.currencyPipe.transform(Number(store.PY), 'USD', 'symbol', '1.0-2', 'en-US'),
            `${store.percent ? store.percent?.toFixed(2) : 0.0}%`,
            store.NS,
            store.PYNS,
          ]
        )
      });
      documentDefinition.content[ytDIndex].table.body.push(
        [
          { text: 'Grand Total', bold: true },
          { text: this.currencyPipe.transform(Number(this.lastYearTotal.SALES), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
          { text: this.currencyPipe.transform(Number(this.lastYearTotal.PY), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
          { text: `${this.lastYearTotal?.PERCENT}%`, bold: true },
          { text: this.lastYearTotal.NS, bold: true },
          { text: this.lastYearTotal.PYNS, bold: true }
        ]
      )
    }
    pdfMake.createPdf(documentDefinition).download(`Store-Sales-Report-${this._reportService.startDate}-${this._reportService.endDate}.pdf`);
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
