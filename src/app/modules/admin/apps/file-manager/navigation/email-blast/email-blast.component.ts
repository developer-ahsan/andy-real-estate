import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../file-manager.service';

@Component({
  selector: 'app-email-blast',
  templateUrl: './email-blast.component.html'
})
export class EmailBlastComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  presentationScreen: string = "Main";
  selected = 'YES';
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
  presentationButtons: string[] = [
    "Campaign Focused",
    "Featured products",
    "Simple Text",
    "Simple html",
    "Custom email",
    "Opt-In Email",
    "Segmented target files",
  ];
  checked = false;

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
  }
  calledScreen(screenName): void {
    console.log("screenName", screenName)
    this.presentationScreen = screenName;
  }

}