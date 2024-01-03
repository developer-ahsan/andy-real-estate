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
  selector: 'app-order-processing',
  templateUrl: './order-processing.component.html',
  styles: ["::ng-deep {.ql-container {height: auto}} .mat-paginator {border-radius: 16px !important}"]
})
export class ReportsOrderProcessingComponent implements OnInit, OnDestroy {
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
  };
  generateReport(page) {
    this.generateReportData = null;
    this.employeesReportData = null;
    this.lastYear_report_summary = null;
    this.totalStoreSummary = {
      GRAND_TOTAL: 0,
      GRAND_REVENUE: 0,
      GRAND_ANNUAL: 0,
      GRAND_UPO: 0,
      GRAND_NUM_SALES: 0,
      GRAND_IR: 0,
      GRAND_COI: 0
    }
    this._reportService.setFiltersReport();
    let annual_equ = 0;
    if (this._reportService.ngPlan == 'weekly') {
      annual_equ = 52;
    } else if (this._reportService.ngPlan == 'monthly') {
      annual_equ = 12;
    } else if (this._reportService.ngPlan == 'quarterly') {
      annual_equ = 4;
    } else if (this._reportService.ngPlan == 'yearly') {
      annual_equ = 1;
    }
    this.isGenerateReportLoader = true;
    let params = {
      order_processing_support_report: true,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      annual_equiv_value: annual_equ
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        let reportData = [];
        res["data"].forEach(employees => {
          let index = reportData.findIndex(item => item.pk_userID == employees.pk_userID);
          if (index == -1) {
            reportData.push({ GRAND_TOTAL: employees.GRAND_TOTAL, ANNUAL_EQUIV_GRAND_TOTAL: employees.ANNUAL_EQUIV_GRAND_TOTAL, pk_userID: employees.pk_userID, Name: employees.EmployeeName, Revenue: employees.TOTAL, Annual: employees.ANNUAL_EQUIV, UPO: employees.UPO, IR: employees.IR, COI: employees.COI, NUM_SALES: employees.NUM_SALES, data: [employees] });
          } else {
            reportData[index].Revenue += employees.TOTAL;
            reportData[index].Annual += employees.ANNUAL_EQUIV;
            reportData[index].UPO += employees.UPO;
            reportData[index].IR += employees.IR;
            reportData[index].NUM_SALES += employees.NUM_SALES;
            reportData[index].COI += employees.COI;
            reportData[index].data.push(employees);
          }
        });
        reportData.forEach((element, index) => {
          element.percent = ((Number(element.Revenue) / element.GRAND_TOTAL) * 100).toFixed(2);
          this.totalStoreSummary.GRAND_ANNUAL = element.ANNUAL_EQUIV_GRAND_TOTAL;
          this.totalStoreSummary.GRAND_UPO += element.UPO;
          this.totalStoreSummary.GRAND_NUM_SALES += element.NUM_SALES;
          this.totalStoreSummary.GRAND_IR += element.IR;
          this.totalStoreSummary.GRAND_COI += element.COI;
          this.totalStoreSummary.GRAND_TOTAL = element.GRAND_TOTAL;
        });
        reportData.forEach((element, index) => {
          element.percentPO = Math.round((Number(element.UPO) / this.totalStoreSummary.GRAND_UPO) * 100);
        });
        this.generateReportData = reportData;
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
  calculatePercentageBussiness(element) {

  }
  backToList() {
    this.generateReportData = null;
    this._changeDetectorRef.markForCheck();
  }
  goToSummary() {
    setTimeout(() => {
      this.employeeSummary.nativeElement.scrollIntoView({ behavior: 'smooth' });
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
        { text: 'Order Processing - ' + this._reportService.ngPlan.toUpperCase(), fontSize: 14 },
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
    // Forn Individual Orders
    documentDefinition.content.push(
      {
        table: {
          widths: ['20%', '20%', '10%', '10%', '10%', '10%', '5%', '5%', '10%'],
          body: [
            [
              { text: 'Employee', bold: true },
              { text: 'Store', bold: true },
              { text: 'Revenue', bold: true },
              { text: 'Annual Equiv', bold: true },
              { text: '% of business', bold: true },
              { text: 'UPO', bold: true },
              { text: 'Num. Sales', bold: true },
              { text: 'IR', bold: true },
              { text: 'COI', bold: true }
            ],
          ]
        },
        fontSize: 8
      },
      { text: '', margin: [0, 20, 0, 0] },
    );
    this.generateReportData.forEach(employee => {
      // First Table Data
      employee.data.forEach(element => {
        documentDefinition.content[3].table.body.push(
          [
            employee.Name,
            element.storeName,
            { text: this.currencyPipe.transform(Number(element.TOTAL), 'USD', 'symbol', '1.0-2', 'en-US') },
            { text: this.currencyPipe.transform(Number(element.ANNUAL_EQUIV), 'USD', 'symbol', '1.0-2', 'en-US') },
            { text: element.percentOfBussiness + '%' },
            element.UPO,
            element.NUM_SALES,
            element.IR,
            { text: this.currencyPipe.transform(Number(element.COI), 'USD', 'symbol', '1.0-2', 'en-US') },
          ]
        )
      });
      documentDefinition.content[3].table.body.push(
        [
          { text: 'TOTAL', bold: true },
          {},
          { text: this.currencyPipe.transform(Number(employee.Revenue), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
          { text: this.currencyPipe.transform(Number(employee.Annual), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
          { text: employee.percent + '%', bold: true },
          { text: employee.UPO, bold: true },
          { text: employee.NUM_SALES, bold: true },
          { text: employee.IR, bold: true },
          { text: this.currencyPipe.transform(Number(employee.COI), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
        ]
      )
    });
    documentDefinition.content[3].table.body.push(
      [
        { text: 'GRAND TOTAL', bold: true },
        {},
        { text: this.currencyPipe.transform(Number(this.totalStoreSummary.GRAND_TOTAL), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
        { text: this.currencyPipe.transform(Number(this.totalStoreSummary.GRAND_ANNUAL), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
        {},
        { text: this.totalStoreSummary.GRAND_UPO, bold: true },
        { text: this.totalStoreSummary.GRAND_NUM_SALES, bold: true },
        { text: this.totalStoreSummary.GRAND_IR, bold: true },
        { text: this.currencyPipe.transform(Number(this.totalStoreSummary.GRAND_COI), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true },
      ]
    )
    // // Employee Summary
    documentDefinition.content.push(
      // 5 index
      { text: 'Summary', margin: [0, 2, 0, 5], pageBreak: 'before' },
      // 6 Index
      {
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            [
              { text: 'Employee', bold: true },
              { text: '% of Revenue', bold: true },
              { text: 'NUM. PO', bold: true },
              { text: '% of PO', bold: true }
            ],
          ]
        },
        fontSize: 8
      }
    );
    this.generateReportData.forEach(employee => {
      documentDefinition.content[6].table.body.push(
        [
          employee.Name,
          employee.percent + '%',
          employee.UPO,
          employee.percentPO + '%'
        ]
      )
    });

    pdfMake.createPdf(documentDefinition).download(`Order-Processing-Report-${this._reportService.startDate}-${this._reportService.endDate}.pdf`);
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
