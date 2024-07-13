[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/snPWRHYg)
# Examenopdracht Front-end Web Development / Web Services


- Student: Jelle Leus
- Studentennummer: 202186597
- E-mailadres: <mailto:jelle.leus@student.hogent.be>

## Vereisten

Ik verwacht dat volgende software reeds geïnstalleerd is:

- [NodeJS](https://nodejs.org)
- [Yarn](https://yarnpkg.com)
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)


## Opstarten

Je kan de applicatie opstarten door 'yarn start' in de terminal in te geven. 
Daarna kan je alles http request testen in postman


## Testen

Je kan de testen runnen door 'yarn test' in de terminal in te geven. 

# Jelle Leus (202186597)

Web Services:
  - https://github.com/Web-IV/2324-webservices-JelleLeus1996
  - https://webservice-cycling.onrender.com


## Projectbeschrijving

Wielerdatabase waarin rensters en teams aanwezig zijn.
De UCI is ook geregistreerd als team en heeft als enige de macht (als admin) om alle details van rensters en teams te bekijken, rensters en teams toe te voegen of te verwijderen.

De vertegenwoordigers van de 'echte' teams kunnen alle teams en rensters zien (in beperkte vorm, bijv. zonder de financiële data) en kunnen alle details van hun eigen team en rensters opvragen. Ook updates over hun eigen team en eigen rensters kunnen zijn doen.

![Domeinmodel](2023-12-22_14-54-35.png)


## API calls

### Teams

- `GET /api/riders`: Alle rensters ophalen met beperkte info (geen financiële data)
- `GET /api/riders/allInfo`: Alle rensters ophalen met alle info (incl. financiële data). 
- `GET /api/riders/all/getAllRidersWithTeam`: Alle rensters ophalen met bijhorende teams.
- `GET /api/riders/full-name/:first_name/:last_name`: Renster met een bepaalde voor- en achternaam ophalen
- `GET /api/riders/:id`: Renster met een bepaald id ophalen

- `GET /api/riders/team/:teamId`: Alle rensters ophalen van een bepaald team

- `POST /api/riders`: Renster toevoegen

- `PUT /api/riders/:id`: Renster met een bepaald id aanpassen

- `DELETE /api/riders/:id`: Renster met een bepaald id verwijderen

### Riders

- `POST /api/teams/login`: Inloggen in het systeem  

- `GET /api/teams`: Alle teams ophalen met beperkte info (geen financiële data)
- `GET /api/teams/allInfo`: Alle teams ophalen met alle info (incl. financiële data). 
- `GET /api/teams/:teamId`: Team met een bepaald teamId ophalen
- `GET /api/teams/:name`: Team met een bepaalde naam (name) ophalen
- `GET /api/teams/getTeamWithRiders/:teamId`: Team met een bepaald teamId ophalen met alle bijhorende rensters

- `POST /api/teams`: Team toevoegen

- `PUT /api/teams/:teamId`: Team met een bepaald teamId aanpassen

- `DELETE /api/teams/:teamId`: Team met een bepaald teamId verwijderen

## Behaalde minimumvereisten

## Projectstructuur

### Web Services

De structuur zit gelijkaardig in elkaar aan de voorbeeldapplicatie. Er wordt gewerkt met een rest-laag met alle routes, een service laag met error handling, een repository laag met de queries en een datalaag met de migrations & seeds.

## Extra technologie

### Web Services

Er werd voor Joi gekozen als extra technologie voor validatie. Dit werd dus geïmplementeerd voor de validatie op servicelaag. Helaas bleek dat deze technologie later in het semester ook gebruikt werd voor validatie. Je zal zien dat er dan ook een aparte map is met een riderSchema & teamSchema voor validatie op de servicelaag. Dit naast de validaties op de restlaag. Dit werd nadien niet meer aangepast.

## Testresultaten

### Web Services

Te laat begonnen aan het effectief testen van de testen. Volgende fout bleef altijd bovenkomen bij mijn riders.spec:'The given email or password do not match'. Heel de namiddag op gezocht zonder succes.

![Test coverage](coverage2023-12-22_17-23-30.png)


## Gekende bugs

### Web Services

In de testen zitten bugs...

