import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import { Subject } from 'rxjs';

export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}


@Component({
  selector: 'app-store-settings',
  templateUrl: './store-settings.component.html'
})
export class StoreSettingsComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  selected = 'YES';
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

  constructor() { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
  }

}