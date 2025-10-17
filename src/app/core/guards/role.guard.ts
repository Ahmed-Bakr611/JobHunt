// core/guards/role.guard.ts
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const user = authService.currentUser(); // however you expose user
    return !!user && allowedRoles.includes(user.role);
  };
}
