import { PostWithCreatorDB } from "../types";
import { BaseDatabase } from "./BaseDatabase";

export class PostDatabase extends BaseDatabase {
    public static TABLE_POSTS = "posts"

    public getPostsWithCreators = async () => {
        const result: PostWithCreatorDB[] = await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .select(
                "posts.id",
                "posts.creator_id",
                "posts.name",
                "posts.likes",
                "posts.dislikes",
                "posts.created_at",
                "posts.updated_at",
                "users.name AS creator_name"
            )
            .join("users", "posts.creator_id", "=", "users.id")

        return result
    }

}