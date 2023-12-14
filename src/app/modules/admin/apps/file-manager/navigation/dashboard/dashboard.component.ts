import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import { Subject } from "rxjs";
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
import { takeUntil } from "rxjs/operators";
import { FileManagerService } from "../../store-manager.service";
import { CurrencyPipe } from "@angular/common";

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
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
};

export type ChartOptionsOne = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  fill: ApexFill;
  colors: string[];
};

export type ChartOptionsTwo = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  fill: ApexFill;
  colors: string[];
};

export type ChartOptionsThree = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  fill: ApexFill;
  colors: string[];
};

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  providers: [CurrencyPipe],
})
export class DashboardComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public chartOptionsBar: Partial<ChartOptionsBar>;
  public chartOptionsOne: Partial<ChartOptionsOne>;
  public chartOptionsTwo: Partial<ChartOptionsTwo>;
  public chartOptionsThree: Partial<ChartOptionsThree>;

  isPageLoadingHistory: boolean = false;
  isPageLoadingYTD: boolean = false;
  isPageLoadingSales: boolean = false;
  isPageLoadingCustomers: boolean = true;
  selectedYear: any = (new Date().getFullYear() - 5).toString();
  yearArray: any;

  topCustomers: any = [];
  displayedColumns: string[] = [
    "cName",
    "Email",
    "Company",
    "Phone",
    "Sales",
    "Total"
  ];

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private currencyPipe: CurrencyPipe
  ) {
    
this.setChartOptions();
    this.chartOptionsBar = {
      series: [],
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: [],
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return '$' + `${val.toLocaleString()}`;
          },
        },
      },
    };

    this.chartOptions = {
      series: [
        {
          name: "",
          data: [],
        },
        {
          name: "",
          data: [],
        },
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
      colors: ['#818CF8'],
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
            return '$' + `${val.toLocaleString()}`;
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

  ngOnInit(): void {
    this.isPageLoadingHistory = true;
    this.isPageLoadingSales = true;
    this.isPageLoadingYTD = true;

    this.isLoadingChange.emit(false);
    this.initialize();

    this.getDashboardGraphsData("sales_average_margin");
    this.getDashboardGraphsData("ytd_month");

    // Get the stores
    this._fileManagerService.stores$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        // console.log(items)
      });
    this.getDashboardData()
  }

  setChartOptions() {
    this.chartOptionsOne = {
      series: [
        {
          name: "",
          data: [],
        },
      ],
      chart: {
        height: 170,
        type: "area",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'straight'
      },
      xaxis: {
        categories: [],
        labels: {
          show: false
        }
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return val.toFixed(0);
          },
        },
        show: false
      },
    };

    this.chartOptionsTwo = {
      series: [
        {
          name: "",
          data: [],
        },
      ],
      chart: {
        height: 170,
        type: "area",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true
        }
      },
      colors: ['#34D399'],
      fill: {
        colors: ['#34D399'],
        opacity: 0.5
      },
      stroke: {
        curve: 'straight'
      },
      xaxis: {
        categories: [],
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return `$${val.toFixed(2)}`;
          },
        },
      },
    };

    this.chartOptionsThree = {
      series: [
        {
          name: "",
          data: [],
        },
      ],
      chart: {
        height: 170,
        type: "area",
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'straight'
      },
      xaxis: {
        categories: [],
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return `${val.toFixed(2)}%`;
          },
        },
      },
    };
  }

  getDashboardData() {
    this.getDashboardGraphsData("historical_store_sales");
    setTimeout(() => {
      this.getDashboardGraphsData("top_customer");
    }, 5000);
  }

  initialize() {
    this.yearArray = [];
    for (let index = new Date().getFullYear(); index > 2005; index--) {
      this.yearArray.push(index);
    }
    this._fileManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
  getDashboardGraphsData(value) {
    if (value == "historical_store_sales") {
      this.isPageLoadingHistory = true;
      this.chartOptions.series[0].data = [];
      this.chartOptions.series[1].data = [];
      this.chartOptions.xaxis.categories = [];
    } else if (value == "sales_average_margin") {
      this.isPageLoadingSales = true;
    } else if (value == "ytd_month") {
      this.isPageLoadingYTD = true;
    } else if (value == "top_customer") {
      this.isPageLoadingCustomers = true;
    }

    let params = {
      dashboard: true,
      [value]: true,
      store_id: this.selectedStore.pk_storeID,
      year: Number(this.selectedYear),
    };
    this._fileManagerService
      .getDashboardGraphData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        if (value == "historical_store_sales") {
          this.isPageLoadingHistory = false;
          res.data.ytd.forEach((element) => {
            this.chartOptions.xaxis.categories.push(element.orderDate);
            this.chartOptions.series[1].data.push(element.earnings);
          });
          // + res.data.sales[0].reportColor
          this.chartOptions.colors[0] = "#999999";
          res.data.sales.forEach((element) => {
            this.chartOptions.colors[1] = "#" + res.data.sales[0].reportColor;
            this.chartOptions.xaxis.categories.push(element.orderDate);
            let earning = this.currencyPipe.transform(element.total, "USD");
            this.chartOptions.series[0].data.push(element.total);
          });
        } else if (value == "sales_average_margin") {
          this.isPageLoadingSales = false;
          res.data.forEach((element) => {
            this.chartOptionsOne.xaxis.categories.push(element.year);
            this.chartOptionsOne.series[0].data.push(element.numSales);
            this.chartOptionsTwo.xaxis.categories.push(element.year);
            this.chartOptionsTwo.series[0].data.push(element.Average);
            this.chartOptionsThree.xaxis.categories.push(element.year);
            this.chartOptionsThree.series[0].data.push(element.Margin);
          });
        } else if (value == "ytd_month") {
          this.isPageLoadingYTD = false;
          let grouped = Object.create(null);
          let months = [];
          res.data.forEach((element, index) => {
            let value = element.orderDate.split("-");
            const year = value[0];
            const month = value[1];
            let valueExist = months.indexOf(this.toMonthName(month));
            if (valueExist === -1) {
              months.push(this.toMonthName(month));
            }
            grouped[year] = grouped[year] || (grouped[year] = []);
            grouped[year].push(element.earnings);
            if (res.data.length - 1 == index) {
              let arr = Object.keys(grouped);
              arr.forEach((item) => {
                this.chartOptionsBar.series.push({
                  name: item,
                  data: grouped[item],
                });
              });
              this.chartOptionsBar.xaxis.categories = months;
            }
          });
        } else if (value == "top_customer") {
          this.topCustomers = [];
          this.isPageLoadingCustomers = false;
          this.topCustomers = res["data"];
        }
        this._changeDetectorRef.markForCheck();
      });
  }
  toMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("en-US", {
      month: "short",
    });
  }
  selectedTabValue(event) {
    if (event.tab.textLabel == 'Top Customers' && this.topCustomers.length == 0) {
      this.getDashboardGraphsData("top_customer");
    }
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
