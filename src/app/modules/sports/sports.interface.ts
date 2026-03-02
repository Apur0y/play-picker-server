export type SportsType =
  | "basketball"
  | "soccer"
  | "volleyball"
  | "lacrosse"
  | "football"
  | "highlight"
  | "recruiting";


export interface Sports {
  title: string;
  description: string;
  thumbnail?: string; 
  type: string;       
  src: string;        
}
