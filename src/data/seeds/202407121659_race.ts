import {Knex} from 'knex';
import {tables} from '../index';
import {Race} from '../../types/types'


export async function seed(knex: Knex): Promise<void>{
    //first delete all entries
    await knex(tables.race).del();

    //add data
    const races: Race[] = [
      { raceId: 1, name: 'Omloop het Nieuwsblad', date: new Date('2024-02-25'), location: 'Belgium' },
      { raceId: 2, name: 'Tour de France', date: new Date('2024-07-01'), location: 'France' },
      { raceId: 3, name: "Giro d'Italia", date: new Date('2024-05-06'), location: 'Italy' },
      { raceId: 4, name: 'Vuelta a España', date: new Date('2024-08-19'), location: 'Spain' },
      { raceId: 5, name: 'Paris-Roubaix', date: new Date('2024-04-09'), location: 'France' },
      { raceId: 6, name: 'Milan-San Remo', date: new Date('2024-03-18'), location: 'Italy' },
      { raceId: 7, name: 'Tour of Flanders', date: new Date('2024-04-02'), location: 'Belgium' },
      { raceId: 8, name: 'Liège-Bastogne-Liège', date: new Date('2024-04-23'), location: 'Belgium' },
      { raceId: 9, name: 'La Flèche Wallonne', date: new Date('2024-04-19'), location: 'Belgium' },
      { raceId: 10, name: 'Amstel Gold Race', date: new Date('2024-04-16'), location: 'Netherlands' },
      { raceId: 11, name: 'Gent-Wevelgem', date: new Date('2024-03-26'), location: 'Belgium' },
      { raceId: 12, name: 'E3 Harelbeke', date: new Date('2024-03-24'), location: 'Belgium' },
      { raceId: 13, name: 'Strade Bianche', date: new Date('2024-03-04'), location: 'Italy' },
      { raceId: 14, name: 'Clásica de San Sebastián', date: new Date('2024-07-29'), location: 'Spain' },
      { raceId: 15, name: 'Paris-Tours', date: new Date('2024-10-08'), location: 'France' },
      { raceId: 16, name: 'Tour Down Under', date: new Date('2024-01-17'), location: 'Australia' },
      { raceId: 17, name: 'Cadel Evans Great Ocean Road Race', date: new Date('2024-01-29'), location: 'Australia' },
      { raceId: 18, name: 'Tirreno-Adriatico', date: new Date('2024-03-08'), location: 'Italy' },
      { raceId: 19, name: 'Tour of California', date: new Date('2024-05-14'), location: 'USA' },
      { raceId: 20, name: 'Tour de Suisse', date: new Date('2024-06-11'), location: 'Switzerland' },
      { raceId: 21, name: 'Critérium du Dauphiné', date: new Date('2024-06-04'), location: 'France' },
      { raceId: 22, name: 'Tour de Romandie', date: new Date('2024-04-25'), location: 'Switzerland' },
      { raceId: 23, name: 'Volta a Catalunya', date: new Date('2024-03-20'), location: 'Spain' },
      { raceId: 24, name: 'Tour de Pologne', date: new Date('2024-07-30'), location: 'Poland' },
      { raceId: 25, name: 'BinckBank Tour', date: new Date('2024-08-30'), location: 'Belgium/Netherlands' },
      { raceId: 26, name: 'Tour of Britain', date: new Date('2024-09-03'), location: 'United Kingdom' },
      { raceId: 27, name: 'Il Lombardia', date: new Date('2024-10-07'), location: 'Italy' },
      { raceId: 28, name: 'World Championships Road Race', date: new Date('2024-09-24'), location: 'Switzerland' },
      { raceId: 29, name: 'Olympic Games Road Race', date: new Date('2024-07-27'), location: 'France' }, 
      { raceId: 30, name: 'Commonwealth Games Road Race', date: new Date('2022-08-07'), location: 'United Kingdom' } 
    ];
    await knex(tables.race).insert(races);
};