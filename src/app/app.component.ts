import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

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
    private router: Router,
    private _activatedRoute: ActivatedRoute,
  ) { }
  ngOnInit(): void {
    // console.log(this._activatedRoute.snapshot.queryParamMap.get('redirectURL'))
    // const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
    // console.log(redirectURL);
    // const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    // if (!userDetails) {
    //   localStorage.clear();
    //   this.router.navigateByUrl(redirectURL);
    // }
  }
}
