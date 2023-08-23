import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-graphics-support-report',
  templateUrl: './graphics-support-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class GraphicsSupportReportComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('topScrollAnchor') topScroll: ElementRef;
  @ViewChild('summaryScrollAnchor') summaryScrollAnchor: ElementRef;
  generateReportData: any;
  isGenerateReportLoader: boolean = false;
  isPdfLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService
  ) { }

  ngOnInit(): void {
  };

  generateReport() {
    this.isGenerateReportLoader = true;
    let params = {
      employee_sales_report: true,
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      console.log(res);
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
  generatePdf() { }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
