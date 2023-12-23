import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { ApplyBlanketFOBlocation, applyCompanyWideCoop, updateCompanySettings } from '../../reports.types';
import { Sort } from '@angular/material/sort';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { CurrencyPipe } from '@angular/common';
import { environment } from 'environments/environment';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-standard-margin-report',
  templateUrl: './standard-margin-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportStandardMarginComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  allCoops = [];
  dataSource = [];
  initialData = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getMarginReports();
  }
  getMarginReports() {
    let params = {
      store_margins_report: true
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      const data = res["data"];
      if (data.length) {
        const storeMargins = data[0].storeMargins.split(',,');
        this.dataSource = storeMargins.map(store => {
          const [pk_storeID, storeName, margin1, margin2, margin3, margin4, margin5, margin6] = store.split('::');
          return {
            pk_storeID,
            storeName,
            margin1: Math.round(Number(margin1) * 100),
            margin2: Math.round(Number(margin2) * 100),
            margin3: Math.round(Number(margin3) * 100),
            margin4: Math.round(Number(margin4) * 100),
            margin5: Math.round(Number(margin5) * 100),
            margin6: Math.round(Number(margin6) * 100),
          };
        });
      }
      this.initialData = this.dataSource;
    });
  }
  sortData(event: Sort): void {
    const sortHeaderId = event.active;
    const sortDirection = event.direction;

    if (sortDirection === '') {
      this.dataSource = [...this.initialData];
      return;
    }
    this.dataSource.sort((a, b) => {
      const valueA = a[sortHeaderId];
      const valueB = b[sortHeaderId];
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        if (sortDirection === 'asc') {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      } else {
        if (sortDirection === 'asc') {
          return valueA.toString().localeCompare(valueB.toString());
        } else {
          return valueB.toString().localeCompare(valueA.toString());
        }
      }
    });
  }
  generatePdf() {
    const documentDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [10, 10, 10, 10],
      content: [
        // Add a title for your PDF
        { text: 'Standard Store Margins', fontSize: 14 },
        // Add a spacer element to create a margin above the table
        { text: '', margin: [0, 20, 0, 0] },
        {
          table: {
            widths: ['*', '*', '*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'Store', bold: true },
                { text: 'Margin1', bold: true },
                { text: 'Margin2', bold: true },
                { text: 'Margin3', bold: true },
                { text: 'Margin4', bold: true },
                { text: 'Margin5', bold: true },
                { text: 'Margin6', bold: true }
              ]
            ]
          },
          fontSize: 8
        }
      ],
      styles: {
        tableHeader: {
          bold: true
        }
      }
    };
    this.dataSource.forEach(element => {
      documentDefinition.content[2].table.body.push(
        [
          { text: element.storeName, link: `${environment.siteDomain}apps/orders/'${element.pk_storeID}/store-products` },
          element.margin1 + '%',
          element.margin2 + '%',
          element.margin3 + '%',
          element.margin4 + '%',
          element.margin5 + '%',
          element.margin6 + '%'
        ]
      )
    });
    pdfMake.createPdf(documentDefinition).download(`Standard-Store-Margins-Report.pdf`);
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
