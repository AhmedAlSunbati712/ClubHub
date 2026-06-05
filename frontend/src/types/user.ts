
export enum UserRole {
    STUDENT = "Student",
    ADMIN = "Admin"
}
export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole
}