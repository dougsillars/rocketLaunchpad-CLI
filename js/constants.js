export const API_BASE = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/';
export const CACHE_KEY = 'rocketlaunch_cache';
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const STATUS_CLASSES = {
  'Go': 'status-go',
  'TBD': 'status-tbd',
  'TBC': 'status-tbc',
  'Hold': 'status-hold',
  'Success': 'status-success',
  'Failure': 'status-failure',
  'Partial Failure': 'status-failure',
  'In Flight': 'status-inflight',
  'Launch Successful': 'status-success',
};

export const KNOWN_LOCATIONS = [
  'Kennedy Space Center',
  'Cape Canaveral',
  'Vandenberg',
  'Baikonur',
  'Wallops',
  'Plesetsk',
  'Satish Dhawan',
  'Jiuquan',
  'Wenchang',
  'Tanegashima',
  'Guiana Space Centre',
];

export const KNOWN_PROVIDERS = [
  'SpaceX',
  'Rocket Lab',
  'United Launch Alliance',
  'ISRO',
  'Arianespace',
  'CASC',
  'Roscosmos',
  'Northrop Grumman',
  'Blue Origin',
];
