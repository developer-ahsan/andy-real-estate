import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../../store-manager.service';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexLegend,
  ApexPlotOptions,
  ApexFill
} from "ng-apexcharts";
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  colors: string[];
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};
@Component({
  selector: 'app-stat_analysis',
  templateUrl: './stat_analysis.component.html',
})
export class StatAnalysisComponent implements OnInit, OnDestroy {
  @Input() selectedStore: any;
  @Input() processData: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  totalRequests = 0;
  totalClicks = 0;
  totalOpens = 0;

  dateArray = [];
  seriesArray = [];
  chartOptions: Partial<ChartOptions>;;

  showChart: boolean = false;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.isLoading = false;
    this.isLoadingChange.emit(false);
    this.initialize();
    this.statsAnalysisFormation();
  }
  initialize() {
    this.chartOptions = {
      series: [
        {
          name: "Clicks",
          data: [],
        },
        {
          name: "Opened",
          data: [],
        },
        {
          name: "Emails Sent",
          data: [],
        }
      ],
      chart: {
        animations: {
          speed: 400,
          animateGradually: {
            enabled: false
          }
        },
        fontFamily: 'inherit',
        foreColor: 'inherit',
        width: '100%',
        height: '350',
        type: 'area',
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      colors: ['#818CF8',],
      stroke: {
        width: 2
      },
      grid: {
        borderColor: "#e7e7e7",
        show: true
      },
      markers: {
        size: 2,
      },
      xaxis: {
        categories: [],
      },
      dataLabels: {
        enabled: false
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return `${val.toLocaleString()}`;
          },
        },
        axisTicks: {
          show: false
        },
        axisBorder: {
          show: false
        },
        tickAmount: 5,
        show: true
      }
    };
  }
  statsAnalysisFormation() {
    this.chartOptions.series[0].data = [];
    this.chartOptions.series[1].data = [];
    this.chartOptions.series[2].data = [];
    this.chartOptions.colors[0] = "#999999";
    this.chartOptions.colors[1] = "#9e068b";
    this.chartOptions.colors[2] = "#eb3c0f";

    this.processData.forEach(element => {
      this.totalRequests = element.stats[0].metrics.requests;
      this.totalClicks = element.stats[0].metrics.clicks;
      this.totalOpens = element.stats[0].metrics.opens;
      this.chartOptions.xaxis.categories.push(element.date);
      this.chartOptions.series[0].data.push(element.stats[0].metrics.clicks);
      this.chartOptions.series[1].data.push(element.stats[0].metrics.opens);
      this.chartOptions.series[2].data.push(element.stats[0].metrics.requests);
    });
    this.showChart = true;
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
