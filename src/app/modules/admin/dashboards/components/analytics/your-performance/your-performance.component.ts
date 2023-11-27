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
    xaxis: ApexXAxis;
    colors: any[];
    labels: any[];
    fill: ApexFill;
    tooltip: ApexTooltip;
    stroke: ApexStroke;
    responsive: any;
    legend: ApexLegend;
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
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // Pie Chart
    public chartOptions: Partial<ChartOptions>;
    public performanceChartOptions: Partial<PerformanceChartOptions>;
    public ytdChart: Partial<ChartOptions1>;

    isPerformanceLoader: boolean;
    ytDDataMain: any;

    userData: any;
    yourPerformanceData: any = {
        barChartLoader: false,
        allStoresGraphLoader: false,
        userYTDMonthQuarter: moment().quarter(),
        allSeriesData: [],
        allSeriesLabel: [],
        allColors: [],
        q1Loader: false,
        q1Earnings: 0,
        q2Earnings: 0,
        q3Earnings: 0,
        q4Earnings: 0,
        q1Average: 0,
        q2Average: 0,
        q3Average: 0,
        q4Average: 0,
        yearlyAverage: 0,
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
        // BarCharts
        barChartTotal: 0
    };
    currentYear = moment().year();
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
        this.initCharts();
    }
    initCharts() {
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
                    columnWidth: "70%",
                }
            },
            labels: [],
            dataLabels: {
                enabled: false
            },
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
                title: {
                    text: "$"
                }
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return "$ " + val;
                    }
                }
            },
            colors: [],
            legend: {
                show: false
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
        this.isPerformanceLoader = true;
        this.getPerformanceData();
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
        this.yourPerformanceData.barChartLoader = true;
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
            this.ytDDataMain = res["data"][0][0];
            this.calculatePercentage("YTD", "LAST_YTD", "ytdPercent", "ytdPercentBln");
            this.calculatePercentage("MTD", "LAST_MTD", "mtdPercent", "mtdPercentBln");
            this.calculatePercentage("WTD", "LAST_WTD", "wtdPercent", "wtdPercentBln");
            // Monthly Summary 
            let monthlyData = res["data"].slice(1);
            this.ytDDataMain.monthlyData = res["data"].slice(1);
            this.ytDDataMain.flpsUserStores = res["flpsUserStores"];

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

            for (let quarter = 1; quarter <= 4; quarter++) {
                const value = `q${quarter}Earnings`;
                const valueAverage = `q${quarter}Average`;
                let earning = this.yourPerformanceData[value];
                this.calculateAverage(earning, quarter, valueAverage);
            }
            this.calculateAverage(this.ytDDataMain?.YTD, '', 'yearly');

            // Bar Chart Data
            this.barChartData();

            this.isPerformanceLoader = false;
            this._changeDetectorRef.markForCheck();
        })
        this._changeDetectorRef.markForCheck();
    }
    calculateAverage(earning, quarter, key) {
        if (key == 'yearly') {
            const startDate = moment(`${this.currentYear}-01-01`);
            const currentDate = moment();
            const daysSinceStartOfYear = (currentDate.diff(startDate, 'days') + 1) / 7;
            console.log(earning)
            this.yourPerformanceData.yearlyAverage = earning / daysSinceStartOfYear;
        } else {
            const startOfQuarter = moment(`${this.currentYear}-01-01`).add((quarter - 1) * 3, 'months');
            const endOfQuarter = startOfQuarter.clone().endOf('quarter');
            const currentDate = moment();
            const daysInQuarter = [];
            for (let currentDay = startOfQuarter.clone(); currentDay.isSameOrBefore(endOfQuarter) && currentDay.isSameOrBefore(currentDate); currentDay.add(1, 'day')) {
                daysInQuarter.push(currentDay.format('YYYY-MM-DD'));
            }
            const days = daysInQuarter.length / 7;
            this.yourPerformanceData[key] = earning / days;
        }
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
        let total = 0;
        flpsUserStores.forEach((store) => {
            const { pk_storeID } = store;
            const salesArray = [];
            const pyArray = [];
            data.forEach((monthData) => {
                let found = false;
                monthData.forEach((storeData) => {
                    if (storeData.storeID === pk_storeID) {
                        salesArray.push(storeData.SALES);
                        pyArray.push(storeData.PY);
                        total = total + storeData.SALES
                        found = true;
                    }
                });
                if (!found) {
                    salesArray.push(0);
                    pyArray.push(0);
                }
            });

            store.SALES = salesArray;
            store.PY = pyArray;
        });

        return { flpsUserStores, total };
    }

    barChartData() {
        this.ytdChart.series = [];
        this.ytdChart.colors = [];
        this.ytdChart.labels = [];
        this.ytdChart.xaxis.categories = [];
        this.yourPerformanceData.barChartLoader = true;
        this._changeDetectorRef.markForCheck();
        let barChartData: any = [];
        if (this.yourPerformanceData.userYTDMonthQuarter == 5) {
            barChartData = this.getRefactoredDataForBarCharts(this.ytDDataMain.monthlyData, this.ytDDataMain.flpsUserStores);
            this.ytdChart.xaxis.categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        } else if (this.yourPerformanceData.userYTDMonthQuarter == 1) {
            barChartData = this.getRefactoredDataForBarCharts(this.ytDDataMain.monthlyData.slice(0, 3), this.ytDDataMain.flpsUserStores);
            this.ytdChart.xaxis.categories = ['Jan', 'Feb', 'Mar'];
        } else if (this.yourPerformanceData.userYTDMonthQuarter == 2) {
            barChartData = this.getRefactoredDataForBarCharts(this.ytDDataMain.monthlyData.slice(3, 6), this.ytDDataMain.flpsUserStores);
            this.ytdChart.xaxis.categories = ['Apr', 'May', 'Jun'];
        } else if (this.yourPerformanceData.userYTDMonthQuarter == 3) {
            barChartData = this.getRefactoredDataForBarCharts(this.ytDDataMain.monthlyData.slice(6, 9), this.ytDDataMain.flpsUserStores);
            this.ytdChart.xaxis.categories = ['Jul', 'Aug', 'Sep'];
        } else if (this.yourPerformanceData.userYTDMonthQuarter == 4) {
            barChartData = this.getRefactoredDataForBarCharts(this.ytDDataMain.monthlyData.slice(9, 12), this.ytDDataMain.flpsUserStores);
            this.ytdChart.xaxis.categories = ['Oct', 'Nov', 'Dec'];
        }
        barChartData.flpsUserStores.forEach((store: any) => {
            this.ytdChart.series.push(
                { name: `${store.storeName} - ${this.currentYear - 1}`, data: store.PY }
            );
            this.ytdChart.series.push(
                { name: `${store.storeName} - ${this.currentYear}`, data: store.SALES }
            );
            this.yourPerformanceData.allColors.push(`#` + store.reportColor);
            this.ytdChart.colors.push(`#` + store.reportColor); // Adding the color again for the second series
            this.ytdChart.colors.push(`#` + store.reportColor);
            this.ytdChart.labels.push(`${store.storeName}`);
        });
        this.yourPerformanceData.barChartTotal = barChartData.total;
        setTimeout(() => {
            this.yourPerformanceData.barChartLoader = false;
            this._changeDetectorRef.markForCheck();
        }, 100);
        // this.ytdChart
    }
    // Store Remove From BarChart
    checkIfStoreIsRemovedForBarChart(store) {
        console.log(store);
    }
    addItemToBarChartHideList(store) {
        console.log(store);
    }
}
