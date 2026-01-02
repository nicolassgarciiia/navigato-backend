import { UserPreferences } from "../../user-preferences/domain/user-preferences.entity";

export class ApplicationState {
  user: {
    id: string;
    email: string;
    nombre?: string;
    apellidos?: string;
  };

  places: any[];
  vehicles: any[];
  savedRoutes: any[];

  preferences: UserPreferences;

  constructor(params: {
    user: {
      id: string;
      email: string;
      nombre?: string;
      apellidos?: string;
    };
    places: any[];
    vehicles: any[];
    savedRoutes: any[];
    preferences: UserPreferences;
  }) {
    this.user = params.user;
    this.places = params.places;
    this.vehicles = params.vehicles;
    this.savedRoutes = params.savedRoutes;
    this.preferences = params.preferences;
  }
}
