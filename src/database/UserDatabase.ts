import { BaseDatabase } from "./BaseDatabase";
import { UserDB } from "../types"

export class UserDatabase extends BaseDatabase {
    public static TABLE_USERS = "users"

    public insert = async (userDB: UserDB) => {
        await BaseDatabase
            .connection(UserDatabase.TABLE_USERS)
            .insert(userDB)
    }

    public findByEmail = async (email: string): Promise<UserDB | undefined> => {
        const result: UserDB[] = await BaseDatabase
            .connection(UserDatabase.TABLE_USERS)
            .select()
            .where({ email })

        return result[0]
    }
}