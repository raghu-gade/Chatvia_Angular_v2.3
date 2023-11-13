export interface Contacts {
    id: number;
    name: string;
}
export interface User {
  is_notifiable: any
  date_updated: string
  is_online: any
  friendly_name: any
  account_sid: string
  url: string
  date_created: string
  role_sid: string
  sid: string
  attributes: string
  identity: string
  chat_service_sid: string
  links: Links
}

export interface Links {
  user_conversations: string
}
