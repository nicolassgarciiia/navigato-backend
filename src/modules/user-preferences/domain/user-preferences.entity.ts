export class UserPreferences {
  userId: string;
  defaultVehicleId?: string;
  defaultRouteType?: string;

  constructor(props: Partial<UserPreferences>) {
    Object.assign(this, props);
  }
}
