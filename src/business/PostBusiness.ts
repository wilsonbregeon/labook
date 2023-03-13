import { PostDatabase } from "../database/PostDatabase";
import { CreatePostInputDTO, GetPostsInputDTO, GetPostsOutputDTO } from "../dtos/userDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { Post } from "../models/Post";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { PostWithCreatorDB } from "../types";

export class PostBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
    ) { }

    public getPosts = async (input: GetPostsInputDTO): Promise<GetPostsOutputDTO> => {
        const { token } = input

        if (token === undefined) {
            throw new BadRequestError("token ausente!")
        }

        const payload = this.tokenManager.getPayLoad(token)

        if (payload === null) {
            throw new BadRequestError("token inválido!")
        }

        const postsWithCreatorDB: PostWithCreatorDB[] = await this.postDatabase.getPostsWithCreators()

        const posts = postsWithCreatorDB.map((postWithCreatorDB) => {
            const post = new Post(
                postWithCreatorDB.id,
                postWithCreatorDB.name,
                postWithCreatorDB.likes,
                postWithCreatorDB.dislikes,
                postWithCreatorDB.created_at,
                postWithCreatorDB.updated_at,
                postWithCreatorDB.creator_id,
                postWithCreatorDB.creator_name
            )

            return post.toBusinessModel()
        })

        const output: GetPostsOutputDTO = posts

        return output
    }

    public createPost = async (input: CreatePostInputDTO): Promise<void> => {
        const {token, name} = input

        if (token === undefined) {
            throw new BadRequestError("token ausente!")
        }

        const payload = this.tokenManager.getPayLoad(token)

        if (payload === null) {
            throw new BadRequestError("token inválido!")
        }

        if (typeof name !== "string") {
            throw new BadRequestError("'name' deve ser string!")
        }

        const id = this.idGenerator.generate()
        const createdAt = new Date().toISOString()
        const updatedAt = new Date().toISOString()
        const creatorId = payload.id
        const creadtorName = payload.name

        const post = new Post(
           id,
           name,
           0,
           0,
            createdAt,
            updatedAt,
            creatorId,
            creadtorName
        )

        const postDB = post.toDBModel()

        await this.postDatabase.insert(postDB)
    }
}