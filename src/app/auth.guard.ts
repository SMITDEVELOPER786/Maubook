import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable, of } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.loading$.pipe(
      take(1),
      switchMap(loading => {
        if (loading) {
          // Wait for auth to initialize
          return this.authService.authState$.pipe(
            take(1),
            map(user => {
              if (user) {
                return true;
              } else {
                this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                return false;
              }
            })
          );
        } else {
          // Auth is initialized, check user state
          return this.authService.authState$.pipe(
            take(1),
            map(user => {
              if (user) {
                return true;
              } else {
                this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                return false;
              }
            })
          );
        }
      })
    );
  }
}