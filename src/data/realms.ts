import type { CampusVenue, RealmData } from '../types';

export const REALM_DATA: RealmData[] = [
  {
    id: 'gateway',
    num: '01',
    kanji: '飛翔',
    sfx: 'ドォォン!',
    tag: 'ORIGIN PORTAL // IIT BOMBAY',
    title: 'WHERE IDEAS TAKE FLIGHT',
    desc: 'The sacred grounds of Asia’s largest science and technology festival. Across 550 acres of IIT Bombay, thousands of engineers, inventors, and visionaries gather under the legendary Techfest Wall.',
    image: '/manga_mural.png',
    specs: [
      { label: 'FOOTFALL', val: '175,000+' },
      { label: 'COLLEGES', val: '2,500+' },
      { label: 'PATRONAGE', val: 'UNESCO & UNICEF' },
      { label: 'PRIZE MATRIX', val: '₹50+ LAKHS' },
    ],
  },
  {
    id: 'robowars',
    num: '02',
    kanji: '闘魂',
    sfx: 'ガガガッ!',
    tag: 'ARENA // 30nm CIRCUIT MAZE',
    title: 'MESHME RIZE ROBOWARS',
    desc: 'Autonomous micro rovers navigating hyper complex 30nm precision mazes with LiDAR sensors, sub millisecond line detection algorithms, and high torque titanium gears.',
    image: '/manga_bot_maze.png',
    specs: [
      { label: 'MAZE RESOLUTION', val: '30nm PRECISION' },
      { label: 'SPEED TRAVERSAL', val: '3.8 M/S MAX' },
      { label: 'SENSOR SUITE', val: 'LiDAR + IR RADAR' },
      { label: 'MECHA COMBAT', val: 'ROBOWARS INTERNATIONAL' },
    ],
  },
  {
    id: 'drones',
    num: '03',
    kanji: '群星',
    sfx: 'キィィン!',
    tag: 'SKYLINE SWARM // 500+ DRONES',
    title: 'CELESTIAL DRONE MATRIX',
    desc: 'Over the nighttime cityscape of Mumbai, 500 autonomous drones orchestrate into a massive 3D glowing celestial sphere. Real time swarm tele kinetics and satellite positioning.',
    image: '/manga_drone_sphere.png',
    specs: [
      { label: 'DRONE FLEET', val: '500+ QUADCOPTERS' },
      { label: 'FORMATION', val: '3D POKÉBALL ORB' },
      { label: 'GPS SYNC', val: 'RTK SUB CENTIMETER' },
      { label: 'ALTITUDE', val: '120 METERS' },
    ],
  },
  {
    id: 'stage',
    num: '04',
    kanji: '熱狂',
    sfx: 'ズバッ!',
    tag: 'THE APEX // TECHNOHOLIX ARENA',
    title: 'TECHNOHOLIX MEGASTAGE',
    desc: 'The grand fusion of cutting edge technology and sensory euphoria. Mammoth LED monolithic pillars, pyrotechnic laser grids, and world renowned EDM performers under the neon TF emblem.',
    image: '/manga_stage.png',
    specs: [
      { label: 'STAGE RIG', val: '360° LED MONOLITHS' },
      { label: 'AUDIO SYSTEM', val: '100,000 WATTS' },
      { label: 'INTERNATIONAL ACTS', val: '30+ COUNTRIES' },
      { label: 'SPECTATORS', val: '25,000 ARENA CAP' },
    ],
  },
];

export const CAMPUS_VENUES: CampusVenue[] = [
  { name: 'GYMKHANA GROUNDS', event: 'Robowars & Meshmerize', cap: '15,000', icon: '01' },
  { name: 'CONVOCATION HALL', event: 'World Technology Summit', cap: '2,500', icon: '02' },
  { name: 'OPEN AIR THEATRE (OAT)', event: 'Technoholix EDM Night', cap: '25,000', icon: '03' },
  { name: 'SAC LAWNS', event: 'Drone Light Show & Exhibits', cap: '10,000', icon: '04' },
];

export const CYBER_DIVISIONS = [
  'TITAN MECH',
  'SWARM FALCON',
  'CYBER SAMURAI',
  'QUANTUM BIO HACKER',
] as const;

export const DEFAULT_PASS_DATA = {
  name: 'COMMANDER ARCH',
  college: 'IIT BOMBAY',
  roll: 'TF 2026 9942',
  avatar: 'TITAN MECH',
};
