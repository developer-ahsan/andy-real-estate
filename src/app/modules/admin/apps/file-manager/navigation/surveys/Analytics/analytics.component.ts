import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    ApexAxisChartSeries,
    ApexChart,
    ChartComponent,
    ApexDataLabels,
    ApexXAxis,
    ApexPlotOptions
} from "ng-apexcharts";

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    xaxis: ApexXAxis;
};

@Component({
    selector: 'app-surveys-analytics',
    templateUrl: './analytics.component.html'
})
export class SurveysAnalyticsComponent implements OnInit, OnDestroy {
    selectedStore: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    public chartOptions: Partial<ChartOptions>;


    qrySurvey = {
        name: 'Your Survey Name' // Replace this with your actual survey name
        // Add other properties if needed
    };
    quarters = ['1-3', '4-6', '7-9', '10-12']; // Replace with actual quarter values
    years = [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]; // Replace with actual year values

    todayquarter = '10-12'; // Replace with actual selected quarter
    todayyear = 2023; // Replace with actual selected year


    constructor(
        private _storeManagerService: FileManagerService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.getStoreDetails();
        this.chartOptions = {
            series: [
                {
                    // name: "basic",
                    data: [0.0, 1.0, 0.0, 0.0]
                }
            ],
            chart: {
                type: "bar",
                height: 350
            },
            plotOptions: {
                bar: {
                    horizontal: true
                }
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: [
                    "Answer",
                    "Answer",
                    "Answer",
                    "Answer",
                ]
            }
        };
    };
    getStoreDetails() {
        this._storeManagerService.storeDetail$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: any) => {
                this.selectedStore = items["data"][0]
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    };
}
