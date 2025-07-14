import { Journey } from "./journey";

interface Consumption {
  uuid: string,
  progress: number,
  status: string
}

export interface Children {
  id: number;
  name: string;
  description: string;
  type: string;
  group: string;
  status: string;
  children: any[];
  consumption: Consumption;
  uuid: string;
  position: number;
  level: number | null;
  prerequisite: any | null;
  certificate: any | null;
  certificateType: number;
}

export interface Component {
  id: number;
  name: string;
  description: string;
  type: string;
  group: string;
  status: string;
  children: Children[];
  consumption: Consumption;
  uuid: string;
  position: number;
  level: number;
  prerequisite: any | null;
  certificate: any | null;
  certificateType: number;
}

export interface JourneyWithComponents extends Journey {
  journeyId: number,
  journeyName: string,
  components: Component[]
}