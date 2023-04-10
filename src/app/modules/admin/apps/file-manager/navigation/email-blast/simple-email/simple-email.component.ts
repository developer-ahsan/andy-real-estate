import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import moment from "moment";
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import * as XLSX from 'xlsx';
import { read } from 'fs';

@Component({
  selector: 'app-simple-email',
  templateUrl: './simple-email.component.html',
  styles: ['::ng-deep {.ql-container {height: auto}} ngx-dropzone {height: 125px} ngx-dropzone-preview {min-height: 100px !important;height: 100px !important}']
})
export class SimpleEmailBlastComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': ['white'] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };
  sendEmailForm: FormGroup;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  emails = [];
  imagesData: any;
  file: File;
  imageValue: any;
  isEmailLoader: boolean = false;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.sendEmailForm = this._formBuilder.group({
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
    this.getStoreDetails();
  }
  getStoreDetails() {
    this._fileManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
      });
  }
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value) {
      this.emails.push(value);
    }
    // Clear the input value
    event.chipInput!.clear();
  }
  remove(fruit): void {
    const index = this.emails.indexOf(fruit);
    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }
  onSelect(event) {
    this.file = event.addedFiles[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.file);
    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (this.file["type"] != 'image/jpeg' && this.file["type"] != 'image/jpg') {
          this._fileManagerService.snackBar("Image should be jpg format only");
          this.file = null;
          this.imageValue = null;
          this._changeDetectorRef.markForCheck();
          return;
        }
        this.imageValue = {
          name: this.file.name,
          imageUpload: reader.result,
          type: this.file["type"]
        };
      }
    }
  }

  onRemove() {
    this.file = null;
    this.imageValue = null;
  }

  sendEmail() {
    const { subject, message } = this.sendEmailForm.getRawValue();
    if (!subject) {
      this._fileManagerService.snackBar('Subject is required');
      return;
    }
    if (!message) {
      this._fileManagerService.snackBar('Message is required');
      return;
    }
    if (this.emails.length == 0) {
      this._fileManagerService.snackBar('At least 1 email is required');
      return;
    }
    if (!this.imageValue) {
      this._fileManagerService.snackBar('Please choose an image');
      return;
    }
    const base64 = this.imageValue.imageUpload.split(",")[1];
    let payload = {
      email_list: this.emails,
      subject: subject,
      store_name: this.selectedStore.storeName,
      is_html: true,
      message: message,
      image: base64,
      image_title: this.imageValue.name,
      template_id: "none",
      image_extension: this.imageValue.type,
      simple_email: true
    }
    this.isEmailLoader = true;
    this._fileManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._fileManagerService.snackBar(res["message"]);
      }
      this.sendEmailForm.reset();
      this.imageValue = null;
      this.file = null;
      this.emails = [];
      this.isEmailLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isEmailLoader = false;
      this._changeDetectorRef.markForCheck();
    });
    console.log(payload)
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
