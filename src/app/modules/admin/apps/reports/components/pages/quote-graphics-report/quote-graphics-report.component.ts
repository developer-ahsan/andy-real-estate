import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { CurrencyPipe } from '@angular/common';
import * as pdfMake from "pdfmake/build/pdfmake";
@Component({
  selector: 'app-quote-graphics-report',
  templateUrl: './quote-graphics-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class QuoteGraphicsReportComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  blnSettings: boolean = true;
  isUpdateLoader: boolean = false;
  supplierData: any;

  searchColorCtrl = new FormControl();
  seletedCollection: any;
  isSearchingColor = false;

  allCollections = [];

  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('topScrollAnchor') topScroll: ElementRef;
  @ViewChild('summaryScrollAnchor') summaryScrollAnchor: ElementRef;
  generateReportData: any;
  isGenerateReportLoader: boolean = false;
  isPdfLoader: boolean = false;

  totalRevenue = 0;
  totalImprints = 0;
  grandTotal: any;


  totalMinutes = 0
  totalSeconds = 0;
  totalHours = 0;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService,
    private currencyPipe: CurrencyPipe
  ) { }
  ngOnInit(): void {

  }
  calculateTotalTime() {
    this.totalMinutes += Math.floor(this.totalSeconds / 60);
    this.totalSeconds %= 60;
    this.totalHours += Math.floor(this.totalMinutes / 60);
    this.totalMinutes %= 60;

    return `${this.totalHours}:${this.totalMinutes}:${this.totalSeconds}`;
  }
  generateReport() {
    let annual = 0;
    if (this._reportService.ngPlan == 'weekly') {
      annual = 52;
    } else if (this._reportService.ngPlan == 'monthly') {
      annual = 12;
    } else if (this._reportService.ngPlan == 'quarterly') {
      annual = 4;
    } else if (this._reportService.ngPlan == 'yearly') {
      annual = 1;
    }
    this.isGenerateReportLoader = true;
    this.generateReportData = null;
    this.totalRevenue = 0;
    this.totalImprints = 0;
    this.grandTotal = {
      revenue: 0,
      annual: 0,
      percent: 0,
      ui: 0,
      ps: 0,
      ns: 0,
      ir: 0,
      coi: 0,
      GTT: ''
    }
    this._reportService.setFiltersReport();
    let params = {
      quote_graphics_support_report: true,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      annual_equiv_value: annual
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["data"].length > 0) {
        res["data"].forEach(element => {
          element.TotalRevenue = 0;
          const { UniqueImprints, Details, ProofSent, grandTotalRevenue, grandTotalUniqueImprints } = element;
          this.grandTotal.ui = grandTotalUniqueImprints;
          this.grandTotal.revenue = grandTotalRevenue;

          element.coi = 0;
          element.ir = 0;
          element.annual = 0;
          element.ns = 0;

          const ttParts = element.TT.split(":");
          this.totalHours += parseInt(ttParts[0]);
          this.totalMinutes += parseInt(ttParts[1]);
          this.totalSeconds += parseInt(ttParts[2]);

          if (Details) {
            element.detailsData = Details.split(',,').map(d_data => {
              const [id, storeName, revenue, annual, ui, ps, ns, tt] = d_data.split('::');
              element.annual += Number(annual);
              element.ns += Number(ns);
              this.grandTotal.annual += Number(annual);
              this.grandTotal.ns += Number(ns);
              let percent = 0;
              element.TotalRevenue += Number(revenue);
              percent = Math.round((Number(revenue) / element.grandTotalRevenue) * 100);
              return { id, storeName, revenue, annual, ui, ps, ns, tt, percent };
            });
          } else {
            element.detailsData = [];
          }
          element.percent = ((Number(element.TotalRevenue) / grandTotalRevenue) * 100).toFixed(2);
          element.roundedPercent = Math.round((Number(element.TotalRevenue) / grandTotalRevenue) * 100);
          element.imprintPercent = Math.round((Number(UniqueImprints) / grandTotalUniqueImprints) * 100);


          this.totalRevenue += element.TotalRevenue;
          this.totalImprints += UniqueImprints;
          this.grandTotal.ps += Number(ProofSent);
        });
        this.grandTotal.GTT = this.calculateTotalTime();
        this.generateReportData = res["data"];
        this.backtoTop();
      } else {
        this.generateReportData = null;
        this._reportService.snackBar('No records found');
      }
    }, err => { });
  }
  backToList() {
    this.generateReportData = null;
    this._changeDetectorRef.markForCheck();
  }
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
        {
          table: {
            widths: ['20%', '15%', '10%', '10%', '10%', '10%', '10%', '10%', '5%'],
            body: [
              [
                { text: 'Employee', bold: true },
                { text: 'Store', bold: true },
                { text: 'Revenue', bold: true },
                { text: 'Anuual Equiv.', bold: true },
                { text: '% of business', bold: true },
                { text: 'UI', bold: true },
                { text: 'PS', bold: true },
                { text: 'Num. Sales', bold: true },
                { text: 'TT', bold: true }
              ]
            ]
          },
          fontSize: 7
        },
        { text: 'Summary', margin: [0, 20, 0, 0] },
        {
          table: {
            widths: ['*', '*', '*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'Employee', bold: true },
                { text: 'Total Revenue', bold: true },
                { text: '% of Revenue', bold: true },
                { text: '% of Imprints', bold: true },
                { text: 'Unique Imprints', bold: true },
                { text: 'Proof Sent', bold: true },
                { text: 'Total Time', bold: true }
              ]
            ]
          },
          fontSize: 7
        },
      ],
      styles: {
        tableHeader: {
          bold: true
        }
      }
    };
    this.generateReportData.forEach(employee => {

      // Loop through the details of each employee and add them to the main table
      employee.detailsData.forEach(data => {
        documentDefinition.content[3].table.body.push(
          [
            employee.Employee,
            data.storeName,
            { text: this.currencyPipe.transform(Number(data.revenue), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
            { text: this.currencyPipe.transform(Number(data.annual), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
            `${data.percent}`,
            data.ui,
            data.ps,
            data.ns,
            data.tt
          ]
        );
      });

      // Add a 'TOTAL' row for each employee after all their individual rows
      documentDefinition.content[3].table.body.push(
        // ... [Your code for adding 'TOTAL' for each employee]
        [
          { text: 'TOTAL', colSpan: 2, bold: true }, {},
          { text: this.currencyPipe.transform(Number(employee.TotalRevenue), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
          { text: this.currencyPipe.transform(Number(employee.annual), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
          `${employee.percent}`,
          employee.UniqueImprints,
          employee.ProofSent,
          employee.ns,
          employee.TT
        ]
      );

      // Add summary data for each employee
      documentDefinition.content[5].table.body.push(
        // ... [Your code for adding each employee's summary]
        [
          employee.Employee,
          { text: this.currencyPipe.transform(Number(employee.TotalRevenue), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
          employee.roundedPercent + '%',
          employee.imprintPercent + '%',
          employee.UniqueImprints,
          employee.ProofSent,
          employee.TT
        ]
      );
    });

    // Add the 'GRAND TOTAL' row once after looping through all employees
    documentDefinition.content[3].table.body.push(
      [
        { text: 'GRAND TOTAL', colSpan: 2, bold: true }, {},
        { text: this.currencyPipe.transform(Number(this.grandTotal.revenue), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
        { text: this.currencyPipe.transform(Number(this.grandTotal.annual), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
        '',
        this.grandTotal.ui,
        this.grandTotal.ps,
        this.grandTotal.ns,
        this.grandTotal.GTT
      ]
    );

    pdfMake.createPdf(documentDefinition).download(`Quote-Graphics-Support-Report-${this._reportService.startDate}-${this._reportService.endDate}.pdf`);
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
