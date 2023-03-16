import { PostDatabase } from "../database/PostDatabase";
import { CreatePostInputDTO, DeletePostInputDTO, EditPostInputDTO, GetPostsInputDTO, GetPostsOutputDTO, LikeOrDislikePostinputDTO } from "../dtos/userDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { Post } from "../models/Post";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { LikeDislikeDB, PostDB, PostWithCreatorDB, POST_LIKE, USER_ROLES } from "../types";

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

    public likeOrDislikePost = async (input: LikeOrDislikePostinputDTO): Promise<void> => {
        const { idToLikeOrDislike, token, like } = input

        if (token === undefined) {
            throw new BadRequestError("token ausente!")
        }

        const payload = this.tokenManager.getPayLoad(token)

        if (payload === null) {
            throw new BadRequestError("token inválido!")
        }

        if (typeof like !== "boolean") {
            throw new BadRequestError("'like' tem que ser boolean!")
        }

        const postWithCreatorDB = await this.postDatabase.findPostWithCreatorById(idToLikeOrDislike)

        if (!postWithCreatorDB) {
            throw new NotFoundError("'id' não encontrado!")
        }

        const userId = payload.id
        const likeSQLite = like ? 1 : 0

        const likeDislikeDB: LikeDislikeDB = {
            user_id: userId,
            post_id: postWithCreatorDB.id,
            like: likeSQLite
        }

        const post = new Post(
            postWithCreatorDB.id,
            postWithCreatorDB.name,
            postWithCreatorDB.likes,
            postWithCreatorDB.dislikes,
            postWithCreatorDB.created_at,
            postWithCreatorDB.created_at,
            postWithCreatorDB.creator_id,
            postWithCreatorDB.creator_name
        )

        const likeDislikeExists = await this.postDatabase.findLikeDislike(likeDislikeDB)

        if (likeDislikeExists === POST_LIKE.ALREADY_LIKED) {
            if (like) {
                await this.postDatabase.removeLikeDislike(likeDislikeDB)
                post.removeLike()

            } else {
                await this.postDatabase.updateLikeDisliked(likeDislikeDB)
                post.removeLike()
                post.addDislike()
            }

        } else if (likeDislikeExists === POST_LIKE.ALREADY_DISLIKED) {
            if (like) {
                await this.postDatabase.updateLikeDisliked(likeDislikeDB)
                post.removeDislike()
                post.addLike()

            } else {
                await this.postDatabase.removeLikeDislike(likeDislikeDB)
                post.removeDislike()
                post.addLike()
            }

        } else {
            await this.postDatabase.likeOrDislikePost(likeDislikeDB)

            like ? post.addLike() : post.addDislike()
        }

        const updatedPostDB = post.toDBModel()

        await this.postDatabase.update(idToLikeOrDislike, updatedPostDB)
    }
}