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
import { sendgrid_simple_email } from '../../../stores.types';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
// import { Base64UploadAdapter } from './base64-upload-adapter';

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

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private http: HttpClient,
    private sanitizer: DomSanitizer
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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const valid = emailRegex.test(value);
    if (valid) {
      this.emails.push(value);
    } else {
      this._fileManagerService.snackBar('Please enter a valid email');
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
    let messageData = message;
    if (!subject || subject.trim()=== '') {
      this._fileManagerService.snackBar('Subject is required');
      return;
    }
    if (!message || message.trim()) {
      this._fileManagerService.snackBar('Message is required');
      return;
    }
    if (this.emails.length == 0) {
      this._fileManagerService.snackBar('At least 1 email is required');
      return;
    }
    let images = [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(message, 'text/html');
    // Extract all img tags
    const imgTags = doc.getElementsByTagName('img');
    for (let i = 0; i < imgTags.length; i++) {
      const imgTag = imgTags[i];
      const src = imgTag.getAttribute('src');
      images.push({
        image: src,
        image_title: `${i + 1}_image`,
        template_id: 'none',
        image_extension: 'png'
      });
      messageData = messageData.replace(src, `cid:${i + 1}_image`);

    }
    let payload: sendgrid_simple_email = {
      email_list: this.emails,
      subject: subject,
      store_name: this.selectedStore.storeName,
      is_html: true,
      message: messageData,
      images: images,
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
  }
  // onEditorReady(editor: any) {
  //   editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
  //     return new Base64UploadAdapter(loader, 'https://ckeditor.com/apps/ckfinder/3.4.5/core/connector/php/connector.php?command=QuickUpload&type=Images');
  //   };
  // }
  toDataURL(url, callback) {
    let u: any = this.sanitizer.bypassSecurityTrustHtml(url)
    // console.log(url);
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', u);
    xhr.responseType = 'blob';
    xhr.send();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
