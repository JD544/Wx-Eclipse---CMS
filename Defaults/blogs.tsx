import { BlogPost } from "../ui";
import { defaultBlogContent } from "./isWxPowerfulBlog";

export const DefaultBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Is WX Eclipse powerful?',
    content: defaultBlogContent,
    excerpt: 'In the rapidly evolving landscape of web development, developers are constantly seeking tools that can streamline their workflow',
    author: 'WX Eclipse',
    category: 'uncategorized',
    tags: ['web development', 'tools', 'development'],
    status: 'published',
    featuredImage: 'https://example.com/image.jpg',
    createdAt: '2025-04-20T12:00:00Z',
    updatedAt: '2025-04-20T12:00:00Z',
    slug: 'is-wx-eclipse-powerful'
  }
]