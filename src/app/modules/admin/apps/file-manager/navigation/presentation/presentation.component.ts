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
    "Site Color",
    "Masthead",
    "Feature Images",
    "Social Media",
    "Support Team",
    "Special offers",
    "Typekit",
    "News Feed",
    "Logo bank",
    "Brand Guide",
    "Favicon",
    "Sitemap",
    "Payment methods",
    "Feature Campaign",
    "Home Page Scrollers",
    "Header Image",
    "Default Dashboard Emails",
    "Product Builder Settings",
    "Order Options",
    "Artwork tags",
    "Quick guides"
  ];
  checked = false;

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
  };

  currentTestimonial: string[] = ['id', 'name', 'decorator', 'order'];
  // displayedColumns: string[] = ['id', 'method', 'decorator', 'active', 'action'];
  // dataSource = [];
  displayedColumns: string[] = ['spid', 'name', 'master', 'store'];
  dataSource = [];

  calledScreen(screenName): void {
    this.presentationScreen = screenName;
  }

}
