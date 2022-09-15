import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileManagerService } from '../../../store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-email-template-preview',
  templateUrl: './email-template-preview.component.html',
  styleUrls: ['./email-template-preview.component.scss']
})
export class EmailTemplatePreviewComponent implements OnInit {

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  data: any;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this._activeRoute.params.subscribe(params => {
      this.getEmailTemplatePreview(params.id)
    })
  }
  getEmailTemplatePreview(id) {
    let params = {
      emails: true,
      template_id: id
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.data = res["data"].versions[0].html_content;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._changeDetectorRef.markForCheck();
      })
  }

}
