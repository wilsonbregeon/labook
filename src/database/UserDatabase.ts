import { BaseDatabase } from "./BaseDatabase";
import { UserDB } from "../types"

export class UserDatabase extends BaseDatabase {
    public static TABLE_USERS = "users"

    public insert = async (userDB: UserDB) => {
        await BaseDatabase
        .connection(UserDatabase.TABLE_USERS)
        .insert(userDB)
    }
}