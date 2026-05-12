export interface CitySuggestion {
  city: string;
  state: string;
  country: string;
  countryCode: string;
  label: string;
  lat: number;
  lng: number;
}

export interface LocationError {
  error: string;
  message: string;
}
