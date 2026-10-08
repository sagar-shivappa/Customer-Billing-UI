import { HttpErrorResponse, HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, filter, finalize, tap, throwError } from 'rxjs';

import { LoaderService } from '../services/loader.service';
import { NotificationService } from '../services/notification.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  const notificationService = inject(NotificationService);

  loaderService.show();

  return next(req).pipe(
    filter((event) => event.type === HttpEventType.Response),

    tap(() => {
      if (req.method !== 'GET') {
        notificationService.success(getSuccessMessage(req.method));
      }
    }),

    catchError((error: HttpErrorResponse) => {
      console.error('API Error:', error);

      notificationService.error(getErrorMessage(error));

      return throwError(() => error);
    }),

    finalize(() => {
      loaderService.hide();
    }),
  );
};

const getSuccessMessage = (method: string): string => {
  switch (method) {
    case 'POST':
      return 'Saved successfully.';

    case 'PUT':
    case 'PATCH':
      return 'Updated successfully.';

    case 'DELETE':
      return 'Deleted successfully.';

    default:
      return 'Operation completed successfully.';
  }
};

const getErrorMessage = (error: HttpErrorResponse): string => {
  if (error.error?.message) {
    return error.error.message;
  }

  if (typeof error.error === 'string') {
    return error.error;
  }

  if (error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};
