import { Routes } from '@angular/router';
import { sample } from '../shared/sample/sample';
import { Home } from '../shared/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'sample', component: sample },
];
