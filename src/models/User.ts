export interface User {
    id: number;
    email: string;
    password: string;
    name?: string;
    surname?: string;
    authToken?: string;
}

export const Insert_user = `
  INSERT INTO users (email, password, name, surname)
  VALUES (?, ?, ?, ?)
`