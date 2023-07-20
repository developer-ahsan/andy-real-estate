import { Route } from '@angular/router';
import { QuotesDetailsComponent } from './components/details/details-quote.component';
import { QuoteComments } from './components/pages/comments/comments.component';
import { QuoteSummaryComponent } from './components/pages/summary/summary.component';
import { QuotesComponent } from './components/quotes.component';
import { QuoteDetailsResolver } from './components/quotes.resolvers';
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
            suplier: QuoteDetailsResolver
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
        ]
    }

];
