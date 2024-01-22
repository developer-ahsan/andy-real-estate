import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { finalize, takeUntil } from 'rxjs/operators';
import moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { UpdateSurveyHiddenStatus, addAnswer, addQuestion, addSurvey, automateSurvey, deleteSurvey, finalizeSurvey, updateAnswer, updateQuestion, updateScaleRating, updateSurveyBody } from '../../../stores.types';

@Component({
  selector: 'app-edit-survey',
  templateUrl: './edit-survey.component.html'
})
export class EditSurveysComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  surveysList: any;
  surveyID: number = 0;

  editorConfig = {
    toolbar: [
      { name: 'clipboard', items: ['Undo', 'Redo'] },
      { name: 'styles', items: ['Format'] },
      { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike'] },
      { name: 'align', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
      { name: 'links', items: ['Link', 'Unlink'] },
      { name: 'insert', items: ['Image', 'Table'] },
      { name: 'tools', items: ['Maximize'] },
    ],
    extraPlugins: 'uploadimage,image2',
    uploadUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json',
    filebrowserUploadMethod: 'base64',
    // Configure your file manager integration. This example uses CKFinder 3 for PHP.
    filebrowserBrowseUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/ckfinder.html',
    filebrowserImageBrowseUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/ckfinder.html?type=Images',
    filebrowserUploadUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/core/connector/php/connector.php?command=QuickUpload&type=Files',
    filebrowserImageUploadUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/core/connector/php/connector.php?command=QuickUpload&type=Images'
    // other options
  };
  isUpdateBodyLoader: boolean = false;
  isQuestionAnswerLoader: boolean = false;
  isAddQuestionLoader: boolean = false;
  addQuestions = {
    question: '',
    type: 1
  }
  questionsList: any = [];
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _commonService: DashboardsService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.route.params.subscribe(param => {
      this.surveyID = Number(param.id);
      this.getStoreDetails();
    });
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
  updateSurvey(): void {
    const { pk_storeID } = this.selectedStore;
    const payload: updateSurveyBody = {
      surveyID: this.surveyID,
      surveyBody: this.surveysList.surveyBody,
      update_survey_body: true
    };
    this.isUpdateBodyLoader = true;
    this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateBodyLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    });
  };
  // Add Question
  addQuestion(): void {
    const { question, type } = this.addQuestions;
    if (question.trim() == '') {
      this._storeManagerService.snackBar('Question is required');
      return;
    }
    const { pk_storeID } = this.selectedStore;
    const payload: addQuestion = {
      surveyID: this.surveyID,
      question: question,
      questionType: type,
      add_survey_question: true
    };
    this.isAddQuestionLoader = true;
    this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this._storeManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isAddQuestionLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
        res["newRecord"].answersList = [];
        this.setQuestionType(res["newRecord"]);
        this.questionsList.push(res["newRecord"]);
        this.addQuestions = {
          question: '',
          type: 1
        }
      }
      this._changeDetectorRef.markForCheck();
    });
  };
  // Add Question Answer
  addQuestionAnswer(question): void {
    const { newAnswerValue } = question;
    if (newAnswerValue.trim() == '') {
      this._storeManagerService.snackBar('Answer is required');
      return;
    }
    const { pk_storeID } = this.selectedStore;
    const payload: addAnswer = {
      surveyQuestionID: question.pk_surveyQuestionID,
      answer: newAnswerValue,
      add_survey_answer: true
    };
    question.isAddAnswerLoader = true;
    this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this._storeManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      question.isAddAnswerLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
        question.answersList.push(res["newRecord"]);
        question.newAnswerValue = '';
      }
      this._changeDetectorRef.markForCheck();
    });
  };
  // Update Survey Question
  updateSurveyQuestion(question, is_delete) {
    if (!is_delete) {
      if (question.question.trim() == '') {
        this._storeManagerService.snackBar('Question is requird');
        return;
      }
      if (question.listOrder <= 0) {
        this._storeManagerService.snackBar('Display Order should be greater than 0');
        return;
      }
      question.isUpdateLoader = true;
      let payload: updateQuestion = {
        surveyQuestionID: question.pk_surveyQuestionID,
        question: question.question,
        listOrder: Number(question.listOrder),
        is_delete: is_delete,
        update_survey_question: true
      }
      payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
      this.questionUpdate(question, payload);
    } else {
      let msg = 'Are you sure you want to remove this survey question?';
      this._commonService.showConfirmation(msg, (confirm) => {
        if (confirm) {
          question.isDelLoader = true;
          let payload: updateQuestion = {
            surveyQuestionID: question.pk_surveyQuestionID,
            question: question.question,
            listOrder: Number(question.listOrder),
            is_delete: is_delete,
            update_survey_question: true
          }
          payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
          this.questionUpdate(question, payload);
        };
      });
    }
  }
  questionUpdate(question, payload) {
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      question.isUpdateLoader = false;
      question.isDelLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
        if (payload.is_delete) {
          this.questionsList = this.questionsList.filter(item => item.pk_surveyQuestionID != question.pk_surveyQuestionID);
        }
      }
    })
  }
  // Update Answer
  updateSurveyQuestionAnswer(question, answer, index, is_delete) {
    if (!is_delete) {
      if (answer.answer.trim() == '') {
        this._storeManagerService.snackBar('Answer is requird');
        return;
      }
      answer.isUpdateLoader = true;
    } else {
      answer.isDelLoader = true;
    }
    let payload: updateAnswer = {
      answerID: answer.pk_surveyQuestionAnswerID,
      answer: answer.answer,
      is_delete: is_delete,
      update_survey_answer: true
    }
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      answer.isUpdateLoader = false;
      answer.isDelLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
        if (payload.is_delete) {
          question.answersList = question.answersList.filter(item => item.pk_surveyQuestionAnswerID != answer.pk_surveyQuestionAnswerID);
        }
      }
    })
  }
  // Udpdate Scating
  updateScaling(question) {
    if (question.scaleRatingMin <= 0 || question.scaleRatingMax <= 0 || question.scaleRatingMin > 10 || question.scaleRatingMax > 10) {
      this._storeManagerService.snackBar('Question scaling should be between 1-10');
      return;
    }
    let payload: updateScaleRating = {
      questionID: question.pk_surveyQuestionID,
      scaleRatingMin: question.scaleRatingMin,
      scaleRatingMax: question.scaleRatingMax,
      update_scale_rating: true
    }
    question.isUpdateScaling = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      question.isUpdateScaling = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
      }
    });
  }
  finalizeSurvey() {
    let msg = 'Finalizing this survey means that you will no longer be able to make changes or remove this survey, and will make this survey available to be sent to customers.  Are you sure you want to continue?';
    this._commonService.showConfirmation(msg, (confirm) => {
      if (confirm) {
        let payload: finalizeSurvey = {
          surveyID: this.surveyID,
          finalize_survey: true
        }
        this.surveysList.isFinalizeLoader = true;
        this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          this.surveysList.isFinalizeLoader = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
          if (res["success"]) {
            this._storeManagerService.snackBar(res["message"]);
            this.surveysList.blnFinalized = true;
          }
        });
      }
    });
  }
  goToEditPage(survey) {
    const { pk_surveyID } = survey;
    this.router.navigateByUrl(`/apps/stores/surveys/edit/${pk_surveyID}`);

  }
  backToList() {
    const { pk_storeID } = this.selectedStore;
    this.router.navigateByUrl(`/apps/stores/${pk_storeID}/surveys/list`);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
