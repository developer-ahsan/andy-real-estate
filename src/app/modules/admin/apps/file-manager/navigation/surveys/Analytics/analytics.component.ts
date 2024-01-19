import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    ApexAxisChartSeries,
    ApexChart,
    ChartComponent,
    ApexDataLabels,
    ApexXAxis,
    ApexPlotOptions
} from "ng-apexcharts";
import { ActivatedRoute, Router } from '@angular/router';

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

    isLoading = false;
    surveyID: number = 0;
    surveysList: any;
    isQuestionAnswerLoader: boolean = false;
    questionsList: any = [];
    constructor(
        private _storeManagerService: FileManagerService,
        private _changeDetectorRef: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute,
        private _snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.isLoading = true;
        this.route.params.subscribe(param => {
            this.surveyID = Number(param.id);
            this.getStoreDetails();
        });
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
                this.selectedStore = items["data"][0];
                this.getSurveys();
            });
    }
    getSurveys() {
        const { pk_storeID } = this.selectedStore;
        let params = {
            survey: true,
            survey_id: this.surveyID,
            store_id: pk_storeID
        }
        this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
            if (res["data"].length) {
                this.surveysList = res["data"][0];
                this.isQuestionAnswerLoader = true;
                this.getSurveysQuestionAnswers();
            }
        });
    }
    getSurveysQuestionAnswers() {
        const { pk_storeID } = this.selectedStore;
        let params = {
            survey_questions_answers: true,
            survey_id: this.surveyID,
            store_id: pk_storeID
        }
        this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
            this.isQuestionAnswerLoader = false;
            this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
            res["surveyQuestionAnswers"].forEach(questions => {
                this.setQuestionType(questions);
                if (questions.Answers) {
                    questions.answersList = questions.Answers.split(',,').map(answer => {
                        const [ID, text] = answer.split('::');
                        return { pk_surveyQuestionAnswerID: Number(ID), answer: text, fk_surveyQuestionID: questions.pk_surveyQuestionID };
                    });
                } else {
                    questions.answersList = [];
                }
            });
            this.questionsList = res["surveyQuestionAnswers"];
            console.log(this.questionsList);
        });
    }
    setQuestionType(questions) {
        questions.newAnswerValue = '';
        if (questions.questionType == 1) {
            questions.typeName = 'Multiple choice';
        } else if (questions.questionType == 2) {
            questions.typeName = 'Checkbox';
        } else if (questions.questionType == 3) {
            questions.typeName = 'Star rating';
        } else if (questions.questionType == 4) {
            questions.typeName = 'Text box';
        } else if (questions.questionType == 5) {
            questions.typeName = 'Scale rating';
        }
    }
    backToList() {
        const { pk_storeID } = this.selectedStore;
        this.router.navigateByUrl(`/apps/stores/${pk_storeID}/surveys/list`);
    }
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    };
}
