import Comment from "../Models/Comment.js";
import Post from "../Models/Post.js";

export async function createComment(req, res) {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!postId || !content) {
            return res.status(400).json({
                message: "PostId and content are required"
            })
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            })
        }

        const existingComment = await Comment.findOne({
            author: userId,
            post: postId,
        });

        if (existingComment) {
            return res.status(400).json({
                message: "Can not create second comment for this post"
            })
        }

        const createComment = await Comment.create({
            author: userId,
            post: postId,
            content
        });

        post.comments.push(createComment._id);
        await post.save();

        res.status(201).json({
            message: "Comment created successfully",
            comment: createComment
        });

    } catch (error) {
        console.error("Error in createCommentController", error.message);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

export async function deleteComment(req, res) {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            })
        }

        const post = await Post.findById(comment.post);
        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            })
        }

        if (comment.author.toString() !== userId.toString()) {
            return res.status(403).json({
                message: "You are not authorized to delete this comment"
            })
        }

        await Comment.findByIdAndDelete(commentId);

        post.comments = post.comments.filter((item) => item.toString() !== commentId.toString());
        await post.save();

        res.status(200).json({
            message: "Comment deleted successfully"
        })

    } catch (error) {
        console.error("Error in deleteCommentController", error.message);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}