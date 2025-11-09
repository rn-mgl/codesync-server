import type { UserInterface } from "@/types/user-type";

class User implements UserInterface {
  first_name: string;
  last_name: string;
  email: string;

  constructor(data: UserInterface) {
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
  }
}
