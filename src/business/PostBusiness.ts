import { PostDatabase } from "../database/PostDatabase";
import { CreatePostInputDTO, DeletePostInputDTO, EditPostInputDTO, GetPostsInputDTO, GetPostsOutputDTO } from "../dtos/userDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { Post } from "../models/Post";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { PostDB, PostWithCreatorDB, USER_ROLES } from "../types";

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
        const { token, name } = input

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

    public editPost = async (input: EditPostInputDTO): Promise<void> => {
        const { idToEdit, token, name } = input

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

        const postDB = await this.postDatabase.findById(idToEdit)

        if (!postDB) {
            throw new NotFoundError("'id' não encontrado!")
        }

        const creatorId = payload.id

        if (postDB.creator_id !== creatorId) {
            throw new BadRequestError("somente quem criou o post pode editá-lo!")
        }

        const creadtorName = payload.name

        const post = new Post(
            postDB.id,
            postDB.name,
            postDB.likes,
            postDB.dislikes,
            postDB.created_at,
            postDB.created_at,
            creatorId,
            creadtorName
        )

        post.setName(name)
        post.setUpdatedAt(new Date().toISOString())

        const updatedPostDB = post.toDBModel()

        await this.postDatabase.update(idToEdit, updatedPostDB)

    }

    public deletePost = async (input: DeletePostInputDTO): Promise<void> => {
        const { idToDelete, token } = input

        if (token === undefined) {
            throw new BadRequestError("token ausente!")
        }

        const payload = this.tokenManager.getPayLoad(token)

        if (payload === null) {
            throw new BadRequestError("token inválido!")
        }

        const postDB = await this.postDatabase.findById(idToDelete)

        if (!postDB) {
            throw new NotFoundError("'id' não encontrado!")
        }

        const creatorId = payload.id

        if (payload.role !== USER_ROLES.ADMIN && postDB.creator_id !== creatorId) {
            throw new BadRequestError("somente quem criou o post pode deletá-lo!")
        }

        await this.postDatabase.delete(idToDelete)

    }
}