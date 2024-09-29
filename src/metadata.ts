/* eslint-disable */
export default async () => {
    const t = {};
    return { "@nestjs/swagger": { "models": [[import("./post/dto/create-post.dto"), { "CreatePostDto": { title: { required: true, type: () => String }, content: { required: true, type: () => String }, authorId: { required: true, type: () => String } } }], [import("./post/dto/update-post.dto"), { "UpdatePostDto": {} }], [import("./user/dto/create-user.dto"), { "CreateUserDto": { email: { required: true, type: () => String }, password: { required: true, type: () => String } } }], [import("./user/dto/update-user.dto"), { "UpdateUserDto": {} }]], "controllers": [[import("./app.controller"), { "AppController": { "health": { type: String } } }], [import("./post/post.controller"), { "PostController": { "getAllPosts": {}, "createDraft": {}, "publishPost": {} } }], [import("./user/user.controller"), { "UserController": { "signup": {}, "getAllUsers": {}, "findOne": {} } }]] } };
};