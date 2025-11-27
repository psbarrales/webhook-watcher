import Post from 'models/Post'

const resolver = {
  Query: {
    posts: () => {
      return Post.find()
    },
    post: (_: unknown, args: { id: string }) => {
      return Post.findOne({
        where: {
          id: args.id,
        },
      })
    },
  },
}

export default resolver
