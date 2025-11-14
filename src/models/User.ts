import type { UserInterface } from "#types/user-type";
import db from "#database/database";

class User implements UserInterface {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  problems_solved: number;
  total_submissions: number;

  constructor(data: UserInterface) {
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.username = data.username;
    this.password = data.password;
    this.problems_solved = data.problems_solved;
    this.total_submissions = data.total_submissions;
  }

  static async createUser(
    first_name: string,
    last_name: string,
    username: string,
    email: string,
    password: string
  ) {
    try {
      const query = `INSERT INTO users (first_name, last_name, username, email, password)
                      VALUES (?, ?, ?, ?, ?);`;

      const values = [first_name, last_name, username, email, password];

      const res = await db.execute(query, values);

      return res;
    } catch (error) {
      console.log(error);
    }
  }
}

export default User;
