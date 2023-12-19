import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import moment from 'moment';
import { fromEvent, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, skipWhile, switchMap, takeUntil, tap, take } from 'rxjs/operators';
import { FLPSService } from '../../flps.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { updateReport } from '../../flps.types';
declare var $: any;

@Component({
    selector: 'app-generate-report',
    templateUrl: './generate-report.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerateReportComponent implements OnInit {
    @ViewChild('updateCommissionAlert') updateCommissionAlert: ElementRef;
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
    currentMonth = this.WeekDate.getMonth() + 1

    currentQuarter: string;

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
    blnSendEmail: boolean = true;
    @ViewChild('topScrollAnchor') topScroll: ElementRef;
    @ViewChild('summaryScrollAnchor') summaryScrollAnchor: ElementRef;
    storeTotals: { Sales: number; Revenue: number; Num_Sales: number; EST_Profit: number; orderCommission: number; amountPaid: number };
    flpsLoginAdmin = sessionStorage.getItem('flpsLoginAdmin');
    flpsLoginName = sessionStorage.getItem('FullName');
    flpsLoginID = sessionStorage.getItem('flpsUserID');
    flpsLoginEmail = sessionStorage.getItem('flpsUserEmail');
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
        if (this.flpsLoginAdmin == 'true') {
            this.getEmployees();
        } else {
            this.selectedEmployee = { pk_userID: Number(this.flpsLoginID), fullName: this.flpsLoginName, email: this.flpsLoginEmail };
        }
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
        this.setCurrentQuarter();
    }

    setCurrentQuarter() {
        if (this.currentMonth >= 1 && (this.currentMonth <= 3)) {
            this.quarterMonth = 1
        } else if (this.currentMonth >= 4 && (this.currentMonth <= 6)) {
            this.quarterMonth = 2
        } else if (this.currentMonth >= 7 && (this.currentMonth <= 9)) {
            this.quarterMonth = 3
        } else {
            this.quarterMonth = 4
        }
    }

    onSelected(ev) {
        this.selectedEmployee = ev.option.value;
    }

    displayWith(value: any) {
        return value ? value?.firstName + ' ' + value?.lastName : '';
    }

    getEmployees() {
        this._flpsService.reportUsers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            let employees = res["data"][0].flpsUsers;
            if (employees) {
                let employee = employees.split(',');
                employee.forEach(emp => {
                    let colonEmp = emp.split(':');
                    this.employeeAdmins.push({ pk_userID: Number(colonEmp[0]), fullName: colonEmp[2], email: colonEmp[6] });
                });
            }
            this.selectedEmployee = this.employeeAdmins[0];
        });
    }
    generateReport() {
        if (!this.selectedEmployee) {
            this._flpsService.snackBar('Please select any flps user');
            return;
        }

        this.storeTotals = {
            Sales: 0,
            Revenue: 0,
            Num_Sales: 0,
            EST_Profit: 0,
            orderCommission: 0,
            amountPaid: 0
        };

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
            this.reportParams.start_date = moment(this.WeekDate).startOf('isoWeek').format('yyyy-MM-DD');
            this.reportParams.end_date = moment(this.WeekDate).endOf('isoWeek').format('yyyy-MM-DD');
            this.report_type = 'Weekly Sales';
        } else if (this.ngPlan == 'monthly') {
            let d = new Date(this.monthlyYear, this.currentMonth - 1, 1);
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
            this.report_type = 'Yearly Sales';
        } else if (this.ngPlan == 'range') {
            this.reportParams.start_date = moment(this.ngRangeStart).format('yyyy-MM-DD');
            this.reportParams.end_date = moment(this.ngRangeEnd).format('yyyy-MM-DD');
            this.report_type = 'Range Sales';
        }
        this._flpsService.getFlpsData(this.reportParams).pipe(skipWhile(obj => !obj), take(1)).subscribe(res => {
            if (res["data"].length == 0) {
                this.groupByStoresData = null;
                this.generateReportLoader = false;
                this._changeDetectorRef.markForCheck();
                this._flpsService.snackBar('No orders have been found in the specified range that match your criteria.');
                return;
            }
            this.isGenerateReport = true;
            res["data"].forEach(element => {
                this.storeTotals.Sales = element.Grand_Sales;
                this.storeTotals.Revenue = element.Grand_Revenue;
                this.storeTotals.Num_Sales = element.Grand_Num_Sales;
                this.storeTotals.EST_Profit = element.Grand_Profit;
                this.storeTotals.orderCommission = element.Grand_Commission;
                element.DetailsData = [];
                if (element.Details) {
                    let Details = element.Details.split('||');
                    Details.forEach(item => {
                        let [date, id, customer, sales, revenue, margin, profit, comission, commision_percentage, cpd, amount, paymentDate] = item.split('::');
                        element.DetailsData.push({ date: date, id: Number(id), customer: customer, sales: Number(sales), revenue: Number(revenue), margin: margin, profit: profit, comission: comission, cpd: cpd, amount: amount, commision_percentage: commision_percentage, paymentDate: paymentDate });
                        this.storeTotals.amountPaid += Number(amount);
                        this.dataSource.push({ date: date, id: Number(id), customer: customer, sales: Number(sales), revenue: Number(revenue), margin: margin, profit: profit, comission: comission, cpd: cpd, amount: amount, commision_percentage: commision_percentage, storeName: element.storeName, paymentDate: paymentDate });
                    });
                }
            });
            res["data"].forEach((element) => {
                element.date_data = [];
                element.DetailsData.forEach(item => {
                    item.checked = false;
                    item.disabled = false;

                    if (item.paymentDate != "NULL") {
                        let date = moment(item.paymentDate);
                        let start_date = moment(this.reportParams.start_date);
                        let end_date = moment(this.reportParams.end_date);
                        // console.log(date.isBefore(end_date));
                        if (date.isSameOrAfter(start_date) && date.isSameOrBefore(end_date)) {
                            item.color = 'green';
                        }
                    } else {
                        item.color = null;
                    }
                    if (item.cpd != '---') {
                        item.checked = true;
                        item.disabled = true;
                    } else if (item.paymentDate != "NULL") {
                        let date = moment(item.paymentDate);
                        let start_date = moment(this.reportParams.start_date);
                        let end_date = moment(this.reportParams.end_date);
                        if (date.isSameOrAfter(start_date) && date.isSameOrBefore(end_date)) {
                            item.checked = true;
                        }
                    }

                    let date_check = moment(item.date).format('MMM,yyyy');
                    if (element.date_data.length == 0) {
                        element.date_data.push({ date: moment(item.date).format('MMM,yyyy'), data: [item] });
                    } else {
                        const d_index = element.date_data.findIndex(date => date.date == date_check);
                        if (d_index < 0) {
                            element.date_data.push({ date: moment(item.date).format('MMM,yyyy'), data: [item] });
                        } else {
                            element.date_data[d_index].data.push(item);
                        }
                    }
                });
            });
            this.reportSummaryData = res["data"];
            this.totalUsers = res["totalRecords"];
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
        storeOrders.forEach(element => {
            element.data.forEach(item => {
                if (!item.disabled) {
                    if (ev.checked) {
                        item.checked = true;
                    } else {
                        item.checked = false;
                    }
                }
            });

        });
    }
    openUpdateCommissionAlert() {
        $(this.updateCommissionAlert.nativeElement).modal('show');
    }
    updateFlPSCommission() {
        let FlpsOrders = [];
        let reportSummary = [];
        let markPaidList = [];
        let grandCommission = 0;
        let grandEstimatedProfitTotal = 0;
        let totalNumSales = 0;
        this.reportSummaryData.forEach(element => {
            element.DetailsData.forEach(order => {
                FlpsOrders.push({ order_id: order.id, amountPaid: order.amount });
                if (order.checked) {
                    if (order.comission > 0) {
                        grandCommission += Number(order.comission);
                        grandEstimatedProfitTotal += Number(element.Profit);
                        totalNumSales += 1;
                        const index = reportSummary.findIndex(store => store.fk_storeID == element.fk_storeID);
                        if (index < 0) {
                            reportSummary.push({
                                fk_storeID: element.fk_storeID,
                                storeName: element.storeName,
                                sales: element.Sales,
                                num_sales: 1,
                                profit: element.Profit,
                                commission: Number(order.comission)
                            });
                        } else {
                            reportSummary[index].num_sales += 1;
                            reportSummary[index].commission += Number(order.comission);
                        }
                        markPaidList.push({
                            orderID: order.id,
                            customer: order.customer,
                            sale: order.sales,
                            profit: order.profit,
                            commission: order.comission,
                            commissionPercent: order.commision_percentage
                        })
                    }
                }
            });
            // reportSummary.push({
            //     storeName: element.storeName,
            //     sales: element.Sales,
            //     num_sales: element.Num_Sales,
            //     profit: element.Profit,
            //     commission: element.Commission
            // });
        });
        let userCommission = (grandCommission * this.storeTotals.EST_Profit).toFixed(2);
        // let grandCommission = (this.storeTotals.orderCommission).toFixed(2);
        let payload: updateReport = {
            flps_userID: this.selectedEmployee.pk_userID,
            flpsName: this.selectedEmployee.fullName,
            flpsUserEmail: this.selectedEmployee.email,
            blnSendEmail: this.blnSendEmail,
            rangeStart: this.reportParams.start_date,
            rangeEnd: this.reportParams.end_date,
            flpsOrders: FlpsOrders,
            markPaidList: markPaidList,
            reportSummary: reportSummary,
            grandSalesTotal: this.storeTotals.Sales,
            grandNumSalesTotal: totalNumSales,
            grandEstimatedProfitTotal: grandEstimatedProfitTotal,
            grandCommissionTotal: Number(grandCommission),
            userTotalCommission: Number(userCommission), // totalCommission * Profit
            update_flps_report: true
        }
        this.isUpdateCommissionLoader = true;
        this._flpsService.UpdateFlpsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["success"]) {
                this._flpsService.snackBar(res["message"]);
            }
            $(this.updateCommissionAlert.nativeElement).modal('hide');
            this.isGenerateReport = false;
            setTimeout(() => {
                this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            this.isUpdateCommissionLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isUpdateCommissionLoader = false;
            this._changeDetectorRef.markForCheck();
        });
    }

    downloadExcelWorkSheet() {
        const fileName = `FLPS-Report-${this.selectedEmployee.fullName}-${this.reportParams.start_date}-${this.reportParams.end_date}`;
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet("FLPS-Reports");
        // Columns
        worksheet.columns = [
            { header: "store", key: "storeName", width: 30 },
            { header: "Date", key: "date", width: 30 },
            { header: "OrderID", key: "id", width: 30 },
            { header: "Customer", key: "customer", width: 50 },
            { header: "Sales", key: "sales", width: 30 },
            { header: "Revenue", key: "revenue", width: 10 },
            { header: "Margin", key: "margin", width: 10 },
            { header: "Profit", key: "profit", width: 10 },
            { header: "Commission", key: "commision_percentage", width: 10 },
            { header: "CommissionPaidDate", key: "cpd", width: 10 },
            { header: "AmountPaid", key: "amount", width: 10 }
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
