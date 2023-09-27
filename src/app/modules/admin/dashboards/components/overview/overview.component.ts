import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ApexOptions } from 'ng-apexcharts';
import { DashboardsService } from '../../dashboard.service';
import { fuseAnimations } from '@fuse/animations';

@Component({
    selector: 'overview',
    templateUrl: './overview.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class DashboardOverviewComponent implements OnInit, OnDestroy {


    private _unsubscribeAll: Subject<any> = new Subject<any>();


    // Table

    page = 1;
    programPerformanceData = [];
    programPerformanceColumns: string[] = ['store', 'sales', 'py', 'percent', 'difference', 'n_sales', 'pyns', 'avg', 'margin'];
    totalPerformanceRecords = 0;
    pagePerformance = 1;

    // Employee Performance
    employeePerformanceData = [];
    employeePerformanceColumns: string[] = ['name', 't_sales', 'n_sales', 'a_sales', 'scr', 'action'];
    totalEmployees = 0;
    employeePage = 1;
    employeeListLoader: boolean = false;

    employeeStoresData: any;
    isEmployeeStoreLoader: boolean = false;
    expandedElement: any
    ytDDataMain: any;

    sortOrder: string = 'ASC'
    sortBy: string = 'monthlyEarnings';
    isPerformanceLoader: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private _analyticsService: DashboardsService,
        private _changeDetectorRef: ChangeDetectorRef,
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
        this.getYTDData();
        this.employeeListLoader = true;
        this.isPerformanceLoader = true;
        this.getAllPortfolioPerformance();
        this.getEmployeePerformance(1);
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
                console.log(this.ytDDataMain);
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
    getEmployeePerformance(page) {
        let params = {
            employee_performance_list: true,
            size: 20,
            page: page
        }
        this._analyticsService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.employeePerformanceData = res["data"];
            this.totalEmployees = res["totalRecords"];
            this.employeePerformanceData.forEach(element => {
                element.avg = Number(element.TOTAL_SALES / element.NS);
                element.scr = 0
            });
            this.employeeListLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.employeeListLoader = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    getNextEmployeeData(event) {
        const { previousPageIndex, pageIndex } = event;
        if (pageIndex > previousPageIndex) {
            this.employeePage++;
        } else {
            this.employeePage--;
        };
        this.getEmployeePerformance(this.employeePage);
    };
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
                if (element.previousYearSales == 0) {
                    element.percent = 0
                } else {
                    element.percent = Math.round(Number(100 - (element.monthlyEarnings / element.previousYearSales) * 100));
                }
                if (element.percent == 0) {
                    element.percent = 0;
                    element.color = 'gray';
                }
                if (element.percent < 0) {
                    element.percent = element.percent * -1;
                    element.color = 'green';
                } else if (element.percent > 0) {
                    element.color = 'red'
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
            this.isPerformanceLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isPerformanceLoader = false;
            this._changeDetectorRef.markForCheck();
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
    sortData(ev) {
        this.isPerformanceLoader = true;
        this._changeDetectorRef.markForCheck();
        if (ev.active == 'sales') {
            this.sortBy = 'monthlyEarnings';
            if (ev.direction == '') {
                this.sortOrder = 'ASC';
            } else {
                this.sortOrder = ev.direction;
            }
        }
        this.getPortfolioData(1);
    }
    getPortfolioData(page) {
        let params = {
            performance_report: true,
            sort_order: this.sortOrder,
            sort_by: this.sortBy,
            size: 20,
            page: page
        }
        this._analyticsService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.programPerformanceData = res["data"];
            this.totalPerformanceRecords = res["totalRecords"];
            this.programPerformanceData.forEach(element => {
                if (element.previousYearSales == 0) {
                    element.percent = 0
                } else {
                    element.percent = Math.round(Number(100 - (element.monthlyEarnings / element.previousYearSales) * 100));
                }
                if (!element.percent) {
                    element.percent = 0;
                    element.color = 'gray';
                }
                if (element.percent < 0) {
                    element.percent = element.percent * -1;
                    element.color = 'green';
                } else if (element.percent > 0) {
                    element.color = 'red'
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
            this.isPerformanceLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isPerformanceLoader = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    openedAccordion(item) {
        this.employeeStoresData = item;
        if (!item.storesData) {
            item.storeLoader = true;
            this._changeDetectorRef.markForCheck();
            this.getEmployeeStoresData(1);
        } else {
            item.storeLoader = false;
            this._changeDetectorRef.markForCheck();
        }
    }
    getEmployeeStoresData(page) {
        let params = {
            stores_per_employee: true,
            size: 20,
            page: page,
            user_id: this.employeeStoresData.pk_userID
        }
        this._analyticsService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
            this.employeeStoresData.storeLoader = false;
            this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
            this.employeeStoresData.storesData = res["data"];
            this.employeeStoresData.totalRecords = res["totalRecords"];
            this.employeeStoresData.storesData.forEach(element => {
                if (element.previousYearSales == 0) {
                    element.percent = 0
                } else {
                    element.percent = Math.round(Number(100 - (element.monthlyEarnings / element.previousYearSales) * 100));
                }
                if (!element.percent) {
                    element.percent = 0;
                    element.color = 'gray';
                }
                if (element.percent < 0) {
                    element.percent = element.percent * -1;
                    element.color = 'green';
                } else if (element.percent > 0) {
                    element.color = 'red'
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
