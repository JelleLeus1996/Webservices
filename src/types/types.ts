export interface TeamBase {
    teamId: number;
    name: string;
    country: string;
    victories?: number;
    points?: number;
    team_status: string;
    abbreviation: string;
    director: string;
    assistant?: string;
    representative?: string;
    bike: string;
    email: string;
    overhead_cost?: number;
  }

export interface Team {
    teamId: number;
    name: string;
    country: string;
    victories?: number;
    points?: number;
    team_status: string;
    abbreviation: string;
    director: string;
    assistant?: string;
    representative?: string;
    bike: string;
    overhead_cost: number;
    email: string;
    password_hash: string;
    roles: string;
  }
  export interface TeamWithRiders extends TeamBase {
    riders: Rider[];
  }
  
  export interface Rider {
    id: number;
    nationality:string;
    last_name:string;
    first_name:string;
    birthday:Date;
    points?:number;
    teamId:number;
    monthly_wage?:number;
  }
  
  export interface Sponsor {
    sponsorId:number;
    name:string;
    industry:string;
    contribution?:number;
    teamId:number;
  }
  
  export interface Race {
    raceId:number;
    name:String;
    date:Date;
    location:string;
  }

  export interface TeamWithSponsorsAndRaces extends TeamBase {
    sponsors?: Sponsor[];
    races?: Race[];
  }

  export interface RiderWithTeam extends Rider {
    team: TeamBase;
  }