import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexNonAxisChartSeries, ApexOptions, ApexPlotOptions, ApexResponsive, ApexStroke, ApexTitleSubtitle, ApexTooltip, ApexXAxis, ApexYAxis, ChartComponent } from 'ng-apexcharts';
import { DashboardsService } from '../../dashboard.service';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';

export type ChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    responsive: ApexResponsive[];
    labels: any;
};
export type ChartOptions1 = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    xaxis: ApexXAxis;
    colors: any;
    fill: ApexFill;
    tooltip: ApexTooltip;
    stroke: ApexStroke;
    legend: ApexLegend;
};
export type ChartOptions2 = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    dataLabels: ApexDataLabels;
    grid: ApexGrid;
    stroke: ApexStroke;
    title: ApexTitleSubtitle;
};
@Component({
    selector: 'project',
    templateUrl: './project.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectComponent implements OnInit, OnDestroy {
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
    @ViewChild("chart1") chart1: ChartComponent;
    public barChartOptions: Partial<ChartOptions1>;
    public chartOptions2: Partial<ChartOptions1>;
    public chartOptions3: Partial<ChartOptions2>;

    chartGithubIssues: ApexOptions = {};
    programPerformanceData = [];
    programPerformanceColumns: string[] = ['store', 'sales', 'py', 'percent', 'difference', 'n_sales', 'pyns', 'avg', 'margin'];
    isPerformanceLoader: boolean = false;
    totalPerformanceRecords = 0;
    pagePerformance = 1;

    // Employee Searchable
    allEmployees = [];
    searchEmployeeCtrl = new FormControl();
    selectedEmployee: any;
    isSearchingEmployee = false;
    // BarChart
    isBarChartLoader: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private _analyticsService: DashboardsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router
    ) {
        this._analyticsService.dataProject$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.testData = data;

                // Prepare the chart data
                this._prepareChartData();
            });
        this.chartOptions = {
            series: [44, 55, 13, 43, 22],
            chart: {
                width: 380,
                type: "pie"
            },
            labels: ["Team A", "Team B", "Team C", "Team D", "Team E"],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200
                        },
                        legend: {
                            position: "bottom"
                        }
                    }
                }
            ]
        }
        this.barChartOptions = {
            series: [],
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
                categories: []
            },
            yaxis: {
                title: {
                    // text: "$"
                },
                labels: {
                    formatter: function (val) {
                        return "$" + val.toLocaleString("en-US");
                    }
                }
            },
            colors: [],
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return "$ " + val.toLocaleString("en-US");
                    }
                }
            }
        };
        this.chartOptions2 = {
            series: [
                {
                    name: "2023",
                    data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
                }
            ],
            chart: {
                type: "bar",
                height: 350
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "70%"
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
                categories: [
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct"
                ]
            },
            yaxis: {
                title: {
                    text: "$ (thousands)"
                }
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return "$ " + val + " thousands";
                    }
                }
            }
        };
        this.chartOptions3 = {
            series: [
                {
                    name: "Sales",
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
                // text: "Product Trends by Month",
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
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep"
                ]
            }
        };
        this.chartGithubIssues = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            colors: ['#64748B', '#94A3B8'],
            dataLabels: {
                enabled: true,
                enabledOnSeries: [0],
                background: {
                    borderWidth: 0
                }
            },
            grid: {
                borderColor: 'var(--fuse-border)'
            },
            labels: this.testData.githubIssues.labels,
            legend: {
                show: false
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%'
                }
            },
            series: this.testData.githubIssues.series,
            states: {
                hover: {
                    filter: {
                        type: 'darken',
                        value: 0.75
                    }
                }
            },
            stroke: {
                width: [3, 0]
            },
            tooltip: {
                followCursor: true,
                theme: 'dark'
            },
            xaxis: {
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    color: 'var(--fuse-border)'
                },
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                },
                tooltip: {
                    enabled: false
                }
            },
            yaxis: {
                labels: {
                    offsetX: -16,
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                }
            }
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
        this._analyticsService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.data = data;

                // Prepare the chart data
                this._prepareChartData();
            });

        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any) => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any) => {
                        this._fixSvgFill(chart.el);
                    }
                }
            }
        };
        this.getSearchableEmployee();
        this.getEmployeeData();
    }
    getSearchableEmployee() {
        let params;
        this.searchEmployeeCtrl.valueChanges.pipe(
            filter((res: any) => {
                params = {
                    supplier: true,
                    bln_active: 1,
                    keyword: res
                }
                return res !== null && res.length >= 3
            }),
            distinctUntilChanged(),
            debounceTime(300),
            tap(() => {
                this.allEmployees = [];
                this.isSearchingEmployee = true;
                this._changeDetectorRef.markForCheck();
            }),
            switchMap(value => this._analyticsService.getDashboardData(params)
                .pipe(
                    finalize(() => {
                        this.isSearchingEmployee = false
                        this._changeDetectorRef.markForCheck();
                    }),
                )
            )
        ).subscribe((data: any) => {
            this.allEmployees = data['data'];
        });
    }
    getEmployeeData() {
        this._analyticsService.employeeData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.allEmployees = res["data"];
        });
    }
    calledScreen(screen) {
        this.mainScreen = screen;
    }
    onSelected(ev) {
        this.selectedEmployee = ev.option.value;
        this.isPerformanceLoader = true;
        this.isBarChartLoader = true;
        this.getPortfolioData(1);
    }
    displayWith(value: any) {
        let name = value?.firstName + ' ' + value?.lastName;
        if (!value?.firstName) {
            name = '';
        }
        return name;
    }

    getNextPortfolioData(event) {
        const { previousPageIndex, pageIndex } = event;
        if (pageIndex > previousPageIndex) {
            this.pagePerformance++;
        } else {
            this.pagePerformance--;
        };
        this.getPortfolioData(this.pagePerformance);
    };
    getPortfolioData(page) {
        let params = {
            stores_per_employee: true,
            size: 20,
            page: page,
            user_id: this.selectedEmployee.pk_userID
        }
        this._analyticsService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
            this.isPerformanceLoader = false;
            this.getBarChartData();
            this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
            this.programPerformanceData = res["data"];
            this.totalPerformanceRecords = res["totalRecords"];
            this.programPerformanceData.forEach(element => {
                element.percent = Number(100 - (element.monthlyEarnings / element.previousYearSales) * 100);
                if (!element.percent) {
                    element.percent = 0;
                    element.color = 'gray';
                }
                if (element.percent < 0) {
                    element.color = 'red';
                } else if (element.percent > 0) {
                    element.color = 'green'
                } else {
                    element.color = 'gray';
                }
                element.difference = Number(element.monthlyEarnings - element.previousYearSales);
                if (!element.difference) {
                    element.difference = 0;
                }
                if (element.difference < 0) {
                    element.difference = Math.abs(element.difference);
                }
                element.avg = Number(element.monthlyEarnings / element.NS);
                if (!element.avg) {
                    element.avg = 0;
                }
                element.margin = Number(((element.price - element.cost) / element.price) * 100);
                if (!element.margin) {
                    element.margin = 0;
                }
            });
        }, err => {
        });
    }
    getBarChartData() {
        let stores_list = [];
        this.programPerformanceData.forEach(element => {
            stores_list.push(element.pk_storeID);
        });
        this._changeDetectorRef.markForCheck();
        let params = {
            monthly_bar_graph_per_manager: true,
            size: 20,
            stores_list: stores_list.toString(),
            user_id: this.selectedEmployee.pk_userID
        }
        this._analyticsService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
            this.isBarChartLoader = false;
            this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
            const seriesData = [];
            let months = this.getCurrentAndPreviousMonthNames();
            res["data"].forEach((store: any) => {
                let data = [];
                months.forEach(month => {
                    data.push(store[month + 'Earnings']);
                });
                const seriesItem = {
                    name: store.storeName,
                    data: data,
                };
                const index = this.programPerformanceData.findIndex(item => item.pk_storeID == store.pk_storeID);
                this.barChartOptions.colors.push('#' + this.programPerformanceData[index].reportColor);
                seriesData.push(seriesItem);
            });
            this.barChartOptions.xaxis.categories = this.getCurrentAndPreviousMonthNamesHalf();
            this.barChartOptions.series = seriesData;
            // res["data"].forEach((element, index) => {
            //     data.push()
            //     this.barChartOptions.series.push({ name: element.storeName, data: })
            // });
            // this.programPerformanceData = res["data"];
            // this.totalPerformanceRecords = res["totalRecords"];
        }, err => {
        });
    }
    getCurrentAndPreviousMonthNames() {
        const currentMonthNumber = moment().month() + 1;
        const previousMonthNames = [];
        for (let i = 1; i <= currentMonthNumber; i++) {
            const monthName = moment().subtract(currentMonthNumber - i, "month").format("MMMM");
            previousMonthNames.push(monthName);
        }
        return previousMonthNames;
    }
    getCurrentAndPreviousMonthNamesHalf() {
        const currentMonthNumber = moment().month() + 1;
        const previousMonthNames = [];
        for (let i = 1; i <= currentMonthNumber; i++) {
            const monthName = moment().subtract(currentMonthNumber - i, "month").format("MMM");
            previousMonthNames.push(monthName);
        }
        return previousMonthNames;
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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter(el => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) => {
                const attrVal = el.getAttribute('fill');
                el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
            });
    }

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void {
        // Visitors
        this.chartVisitors = {
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
                height: '100%',
                type: 'area',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            colors: ['#818CF8'],
            dataLabels: {
                enabled: false
            },
            fill: {
                colors: ['#312E81']
            },
            grid: {
                show: true,
                borderColor: '#334155',
                padding: {
                    top: 10,
                    bottom: -40,
                    left: 0,
                    right: 0
                },
                position: 'back',
                xaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            series: this.data.visitors.series,
            stroke: {
                width: 2
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
                x: {
                    format: 'MMM dd, yyyy'
                },
                y: {
                    formatter: (value: number): string => `${value}`
                }
            },
            xaxis: {
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                crosshairs: {
                    stroke: {
                        color: '#475569',
                        dashArray: 0,
                        width: 2
                    }
                },
                labels: {
                    offsetY: -20,
                    style: {
                        colors: '#CBD5E1'
                    }
                },
                tickAmount: 20,
                tooltip: {
                    enabled: false
                },
                type: 'datetime'
            },
            yaxis: {
                axisTicks: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                min: min => min - 750,
                max: max => max + 250,
                tickAmount: 5,
                show: false
            }
        };

        // Conversions
        this.chartConversions = {
            chart: {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'area',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#38BDF8'],
            fill: {
                colors: ['#38BDF8'],
                opacity: 0.5
            },
            series: this.data.conversions.series,
            stroke: {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme: 'dark'
            },
            xaxis: {
                type: 'category',
                categories: this.data.conversions.labels
            },
            yaxis: {
                labels: {
                    formatter: val => val.toString()
                }
            }
        };

        // Impressions
        this.chartImpressions = {
            chart: {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'area',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#34D399'],
            fill: {
                colors: ['#34D399'],
                opacity: 0.5
            },
            series: this.data.impressions.series,
            stroke: {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme: 'dark'
            },
            xaxis: {
                type: 'category',
                categories: this.data.impressions.labels
            },
            yaxis: {
                labels: {
                    formatter: val => val.toString()
                }
            }
        };

        // Visits
        this.chartVisits = {
            chart: {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'area',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#FB7185'],
            fill: {
                colors: ['#FB7185'],
                opacity: 0.5
            },
            series: this.data.visits.series,
            stroke: {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme: 'dark'
            },
            xaxis: {
                type: 'category',
                categories: this.data.visits.labels
            },
            yaxis: {
                labels: {
                    formatter: val => val.toString()
                }
            }
        };

        // Visitors vs Page Views
        this.chartVisitorsVsPageViews = {
            chart: {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'area',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            colors: ['#64748B', '#94A3B8'],
            dataLabels: {
                enabled: false
            },
            fill: {
                colors: ['#64748B', '#94A3B8'],
                opacity: 0.5
            },
            grid: {
                show: false,
                padding: {
                    bottom: -40,
                    left: 0,
                    right: 0
                }
            },
            legend: {
                show: false
            },
            series: this.data.visitorsVsPageViews.series,
            stroke: {
                curve: 'smooth',
                width: 2
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
                x: {
                    format: 'MMM dd, yyyy'
                }
            },
            xaxis: {
                axisBorder: {
                    show: false
                },
                labels: {
                    offsetY: -20,
                    rotate: 0,
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                },
                tickAmount: 3,
                tooltip: {
                    enabled: false
                },
                type: 'datetime'
            },
            yaxis: {
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                },
                max: max => max + 250,
                min: min => min - 250,
                show: false,
                tickAmount: 5
            }
        };

        // New vs. returning
        this.chartNewVsReturning = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#3182CE', '#63B3ED'],
            labels: this.data.newVsReturning.labels,
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%'
                    }
                }
            },
            series: this.data.newVsReturning.series,
            states: {
                hover: {
                    filter: {
                        type: 'none'
                    }
                },
                active: {
                    filter: {
                        type: 'none'
                    }
                }
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w
                }) => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                            <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                            <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                            <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                        </div>`
            }
        };

        // Gender
        this.chartGender = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#319795', '#4FD1C5'],
            labels: this.data.gender.labels,
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%'
                    }
                }
            },
            series: this.data.gender.series,
            states: {
                hover: {
                    filter: {
                        type: 'none'
                    }
                },
                active: {
                    filter: {
                        type: 'none'
                    }
                }
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w
                }) => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                            <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                            <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                            <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                        </div>`
            }
        };

        // Age
        this.chartAge = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#DD6B20', '#F6AD55'],
            labels: this.data.age.labels,
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%'
                    }
                }
            },
            series: this.data.age.series,
            states: {
                hover: {
                    filter: {
                        type: 'none'
                    }
                },
                active: {
                    filter: {
                        type: 'none'
                    }
                }
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w
                }) => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                            <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                            <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                            <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                        </div>`
            }
        };

        // Language
        this.chartLanguage = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#805AD5', '#B794F4'],
            labels: this.data.language.labels,
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%'
                    }
                }
            },
            series: this.data.language.series,
            states: {
                hover: {
                    filter: {
                        type: 'none'
                    }
                },
                active: {
                    filter: {
                        type: 'none'
                    }
                }
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w
                }) => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                            <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                            <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                            <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                        </div>`
            }
        };
    }
}
