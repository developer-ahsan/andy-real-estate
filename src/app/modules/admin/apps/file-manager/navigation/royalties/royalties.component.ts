import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { FileManagerService } from '../../store-manager.service';

@Component({
  selector: 'app-royalties',
  templateUrl: './royalties.component.html',
  styles: ['::ng-deep {.ql-container {height: auto}}']
})
export class RoyaltiesComponent implements OnInit {

  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  quillModules: any = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: ["white"] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  royalityForm: FormGroup;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.royalityForm = new FormGroup({
    })
  }

}
