import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-cost-analysis',
  templateUrl: './cost-analysis.component.html'
})
export class CostAnalysisComponent implements OnInit {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
      this.isLoadingChange.emit(false)
    }, 100);
  }

  public exportHtmlToPDF() {
    let data = document.getElementById('htmltable');
    const file_name = `CostAnalysisReport_56165.pdf`;
    html2canvas(data).then(canvas => {

      let docWidth = 208;
      let docHeight = canvas.height * docWidth / canvas.width;

      const contentDataURL = canvas.toDataURL('image/png')
      let doc = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      doc.addImage(contentDataURL, 'PNG', 0, position, docWidth, docHeight)

      doc.save(file_name);
    });
  }
}
