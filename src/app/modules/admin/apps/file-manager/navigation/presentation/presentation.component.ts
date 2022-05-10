import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../file-manager.service';

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html'
})
export class PresentationComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  presentationScreen: string = "Main";
  presentationButtons: string[] = [
    "Site Color",
    "Masthead",
    "Feature Images",
    "Social Media",
    "Support Team"
  ]

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
  };

  calledScreen(screenName): void {
    console.log("screenName", screenName)
    this.presentationScreen = screenName;
  }

}
