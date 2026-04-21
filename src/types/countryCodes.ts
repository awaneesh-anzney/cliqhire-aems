export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  minLength: number;
  maxLength: number;
  regex?: RegExp;
}

export interface PhoneRawChange {
  countryCode: string;
  localNumber: string;
  dialCode: string;
  full: string;
  valid: boolean;
  error: string | null;
}
