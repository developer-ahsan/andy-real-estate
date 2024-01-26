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
    programPerformanceData = [];
    // Employee Performance
    employeePerformanceData = [];
    employeeListLoader: boolean = false;

    employeeStoresData: any;
    isEmployeeStoreLoader: boolean = false;
    expandedElement: any
    ytDDataMain: any;

    isPerformanceLoader: boolean = false;

    totalProgramPerformanceData: any;
    employeeName: string = '';
    /**
     * Constructor
     */
    constructor(
        public _analyticsService: DashboardsService,
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
        this.getEmployeePerformance();
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
    getEmployeePerformance() {
        let params = {
            employee_performance_list: true
        }
        this._analyticsService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.employeePerformanceData = res["data"];
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
    getAllPortfolioPerformance() {
        this.totalProgramPerformanceData = {
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
        let params = {
            performance_report: true
        }
        this._analyticsService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
            this.isPerformanceLoader = false;
            this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
            this.programPerformanceData = res["data"];
            this.programPerformanceData.forEach(element => {
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

                // Add a property 'sortKey' based on whether blnPercent is true or false
                element.sortKey = element.blnPercent ? element.percent : -element.percent;

                this.totalProgramPerformanceData.SALES = element.Grand_Sales;
                this.totalProgramPerformanceData.PY = element.Grand_LastYearSales;
                this.totalProgramPerformanceData.NS += element.NS;
                this.totalProgramPerformanceData.PYNS += element.PYNS;
                this.totalProgramPerformanceData.COST += element.cost;
                this.totalProgramPerformanceData.PRICE += element.price;
            });

            // Now, sort the array based on the 'sortKey'
            this.programPerformanceData.sort((a, b) => a.sortKey - b.sortKey);

            // Optional: Remove the 'sortKey' property if you don't need it in the final result
            this.programPerformanceData.forEach(element => {
                delete element.sortKey;
            });

            if (this.totalProgramPerformanceData.SALES > this.totalProgramPerformanceData.PY) {
                this.totalProgramPerformanceData.blnPercent = true;
                const diff = this.totalProgramPerformanceData.SALES - this.totalProgramPerformanceData.PY;
                if (this.totalProgramPerformanceData.PY == 0) {
                    this.totalProgramPerformanceData.PERCENT = 100;
                } else {
                    this.totalProgramPerformanceData.PERCENT = Math.round((diff / this.totalProgramPerformanceData.PY) * 100);
                }
            } else if (this.totalProgramPerformanceData.SALES < this.totalProgramPerformanceData.PY) {
                this.totalProgramPerformanceData.blnPercent = false;
                const diff = this.totalProgramPerformanceData.PY - this.totalProgramPerformanceData.SALES;
                if (this.totalProgramPerformanceData.SALES == 0) {
                    this.totalProgramPerformanceData.PERCENT = 100;
                } else {
                    this.totalProgramPerformanceData.PERCENT = Math.round((diff / this.totalProgramPerformanceData.PY) * 100);
                }
            } else {
                this.totalProgramPerformanceData.PERCENT = 0;
            }
            this.totalProgramPerformanceData.N_DIFF = Math.abs((this.totalProgramPerformanceData?.PYNS - this.totalProgramPerformanceData?.NS));
            this.totalProgramPerformanceData.AVG = this.totalProgramPerformanceData.SALES / this.totalProgramPerformanceData.NS;
            this.totalProgramPerformanceData.MARGIN = Math.ceil(((this.totalProgramPerformanceData.PRICE - this.totalProgramPerformanceData.COST) / this.totalProgramPerformanceData.PRICE) * 10000) / 100;
            this.totalProgramPerformanceData.DIFF = this.totalProgramPerformanceData.SALES - this.totalProgramPerformanceData.PY;
        }, err => {
        });
    }
    openedAccordion(item) {
        this.employeeStoresData = item;
        if (this.employeeName == item.EMPLOYEE) {
            this.employeeName = '';
        } else {
            this.employeeName = item.EMPLOYEE;
        }
        if (!item.storesData) {
            item.storeLoader = true;
            this._changeDetectorRef.markForCheck();
            this.getEmployeeStoresData();
        } else {
            item.storeLoader = false;
            this._changeDetectorRef.markForCheck();
        }
    }
    getEmployeeStoresData() {
        let params = {
            company_overview_employee_performance_store: true,
            user_id: this.employeeStoresData.pk_userID
        }
        this._analyticsService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
            this.employeeStoresData.storeLoader = false;
            this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
            res["data"].forEach(store => {
                if (store.SALES > store.PY) {
                    store.blnPercent = true;
                    const diff = store.SALES - store.PY;
                    if (store.PY == 0) {
                        store.percent = 100;
                    } else {
                        store.percent = Math.round((diff / store.PY) * 100);
                    }
                } else if (store.SALES < store.PY) {
                    store.blnPercent = false;
                    const diff = store.PY - store.SALES;
                    if (store.SALES == 0) {
                        store.percent = 100;
                    } else {
                        store.percent = Math.round((diff / store.PY) * 100);
                    }
                } else {
                    store.percent = 0;
                }
            });
            this.employeeStoresData.storesData = res["data"];
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
