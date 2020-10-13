const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
} = require("graphql");

const authors = [
  {
    id: 1,
    name: "Marijn Haverbeke",
  },
  {
    id: 2,
    name: "Addy Osmani",
  },
  {
    id: 3,
    name: "Axel Rauschmayer",
  },
];

const books = [
  {
    id: "9781593275846",
    title: "Eloquent JavaScript, Second Edition",
    authorId: 1,
  },
  {
    id: "9781449331818",
    title: "Learning JavaScript Design Patterns",
    authorId: 2,
  },
  {
    id: "9781449365035",
    title: "Speaking JavaScript",
    authorId: 3,
  },
  {
    id: "9781491950296",
    title: "Programming JavaScript Applications",
    authorId: 1,
  },
  {
    id: "9781593277574",
    title: "Understanding ECMAScript 6",
    authorId: 2,
  },
  {
    id: "9781491904244",
    title: "You Don't Know JS",
    authorId: 3,
  },
  {
    id: "9781449325862",
    title: "Git Pocket Guide",
    authorId: 2,
  },
  {
    id: "9781449337711",
    title: "Designing Evolvable Web APIs with ASP.NET",
    authorId: 1,
  },
];

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "Author of a book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: GraphQLList(BookType),
      resolve: (author) => books.filter((book) => author.id == book.authorId),
    },
  }),
});

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book from an author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLString) },
    title: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: GraphQLNonNull(AuthorType),
      resolve: (book) => authors.find((author) => book.authorId === author.id),
    },
  }),
});

const rootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    book: {
      type: BookType,
      description: "A single book",
      args: {
        id: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    books: {
      type: GraphQLList(BookType),
      description: "List of books",
      resolve: () => books,
    },
    author: {
      type: AuthorType,
      description: "A single author",
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
    authors: {
      type: GraphQLList(AuthorType),
      description: "List of Authors",
      resolve: () => authors,
    },
  }),
});

const rootMutationType = new GraphQLObjectType({
  name: "Mutations",
  fields: () => ({
    addBook: {
      type: BookType,
      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const book = {
          id: Math.random().toString().substring(2, 15),
          title: args.title,
          authorId: args.authorId,
        };
        books.push(book);
        return book;
      },
    },
    addAuthor: {
      type: AuthorType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        const author = { id: authors.length + 1, name: args.name };
        authors.push(author);
        return author;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: rootQueryType,
  mutation: rootMutationType,
});

const app = express();

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(5000, () => console.log("server running"));
