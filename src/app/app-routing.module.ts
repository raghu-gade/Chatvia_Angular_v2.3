import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { MainComponent } from './Startup/main/main.component';

const routes: Routes = [
  {
    path: 'dashboard', component: MainComponent,
    data: [{ breadcrumb: "dashboard" }]
},
{ path: 'chat', loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule) },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full'}
  // { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  // { path: '', loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule), canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
