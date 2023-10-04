import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  /**
   * Constructor
   */
  constructor(
    private router: Router
  ) { }
  ngOnInit(): void {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails'));
    if (!userDetails) {
      localStorage.clear();
      this.router.navigateByUrl('/sign-in');
    }
  }
}
