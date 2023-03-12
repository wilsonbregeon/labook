export enum USER_ROLES {
    NORMAL = "NORMAL",
    ADMIN = "ADMIN" 
}

export interface TokenPayLoad {
    id: string,
    name: string,
    role: USER_ROLES
}