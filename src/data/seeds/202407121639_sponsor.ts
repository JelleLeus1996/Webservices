import {Knex} from 'knex';
import tables from '..';

import {Sponsor} from '../../types/types'

export async function seed(knex: Knex): Promise<void>{
    //first delete all entries
    await knex(tables.sponsor).del();

    //add data
    const sponsors: Sponsor[]=[

      // Canyon//SRAM Racing
      { sponsorId: 1, name: 'Canyon', industry: 'Bicycle', contribution: 4500000, teamId: 1 },
      { sponsorId: 2, name: 'SRAM', industry: 'Bicycle Components', contribution: 4000000, teamId: 1 },
    
      // EF Education TIBCO SVB
      { sponsorId: 3, name: 'EF Education', industry: 'Education', contribution: 4500000, teamId: 2 },
      { sponsorId: 4, name: 'TIBCO Software', industry: 'Software', contribution: 1500000, teamId: 2 },
      { sponsorId: 5, name: 'Silicon Valley Bank', industry: 'Banking', contribution: 1500000, teamId: 2 },
    
      // FDJ Suez
      { sponsorId: 6, name: 'FDJ', industry: 'Gambling', contribution: 5500000, teamId: 3 },
      { sponsorId: 7, name: 'Suez', industry: 'Utilities', contribution: 2500000, teamId: 3 },
    
      // Fenix Deceuninck
      { sponsorId: 8, name: 'Fenix', industry: 'Materials', contribution: 2500000, teamId: 4 },
      { sponsorId: 9, name: 'Deceuninck', industry: 'Building Materials', contribution: 2200000, teamId: 4 },
    
      // Human Powered Health
      { sponsorId: 10, name: 'Human Powered Health', industry: 'Healthcare', contribution: 4000000, teamId: 5 },
      { sponsorId: 11, name: 'Wahoo Fitness', industry: 'Fitness Equipment', contribution: 1700000, teamId: 5 },
    
      // Israel Premier Tech Roland
      { sponsorId: 12, name: 'Premier Tech', industry: 'Horticulture', contribution: 5000000, teamId: 6 },
      { sponsorId: 13, name: 'Roland', industry: 'Musical Instruments', contribution: 3200000, teamId: 6 },
    
      // Lidl Trek
      { sponsorId: 14, name: 'Lidl', industry: 'Retail', contribution: 5000000, teamId: 7 },
      { sponsorId: 15, name: 'Trek Bikes', industry: 'Bicycle', contribution: 4700000, teamId: 7 },
    
      // Liv Racing TeqFind
      { sponsorId: 16, name: 'Liv Cycling', industry: 'Bicycle', contribution: 3000000, teamId: 8 },
      { sponsorId: 17, name: 'TeqFind', industry: 'Technology', contribution: 2200000, teamId: 8 },
    
      // Movistar Team
      { sponsorId: 18, name: 'Movistar', industry: 'Telecommunications', contribution: 6000000, teamId: 9 },
      { sponsorId: 19, name: 'Telefónica', industry: 'Telecommunications', contribution: 3200000, teamId: 9 },
    
      // Team DSM Firmenich
      { sponsorId: 20, name: 'DSM', industry: 'Nutrition', contribution: 4500000, teamId: 10 },
      { sponsorId: 21, name: 'Firmenich', industry: 'Fragrances', contribution: 4000000, teamId: 10 },

      // Team Jayco AlUla
      { sponsorId: 22, name: 'Jayco', industry: 'Recreational Vehicles', contribution: 2800000, teamId: 11 },
      { sponsorId: 23, name: 'AlUla', industry: 'Tourism', contribution: 2200000, teamId: 11 },
    
      // Team Jumbo Visma
      { sponsorId: 24, name: 'Jumbo', industry: 'Retail', contribution: 6000000, teamId: 12 },
      { sponsorId: 25, name: 'Visma', industry: 'Software', contribution: 4500000, teamId: 12 },
    
      // Team SD Worx
      { sponsorId: 26, name: 'SD Worx', industry: 'Human Resources', contribution: 12000000, teamId: 13 },
      { sponsorId: 27, name: 'Specialized', industry: 'Bicycle', contribution: 3000000, teamId: 13 },
    
      // UAE Team ADQ
      { sponsorId: 28, name: 'Emirates', industry: 'Airlines', contribution: 7000000, teamId: 14 },
      { sponsorId: 29, name: 'ADQ', industry: 'Investment', contribution: 3000000, teamId: 14 },
    
      // Uno X Pro Cycling Team
      { sponsorId: 30, name: 'Uno X', industry: 'Energy', contribution: 3000000, teamId: 15 },
      { sponsorId: 31, name: 'Ridley Bikes', industry: 'Bicycle', contribution: 2000000, teamId: 15 },
    
      // AG Insurance Soudal Quick Step
      { sponsorId: 32, name: 'AG Insurance', industry: 'Insurance', contribution: 2000000, teamId: 16 },
      { sponsorId: 33, name: 'Soudal', industry: 'Adhesives', contribution: 1500000, teamId: 16 },
      { sponsorId: 34, name: 'Quick-Step', industry: 'Flooring', contribution: 1500000, teamId: 16 },
    
      // Arkéa Pro Cycling Team
      { sponsorId: 35, name: 'Arkéa', industry: 'Banking', contribution: 1000000, teamId: 17 },
      { sponsorId: 36, name: 'Samsic', industry: 'Facility Management', contribution: 700000, teamId: 17 },
    
      // Cofidis Women Team
      { sponsorId: 37, name: 'Cofidis', industry: 'Financial Services', contribution: 1000000, teamId: 18 },
      { sponsorId: 38, name: 'Look Cycle', industry: 'Bicycle', contribution: 500000, teamId: 18 },
    
      // Duolar Chevalmeire Cycling Team
      { sponsorId: 39, name: 'Duolar', industry: 'Solar Energy', contribution: 7000000, teamId: 19 },
      { sponsorId: 40, name: 'Chevalmeire', industry: 'Real Estate', contribution: 600000, teamId: 19 },
    
      // Lotto Dstny Ladies
      { sponsorId: 41, name: 'Lotto', industry: 'Gambling', contribution: 650000, teamId: 20 },
      { sponsorId: 42, name: 'Dstny', industry: 'Telecommunications', contribution: 550000, teamId: 20 },
    
      // Parkhotel Valkenburg
      { sponsorId: 43, name: 'Parkhotel Valkenburg', industry: 'Hospitality', contribution: 900000, teamId: 21 },
      { sponsorId: 44, name: 'Destil', industry: 'Tools', contribution: 200000, teamId: 21 },
    
      // Proximus Cyclis
      { sponsorId: 45, name: 'Proximus', industry: 'Telecommunications', contribution: 600000, teamId: 22 },
      { sponsorId: 46, name: 'Cyclis', industry: 'Insurance', contribution: 300000, teamId: 22 },
    
      // Union Cycliste Internationale
      { sponsorId: 47, name: 'Tissot', industry: 'Watches', contribution: 50000000, teamId: 23 },
      { sponsorId: 48, name: 'Santini', industry: 'Cycling Clothing', contribution: 10000000, teamId: 23 },
      { sponsorId: 49, name: 'Shimano', industry: 'Bicycle Components', contribution: 5000000, teamId: 23 },
    
    ];
    await knex(tables.sponsor).insert(sponsors);  
};