import { Component, Input, Output, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
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
  ApexPlotOptions
} from "ng-apexcharts";
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../file-manager.service';

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

export type ChartOptionsBar = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

export type ChartOptionsOne = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

export type ChartOptionsTwo = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

export type ChartOptionsThree = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public chartOptionsBar: Partial<ChartOptionsBar>;
  public chartOptionsOne: Partial<ChartOptionsOne>;
  public chartOptionsTwo: Partial<ChartOptionsTwo>;
  public chartOptionsThree: Partial<ChartOptionsThree>;

  constructor(
    private _fileManagerService: FileManagerService
  ) {

    this.chartOptionsOne = {
      series: [
        {
          name: "Desktops",
          data: [103, 92, 106, 127, 12]
        }
      ],
      chart: {
        height: 350,
        type: "line",
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      title: {
        text: "Number Of Sales, Past 5 Years",
        align: "left"
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      xaxis: {
        categories: [
          "2017",
          "2018",
          "2019",
          "2020",
          "2021"
        ]
      }
    };

    this.chartOptionsTwo = {
      series: [
        {
          name: "Desktops",
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
        }
      ],
      chart: {
        height: 350,
        type: "line",
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      title: {
        text: "Average Size Of Sales, Past 5 Years",
        align: "left"
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      xaxis: {
        categories: [
          "2017",
          "2018",
          "2019",
          "2020",
          "2021"
        ]
      }
    };

    this.chartOptionsThree = {
      series: [
        {
          name: "Desktops",
          data: [103, 92, 106, 127, 12]
        }
      ],
      chart: {
        height: 350,
        type: "line",
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      title: {
        text: "Margin, Past 5 Years",
        align: "left"
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      xaxis: {
        categories: [
          "2017",
          "2018",
          "2019",
          "2020",
          "2021"
        ]
      }
    };

    this.chartOptionsBar = {
      series: [
        {
          name: "basic",
          data: [19046.23, 4317.23, 4696.27, 65.72, 943.3, 0.00, 1771.69, 0.00]
        }
      ],
      title: {
        text: "Store Sales, Year To Date, by Month",
        align: "left"
      },
      chart: {
        type: "bar",
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: [
          "2017",
          "2018",
          "2019",
          "2020",
          "2021"
        ]
      }
    };

    this.chartOptions = {
      series: [
        {
          name: "High - 2013",
          data: [47824.591, 51258.5253, 58222.5545, 72623.7411, 43982.9542]
        },
        {
          name: "Low - 2013",
          data: [12518.591, 15480.5253, 12325.5545, 26457.7411, 43982.9542]
        }
      ],
      chart: {
        height: 350,
        type: "line",
        dropShadow: {
          enabled: true,
          color: "#000",
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2
        },
        toolbar: {
          show: false
        }
      },
      colors: ["#77B6EA", "#545454"],
      dataLabels: {
        enabled: true
      },
      stroke: {
        curve: "smooth"
      },
      title: {
        text: "Historical Store Sales",
        align: "left"
      },
      grid: {
        borderColor: "#e7e7e7",
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      markers: {
        size: 1
      },
      xaxis: {
        categories: ["2017", "2018", "2019", "2020", "2021"]
      },
      yaxis: {
        title: {
          text: "Temperature"
        },
        min: 5,
        max: 40
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        offsetX: -5
      }
    };
  }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);

    // Get the stores
    this._fileManagerService.stores$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        // console.log(items)
      });
  }

}
