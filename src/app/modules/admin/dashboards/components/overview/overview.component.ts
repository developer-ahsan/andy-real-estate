import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApexOptions } from 'ng-apexcharts';
import { DashboardsService } from '../../dashboard.service';

@Component({
    selector: 'overview',
    templateUrl: './overview.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardOverviewComponent implements OnInit, OnDestroy {
    chartVisitors: ApexOptions;
    chartConversions: ApexOptions;
    chartImpressions: ApexOptions;
    chartVisits: ApexOptions;
    chartVisitorsVsPageViews: ApexOptions;
    data: any;
    dataProject: any;

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


    // Table
    employeePerformanceData = [];
    employeePerformanceColumns: string[] = ['name', 't_sales', 'n_sales', 'a_sales', 'scr'];
    totalUsers = 0;
    page = 1;
    programPerformanceData = [];
    programPerformanceColumns: string[] = ['store', 'sales', 'py', 'percent', 'difference', 'n_sales', 'pyns', 'avg', 'margin'];
    totalPerformanceRecords = 0;
    pagePerformance = 1;
    /**
     * Constructor
     */
    constructor(
        private _analyticsService: DashboardsService,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.getAllPortfolioPerformance();
        this.dummyData();
        // Get the data
        this._analyticsService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.data = data;

                // Prepare the chart data
                this._prepareChartData();
            });
        this._analyticsService.dataProject$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // Store the data
                this.dataProject = data;
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
    }
    dummyData() {
        this.employeePerformanceData = [
            {
                name: 'Lindsey Myers',
                t_sales: 1095109.82,
                n_sales: 712,
                a_sales: 1538.08,
                scr: '0/62 (0%)'
            },
            {
                name: 'Rhianne Smith',
                t_sales: 446674.29,
                n_sales: 306,
                a_sales: 1459.72,
                scr: '7/21 (33.33%)'
            },
            {
                name: 'Matt Heldman',
                t_sales: 349269.93,
                n_sales: 180,
                a_sales: 1940.39,
                scr: '0/67 (0%)'
            },
            {
                name: 'Abena Oworae',
                t_sales: 223924.69,
                n_sales: 208,
                a_sales: 1076.56,
                scr: '3/13 (23.08%)'
            },
            {
                name: 'Andy Halm',
                t_sales: 199767.43,
                n_sales: 107,
                a_sales: 1866.99,
                scr: '0/13 (0%)'
            },
            {
                name: 'Ronny Vorthong',
                t_sales: 182892.60,
                n_sales: 137,
                a_sales: 1334.98,
                scr: '1/13 ( 7.69%)'
            }
        ]
    }
    getAllPortfolioPerformance() {
        this._analyticsService.portfolioData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.programPerformanceData = res["data"];
            this.totalPerformanceRecords = res["totalRecords"];
            this.programPerformanceData.forEach(element => {
                element.percent = Number(100 - (element.monthlyEarnings / element.previousYearSales) * 100);
                if (!element.percent) {
                    element.percent = 0;
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
                    element.difference = -1 * element.difference;
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
            console.log(this.programPerformanceData)
        });
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
            performance_report: true,
            size: 20,
            page: page
        }
        this._analyticsService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.programPerformanceData = res["data"];
            this.totalPerformanceRecords = res["totalRecords"];
        }, err => {
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
