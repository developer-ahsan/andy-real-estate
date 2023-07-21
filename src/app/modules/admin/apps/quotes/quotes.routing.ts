import { Route } from '@angular/router';
import { QuotesDetailsComponent } from './components/details/details-quote.component';
import { QuoteComments } from './components/pages/comments/comments.component';
import { QuoteSummaryComponent } from './components/pages/summary/summary.component';
import { QuotesComponent } from './components/quotes.component';
import { QuoteCommentResolver, QuoteDetailsResolver } from './components/quotes.resolvers';
import { QuoteOriginalComponent } from './components/pages/original-quote-report/original-quote-report.component';
export const quotesRoutes: Route[] = [

    {
        path: '',
        component: QuotesComponent,
        resolve: {
        }
    },
    {
        path: ':id',
        component: QuotesDetailsComponent,
        resolve: {
            suplier: QuoteDetailsResolver,
            comment: QuoteCommentResolver
        },
        children: [
            {
                path: '',
                redirectTo: 'summary',
                pathMatch: 'full'
            },
            {
                path: 'summary',
                component: QuoteSummaryComponent,
                data: {
                    title: 'Summary',
                    url: 'summary'
                }
            },
            {
                path: 'comments',
                component: QuoteComments,
                data: {
                    title: 'Comments',
                    url: 'comments'
                }
            },
            {
                path: 'original-quotes-reports',
                component: QuoteOriginalComponent,
                data: {
                    title: 'Quote Original Report',
                    url: 'original-quotes-reports'
                }
            },
        ]
    }

];
