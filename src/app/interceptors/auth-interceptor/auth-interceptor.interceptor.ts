import { Injectable } from "@angular/core";
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
} from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    token: any;
    constructor() {
    }

    intercept(
        request: HttpRequest<unknown>,
        next: HttpHandler
    ): Observable<HttpEvent<unknown>> {
        let url = null;
        this.token = localStorage.getItem('token');
        if (!request.url.includes("dashboard")) {
            url = `http://localhost:5000/dev/${request.url}`
            //url = `https://cqlfqg2orc.execute-api.us-east-2.amazonaws.com/${request.url}`
        }



        request = request.clone({

            url: url ? url : request.url,
            setHeaders: {
                Authorization: this.token,
            },
        });
        return next.handle(request);
    }
}
