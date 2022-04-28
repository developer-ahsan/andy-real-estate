import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

export interface PeriodicElement {
  spid: number;
  name: string;
  vendor: string;
  master: string;
  store: string;
  desc: boolean;
  image: boolean;
  video: boolean;
  colors: boolean;
  techno_logo: boolean;
  misc: boolean
}

const ELEMENT_DATA: PeriodicElement[] = [
  { spid: 1, name: '15 Adult Flip Flops', vendor: 'Cathy', master: 'Active', store: 'Online', desc: true, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 2, name: '3080 Snowflake Ice Scraper', vendor: 'Saul', master: 'Active', store: 'Online', desc: true, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 3, name: 'Lithium', vendor: 'GaryLine LLC', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 4, name: 'Beryllium', vendor: 'SanMar', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 5, name: 'Boron', vendor: 'A-One', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 6, name: 'Carbon', vendor: 'Delta Apparel LLC', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 1, name: '15 Adult Flip Flops', vendor: 'Cathy', master: 'Active', store: 'Online', desc: true, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 2, name: '3080 Snowflake Ice Scraper', vendor: 'Saul', master: 'Active', store: 'Online', desc: true, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 3, name: 'Lithium', vendor: 'GaryLine LLC', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 4, name: 'Beryllium', vendor: 'SanMar', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 5, name: 'Boron', vendor: 'A-One', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 6, name: 'Carbon', vendor: 'Delta Apparel LLC', master: 'Active', store: 'Online', desc: true, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 1, name: '15 Adult Flip Flops', vendor: 'Cathy', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 2, name: '3080 Snowflake Ice Scraper', vendor: 'Saul', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 3, name: 'Lithium', vendor: 'GaryLine LLC', master: 'Active', store: 'Online', desc: true, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 4, name: 'Beryllium', vendor: 'SanMar', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 5, name: 'Boron', vendor: 'A-One', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 6, name: 'Carbon', vendor: 'Delta Apparel LLC', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 1, name: '15 Adult Flip Flops', vendor: 'Cathy', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 2, name: '3080 Snowflake Ice Scraper', vendor: 'Saul', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 3, name: 'Lithium', vendor: 'GaryLine LLC', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 4, name: 'Beryllium', vendor: 'SanMar', master: 'Active', store: 'Online', desc: true, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 5, name: 'Boron', vendor: 'A-One', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false },
  { spid: 6, name: 'Carbon', vendor: 'Delta Apparel LLC', master: 'Active', store: 'Online', desc: false, image: false, video: false, colors: false, techno_logo: false, misc: false }
];

@Component({
  selector: 'app-rapidbuild-actions',
  templateUrl: './rapidbuild-actions.component.html'
})
export class RapidbuildActionsComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['spid', 'name', 'vendor', 'master', 'store', 'desc', 'image', 'video', 'colors', 'techno_logo', 'misc'];
  dataSource = ELEMENT_DATA;

  constructor() { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
  }
}
