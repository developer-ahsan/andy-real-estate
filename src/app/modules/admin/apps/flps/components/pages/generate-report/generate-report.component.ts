import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import moment from 'moment';
import { fromEvent, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { FLPSService } from '../../flps.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { updateReport } from '../../flps.types';

@Component({
    selector: 'app-generate-report',
    templateUrl: './generate-report.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerateReportComponent implements OnInit {
    planBillingForm: FormGroup;
    plans: any[];
    @Input() isLoading: boolean;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    employeeAdmins = [];
    ngEmployee = 12885;
    ngPlan = 'weekly';
    maxDate = new Date();
    months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    month = 1;
    currentYear = new Date().getFullYear();
    years = [];

    quarter = 1;
    quarterly = [{
        value: 1,
        text: '1-3'
    },
    {
        value: 2,
        text: '4-6'
    },
    {
        value: 3,
        text: '7-9'
    },
    {
        value: 4,
        text: '10-12'
    }];


    searcEmployeeCtrl = new FormControl();
    selectedEmployee: any;
    isSearching = false;
    minLengthTerm = 3;

    // Report
    WeekDate = new Date();
    monthlyMonth = 1;
    monthlyYear = new Date().getFullYear();
    quarterMonth = 1;
    quarterYear = new Date().getFullYear();
    yearlyYear = new Date().getFullYear();
    ngRangeStart = new Date();
    ngRangeEnd = new Date();

    generateReportLoader: boolean = false;
    isGenerateReport: boolean = false;

    // Orders Data
    dataSource = [];
    displayedColumns: string[] = ['date', 'id', 'store_name', 'payment', 'action'];
    totalUsers = 0;
    page = 1;
    reportParams: any;
    report_type = '';
    ngReportType = 1;

    groupByStoresData: any;
    reportSummaryData: any;
    isUpdateCommissionLoader: boolean = false;
    blnSendEmail: boolean = false;
    @ViewChild('topScrollAnchor') topScroll: ElementRef;
    @ViewChild('summaryScrollAnchor') summaryScrollAnchor: ElementRef;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _flpsService: FLPSService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        for (let index = 0; index < 17; index++) {
            this.years.push(this.currentYear - index);
        }
        this.getEmployees();
        // Create the form
        this.planBillingForm = this._formBuilder.group({
            plan: ['team'],
            cardHolder: ['Brian Hughes'],
            cardNumber: [''],
            cardExpiration: [''],
            cardCVC: [''],
            country: ['usa'],
            zip: ['']
        });

        // Setup the plans
        this.plans = [
            {
                value: 'weekly',
                label: 'Weekly',
                details: 'Choose a date.',
                price: '10'
            },
            {
                value: 'monthly',
                label: 'Monthly',
                details: 'Choose month and year.',
                price: '20'
            },
            {
                value: 'quarterly',
                label: 'Quarterly',
                details: 'Generate quarterly report.',
                price: '40'
            },
            {
                value: 'yearly',
                label: 'Yearly',
                details: 'Choose a year.',
                price: '40'
            },
            {
                value: 'range',
                label: 'Range',
                details: 'Generate range report.',
                price: '40'
            }
        ];
        let params;
        this.searcEmployeeCtrl.valueChanges.pipe(
            filter(res => {
                params = {
                    view_store_all_admins: true,
                    keyword: res
                }
                if (res.length == 0) {
                    this.getEmployees();
                }
                return res !== null && res.length >= this.minLengthTerm
            }),
            distinctUntilChanged(),
            debounceTime(500),
            tap(() => {
                this.employeeAdmins = [];
                this.isSearching = true;
                this._changeDetectorRef.markForCheck();
            }),
            switchMap(value => this._flpsService.getFlpsData(params)
                .pipe(
                    finalize(() => {
                        this.isSearching = false
                        this._changeDetectorRef.markForCheck();
                    }),
                )
            )
        )
            .subscribe((data: any) => {
                this.employeeAdmins = data['data'];
            });
    }
    onSelected(ev) {
        this.selectedEmployee = ev.option.value;
    }

    displayWith(value: any) {
        return value ? value?.firstName + ' ' + value?.lastName : '';
    }

    getEmployees() {
        this._flpsService.reportUsers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.employeeAdmins = res["data"];
        })
    }
    generateReport() {
        if (!this.selectedEmployee) {
            this._flpsService.snackBar('Please select any flps user');
            return;
        }
        this.generateReportLoader = true;
        this.reportParams = {
            page: this.page,
            start_date: '',
            end_date: '',
            flps_user_id: this.selectedEmployee.pk_userID,
            report_type: this.ngReportType,
            options_report: true
        };
        if (this.ngPlan == 'weekly') {
            this.reportParams.start_date = moment(this.WeekDate).startOf('week').format('yyyy-MM-DD');
            this.reportParams.end_date = moment(this.WeekDate).endOf('week').format('yyyy-MM-DD');
            this.report_type = 'Weekly Sales';
        } else if (this.ngPlan == 'monthly') {
            let d = new Date(this.monthlyYear, this.monthlyMonth - 1, 1);
            this.reportParams.start_date = moment(d).startOf('month').format('yyyy-MM-DD');
            this.reportParams.end_date = moment(d).endOf('month').format('yyyy-MM-DD');
            this.report_type = 'Monthly Sales';
        } else if (this.ngPlan == 'quarterly') {
            let s;
            let e;
            if (this.quarterMonth == 1) {
                s = new Date(this.quarterYear, 0, 1);
                e = new Date(this.quarterYear, 2, 1);
            } else if (this.quarterMonth == 2) {
                s = new Date(this.quarterYear, 3, 1);
                e = new Date(this.quarterYear, 5, 1);
            } else if (this.quarterMonth == 3) {
                s = new Date(this.quarterYear, 6, 1);
                e = new Date(this.quarterYear, 8, 1);
            } else if (this.quarterMonth == 4) {
                s = new Date(this.quarterYear, 9, 1);
                e = new Date(this.quarterYear, 11, 1);
            }
            this.reportParams.start_date = moment(s).startOf('month').format('yyyy-MM-DD');
            this.reportParams.end_date = moment(e).endOf('month').format('yyyy-MM-DD');
            this.report_type = 'Quarterly Sales';
        } else if (this.ngPlan == 'yearly') {
            let d = new Date(this.yearlyYear, 0, 1);
            this.reportParams.start_date = moment(d).startOf('year').format('yyyy-MM-DD');
            this.reportParams.end_date = moment(d).endOf('year').format('yyyy-MM-DD');
        } else if (this.ngPlan == 'range') {
            this.reportParams.start_date = moment(this.ngRangeStart).format('yyyy-MM-DD');
            this.reportParams.end_date = moment(this.ngRangeEnd).format('yyyy-MM-DD');
            this.report_type = 'Range Sales';
        }
        this._flpsService.getFlpsData(this.reportParams).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["data"].length == 0) {
                this._flpsService.snackBar('No orders have been found in the specified range that match your criteria.');
            }
            this.isGenerateReport = true;
            this.dataSource = res["data"];
            this.totalUsers = res["totalRecords"];
            let groupByStores = [];
            this.dataSource.forEach(element => {
                element.checked = false;
                element.disabled = false;
                if (element.paymentDate) {
                    let paymentDate = moment(element.paymentDate);
                    let start_date = moment(this.reportParams.start_date);
                    let end_date = moment(this.reportParams.end_date);
                    if (paymentDate.diff(start_date, 'days') > 0 && paymentDate.diff(end_date, 'days') < 0) {
                        element.color = 'green';
                    }
                } else {
                    element.color = null;
                }
                if (element.commissionPaidDate) {
                    element.checked = true;
                    element.disabled = true;
                } else if (element.paymentDate) {
                    let paymentDate = moment(element.paymentDate);
                    let start_date = moment(this.reportParams.start_date);
                    let end_date = moment(this.reportParams.end_date);
                    if (paymentDate.diff(start_date, 'days') > 0 && paymentDate.diff(end_date, 'days') < 0) {
                        element.checked = true;
                    }
                }
                if (groupByStores.length == 0) {
                    groupByStores.push({ store: element.storeName, data: [element] });
                } else {
                    let index = groupByStores.findIndex(store => store.store == element.storeName);
                    if (index == -1) {
                        groupByStores.push({ store: element.storeName, data: [element] });
                    } else {
                        groupByStores[index].data.push(element);
                    }
                }
            });
            this.groupByStoresData = groupByStores;
            this.reportSummaryData = res["storesData"];
            setTimeout(() => {
                this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            this.generateReportLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.generateReportLoader = false;
            this._changeDetectorRef.markForCheck();
        })
    }
    getNextData(event) {
        const { previousPageIndex, pageIndex } = event;

        if (pageIndex > previousPageIndex) {
            this.page++;
        } else {
            this.page--;
        };
        this.generateReport();
    };
    backToFilters() {
        this.isGenerateReport = false;
        setTimeout(() => {
            this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        this._changeDetectorRef.markForCheck();
    }
    goToSummary() {
        setTimeout(() => {
            this.summaryScrollAnchor.nativeElement.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
    backtoTop() {
        setTimeout(() => {
            this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
    checkOrUncheckStoresOrders(ev, storeOrders) {
        storeOrders.data.forEach(element => {
            if (!element.disabled) {
                if (ev.checked) {
                    element.checked = true;
                } else {
                    element.checked = false;
                }
            }
        });
    }
    updateFlPSCommission() {
        this.isUpdateCommissionLoader = true;
        let FlpsOrders = [];
        this.groupByStoresData.forEach(element => {
            element.data.forEach(order => {
                if (!order.disabled && order.checked) {
                    FlpsOrders.push({ order_id: order.pk_orderID, commissionPaidDate: order.commissionPaidDate, amountPaid: order.amountPaid });
                }
            });
        });
        let payload: updateReport = {
            flps_userID: this.selectedEmployee.pk_userID,
            flpsOrders: FlpsOrders,
            blnSendEmail: this.blnSendEmail,
            update_flps_report: true
        }
        this._flpsService.UpdateFlpsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["success"]) {
                this._flpsService.snackBar(res["message"]);
            }
            this.isUpdateCommissionLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isUpdateCommissionLoader = false;
            this._changeDetectorRef.markForCheck();
        });
    }

    downloadExcelWorkSheet() {
        const fileName = `FLPS-Report-${this.selectedEmployee.firstName}-${this.selectedEmployee.lastName}-${this.reportParams.start_date}-${this.reportParams.end_date}`;
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet("FLPS-Reports");

        // Columns
        worksheet.columns = [
            { header: "store", key: "storeName", width: 30 },
            { header: "Date", key: "orderDate", width: 30 },
            { header: "OrderID", key: "pk_orderID", width: 30 },
            { header: "Customer", key: "companyName", width: 50 },
            { header: "Sales", key: "Sales", width: 30 },
            { header: "Revenue", key: "Revenue", width: 10 },
            { header: "Margin", key: "Margin", width: 10 },
            { header: "Profit", key: "Profit", width: 10 },
            { header: "Commission", key: "CommissionPercentage", width: 10 },
            { header: "CommissionPaidDate", key: "commissionPaidDate", width: 10 },
            { header: "AmountPaid", key: "amountPaid", width: 10 }
        ];
        for (const obj of this.dataSource) {
            worksheet.addRow(obj);
        }
        setTimeout(() => {
            workbook.xlsx.writeBuffer().then((data: any) => {
                const blob = new Blob([data], {
                    type:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement("a");
                document.body.appendChild(a);
                a.setAttribute("style", "display: none");
                a.href = url;
                a.download = `${fileName}.xlsx`;
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
                // this.generateReportLoader = false;
                this._changeDetectorRef.markForCheck();
            });
        }, 500);
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
        return item.value || index;
    }
}
