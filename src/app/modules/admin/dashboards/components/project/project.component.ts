import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexNonAxisChartSeries, ApexOptions, ApexPlotOptions, ApexResponsive, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent } from 'ng-apexcharts';
import { DashboardsService } from '../../dashboard.service';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';

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
export type ChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    responsive: ApexResponsive[];
    labels: any;
    colors: string[];
    dataLabels: ApexDataLabels;
    yaxis: ApexYAxis;

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
@Component({
    selector: 'project',
    templateUrl: './project.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectComponent implements OnInit, OnDestroy {
    public ytdChart: Partial<ChartOptions1>;
    public quarterChart: Partial<ChartOptions1>;
    annualChartOptions: Partial<AnnualChartOptions>;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    programPerformanceData = [];

    // Employee Searchable
    allEmployees = [];
    selectedEmployee: any = '';
    // BarChart
    isBarChartLoader: boolean = false;


    totalStoreSummary: any;
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
    programPortfolioData: any;
    /**
     * Constructor
     */

    constructor(
        public _analyticsService: DashboardsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router
    ) {
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
                enabled: true,
                formatter: function (val) {
                    return '$' + `${val.toLocaleString()}`;
                },
            },
            stroke: {
                curve: "straight",
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
        this.getEmployeeData();
    }
    getEmployeeData() {
        this._analyticsService.employeeData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.allEmployees.push({ email: '', name: 'Select Program Manager' });
            let employees = res["data"][0].flpsUsers.split(',');
            employees.forEach(element => {
                const [id, username, name, a, b, c, email] = element.split(':');
                this.allEmployees.push({ id, username, name, email });
            });
        });
    }
    onSelected(ev) {
        this.selectedEmployee = ev.value;
        if (this.selectedEmployee != '') {
            this.isPortfolioLoader = true;
            this.isPerformanceLoader = true;
            this.getPortfolioData();
            this.getPerformanceData();
        }

    }
    getPortfolioData() {
        // Set initial loader flags to true
        this.yourPerformanceData.allStoresGraphLoader = true;
        this.yourPerformanceData.q1Loader = true;
        this.yourPerformanceData.q2Loader = true;
        this.yourPerformanceData.q3Loader = true;
        this.yourPerformanceData.q4Loader = true;

        this.storesData = [];
        const params = {
            portfolio_performance: true,
            email: this.selectedEmployee,
        };

        // Create a function to calculate the percent
        const calculatePercent = (value: number, reference: number): number => {
            if (reference === 0) {
                return 100;
            } else {
                return Math.round((Math.abs(value - reference) / reference) * 100);
            }
        };

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
            blnPercent: false,
        };

        this._analyticsService
            .getDashboardData(params)
            .pipe(
                takeUntil(this._unsubscribeAll),
                finalize(() => {
                    this.isPortfolioLoader = false;
                    this._changeDetectorRef.markForCheck();
                    this.yourPerformanceData.allStoresGraphLoader = false;
                })
            )
            .subscribe(
                (res) => {
                    this.programPortfolioData = res["data"];
                    this.programPortfolioData.forEach((element) => {
                        // Add data to Chrt
                        this.yourPerformanceData.allSeriesData.push(element.SALES);
                        this.yourPerformanceData.allSeriesLabel.push(element.storeName);
                        this.storesData.push({
                            storeName: element.storeName,
                            pk_storeID: element.storeID,
                        });

                        if (element.SALES > element.PY) {
                            element.blnPercent = true;
                            element.percent = calculatePercent(element.SALES, element.PY);
                        } else if (element.SALES < element.PY) {
                            element.blnPercent = false;
                            element.percent = calculatePercent(element.SALES, element.PY);
                        } else {
                            element.percent = 0;
                        }

                        // Update totalStoreSummary values
                        this.totalStoreSummary.SALES += element.SALES;
                        this.totalStoreSummary.PY += element.PY;
                        this.totalStoreSummary.NS += element.NS;
                        this.totalStoreSummary.PYNS += element.PYNS;
                        this.totalStoreSummary.COST += element.cost;
                        this.totalStoreSummary.PRICE += element.price;
                        this.totalStoreSummary.TAX += element.tax;
                    });

                    // Calculate totalStoreSummary values
                    if (this.totalStoreSummary.SALES > this.totalStoreSummary.PY) {
                        this.totalStoreSummary.blnPercent = true;
                        this.totalStoreSummary.PERCENT = calculatePercent(
                            this.totalStoreSummary.SALES,
                            this.totalStoreSummary.PY
                        );
                    } else if (this.totalStoreSummary.SALES < this.totalStoreSummary.PY) {
                        this.totalStoreSummary.blnPercent = false;
                        this.totalStoreSummary.PERCENT = calculatePercent(
                            this.totalStoreSummary.SALES,
                            this.totalStoreSummary.PY
                        );
                    } else {
                        this.totalStoreSummary.PERCENT = 0;
                    }

                    this.totalStoreSummary.N_DIFF = Math.abs(
                        this.totalStoreSummary.PYNS - this.totalStoreSummary.NS
                    );
                    this.totalStoreSummary.AVG =
                        this.totalStoreSummary.SALES / this.totalStoreSummary.NS;
                    this.totalStoreSummary.MARGIN =
                        Math.ceil(
                            ((this.totalStoreSummary.PRICE - this.totalStoreSummary.COST) /
                                this.totalStoreSummary.PRICE) *
                            10000
                        ) / 100;
                    this.totalStoreSummary.DIFF =
                        this.totalStoreSummary.SALES - this.totalStoreSummary.PY;

                    this._changeDetectorRef.markForCheck();
                },
                (err) => { }
            );

    }
    getPerformanceData() {
        // Constants
        const COLOR_PREFIX = '#';
        const currentYear = moment().year();

        const initializeStore = ({ storeName, pk_storeID }) => ({
            storeName,
            pk_storeID,
            ytdSeries: [{ name: 'Sales', data: [] }],
            xaxis: { categories: [] },
            colors: [],
            ytd: [],
            annual: [],
            annualSeries: [{ name: 'Sales', data: [] }],
            annualxaxis: { categories: [] },
            annualColors: [],
            quarter: {},
            quarterSeries: [],
            quarterxaxis: { categories: [1, 2, 3, 4] },
            quarterColors: [],
        });

        const processYTD = (element, stores) => {
            const { earnings, reportColor, orderDate, pk_storeID, storeName } = element;
            const existingStore = stores.find(store => store.pk_storeID === pk_storeID);

            const ytdValues = {
                earnings,
                reportColor,
                orderDate,
            };

            if (!existingStore) {
                const newStore = initializeStore({ storeName, pk_storeID });
                newStore.ytd.push(ytdValues);
                newStore.ytdSeries[0].data.push(earnings);
                newStore.xaxis.categories.push(orderDate);
                newStore.colors.push(COLOR_PREFIX + reportColor);
                stores.push(newStore);
            } else {
                existingStore.ytd.push(ytdValues);
                existingStore.ytdSeries[0].data.push(earnings);
                existingStore.xaxis.categories.push(orderDate);
                existingStore.colors.push(COLOR_PREFIX + reportColor);
            }
        };

        const processAnnual = (element, stores) => {
            const { total, year, reportColor, pk_storeID, storeName } = element;
            const existingStore = stores.find(store => store.pk_storeID === pk_storeID);

            const annualValues = {
                total,
                reportColor,
                year,
            };

            if (!existingStore) {
                const newStore = initializeStore({ storeName, pk_storeID });
                newStore.annual.push(annualValues);
                newStore.annualSeries[0].data.push(total);
                newStore.annualxaxis.categories.push(year);
                newStore.annualColors.push(COLOR_PREFIX + reportColor);
                stores.push(newStore);
            } else {
                existingStore.annual.push(annualValues);
                existingStore.annualSeries[0].data.push(total);
                existingStore.annualxaxis.categories.push(year);
                existingStore.annualColors.push(COLOR_PREFIX + reportColor);
            }
        };

        const processQuarter = (element, stores) => {
            const { orderYear, orderQuarter, earnings, reportColor, pk_storeID, storeName } = element;
            const existingStore = stores.find(store => store.pk_storeID === pk_storeID);

            if (!existingStore.quarter) {
                existingStore.quarter = {};
            }

            if (!existingStore.quarter[orderYear]) {
                existingStore.quarter[orderYear] = [];
            }

            const quarterValues = {
                earnings,
                reportColor,
                year: orderYear,
                orderQuarter,
            };

            const existingQuarter = existingStore.quarter[orderYear].find(q => q.quarter === orderQuarter);

            if (existingQuarter) {
                existingQuarter.data.push(quarterValues);
            } else {
                existingStore.quarter[orderYear].push({ quarter: orderQuarter, data: [quarterValues] });
            }

            existingStore.quarterColors.push(COLOR_PREFIX + reportColor);
        };

        let params = {
            program_performance: true,
            email: this.selectedEmployee,
        };

        this._analyticsService.getDashboardData(params)
            .pipe(takeUntil(this._unsubscribeAll), finalize(() => {
                this.isPerformanceLoader = false;
                this.yourPerformanceData.q1Loader = false;
                this.yourPerformanceData.q2Loader = false;
                this.yourPerformanceData.q3Loader = false;
                this.yourPerformanceData.q4Loader = false;
                this._changeDetectorRef.markForCheck();
            }))
            .subscribe(res => {
                const stores = [];
                const { ytd, annual, quarter } = res["data"];

                ytd.forEach(element => processYTD(element, stores));
                annual.forEach(element => processAnnual(element, stores));
                quarter.forEach(element => processQuarter(element, stores));

                stores.forEach(store => {
                    this.yourPerformanceData.allColors.push(store.colors[0]);
                    store.quarterSeries = Object.keys(store.quarter).map(quarter => ({
                        name: quarter,
                        data: store.quarter[quarter].map(q => q.data[0].earnings),
                    }));

                    store.quarterColors = store.quarterSeries.map(qs =>
                        COLOR_PREFIX + store.quarter[qs.name][0].data[0].reportColor
                    );

                    store.quarter[`${currentYear}`]?.forEach(element => {
                        const quarterIndex = element.orderQuarter - 1;
                        const earnings = element.data[0].earnings;

                        if (quarterIndex === 0) {
                            this.yourPerformanceData.q1Earnings += earnings;
                            this.yourPerformanceData.q1SeriesData.push(earnings);
                            this.yourPerformanceData.q1SeriesLabel.push(store.storeName);
                            this.yourPerformanceData.q1Colors.push(
                                COLOR_PREFIX + element.data[0].reportColor
                            );
                        } else if (quarterIndex === 1) {
                            this.yourPerformanceData.q2SeriesData.push(earnings);
                            this.yourPerformanceData.q2SeriesLabel.push(store.storeName);
                            this.yourPerformanceData.q2Colors.push(
                                COLOR_PREFIX + element.data[0].reportColor
                            );
                        } else if (quarterIndex === 2) {
                            this.yourPerformanceData.q3SeriesData.push(earnings);
                            this.yourPerformanceData.q3SeriesLabel.push(store.storeName);
                            this.yourPerformanceData.q3Colors.push(
                                COLOR_PREFIX + element.data[0].reportColor
                            );
                        } else if (quarterIndex === 3) {
                            this.yourPerformanceData.q4SeriesData.push(earnings);
                            this.yourPerformanceData.q4SeriesLabel.push(store.storeName);
                            this.yourPerformanceData.q4Colors.push(
                                COLOR_PREFIX + element.data[0].reportColor
                            );
                        }
                    });
                });

                this.programPerformanceData = stores;
                this._changeDetectorRef.markForCheck();
            });
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
