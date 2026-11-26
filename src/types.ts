export interface RealmSpec {
  label: string;
  val: string;
}

export interface RealmData {
  id: string;
  num: string;
  kanji: string;
  sfx: string;
  tag: string;
  title: string;
  desc: string;
  image: string;
  specs: RealmSpec[];
}

export interface CampusVenue {
  name: string;
  event: string;
  cap: string;
  icon: string;
}

export interface PassData {
  name: string;
  college: string;
  roll: string;
  avatar: string;
}

export interface BotControl {
  x: number;
  z: number;
  active: boolean;
}

export type CameraMode = 'scroll' | 'orbit' | 'fpv' | 'cockpit';

export type DroneFormation = 'sphere' | 'tf' | 'falcon' | 'helix';

export type SfxType = 'kick' | 'hihat' | 'synth' | 'drop' | 'warp' | 'click';

export type PlaySfx = (type?: SfxType) => void;
