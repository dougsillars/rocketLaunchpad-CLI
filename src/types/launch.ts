export interface LaunchStatus {
  id: number;
  name: string;
  abbrev: string;
  description: string;
}

export interface RocketConfiguration {
  name: string;
}

export interface Rocket {
  configuration: RocketConfiguration;
}

export interface LaunchServiceProvider {
  id: number;
  name: string;
  type: string;
}

export interface PadLocation {
  id: number;
  name: string;
  country_code: string;
}

export interface Pad {
  id: number;
  name: string;
  location: PadLocation;
}

export interface Mission {
  name: string;
  description: string;
  type: string;
}

export interface Launch {
  id: string;
  name: string;
  status: LaunchStatus;
  net: string;
  window_start: string;
  window_end: string;
  rocket: Rocket;
  launch_service_provider: LaunchServiceProvider;
  pad: Pad;
  mission: Mission | null;
}

export interface LaunchApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Launch[];
}
