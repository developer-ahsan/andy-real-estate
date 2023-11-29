import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexNonAxisChartSeries, ApexOptions, ApexPlotOptions, ApexResponsive, ApexStroke, ApexTheme, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent } from 'ng-apexcharts';
import { DashboardsService } from '../../dashboard.service';
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
    selector: 'analytics',
    templateUrl: './analytics.component.html',
    styles: [`#myChart .apexcharts-legend {
        display: none !important;
    }`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsComponent implements OnInit, OnDestroy {
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
        this.getYTDData();
        this.getPortfolioData();
        this.getPerformanceData();
    }
    calledScreen(screen) {
        this.mainScreen = screen;
    }
    getYTDData() {
        this._analyticsService.ytdData$
            .pipe(
                takeUntil(this._unsubscribeAll),
                finalize(() => {
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe((res) => {
                this.ytDDataMain = res["data"][0];
                this.calculatePercentage("YTD", "LAST_YTD", "ytdPercent", "ytdPercentBln");
                this.calculatePercentage("MTD", "LAST_MTD", "mtdPercent", "mtdPercentBln");
                this.calculatePercentage("WTD", "LAST_WTD", "wtdPercent", "wtdPercentBln");
            },
                (err) => {
                    // Handle errors if needed
                });
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
    getPortfolioData() {
        this.yourPerformanceData.allStoresGraphLoader = true;
        this.yourPerformanceData.q1Loader = true;
        this.yourPerformanceData.q2Loader = true;
        this.yourPerformanceData.q3Loader = true;
        this.yourPerformanceData.q4Loader = true;

        this.storesData = [];
        const userData = JSON.parse(localStorage.getItem('userDetails'));
        let params = {
            portfolio_performance: true,
            // email: this.userData.email
            user_id: userData.FLPSUserID
        }
        this.totalStoreSummary = {
            SALES: 0,
            PY: 0,
            percent: 0,
            DIFF: 0,
            N_DIFF: 0,
            NS: 0,
            PYNS: 0,
            AVG: 0,
            MARGIN: 0,
            COST: 0,
            PRICE: 0,
            TAX: 0,
            blnPercent: false
        }
        this._analyticsService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
            this.isPortfolioLoader = false;
            this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
            this.programPortfolioData = res["data"];
            this.programPortfolioData.forEach(element => {
                // Add data to Chrt
                this.yourPerformanceData.allSeriesData.push(element.SALES);
                this.yourPerformanceData.allSeriesLabel.push(element.storeName);
                this.storesData.push({ storeName: element.storeName, pk_storeID: element.storeID });
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
                if (element.DIFF > 0) {
                    this.totalStoreSummary.DIFF += element.DIFF;
                } else {
                    this.totalStoreSummary.DIFF = this.totalStoreSummary.DIFF + (element.DIFF * -1);
                }
            });
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
            this.totalStoreSummary.N_DIFF = Math.abs((this.totalStoreSummary?.PYNS - this.totalStoreSummary?.NS));
            this.totalStoreSummary.AVG = this.totalStoreSummary.SALES / this.totalStoreSummary.NS;
            this.totalStoreSummary.MARGIN = Math.ceil(((this.totalStoreSummary.PRICE - this.totalStoreSummary.COST) / this.totalStoreSummary.PRICE) * 10000) / 100;
            // this.totalStoreSummary.DIFF = this.totalStoreSummary.SALES - this.totalStoreSummary.PY;
            this.yourPerformanceData.allStoresGraphLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
        });
    }
    getPerformanceData() {
        let params = {
            program_performance: true,
            email: this.userData.email
        }
        this._analyticsService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
            this.isPerformanceLoader = false;
            this.yourPerformanceData.q1Loader = false;
            this.yourPerformanceData.q2Loader = false;
            this.yourPerformanceData.q3Loader = false;
            this.yourPerformanceData.q4Loader = false;
            this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
            this.programPerformanceData = [];
            let stores = [];
            const { ytd, annual, quarter } = res["data"];
            ytd.forEach(element => {
                const { earnings, reportColor, orderDate, pk_storeID, storeName } = element;
                const existingStore = stores.find(store => store.pk_storeID === pk_storeID);
                const ytdValues = {
                    earnings: earnings, reportColor: reportColor, orderDate: orderDate
                }
                if (!existingStore) {
                    stores.push({
                        storeName: storeName, pk_storeID: pk_storeID,
                        ytdSeries: [{ name: 'Sales', data: [earnings] }],
                        xaxis: { categories: [orderDate] },
                        colors: ['#' + reportColor],
                        ytd: [ytdValues],
                        annual: [],
                        annualSeries: [{ name: 'Sales', data: [] }],
                        anuualxaxis: { categories: [] },
                        annualColors: [],
                        quarter: [],
                        quarterSeries: [{ name: '', data: [] }, { name: '', data: [] }, { name: '', data: [] }],
                        quarterxaxis: { categories: [1, 2, 3, 4] },
                        quarterColors: [],
                    });
                } else {
                    existingStore.ytd.push(ytdValues);
                    existingStore.ytdSeries[0].data.push(earnings);
                    existingStore.xaxis.categories.push(orderDate);
                    existingStore.colors.push('#' + reportColor);
                }
            });
            annual.forEach(element => {
                const { total, year, reportColor, pk_storeID, storeName } = element;
                const existingStore = stores.find(store => store.pk_storeID === pk_storeID);
                const annualValues = {
                    total: total, reportColor: reportColor, year: year
                }
                if (!existingStore) {
                    stores.push({
                        storeName: storeName, pk_storeID: pk_storeID,
                        annualSeries: [{ data: [total] }],
                        anuualxaxis: { categories: [year] },
                        annualColors: ['#' + reportColor],
                        ytdSeries: [],
                        xaxis: { categories: [] },
                        colors: [],
                        ytd: [], annual: [annualValues], quarter: []
                    });
                } else {
                    existingStore.annual.push(annualValues);
                    existingStore.annualSeries[0].data.push(total);
                    existingStore.anuualxaxis.categories.push(year);
                    existingStore.annualColors.push('#' + reportColor);
                }
            });
            quarter.forEach(element => {
                const { orderYear, orderQuarter, earnings, reportColor, pk_storeID, storeName } = element;
                const existingStore = stores.find(store => store.pk_storeID === pk_storeID);

                if (!existingStore.quarter) {
                    existingStore.quarter = {};
                }

                if (!existingStore.quarter[orderYear]) {
                    existingStore.quarter[orderYear] = [];
                }

                const quarterValues = {
                    earnings: earnings,
                    reportColor: reportColor,
                    year: orderYear,
                    orderQuarter: orderQuarter
                };

                const existingQuarter = existingStore.quarter[orderYear].find(q => q.quarter === orderQuarter);

                if (existingQuarter) {
                    existingQuarter.data.push(quarterValues);
                } else {
                    existingStore.quarter[orderYear].push({ quarter: orderQuarter, data: quarterValues });
                }

                existingStore.quarterColors.push('#' + reportColor);
            });
            const year: any = moment().year();
            stores.forEach(store => {
                this.yourPerformanceData.allColors.push(store.colors[0]);
                let quarters = Object.keys(store.quarter);
                quarters.forEach((quarter, index) => {
                    store.quarterSeries[index].name = quarter;
                    store.quarterColors[index] = '#' + store.quarter[quarter][index]?.data.reportColor;
                    store.quarter[quarter].forEach(element => {
                        store.quarterSeries[index].data.push(element.data.earnings);
                        if (year == quarter) {
                            if (element.quarter == 1) {
                                this.yourPerformanceData.q1Earnings += element.data.earnings;
                                this.yourPerformanceData.q1SeriesData.push(element.data.earnings);
                                this.yourPerformanceData.q1SeriesLabel.push(store.storeName);
                                this.yourPerformanceData.q1Colors.push('#' + element.data.reportColor);
                            } else if (element.quarter == 2) {
                                this.yourPerformanceData.q2SeriesData.push(element.data.earnings);
                                this.yourPerformanceData.q2SeriesLabel.push(store.storeName);
                                this.yourPerformanceData.q2Colors.push('#' + element.data.reportColor);
                            } else if (element.quarter == 3) {
                                this.yourPerformanceData.q3SeriesData.push(element.data.earnings);
                                this.yourPerformanceData.q3SeriesLabel.push(store.storeName);
                                this.yourPerformanceData.q3Colors.push('#' + element.data.reportColor);
                            } else if (element.quarter == 4) {
                                this.yourPerformanceData.q4SeriesData.push(element.data.earnings);
                                this.yourPerformanceData.q4SeriesLabel.push(store.storeName);
                                this.yourPerformanceData.q4Colors.push('#' + element.data.reportColor);
                            }
                        }
                    });
                });
            });
            this.programPerformanceData = stores;
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
