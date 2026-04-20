import { CanDeactivateFn } from '@angular/router';
import { BaseStageComponent } from './base-stage';

export const stageCanDeactivateGuard: CanDeactivateFn<BaseStageComponent> =
  (component) => component.canDeactivate();
