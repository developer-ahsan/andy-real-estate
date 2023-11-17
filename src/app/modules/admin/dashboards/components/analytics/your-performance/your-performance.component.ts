import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexNonAxisChartSeries, ApexOptions, ApexPlotOptions, ApexResponsive, ApexStroke, ApexTheme, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent } from 'ng-apexcharts';
import { DashboardsService } from '../../../dashboard.service';
import { AuthService } from 'app/core/auth/auth.service';
import moment from 'moment';
export type ChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    responsive: ApexResponsive[];
    labels: any;
    colors: string[];
    dataLabels: ApexDataLabels;
    yaxis: ApexYAxis;

};
export type PerformanceChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    responsive: ApexResponsive[];
    labels: any;
    colors: string[];
    yaxis: ApexYAxis;
    theme: ApexTheme;
    title: ApexTitleSubtitle;
};
export type ChartOptions1 = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    colors: string[];
    xaxis: ApexXAxis;
    fill: ApexFill;
    tooltip: ApexTooltip;
    stroke: ApexStroke;
    legend: ApexLegend;
    title: ApexTitleSubtitle;
};
export type AnnualChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    yaxis: ApexYAxis;
    xaxis: ApexXAxis;
    dataLabels: ApexDataLabels;
    colors: string[];
    grid: ApexGrid;
    tooltip: ApexTooltip;
    stroke: ApexStroke;
    title: ApexTitleSubtitle;
};
@Component({
    selector: 'your-performance',
    templateUrl: './your-performance.component.html',
    styles: [`#myChart .apexcharts-legend {
        display: none !important;
    }`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class YourPerformanceComponent implements OnInit, OnDestroy {
    chartVisitors: ApexOptions;
    chartConversions: ApexOptions;
    chartImpressions: ApexOptions;
    chartVisits: ApexOptions;
    chartVisitorsVsPageViews: ApexOptions;
    data: any;

    chartAge: ApexOptions;
    averagePurchaseValueOptions: ApexOptions;
    browsersOptions: ApexOptions;
    channelsOptions: ApexOptions;
    devicesOptions: ApexOptions;
    chartGender: ApexOptions;
    chartLanguage: ApexOptions;
    chartNewVsReturning: ApexOptions;
    refundsOptions: ApexOptions;
    totalVisitsOptions: ApexOptions;
    uniqueVisitorsOptions: ApexOptions;
    uniquePurchasesOptions: ApexOptions;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    mainScreen = 'sales';
    testData: any;
    // Pie Chart
    @ViewChild("chart") chart: ChartComponent;
    public chartOptions: Partial<ChartOptions>;
    public performanceChartOptions: Partial<PerformanceChartOptions>;
    @ViewChild("chart1") chart1: ChartComponent;
    public ytdChart: Partial<ChartOptions1>;
    public quarterChart: Partial<ChartOptions1>;
    annualChartOptions: Partial<AnnualChartOptions>;
    public chartOptions2: Partial<ChartOptions1>;
    programPortfolioData = [];
    programPerformanceData = [];
    totalStoreSummary: any;

    pagePerformance = 1;
    totalPerformanceRecords = 0;
    isPerformanceLoader: boolean;
    isPortfolioLoader: boolean;
    isYTDLoader: boolean = false;
    ytDDataMain: any;

    userData: any;
    storesData: any;
    yourPerformanceData: any = {
        allStoresGraphLoader: false,
        allSeriesData: [],
        allSeriesLabel: [],
        allColors: [],
        q1Loader: false,
        q1Earnings: 0,
        q1SeriesData: [],
        q1SeriesLabel: [],
        q1Colors: [],
        q2Loader: false,
        q2SeriesData: [],
        q2SeriesLabel: [],
        q2Colors: [],
        q3Loader: false,
        q3SeriesData: [],
        q3SeriesLabel: [],
        q3Colors: [],
        q4Loader: false,
        q4SeriesData: [],
        q4SeriesLabel: [],
        q4Colors: [],
    };
    /**
     * Constructor
     */
    constructor(
        private _analyticsService: DashboardsService,
        private _authService: AuthService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router
    ) {
        this.userData = this._authService.parseJwt(this._authService.accessToken);
        this.performanceChartOptions = {
            series: [25, 15, 44, 55, 41, 17],
            chart: {
                width: "70%",
                type: "pie"
            },
            colors: [],
            labels: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ],
            theme: {
                monochrome: {
                    enabled: false
                }
            },
            title: {
                text: ""
            },
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200
                        }
                    }
                },
                {
                    breakpoint: 0, // Add a default breakpoint for larger screens
                    options: {
                        legend: {
                            show: false // Hide legend for all screen sizes
                        }
                    }
                }
            ],
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return '$' + `${val.toLocaleString()}`;
                    },
                },
            },
        }
        this.chartOptions = {
            series: [25, 15, 44, 55, 41, 17],
            chart: {
                width: "50%",
                type: "pie"
            },
            colors: [],
            labels: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200
                        }
                    }
                },
                {
                    breakpoint: 0, // Add a default breakpoint for larger screens
                    options: {
                        legend: {
                            show: false // Hide legend for all screen sizes
                        }
                    }
                }
            ],
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return '$' + `${val.toLocaleString()}`;
                    },
                },
            },
        }
        this.ytdChart = {
            series: [
            ],
            chart: {
                type: "bar",
                height: 350
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "55%"
                }
            },
            dataLabels: {
                enabled: false
            },
            colors: [],
            stroke: {
                show: true,
                width: 2,
                colors: ["transparent"]
            },
            xaxis: {
                categories: [
                ]
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return '$' + `${val.toLocaleString()}`;
                    },
                },
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return '$' + `${val.toLocaleString()}`;
                    },
                }
            },
            title: {
                text: "YTD Sales",
                align: "left"
            },
        };
        this.quarterChart = {
            series: [
                {
                    "name": "1",
                    data: [
                        161070.8812,
                        168645.3247,
                        274948.0738
                    ]
                },
                {
                    name: "2",
                    data: [
                        116023.1558,
                        268538.4856,
                        337882.7501,
                    ]
                },
                {
                    name: "3",
                    data: [
                        250311.6733,
                        340202.86,
                        273543.5929,

                    ]
                },
                {
                    name: "4",
                    data: [
                        218198.2745,
                        320052.1767,
                        0,

                    ]
                }
            ],
            chart: {
                type: "bar",
                height: 350
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "55%"
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ["transparent"]
            },
            xaxis: {
                categories: [1, 2, 3, 4]
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return '$' + `${val.toLocaleString()}`;
                    },
                },
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return '$' + `${val.toLocaleString()}`;
                    },
                }
            },
            colors: [],
            title: {
                text: "Quarterly Sales",
                align: "left"
            },
        };
        this.annualChartOptions = {
            series: [
                {
                    name: "Sales",
                    data: []
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
            colors: [],
            title: {
                text: "Annual Total Sales",
                align: "left"
            },
            grid: {
                row: {
                    colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
                    opacity: 0.5
                }
            },
            xaxis: {
                categories: []
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return '$' + `${val.toLocaleString()}`;
                    },
                }
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return '$' + `${val.toLocaleString()}`;
                    },
                },
            },
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the data
        this.isYTDLoader = true;
        this.isPortfolioLoader = true;
        this.isPerformanceLoader = true;
        this.getPerformanceData();
    }
    calledScreen(screen) {
        this.mainScreen = screen;
    }
    calculatePercentage(currentKey, lastKey, percentKey, percentBlnKey) {
        const current = this.ytDDataMain[currentKey];
        const last = this.ytDDataMain[lastKey];

        let percentBln = false;
        let percent = 0;

        if (current > last) {
            percentBln = true;
            const diff = current - last;
            percent = last === 0 ? 100 : Math.round((diff / last) * 100);
        } else if (current < last) {
            percentBln = false;
            const diff = last - current;
            percent = current === 0 ? 100 : Math.round((diff / last) * 100);
        }

        this.ytDDataMain[percentKey] = percent;
        this.ytDDataMain[percentBlnKey] = percentBln;
    }
    getPerformanceData() {
        const userData = JSON.parse(localStorage.getItem('userDetails'));
        let params = {
            company_overview_your_performance: true,
            user_id: userData.FLPSUserID
        }
        this._analyticsService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
            this.isPerformanceLoader = false;
            this.yourPerformanceData.q1Loader = false;
            this.yourPerformanceData.q2Loader = false;
            this.yourPerformanceData.q3Loader = false;
            this.yourPerformanceData.q4Loader = false;
            this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
            console.log(res);
            this.ytDDataMain = res["data"][0][0];
            this.calculatePercentage("YTD", "LAST_YTD", "ytdPercent", "ytdPercentBln");
            this.calculatePercentage("MTD", "LAST_MTD", "mtdPercent", "mtdPercentBln");
            this.calculatePercentage("WTD", "LAST_WTD", "wtdPercent", "wtdPercentBln");
            // Monthly Summary 
            let monthlyData = res["data"].slice(1);


            const monthlySummary = [];

            monthlyData.forEach((month, index) => {
                month.forEach((store) => {
                    const { storeID, storeName, SALES, PY, NS } = store;
                    const index = monthlySummary.findIndex(mSD => mSD.storeID == storeID);
                    if (!monthlySummary[storeID]) {
                        monthlySummary[storeID] = {
                            storeID,
                            storeName,
                            monthlyData: Array(monthlyData.length).fill({ SALES: 0, PY: 0, NS: 0 }),
                        };
                    }

                    monthlySummary[storeID].monthlyData[index] = {
                        SALES: monthlySummary[storeID].monthlyData[index].SALES + SALES,
                        PY: monthlySummary[storeID].monthlyData[index].PY + PY,
                        NS: monthlySummary[storeID].monthlyData[index].NS + NS,
                    };
                });
            });
            this._changeDetectorRef.markForCheck();
        })
        this._changeDetectorRef.markForCheck();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    trackByItemId(index: number, item: any): string {
        return item.pk_storeID; // Replace with the actual unique identifier
    }
    trackByIndex(index: number, item: any): number {
        return index;
    }
}
