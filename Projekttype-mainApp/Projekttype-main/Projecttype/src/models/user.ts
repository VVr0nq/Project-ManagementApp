export class User {
  id: string;
  login?: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;

  constructor(
    id: string,
    login: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole
  ) {
    this.id = id;
    this.login = login;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
  }
}

export enum UserRole {
  ADMIN = "admin",
  DEVOPS = "devops",
  DEVELOPER = "developer",
}

export function mockUsers(): User[] {
  const admin: User = {
    id: "0",
    login: "admin",
    password: "admin",
    firstName: "Adminn",
    lastName: "Adminnn",
    role: UserRole.ADMIN,
  };

  const developer: User = {
    id: "1",
    firstName: "Developerr",
    lastName: "Developerr",
    role: UserRole.DEVELOPER,
  };

  const devops: User = {
    id: "2",
    firstName: "DevOpss",
    lastName: "Devopsss",
    role: UserRole.DEVOPS,
  };

  return [admin, developer, devops];
}