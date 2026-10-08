import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './app-loader.html',
  styleUrl: './app-loader.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLoaderComponent {
  readonly loaderService = inject(LoaderService);
}
