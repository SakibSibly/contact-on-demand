export interface User {
  id: string;
  username: string;
  email: string;
  contacts: Contact[];
}

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  user_id: string;
  phones?: Phone[];
}

export interface Phone {
  id: string;
  number: string;
  number_type: string | null;
  contact_id: string;
}

// Deprecated - Security QA feature is no longer active
export interface SecurityQA {
  id: string;
  question: string;
  answer: string;
  user_id: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ContactCreate {
  name: string;
  email?: string;
  user_id: string;
}

export interface PhoneCreate {
  number: string;
  number_type?: string;
  contact_id: string;
}
