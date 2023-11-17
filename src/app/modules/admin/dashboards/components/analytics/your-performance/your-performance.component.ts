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
        q2Earnings: 0,
        q3Earnings: 0,
        q4Earnings: 0,
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
            series: [],
            chart: {
                width: "70%",
                type: "pie"
            },
            colors: [],
            labels: [
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
            this.yourPerformanceData.q1Loader = false;
            this.yourPerformanceData.q2Loader = false;
            this.yourPerformanceData.q3Loader = false;
            this.yourPerformanceData.q4Loader = false;
            this._changeDetectorRef.markForCheck();
        })).subscribe((res: any) => {
            // console.log(res);
            this.ytDDataMain = res["data"][0][0];
            this.calculatePercentage("YTD", "LAST_YTD", "ytdPercent", "ytdPercentBln");
            this.calculatePercentage("MTD", "LAST_MTD", "mtdPercent", "mtdPercentBln");
            this.calculatePercentage("WTD", "LAST_WTD", "wtdPercent", "wtdPercentBln");
            // Monthly Summary 
            let monthlyData = res["data"].slice(1);


            const completePiChart = this.getRefactoredDataForPiCharts(monthlyData);
            const firstQuarterPiChart = this.getRefactoredDataForPiCharts(monthlyData.slice(0, 3));
            const secondQuarterPiChart = this.getRefactoredDataForPiCharts(monthlyData.slice(3, 6));
            const thirdQuarterPiChart = this.getRefactoredDataForPiCharts(monthlyData.slice(6, 9));
            const fourthQuarterPiChart = this.getRefactoredDataForPiCharts(monthlyData.slice(9, 12));

            completePiChart.data.forEach((store: any) => {
                this.performanceChartOptions.series.push(store.totalSales);
                this.performanceChartOptions.labels.push(store.storeName);
                this.performanceChartOptions.colors.push('#' + store.reportColor);
            });

            firstQuarterPiChart.data.forEach((store: any) => {
                this.yourPerformanceData.q1SeriesData.push(store.totalSales);
                this.yourPerformanceData.q1SeriesLabel.push(store.storeName);
                this.yourPerformanceData.q1Colors.push('#' + store.reportColor);
            });
            this.yourPerformanceData.q1Earnings = firstQuarterPiChart?.totalSales;

            secondQuarterPiChart.data.forEach((store: any) => {
                this.yourPerformanceData.q2SeriesData.push(store.totalSales);
                this.yourPerformanceData.q2SeriesLabel.push(store.storeName);
                this.yourPerformanceData.q2Colors.push('#' + store.reportColor);
            });
            this.yourPerformanceData.q2Earnings = secondQuarterPiChart?.totalSales;

            thirdQuarterPiChart.data.forEach((store: any) => {
                this.yourPerformanceData.q3SeriesData.push(store.totalSales);
                this.yourPerformanceData.q3SeriesLabel.push(store.storeName);
                this.yourPerformanceData.q3Colors.push('#' + store.reportColor);
            });
            this.yourPerformanceData.q3Earnings = thirdQuarterPiChart?.totalSales;

            fourthQuarterPiChart.data.forEach((store: any) => {
                this.yourPerformanceData.q4SeriesData.push(store.totalSales);
                this.yourPerformanceData.q4SeriesLabel.push(store.storeName);
                this.yourPerformanceData.q4Colors.push('#' + store.reportColor);
            });
            this.yourPerformanceData.q4Earnings = fourthQuarterPiChart?.totalSales;



            console.log(this.performanceChartOptions);

            console.log(completePiChart);
            console.log(firstQuarterPiChart);
            console.log(secondQuarterPiChart);
            console.log(thirdQuarterPiChart);
            console.log(fourthQuarterPiChart);
            console.log(monthlyData);


            let barChartData = this.getRefactoredDataForBarCharts(monthlyData, res.flpsUserStores)
            let firstQarterBarChartData = this.getRefactoredDataForBarCharts(monthlyData.slice(0, 3), res.flpsUserStores)
            let secondQuarterBarChartData = this.getRefactoredDataForBarCharts(monthlyData.slice(3, 6), res.flpsUserStores)
            let thirdQuarterBarChartData = this.getRefactoredDataForBarCharts(monthlyData.slice(6, 9), res.flpsUserStores)
            let FourthQuarterBarChartData = this.getRefactoredDataForBarCharts(monthlyData.slice(9, 12), res.flpsUserStores)


            console.log(barChartData)
            console.log(firstQarterBarChartData)
            console.log(secondQuarterBarChartData)
            console.log(thirdQuarterBarChartData)
            console.log(FourthQuarterBarChartData)




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

    getRefactoredDataForPiCharts(data) {
        let aggregatedData = {};
        let totalSales = 0;

        data.forEach((dataArray) => {
            dataArray.forEach((store) => {
                const { storeID, SALES, PY, NS, storeName, reportColor } = store;

                if (!aggregatedData[storeID]) {
                    aggregatedData[storeID] = {
                        storeName,
                        storeID,
                        reportColor,
                        totalSales: 0,
                        totalPY: 0,
                        totalNS: 0,
                    };
                }

                aggregatedData[storeID].totalSales += SALES;
                aggregatedData[storeID].totalPY += PY;
                aggregatedData[storeID].totalNS += NS;

                totalSales += SALES
            });
        });
        const resultArray = Object.values(aggregatedData);
        return { data: resultArray, totalSales };
    }

    getRefactoredDataForBarCharts(data, flpsUserStores) {
        flpsUserStores.forEach((store) => {
            const { pk_storeID } = store;
            const salesArray = [];
            data.forEach((monthData) => {
                let found = false;
                monthData.forEach((storeData) => {
                    if (storeData.storeID === pk_storeID) {
                        salesArray.push(storeData.SALES);
                        found = true;
                    }
                });
                if (!found) {
                    salesArray.push(0);
                }
            });

            store.SALES = salesArray;
        });

        return flpsUserStores;
    }
}
