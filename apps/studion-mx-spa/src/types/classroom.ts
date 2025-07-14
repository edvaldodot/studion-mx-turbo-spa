import { Journey } from "./journey";
import { Profile } from "./profile";
import { Session } from "./session";

export interface Classroom {
    session: Session;
    journey: Journey;
    profile: Profile;
}